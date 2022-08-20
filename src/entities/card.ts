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
import { Project } from './project'

@Entity()
@ObjectType()
export class Card extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn()
	id: number

	@Field(() => Project)
	@ManyToOne(() => Project, project => project.id)
	project: Project

	@Field(() => String)
	@Column()
	title: string

	@Field(() => String, { nullable: true })
	@Column({ nullable: true })
	description?: string

	@Field(() => [User])
	@ManyToMany(() => User, user => user.email)
	asignee: User[]

	@Field(() => Date)
	@Column()
	startDate: Date

	@Field(() => Date)
	@Column()
	endDate: Date

	@Field(() => ProjectBoardStatus, { defaultValue: ProjectBoardStatus.Open })
	@Column({
		type: 'enum',
		enum: ProjectBoardStatus,
		default: ProjectBoardStatus.Open
	})
	status: string[]

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
