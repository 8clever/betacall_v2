import { Entity, PrimaryGeneratedColumn, JoinTable, ManyToOne, Column, CreateDateColumn } from 'typeorm'
import { User } from './user.entity';

enum DeliveryType {
  PICKUP = "PICKUP",
  COURIER = "COURIER"
}

enum Status {
  NOT_PROCESSED = "not_processed",
  DONE = "done",
  DONE_PICKUP = "done_pickup",
  DENY = "deny",
  UNDER_CALL = "under_call",
  REPLACE_DATE = "replace_date",
  SKIP = "skip"
}

enum Provider {
  TOP_DELIVERY = "top-delivery",
  B2CPL = 'b2cpl'
}

@Entity()
export class Call {
  static Provider = Provider

  static Status = Status

  static DeliveryType = DeliveryType

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  @JoinTable()
  user: User

  @Column({ enum: Status })
  status: Status;

  @CreateDateColumn()
  dt: number;

  @Column()
  phone: string;

  @Column({ enum: Provider })
  provider: Provider;

  /** MAIN RELATION WITH ORDERS */
  @Column()
  orderId: string;

  @Column({ nullable: true })
  history?: boolean;

  @Column({ nullable: true })
  operatorTimeUsage?: number;

  @Column({ nullable: true })
  dtNextCall?: number;

  @Column({ nullable: true })
  callId?: string;

  @Column({ nullable: true })
  fullName?: string;

  @Column({ nullable: true })
  region?: string;

  @Column({ nullable: true })
  dtendOfStorage?: number;

  @Column({ enum: DeliveryType, nullable: true })
  deliveryType?: DeliveryType

  @Column({ nullable: true })
  marketName?: string;
}