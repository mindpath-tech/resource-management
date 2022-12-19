import { ConversationModel } from '../models/conversation';
import IMessageParser from '../parsers/messageParser';
import { ConversationPayload, MessagePayload, SendMessagePayload, UpdateConversationPayload } from '../types/message';
import { IChannelConnector } from './channelConnectors';
import { ConversationRefService } from '../service/conversationRefService';
import { BotMessagePayload, User } from '../types/bot';
import { BotFrameworkAdapter, ConversationState, StatePropertyAccessor } from 'botbuilder';
import { CONVERSATION_MODEL_STATE_PROPERTY } from '../constants';
import { ConversationCache } from '../types/botFramework';
import botLogging from '../helper/botLogging';
import { ActorTypeEnum } from '../enum/actorTypeEnum';
import { BotFrameworkService } from '../service/botFrameworkService';

/**
 * Connector for ms teams.
 */
export default class TeamsConnector implements IChannelConnector {
  private _conversationRefService: ConversationRefService;
  private _messageParser: IMessageParser;
  private _conversationDataAccessor: StatePropertyAccessor<ConversationCache>;
  private _conversationState: ConversationState;
  private _botLogging: botLogging;
  private _adapter: BotFrameworkAdapter;

  constructor(
    conversationRefService: ConversationRefService,
    messageParser: IMessageParser,
    botFrameworkService: BotFrameworkService,
    botLogging: botLogging,
  ) {
    const conversationState = botFrameworkService.conversationState;
    this._conversationDataAccessor = conversationState.createProperty(CONVERSATION_MODEL_STATE_PROPERTY);
    this._conversationRefService = conversationRefService;
    this._messageParser = messageParser;
    this._conversationState = conversationState;
    this._botLogging = botLogging;
    this._adapter = botFrameworkService.adapter;
  }

  async sendMessage(sendMessagePayload: SendMessagePayload): Promise<void> {
    const startTime = new Date().getTime();
    try {
      const conversationId = sendMessagePayload.conversationId;
      const conversationReferenceModel = await this._conversationRefService.getConversationRefRepository(
        conversationId,
      );
      const botMessagePayload = await this._messageParser.toMessage<BotMessagePayload>(sendMessagePayload.messages);
      if (botMessagePayload.attachments?.length) {
        // send it in background.
        this._adapter.continueConversation(conversationReferenceModel!.conversationReference, async (turnContext) => {
          if (sendMessagePayload.clearState) {
            const conversationCache = await this._conversationDataAccessor.get(turnContext, {} as ConversationCache);
            conversationCache.model = undefined;
            await this._conversationState.saveChanges(turnContext, false);
          }
          await turnContext.sendActivity({ attachments: botMessagePayload.attachments });
        });
      }

      for (let index = 0; index < botMessagePayload.messages.length; index++) {
        const message = botMessagePayload.messages[index];
        this._adapter.continueConversation(conversationReferenceModel!.conversationReference, async (turnContext) => {
          if (sendMessagePayload.clearState) {
            const conversationCache = await this._conversationDataAccessor.get(turnContext, {} as ConversationCache);
            conversationCache.model = undefined;
            await this._conversationState.saveChanges(turnContext, false);
          }
          await turnContext.sendActivity(message);
        });
      }
      const endTime = new Date().getTime();
      this._botLogging.logInfo({
        message: 'Message sent to teams',
        action: 'success',
        source: 'TeamsConnector#sendMessage',
        durationMs: endTime - startTime,
      });
      return;
    } catch (error) {
      this._botLogging.logError({
        error: error as Error,
        action: 'error',
        source: 'TeamsConnector#sendMessage',
        data: sendMessagePayload,
      });
    }
  }

  getConversationId(conversationModel: ConversationModel): string {
    return conversationModel.botConversationId;
  }

  getUserId(conversationModel: ConversationModel): string | null {
    return conversationModel.user.botUserId;
  }

  /**
   * This function not required for teams now. Since in our case user will always initiate chat.
   * @param user
   * @param messages
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createConversationAndSendMessage<T>(user: User, messages: Array<MessagePayload>): Promise<T> {
    throw new Error('Method not implemented.');
  }

  /**
   * This function not required for teams now.
   * @param conversationId
   * @param conversation
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateConversation(conversationId: string, conversation: Partial<UpdateConversationPayload>): Promise<void> {
    throw new Error('Method not implemented.');
  }

  /**
   * This function not required for teams now. Since we have only one user in conversation.
   * @param actor
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getActors(actor: ActorTypeEnum): Promise<User[]> {
    throw new Error('Method not implemented.');
  }

  /**
   * This function not required for teams now. We can get conversation from activity.
   * @param conversationId
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getConversation(conversationId: string): Promise<ConversationPayload> {
    throw new Error('Method not implemented.');
  }
}
