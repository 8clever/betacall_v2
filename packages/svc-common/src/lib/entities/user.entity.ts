import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class User {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  login: string;

  @Column({ select: false })
  password: string;
}