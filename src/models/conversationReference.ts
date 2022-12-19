import { ConversationReference } from 'botframework-schema';
import { Column, Entity, Index } from 'typeorm';
import { ModelTemplate } from './modelTemplates';

@Entity({ name: 'conversationReferences' })
export class ConversationReferenceModel extends ModelTemplate {
  @Column('varchar', { nullable: false, length: 250 })
  @Index()
  botConversationId: string;

  @Column('json')
  conversationReference: Partial<ConversationReference>;
}
