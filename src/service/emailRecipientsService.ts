import { EmailRecipientModel } from '../models/emailRecipients';
import EmailRecipientRepository from '../repository/emailRecipientRepository';

/**
 * Perform business logic for email receipts.
 */
export class EmailRecipientsService {
  private _emailRecipientRepository: EmailRecipientRepository;
  constructor(emailRecipientRepository: EmailRecipientRepository) {
    this._emailRecipientRepository = emailRecipientRepository;
  }

  public async getEmailRecipients(): Promise<Array<EmailRecipientModel>> {
    return await this._emailRecipientRepository.getAll();
  }

  async addConversationReference(recipients: Array<EmailRecipientModel>): Promise<void> {
    const models = recipients.map((recipient) => {
      const emailRecipientModel = new EmailRecipientModel();
      emailRecipientModel.email = recipient.email;
      emailRecipientModel.name = recipient.name;
      emailRecipientModel.timezone = recipient.timezone;
      return emailRecipientModel;
    });
    await this._emailRecipientRepository.add(models);
    return;
  }
}
