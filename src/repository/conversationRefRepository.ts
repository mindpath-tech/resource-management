import { ConversationReferenceModel } from '../models/conversationReference';
import { insertQueryBuilderForModels, upsertForInsertQueryBuilder } from '../utils/typeorm';
import { getRepository } from 'typeorm';

/**
 * Class perform database operation on conversationReferences table.
 */
export default class ConversationRefRepository {
  public async get(botConversationId: string): Promise<ConversationReferenceModel | null> {
    const conversationReference = await getRepository(ConversationReferenceModel).findOne({
      botConversationId,
    });
    return conversationReference || null;
  }

  public async appOrUpdate(conversationReferenceModels: Array<ConversationReferenceModel>): Promise<void> {
    const insertQueryBuilder = insertQueryBuilderForModels(conversationReferenceModels);
    const upsertQueryBuilder = upsertForInsertQueryBuilder(ConversationReferenceModel, insertQueryBuilder, {
      criteriaProperties: ['botConversationId'],
    });
    await upsertQueryBuilder.execute();
    return;
  }
}
