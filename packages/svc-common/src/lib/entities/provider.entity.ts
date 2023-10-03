
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class Provider {

  @PrimaryGeneratedColumn('uuid')
  id: string;

	@Column()
	key: string;

	@Column()
	name: string;

	@Column({ default: false })
	internal: boolean

	@Column({ nullable: true, unique: true })
	apiKey: string;
}
