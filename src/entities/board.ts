import { ObjectType, Field, ID } from 'type-graphql'
import { ProjectBoardStatus } from '../types/shared'
import { UserEntity } from './user'
import { TagEntity } from './tag'
import {
	BaseEntity,
	PrimaryGeneratedColumn,
	Column,
	Entity,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	ManyToMany
} from 'typeorm'

@Entity()
@ObjectType()
export class BoardEntity extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn()
	id: number

	@Field(() => String)
	@Column()
	title: string

	@Field(() => String)
	@Column({ nullable: true })
	description?: string

	@Field(() => UserEntity)
	@ManyToOne(() => UserEntity)
	user: UserEntity

	@Field(() => Date)
	@Column()
	startDate: Date

	@Field(() => Date)
	@Column()
	endDate: Date

	@Field(() => ProjectBoardStatus)
	@Column({
		type: 'enum',
		enum: ProjectBoardStatus,
		default: ProjectBoardStatus.Open
	})
	progress: string[]

	@Field(() => [TagEntity])
	@ManyToMany(() => TagEntity)
	tags?: TagEntity

	@Field(() => Date)
	@CreateDateColumn()
	createdAt: Date

	@Field(() => Date)
	@UpdateDateColumn()
	updatedAt: Date
}
