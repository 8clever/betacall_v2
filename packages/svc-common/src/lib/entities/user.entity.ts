import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

enum Roles {
  ADMIN = "admin",
  OPERATOR = "operator"
}

@Entity()
export class User {

  static Roles = Roles;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  login: string;

  @Column({ select: false })
  password: string;

  @Column({ enum: Roles })
  role: Roles;
}

export namespace User {
  export type Role = Roles;
}