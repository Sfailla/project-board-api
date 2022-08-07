import {
	BaseEntity,
	PrimaryGeneratedColumn,
	Column,
	Entity,
	CreateDateColumn,
	UpdateDateColumn
} from 'typeorm'
import { User, ProjectBoardStatus, Tag } from '../types/shared'

@Entity()
export class BoardEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	title: string

	@Column({ nullable: true })
	description?: string | null

	@Column()
	user: User

	@Column()
	startDate: Date

	@Column()
	endDate: Date

	@Column()
	color: Date

	@Column({
		type: 'enum',
		enum: ProjectBoardStatus,
		default: ProjectBoardStatus.Open
	})
	progress: string[]

	@Column({ nullable: true })
	tags?: Tag | null

	@CreateDateColumn()
	createdAt: Date

	@UpdateDateColumn()
	updatedAt: Date
}
