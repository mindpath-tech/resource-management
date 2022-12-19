import { Activity } from 'botbuilder-core';
import IMessageParser from '../parsers/messageParser';
import { ChannelTypeEnum } from '../enum/channelTypeEnum';
import { ConversationModel } from '../models/conversation';
import { MessageProcessor } from './messageProcessor';
import { User } from '../types/bot';

/**
 * Service layer for live agent.
 */
export class LiveAgentService {
  private _messageProcessor: MessageProcessor;
  private _messageParser: IMessageParser;
  constructor(messageProcessor: MessageProcessor, messageParser: IMessageParser) {
    this._messageProcessor = messageProcessor;
    this._messageParser = messageParser;
  }
  public async sendMessageToLiveAgent(user: User, contextActivity: Activity): Promise<ConversationModel> {
    const conversationId = contextActivity.conversation.id;
    const messages = await this._messageParser.fromMessage(contextActivity);
    const conversationModel = await this._messageProcessor.processMessage(
      conversationId,
      user,
      messages,
      contextActivity.channelId as ChannelTypeEnum,
      ChannelTypeEnum.FRESH_CHAT,
    );
    return conversationModel;
  }
}
