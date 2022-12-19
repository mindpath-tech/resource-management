import sgMail, { MailDataRequired } from '@sendgrid/mail';
/**
 * Class implement sendgrid function to send emails
 */
export class EmailRepository {
  private _from: string;

  constructor(apiKey: string, from: string) {
    sgMail.setApiKey(apiKey);
    this._from = from;
  }

  async send(message: MailDataRequired) {
    message.from = message.from || this._from;
    await sgMail.send(message);
  }
}
