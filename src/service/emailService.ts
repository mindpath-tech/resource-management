import { MailDataRequired } from '@sendgrid/mail';
import { EmailRepository } from '../repository/emailRepository';

/**
 * Perform all the business logic related to email.
 */
export class EmailService {
  private _emailRepository: EmailRepository;

  constructor(emailRepository: EmailRepository) {
    this._emailRepository = emailRepository;
  }

  async send(message: MailDataRequired) {
    await this._emailRepository.send(message);
  }
}
