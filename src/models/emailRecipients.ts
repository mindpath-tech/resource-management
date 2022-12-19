import { EmailTypeEnum } from '../enum/emailTypeEnum';
import { Column, Entity, Unique } from 'typeorm';
import { ModelTemplate } from './modelTemplates';

@Unique('unique_email_for_type', ['email', 'emailType']) // named; multiple fields
@Entity({ name: 'emailRecipients' })
export class EmailRecipientModel extends ModelTemplate {
  @Column('varchar', { nullable: false, length: 100 })
  name: string;

  @Column('varchar', { nullable: false, length: 100 })
  email: string;

  @Column('varchar', { nullable: false, length: 100 })
  timezone: string;

  @Column('varchar', { nullable: false, length: 100 })
  emailType: EmailTypeEnum;
}
