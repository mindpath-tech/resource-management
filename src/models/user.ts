import { ActorTypeEnum } from '../enum/actorTypeEnum';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { ConversationModel } from './conversation';
import { ModelTemplate } from './modelTemplates';
import { HardwareRequestModel } from './hardwareRequest';

@Entity({ name: 'users' })
export class UserModel extends ModelTemplate {
  @Column('text', { nullable: false })
  firstName: string;

  @Column('text', { nullable: true })
  lastName: string | null;

  @Column('text', { nullable: true })
  email: string | null;

  @Column('text', { nullable: true })
  avatar: string | null;

  @Column('text', { nullable: true })
  phone: string | null;

  @Column('varchar', { nullable: true, unique: true, length: 250 })
  botUserId: string;

  @Column('text', { nullable: true })
  agentChannelUserId: string | null;

  @Column('varchar', { nullable: false, default: ActorTypeEnum.USER })
  type: ActorTypeEnum;

  @OneToOne(() => ConversationModel, (conversation) => conversation.user)
  public conversation: ConversationModel;

  @OneToMany(() => HardwareRequestModel, (hardwareRequest) => hardwareRequest.user)
  public hardwareRequest: Array<HardwareRequestModel>;
}
