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

enum Providers {
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

  /** MAIN RELATION WITH ORDERS */
  @Index()
  @Column()
  orderId: string;

  @Column({ nullable: true })
  history?: boolean;

  @Column({ nullable: true })
  dtNextCall?: number;

  @Column({ nullable: true })
  callId?: string;

  @Column({ nullable: true })
  region?: string;
}

export namespace Call {
  export type Provider = Providers;
  export type Status = Statuses;
}