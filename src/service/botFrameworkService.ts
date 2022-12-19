import { BotFrameworkAdapter, ConversationState, MemoryStorage, UserState } from 'botbuilder';
import botLogging from '../helper/botLogging';

/**
 * Class create singletons object for various global object in botframework.
 */
export class BotFrameworkService {
  private _conversationState: ConversationState;
  private _botLogging: botLogging;
  private _userState: UserState;
  private _memoryStorage: MemoryStorage;
  private _adapter: BotFrameworkAdapter;

  constructor(botLogging: botLogging) {
    this._botLogging = botLogging;
  }

  get adapter(): BotFrameworkAdapter {
    if (!this._adapter) {
      this._adapter = new BotFrameworkAdapter({
        appId: process.env.MicrosoftAppId,
        appPassword: process.env.MicrosoftAppPassword,
      });
      this._registerOnTurnError(this._adapter);
    }
    return this._adapter;
  }

  get conversationState(): ConversationState {
    if (!this._conversationState) {
      this._conversationState = new ConversationState(this.memoryStorage);
    }
    return this._conversationState;
  }

  get userState(): UserState {
    if (!this._userState) {
      this._userState = new UserState(this.memoryStorage);
    }
    return this._userState;
  }

  get memoryStorage(): MemoryStorage {
    if (!this._memoryStorage) {
      this._memoryStorage = new MemoryStorage();
    }
    return this._memoryStorage;
  }

  private _registerOnTurnError(adapter: BotFrameworkAdapter) {
    adapter.onTurnError = async (context, error) => {
      if (
        error?.message &&
        error.message.includes("Activity must include non empty 'text' field or at least 1 attachment")
      ) {
        //TODO: Ignore this error since no impact on functionality, But we have to fix it.
        // Occur when we send empty string in sendActivity.
        return;
      }
      this._botLogging.logError({
        error: error as Error,
        action: 'onTurnError',
        source: 'BotFrameworkService#onTurnError',
      });
      await context.sendTraceActivity(
        'OnTurnError Trace',
        `${error}`,
        'https://www.botframework.com/schemas/error',
        'TurnError',
      );
      await this._conversationState.delete(context);
    };
  }
}
