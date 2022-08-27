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

	@Field(() => [Card], { nullable: true })
	@ManyToMany(() => Card, card => card.tags, { nullable: true })
	cards: Card[] | null

	@Field(() => Date)
	@CreateDateColumn()
	createdAt: Date

	@Field(() => Date)
	@UpdateDateColumn()
	updatedAt: Date
}
