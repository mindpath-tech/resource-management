import { insertQueryBuilderForModels, upsertForInsertQueryBuilder } from '../utils/typeorm';
import { getRepository } from 'typeorm';
import { EmailRecipientModel } from '../models/emailRecipients';

/**
 * Class perform database operation on emailRecipients table.
 */
export default class EmailRecipientRepository {
  public async getAll(): Promise<Array<EmailRecipientModel>> {
    return await getRepository(EmailRecipientModel).find();
  }

  public async add(EmailRecipientModels: Array<EmailRecipientModel>): Promise<void> {
    const insertQueryBuilder = insertQueryBuilderForModels(EmailRecipientModels);
    const upsertQueryBuilder = upsertForInsertQueryBuilder(EmailRecipientModel, insertQueryBuilder, {
      criteriaProperties: ['email', 'emailType'],
    });
    await upsertQueryBuilder.execute();
    return;
  }
}
