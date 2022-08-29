import { Field, ID, ObjectType } from 'type-graphql'
import {
	BaseEntity,
	CreateDateColumn,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
	Column,
	Entity,
	ManyToMany
} from 'typeorm'
import { Card } from './card'
import { User } from './user'

@Entity()
@ObjectType()
export class Tag extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Field(() => String)
	@Column({ unique: true })
	name: string

	@Field(() => String)
	@Column()
	color: string

	@Field(() => [Card])
	@ManyToMany(() => Card, card => card.tags)
	cards: Card[]

	@Field(() => ID)
	@Column()
	cardId: string

	@Field(() => Date)
	@CreateDateColumn()
	createdAt: Date

	@Field(() => Date)
	@UpdateDateColumn()
	updatedAt: Date
}
