import { ConversationModel } from '../models/conversation';
import { EntityRepository, getRepository, InsertResult, UpdateResult } from 'typeorm';
import { insertQueryBuilderForModels } from '../utils/typeorm';

/**
 * Class perform database operation on conversation table.
 */
@EntityRepository(ConversationModel)
export default class ConversationRepository {
  public async update(id: string, model: Partial<ConversationModel>): Promise<UpdateResult> {
    return await getRepository(ConversationModel).update({ id }, model);
  }

  public async insert(model: ConversationModel): Promise<InsertResult> {
    const insertQueryBuilder = insertQueryBuilderForModels([model]);
    return await insertQueryBuilder.execute();
  }

  /**
   * Get conversation object either by bot conversationId or agentChannelConversationId
   * @param conversationId
   * @returns
   */
  public async getByConversationId(conversationId: string): Promise<ConversationModel | null> {
    const conversation = await getRepository(ConversationModel).findOne({
      where: [
        {
          botConversationId: conversationId,
        },
        {
          agentChannelConversationId: conversationId,
        },
      ],
      relations: ['user'],
    });
    return conversation || null;
  }

  /**
   * Get conversation by either botUserId or agentChannelUserId.
   * @param userId
   * @returns
   */
  public async getByUserId(userId: string): Promise<ConversationModel | null> {
    const conversation = await getRepository(ConversationModel).findOne({
      where: [
        {
          user: { botUserId: userId },
        },
        {
          user: { agentChannelUserId: userId },
        },
      ],
      relations: ['user'],
    });
    return conversation || null;
  }
}
