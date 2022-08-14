import { Field, ID, ObjectType } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@ObjectType()
@Entity()
export class User extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn()
	id: number

	@Field(() => String, { nullable: true })
	@Column({ nullable: true })
	firstname?: string

	@Field(() => String, { nullable: true })
	@Column({ nullable: true })
	lastname?: string

	@Field(() => String)
	@Column({ unique: true })
	username: string

	@Field(() => String)
	@Column({ unique: true })
	email: string

	@Field(() => String)
	@Column()
	password?: string

	@Field(() => String, { nullable: true })
	@Column({ nullable: true })
	company?: string

	@Field(() => String, { nullable: true })
	@Column({ nullable: true })
	position?: string

	@Field(() => String, { nullable: true })
	@Column({ nullable: true })
	avatar?: string

	@Field(() => Date)
	@CreateDateColumn()
	createdAt?: Date

	@Field(() => Date)
	@CreateDateColumn()
	updatedAt?: Date
}
