import { ObjectType, Field, ID } from 'type-graphql'
import { ProjectBoardStatus } from '../types/shared'
import { User } from './user'
import { Tag } from './tag'
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
export class ProjectBoard extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn()
	id: number

	@Field(() => String)
	@Column()
	title: string

	@Field(() => String, { nullable: true })
	@Column({ nullable: true })
	description?: string

	@Field(() => User)
	@ManyToOne(() => User)
	user: User

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

	@Field(() => [Tag])
	@ManyToMany(() => Tag)
	tags?: Tag

	@Field(() => Date)
	@CreateDateColumn()
	createdAt: Date

	@Field(() => Date)
	@UpdateDateColumn()
	updatedAt: Date
}
