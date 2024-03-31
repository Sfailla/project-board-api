import {
  ObjectType,
  Field,
  ID,
  registerEnumType,
  InputType
} from 'type-graphql'
import { ProjectBoardStatus } from '../types.js'
import {
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  ManyToMany,
  JoinTable
} from 'typeorm'
import { Project } from './project.js'
import { User } from './user.js'
import { Tag } from './tag.js'

registerEnumType(ProjectBoardStatus, {
  name: 'ProjectBoardStatus',
  description: 'The status of the task described on project board'
})

@Entity()
@Unique('UQ_TASK_TITLE', ['title', 'user'])
@ObjectType()
export class Task extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field(() => Project, { nullable: true })
  @JoinColumn({ name: 'project' })
  @ManyToOne(() => Project, (project) => project.id, {
    onDelete: 'CASCADE'
  })
  project: Project

  @Field(() => [Tag], { defaultValue: [] })
  @JoinTable({ name: 'task_tags_relation' })
  @ManyToMany(() => Tag, (tag) => tag.id, {
    onDelete: 'CASCADE'
  })
  tags: Tag[]

  @Field(() => User)
  @JoinColumn({ name: 'user' })
  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE'
  })
  user: User

  @Field(() => String)
  @Column()
  title: string

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  assignee?: string

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

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date
}

@InputType()
export class TaskInput implements Partial<Task> {
  @Field(() => ID, { nullable: true })
  id?: string

  @Field(() => ID)
  projectId: string

  @Field(() => String, { nullable: true })
  title?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  asignee?: string

  @Field(() => [ID], { nullable: true })
  tagIds?: string[]

  @Field(() => Date, { nullable: true })
  startDate?: Date

  @Field(() => Date, { nullable: true })
  endDate?: Date

  @Field(() => ProjectBoardStatus, {
    defaultValue: ProjectBoardStatus.Open,
    nullable: true
  })
  status?: ProjectBoardStatus
}
