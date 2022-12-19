import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ModelTemplate } from './modelTemplates';
import { ConversationModel } from './conversation';

@Entity({ name: 'ratings' })
export class RatingModel extends ModelTemplate {
  @Column('text', { nullable: true })
  agentId: string | null;

  @Column('text', { nullable: true })
  groupId: string | null;

  @Column('integer', { nullable: false })
  rating: number;

  @ManyToOne(() => ConversationModel, (conversation) => conversation.ratings)
  @JoinColumn({ referencedColumnName: 'key', name: 'conversationKey' })
  conversation: ConversationModel;

  @Column('int', { name: 'conversationKey', nullable: false })
  conversationKey: number;
}
