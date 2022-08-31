import { ObjectType, Field, ID, registerEnumType } from 'type-graphql'
import { ProjectBoardStatus } from '../types/shared'
import {
	BaseEntity,
	PrimaryGeneratedColumn,
	Column,
	Entity,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne
} from 'typeorm'
import { Project } from './project'
import { User } from './user'

registerEnumType(ProjectBoardStatus, {
	name: 'ProjectBoardStatus',
	description: 'The status of the task described on project board'
})

@Entity()
@ObjectType()
export class Card extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Field(() => Project)
	@ManyToOne(() => Project, project => project.id)
	project: Project

	@Field(() => ID)
	@Column()
	projectId: string

	@Field(() => User)
	@ManyToOne(() => User, user => user.id)
	user: User

	@Field(() => ID)
	@Column()
	userId: string

	@Field(() => String)
	@Column()
	title: string

	@Field(() => String, { nullable: true })
	@Column({ nullable: true })
	description?: string

	@Field(() => String, { nullable: true })
	@Column({ nullable: true })
	asignee?: string

	@Field(() => Date, { nullable: true })
	@Column({ nullable: true })
	startDate: Date

	@Field(() => Date, { nullable: true })
	@Column({ nullable: true })
	endDate: Date

	@Field(() => ProjectBoardStatus, { defaultValue: ProjectBoardStatus.Open })
	@Column({
		type: 'enum',
		enum: ProjectBoardStatus,
		default: ProjectBoardStatus.Open
	})
	status: ProjectBoardStatus

	@Field(() => String, { nullable: true })
	@Column({ nullable: true })
	tagName: string

	@Field(() => Date)
	@CreateDateColumn()
	createdAt: Date

	@Field(() => Date)
	@UpdateDateColumn()
	updatedAt: Date
}
