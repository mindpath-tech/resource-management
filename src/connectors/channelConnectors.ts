import { User } from '../types/bot';
import { ConversationModel } from '../models/conversation';
import { ConversationPayload, MessagePayload, SendMessagePayload, UpdateConversationPayload } from '../types/message';
import { ActorTypeEnum } from '../enum/actorTypeEnum';

export interface IChannelConnector {
  /**
   * Send message to channel.
   * @param sendMessagePayload Payload required to send message.
   */
  sendMessage(sendMessagePayload: SendMessagePayload): Promise<void>;

  /**
   * Create conversation and send messages.
   * @param user User associated with conversation.
   * @param messages Array of messages to send.
   */
  createConversationAndSendMessage(user: User, messages: Array<MessagePayload>): Promise<ConversationPayload>;

  /**
   * Function return conversationId for that channel.
   * @param conversationModel Conversation record from database.
   */
  getConversationId(conversationModel: ConversationModel): string | null;

  /**
   * Function return userId for that channel
   * @param conversationModel Conversation record from database.
   */
  getUserId(conversationModel: ConversationModel): string | null;

  /**
   * Update conversation on channel.
   * @param conversationId Channel conversationId
   * @param conversation Conversation payload that needs to update.
   */
  updateConversation(conversationId: string, conversation: Partial<UpdateConversationPayload>): Promise<void>;

  /**
   * Get conversation from channel.
   * @param conversationId Channel conversationId
   */
  getConversation(conversationId: string): Promise<ConversationPayload>;

  /**
   * Retrieve actors (Users/Agents) from channel.
   * @param actor user/agent
   */
  getActors(actor: ActorTypeEnum): Promise<Array<User>>;
}
