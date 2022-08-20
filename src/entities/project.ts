import { ObjectType, Field, ID } from 'type-graphql'
import {
	BaseEntity,
	PrimaryGeneratedColumn,
	Column,
	Entity,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne
} from 'typeorm'
import { User } from './user'

@Entity()
@ObjectType()
export class Project extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn()
	id: number

	@Field(() => User)
	@ManyToOne(() => User)
	user: User

	@Field(() => String)
	@Column()
	name: string

	@Field(() => String, { nullable: true })
	@Column({ nullable: true })
	description?: string

	@Field(() => Date)
	@CreateDateColumn()
	createdAt: Date

	@Field(() => Date)
	@UpdateDateColumn()
	updatedAt: Date
}
