import { DialogBot } from './dialogBot';
import { MainDialog } from '../dialogs/mainDialog';
import { BotContext } from '../helper/botContext';
import { ConversationState, StatePropertyAccessor, TeamsInfo, TurnContext } from 'botbuilder';
import { DEFAULT_USER_EMAIL, DEFAULT_USER_NAME } from '../constants/livechat';
import { ChannelTypeEnum } from '../enum/channelTypeEnum';
import { User } from '../types/bot';
import { CONVERSATION_MODEL_STATE_PROPERTY } from '../constants';
import { ConversationCache } from '../types/botFramework';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Class handle event when user first time install app and send greet/welcome message.
 */
export class DialogAndWelcomeBot extends DialogBot {
  constructor(botContext: BotContext, dialog: MainDialog) {
    const { conversationState, userState, adapter } = botContext.botFrameworkService;
    super(conversationState, userState, dialog);
    const conversationDataAccessor = conversationState.createProperty(CONVERSATION_MODEL_STATE_PROPERTY);
    adapter.use(botContext.botMessageMiddleware);
    adapter.use(botContext.customTranscriptLoggerMiddleware);

    /**
     * Handle event when user install bot.
     */
    this.onMembersAdded(async (context: TurnContext, next) => {
      const membersAdded = context.activity.membersAdded;
      if (membersAdded) {
        for (let cnt = 0; cnt < membersAdded.length; cnt++) {
          if (membersAdded[cnt].id !== context.activity.recipient.id) {
            const user = await DialogAndWelcomeBot._processUserOnBoarding(
              context,
              botContext,
              conversationDataAccessor,
              conversationState,
            );
            await conversationState.clear(context);
            await context.sendActivity(`Hi ${user.firstName}, How may I help you today?`);
          }
        }
      }
      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });

    this.onMembersRemoved(async (turnContext, next) => {
      await conversationState.clear(turnContext);
      await next();
    });
  }

  /**
   * Process user onboarding such as add user on freshchat and create conversation.
   */
  private static async _processUserOnBoarding(
    context: TurnContext,
    botContext: BotContext,
    conversationDataAccessor: StatePropertyAccessor<ConversationCache>,
    conversationState: ConversationState,
  ): Promise<User> {
    try {
      /**
       * Create conversation on freshchat account.
       */
      const conversationCache = await conversationDataAccessor.get(context, {} as ConversationCache);

      const contextActivity = context.activity;
      const userId = context.activity.from.id;
      const user: User = {
        userId: userId,
        firstName: DEFAULT_USER_NAME,
        email: DEFAULT_USER_EMAIL,
      };
      if (isProduction && contextActivity.channelId === ChannelTypeEnum.MS_TEAMS) {
        try {
          const member = await TeamsInfo.getMember(context, userId);
          if (contextActivity.channelId === ChannelTypeEnum.MS_TEAMS) {
            user.firstName = member.name;
            user.email = member.email;
          }
          conversationCache.teamMember = member;
        } catch (error) {
          botContext.botLogging.logError({
            error: error as Error,
            action: 'error',
            source: 'DialogAndWelcomeBot#processUserOnBoarding#getMember',
          });
        }
      }

      // let conversationModel = await botContext.conversationService.getByConversationId(botConversationId);
      // if (!conversationModel) {
      //   const agentConversation = await botContext.freshChatConnector.createConversationAndSendMessage(
      //     user,
      //     [
      //       {
      //         type: MessageTypeEnum.TEXT_MESSAGE,
      //         message: WELCOME_MESSAGE(),
      //       },
      //     ],
      //     LiveChatConversationStatusEnum.NEW,
      //   );
      //   const botConversation = {
      //     userId,
      //     conversationId: botConversationId,
      //     channelType: channelId,
      //   };
      //   conversationModel = await botContext.conversationService.startConversation(
      //     context,
      //     user,
      //     botConversation,
      //     agentConversation,
      //     true, // skipResolveOperation: True when we send app successfully install message.
      //   );
      // }

      // conversationCache.model = conversationModel;
      await conversationState.saveChanges(context, false);
      await botContext.conversationRefService.addConversationReference(context.activity);
      return user;
    } catch (error) {
      botContext.botLogging.logError({
        error: error as Error,
        action: 'error',
        source: 'DialogAndWelcomeBot#processUserOnBoarding',
      });
      return {
        userId: 'userId',
        firstName: DEFAULT_USER_NAME,
        email: DEFAULT_USER_EMAIL,
      };
    }
  }
}
