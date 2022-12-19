import { ActorTypeEnum } from '../enum/actorTypeEnum';
import { User } from '../types/bot';
import { ConversationModel } from '../models/conversation';
import IMessageParser from '../parsers/messageParser';
import LiveChatRepository from '../repository/liveChatRepository';
import { FreshChatMessagePayload, FreshChatUser } from '../types/liveChat';
import { ConversationPayload, MessagePayload, SendMessagePayload, UpdateConversationPayload } from '../types/message';
import { IChannelConnector } from './channelConnectors';
import { FRESH_CHAT_DEFAULT_AGENT_DETAILS } from '../constants/livechat';
import { ChannelTypeEnum } from '../enum/channelTypeEnum';
import { LiveChatConversationStatusEnum } from '../enum/liveChatConversationStatusEnum';
import BotLogging from '../helper/botLogging';

/**
 * Connector for freshchat.
 */
export default class LiveChatConnector implements IChannelConnector {
  private _freshChatRepository: LiveChatRepository;
  private _messageParser: IMessageParser;
  constructor(freshChatRepository: LiveChatRepository, messageParser: IMessageParser, readonly botLogging: BotLogging) {
    this._freshChatRepository = freshChatRepository;
    this._messageParser = messageParser;
  }

  async sendMessage(sendMessagePayload: SendMessagePayload): Promise<void> {
    const startTime = new Date().getTime();
    try {
      const { conversationId, user } = sendMessagePayload;
      let freshChatMessagePayload = await this._messageParser.toMessage<FreshChatMessagePayload>(
        sendMessagePayload.messages,
      );
      if (freshChatMessagePayload.actor_type === ActorTypeEnum.AGENT.toLowerCase()) {
        const agents = await this._freshChatRepository.getAgents();
        const botAgent = agents.find(
          (agent) =>
            agent.first_name.toLowerCase() === FRESH_CHAT_DEFAULT_AGENT_DETAILS.firstName &&
            agent.last_name.toLowerCase() === FRESH_CHAT_DEFAULT_AGENT_DETAILS.lastName,
        );
        if (botAgent) {
          freshChatMessagePayload = {
            ...freshChatMessagePayload,
            actor_id: botAgent.id,
          };
        }
      } else {
        freshChatMessagePayload = {
          ...freshChatMessagePayload,
          actor_id: user.userId,
        };
      }
      await this._freshChatRepository.sendMessageToConversation(conversationId, freshChatMessagePayload);
      const endTime = new Date().getTime();
      this.botLogging.logInfo({
        message: 'Message sent to freshchat',
        action: 'success',
        source: 'FreshChatConnector#sendMessage',
        durationMs: endTime - startTime,
      });
    } catch (error) {
      this.botLogging.logError({
        error: error as Error,
        action: 'error',
        data: sendMessagePayload,
        source: 'FreshChatConnector#sendMessage',
      });
    }
  }

  async createConversationAndSendMessage(
    user: User,
    messages: Array<MessagePayload>,
    status?: LiveChatConversationStatusEnum,
  ): Promise<ConversationPayload> {
    const response = await Promise.all([
      this._freshChatRepository.createUser(user),
      this._freshChatRepository.getChannels(),
    ]);
    const userId = response[0].id;
    const channelId = response[1][0].id;
    let freshChatMessagePayload = await this._messageParser.toMessage<FreshChatMessagePayload>(messages);

    if (freshChatMessagePayload.actor_type === ActorTypeEnum.BOT.toLowerCase()) {
      const agents = await this._freshChatRepository.getAgents();
      const botAgent = agents.find(
        (agent) =>
          agent.first_name.toLowerCase() === FRESH_CHAT_DEFAULT_AGENT_DETAILS.firstName &&
          agent.last_name.toLowerCase() === FRESH_CHAT_DEFAULT_AGENT_DETAILS.lastName,
      );
      if (botAgent) {
        freshChatMessagePayload = {
          ...freshChatMessagePayload,
          actor_id: botAgent.id,
          channel_id: channelId,
        };
      }
    } else {
      freshChatMessagePayload = {
        ...freshChatMessagePayload,
        actor_id: userId,
        channel_id: channelId,
      };
    }

    const conversation = await this._freshChatRepository.createConversation(
      userId,
      channelId,
      freshChatMessagePayload,
      status,
    );
    return {
      conversationId: conversation.conversation_id,
      userId,
      channelType: ChannelTypeEnum.FRESH_CHAT,
    };
  }

  async updateConversation(conversationId: string, conversation: Partial<UpdateConversationPayload>): Promise<void> {
    await this._freshChatRepository.updateConversation(
      conversationId,
      conversation.status as LiveChatConversationStatusEnum,
    );
    return;
  }

  async getConversation(conversationId: string): Promise<ConversationPayload> {
    const conversation = await this._freshChatRepository.getConversation(conversationId);
    return {
      conversationId: conversation?.conversation_id,
      status: conversation?.status,
      channelType: ChannelTypeEnum.FRESH_CHAT,
    };
  }

  async getActors(actor: ActorTypeEnum): Promise<Array<User>> {
    let freshChatUsers: Array<FreshChatUser> = [];
    if (actor === ActorTypeEnum.AGENT) {
      freshChatUsers = await this._freshChatRepository.getAgents();
    }
    return freshChatUsers.map((freshChatUser) => this._deriveUserFromFreshchatUser(freshChatUser));
  }

  getConversationId(conversationModel: ConversationModel): string | null {
    return conversationModel.agentChannelConversationId;
  }

  getUserId(conversationModel: ConversationModel): string | null {
    return conversationModel.user.agentChannelUserId;
  }

  private _deriveUserFromFreshchatUser(freshChatUser: FreshChatUser): User {
    return {
      ...freshChatUser,
      avatar: freshChatUser.avatar?.url,
      firstName: freshChatUser.first_name,
      lastName: freshChatUser.last_name,
      userId: freshChatUser.id,
    };
  }
}
