import { Field, ID, ObjectType } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
@ObjectType()
export class UserEntity extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn()
	id: number

	@Field(() => String)
	@Column({ nullable: true })
	firstname?: string | null

	@Field(() => String)
	@Column({ nullable: true })
	lastname?: string | null

	@Field(() => String)
	@Column({ unique: true })
	username: string

	@Field(() => String)
	@Column({ unique: true })
	email: string

	@Field(() => String)
	@Column()
	password: string

	@Field(() => String)
	@Column({ nullable: true })
	company?: string | null

	@Field(() => String)
	@Column({ nullable: true })
	position?: string | null

	@Field(() => Buffer)
	@Column({ nullable: true })
	avatar?: Buffer | string | null

	@Field(() => Date)
	@CreateDateColumn()
	createdAt: Date
}
