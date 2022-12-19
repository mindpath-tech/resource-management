import { DeliverOptionEnum } from 'src/enum/deliveryOptionEnum';
import { PriorityEnum } from 'src/enum/priorityEnum';
import { RequestStatusEnum } from 'src/enum/requestStatusEnum';
import { RequestTypeEnum } from 'src/enum/requestTypeEnum';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { ConversationModel } from './conversation';
import { ModelTemplate } from './modelTemplates';
import { UserModel } from './user';

@Entity({ name: 'hardwareRequest' })
export class HardwareRequestModel extends ModelTemplate {
  @ManyToOne(() => UserModel, (user) => user.hardwareRequest)
  @JoinColumn({ referencedColumnName: 'key', name: 'userKey' })
  user: UserModel;

  @Column('int', { name: 'userKey', nullable: false })
  userKey: number;

  @Column('varchar', { nullable: false, length: 50 })
  @Index()
  hardwareId: string;

  @Column('varchar', { nullable: false, length: 50 })
  @Index()
  priority: PriorityEnum;

  @Column('varchar', { nullable: false, length: 50 })
  @Index()
  status: RequestStatusEnum;

  @Column('text', { nullable: true })
  remark: string | null;

  @Column('int', { nullable: false, default: 0 })
  requestedQuantity: number;

  @Column('int', { nullable: false, default: 0 })
  allocatedQuantity: number;

  @Column('varchar', { nullable: false, length: 50 })
  @Index()
  requestType: RequestTypeEnum;

  @Column('text', { nullable: true })
  description: string | null;

  @Column('text', { nullable: false })
  deliveryOption: DeliverOptionEnum;

  @Column('text', { nullable: true })
  deliveryAddress: string | null;

  @OneToOne(() => ConversationModel, (conversation) => conversation.hardwareRequest)
  @JoinColumn({ referencedColumnName: 'key', name: 'conversationKey' })
  conversation: ConversationModel;

  @Column('int', { name: 'conversationKey', nullable: false })
  conversationKey: number;
}
