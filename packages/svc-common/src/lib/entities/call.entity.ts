import { Entity, PrimaryGeneratedColumn, JoinTable, ManyToOne, Column, CreateDateColumn, Index } from 'typeorm'
import { User } from './user.entity';

enum Statuses {
  COMPLETED = 'completed',
  OPERATOR = "operator",
  NOT_PROCESSED = "not_processed",
  UNDER_CALL = "under_call",
  REPLACE_DATE = "replace_date",
  CONNECTING_PROBLEM = 'connecting-problem'
}

export enum Providers {
  TOP_DELIVERY = "top-delivery",
  B2CPL = 'b2cpl'
}

@Entity()
export class Call {
  static Provider = Providers

  static Status = Statuses

  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @ManyToOne(() => User)
  @JoinTable()
  user: User

  @Column({ enum: Statuses })
  status: Statuses;

  @CreateDateColumn()
  dt?: number;

  @Column()
  phone: string;

  @Column({ enum: Providers })
  provider: Providers;

  @Column({ default: 3 })
  utcOffset?: number;

  @Column({ default: false })
  manualOnly?: boolean;

  /** MAIN RELATION WITH ORDERS */
  @Index()
  @Column()
  orderId: string;

  @Column({ nullable: true })
  history?: boolean;

  @Column({ nullable: true })
  dtNextCall?: Date;

  @Column({ nullable: true })
  callId?: string;

  @Column({ nullable: true })
  region?: string;
}

export namespace Call {
  export type Provider = Providers;
  export type Status = Statuses;
}