import { Column, CreateDateColumn, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Call } from './call.entity';
import { User } from './user.entity';

@Entity()
export class Stats<T extends object = object> {

	@PrimaryGeneratedColumn('uuid')
	id?: string;

	@ManyToOne(() => User)
	@JoinTable()
	user: Partial<User>

	@Column({ enum: Call.Provider })
	provider: string

	@Column('json')
	data: T;

	@CreateDateColumn()
	dt?: Date
}