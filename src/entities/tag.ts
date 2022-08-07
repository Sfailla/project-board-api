import { Field, ID, ObjectType } from 'type-graphql'
import {
	BaseEntity,
	CreateDateColumn,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
	Column,
	Entity
} from 'typeorm'

@Entity()
@ObjectType()
export class TagEntity extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn()
	id: number

	@Field(() => String)
	@Column({ unique: true })
	name: string

	@Field(() => String)
	@Column()
	color: string

	@Field(() => Date)
	@CreateDateColumn()
	createdAt: Date

	@Field(() => Date)
	@UpdateDateColumn()
	updatedAt: Date
}
