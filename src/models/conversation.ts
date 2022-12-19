import { ChannelTypeEnum } from '../enum/channelTypeEnum';
import { Column, Entity, Index, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { ConversationStatusEnum } from '../enum/conversationStatus';
import { ModelTemplate } from './modelTemplates';
import { RatingModel } from './ratings';
import { UserModel } from './user';
import { HardwareRequestModel } from './hardwareRequest';

@Entity({ name: 'conversations' })
export class ConversationModel extends ModelTemplate {
  @Column('varchar', { nullable: false, length: 250 })
  @Index()
  botConversationId: string;

  @Column('text', { nullable: false })
  botChannelType: ChannelTypeEnum;

  @Column('varchar', { nullable: true, length: 50 })
  @Index()
  agentChannelConversationId: string | null;

  @Column('text', { nullable: true })
  agentChannelType: ChannelTypeEnum | null;

  @Column('text', { nullable: false })
  status: ConversationStatusEnum;

  @Column('boolean', { nullable: false, default: false })
  skipResolveOperation: boolean; // TODO; Rename this field to skipResolveOperation

  @Column('text', { nullable: true })
  agentId: string | null; // Assign to agent

  @OneToMany(() => RatingModel, (rating) => rating.conversation)
  public ratings: Array<RatingModel>;

  @OneToOne(() => UserModel, (user) => user.conversation, { cascade: true, nullable: true })
  @JoinColumn()
  public user: UserModel;

  @Column('int', { name: 'userKey', nullable: true })
  userKey: number;

  @OneToOne(() => HardwareRequestModel, (hardwareRequest) => hardwareRequest.conversation)
  hardwareRequest: HardwareRequestModel;
}
