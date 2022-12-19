import {
  Activity,
  ConversationState,
  StatePropertyAccessor,
  ActivityTypes,
  ConversationReference,
  ResourceResponse,
  RoleTypes,
  TurnContext,
  Middleware,
  ActivityEventNames,
} from 'botbuilder';
import { TRANSCRIPT_LOGGER_STATE_PROPERTY } from '../constants';
import botLogging from '../helper/botLogging';

/**
 * This is customize version of TranscriptLoggerMiddleware provided by microsoft.
 * Most of the code in this class are from microsoft.
 * We have customize this middleware to store transcript history cache for session.
 */
export class CustomTranscriptLoggerMiddleware implements Middleware {
  private _conversationDataAccessor: StatePropertyAccessor<Array<Activity>>;
  private _conversationState: ConversationState;
  constructor(conversationState: ConversationState, readonly botLogging: botLogging) {
    this._conversationDataAccessor = conversationState.createProperty(TRANSCRIPT_LOGGER_STATE_PROPERTY);
    this._conversationState = conversationState;
  }

  /**
   * Initialization for middleware turn.
   * @param context Context for the current turn of conversation with the user.
   * @param next Function to call at the end of the middleware chain.
   */
  public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
    const transcript: Activity[] = [];

    // log incoming activity at beginning of turn
    if (context.activity) {
      if (!context.activity.from.role) {
        context.activity.from.role = RoleTypes.User;
      }

      this._logActivity(transcript, this._cloneActivity(context.activity));
    }

    // hook up onSend pipeline
    context.onSendActivities(
      async (ctx: TurnContext, activities: Partial<Activity>[], next: () => Promise<ResourceResponse[]>) => {
        // Run full pipeline.
        const responses = await next();

        activities.forEach((activity, index) => {
          const clonedActivity = this._cloneActivity(activity);
          clonedActivity.id = responses && responses[index] ? responses[index].id : clonedActivity.id;

          // For certain channels, a ResourceResponse with an id is not always sent to the bot.
          // This fix uses the timestamp on the activity to populate its id for logging the transcript.
          // If there is no outgoing timestamp, the current time for the bot is used for the activity.id.
          // See https://github.com/microsoft/botbuilder-js/issues/1122
          if (!clonedActivity.id) {
            const prefix = `g_${Math.random().toString(36).slice(2, 8)}`;
            if (clonedActivity.timestamp) {
              clonedActivity.id = `${prefix}${new Date(clonedActivity.timestamp).getTime().toString()}`;
            } else {
              clonedActivity.id = `${prefix}${new Date().getTime().toString()}`;
            }
          }

          this._logActivity(transcript, clonedActivity);
        });

        return responses;
      },
    );

    // hook up update activity pipeline
    context.onUpdateActivity(async (ctx: TurnContext, activity: Partial<Activity>, next: () => Promise<void>) => {
      // run full pipeline
      const response: void = await next();

      // add Message Update activity
      const updateActivity = this._cloneActivity(activity);
      updateActivity.type = ActivityTypes.MessageUpdate;
      this._logActivity(transcript, updateActivity);

      return response;
    });

    // hook up delete activity pipeline
    context.onDeleteActivity(
      async (ctx: TurnContext, reference: Partial<ConversationReference>, next: () => Promise<void>) => {
        // run full pipeline
        await next();

        // add MessageDelete activity
        // log as MessageDelete activity
        const deleteActivity = TurnContext.applyConversationReference(
          {
            type: ActivityTypes.MessageDelete,
            id: reference.activityId,
          },
          reference,
          false,
        );

        this._logActivity(transcript, this._cloneActivity(deleteActivity));
      },
    );

    // process bot logic
    await next();

    // flush transcript at end of turn
    while (transcript.length) {
      try {
        await this.processLogActivity(context, transcript.shift()!);
      } catch (err) {
        this._transcriptLoggerErrorHandler(err);
      }
    }
  }

  /**
   * Logs the Activity.
   * @param activity Activity to log.
   */
  private _logActivity(transcript: Activity[], activity: Activity): void {
    if (!activity.timestamp) {
      activity.timestamp = new Date();
    }

    if (activity.value && activity.value.date && activity.value.time) {
      activity.text = activity.value.date + ', ' + activity.value.time;
    }

    // We should not log ContinueConversation events used by skills to initialize the middleware.
    if (!(activity.type === ActivityTypes.Event && activity.name === ActivityEventNames.ContinueConversation)) {
      transcript.push(activity);
    }
  }

  /**
   * Clones the Activity entity.
   * @param activity Activity to clone.
   */
  private _cloneActivity(activity: Partial<Activity>): Activity {
    return Object.assign(<Activity>{}, activity);
  }

  /**
   * Error logging helper function.
   * @param err Error or object to console.error out.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _transcriptLoggerErrorHandler(error: Error | any): void {
    // tslint:disable:no-console
    this.botLogging.logError({
      error: error as Error,
      action: 'transcript',
      source: 'CustomTranscriptLoggerMiddleware#transcriptLoggerErrorHandler',
    });
    // tslint:enable:no-console
  }

  async processLogActivity(turnContext: TurnContext, activity: Activity) {
    const transcript = await this._conversationDataAccessor.get(turnContext, []);
    transcript.push(activity);
    await this._conversationState.saveChanges(turnContext, false);
  }
}
