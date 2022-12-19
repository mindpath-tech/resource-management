import {
  PrimaryGeneratedColumn,
  Index,
  Column,
  Generated,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

export abstract class ModelTemplate {
  @PrimaryGeneratedColumn('increment')
  public key: number;

  @Index({ unique: true })
  @Column('uuid')
  @Generated('uuid')
  public id: string;

  @CreateDateColumn()
  public createAt: Date;

  @UpdateDateColumn()
  public updateAt: Date;

  @VersionColumn({ default: 1 })
  public version: number;

  @Column('bool', { default: false })
  public deleted: boolean;
}

export interface ModelTemplateClass<ModelTemplate> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): ModelTemplate;
}
