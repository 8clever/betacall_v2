import { Column, CreateDateColumn, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Stats<T extends object = object> {

	@PrimaryGeneratedColumn('uuid')
	id?: string;

	@ManyToOne(() => User)
	@JoinTable()
	user: Partial<User>

	@Column('json')
	data: T;

	@CreateDateColumn()
	dt?: Date
}