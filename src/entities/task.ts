import { ObjectType, Field, ID, InputType, Int } from 'type-graphql'
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
import { Category } from './category.js'

@Entity()
@Unique('UQ_TASK_TITLE', ['title', 'user'])
@ObjectType()
export class Task extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

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

  @Field(() => String, { defaultValue: 'open' })
  @Column()
  status: string

  @Field(() => Int, { defaultValue: 0 })
  @Column({ default: 0 })
  displayOrder: number

  @Field(() => Project)
  @JoinColumn({ name: 'project' })
  @ManyToOne(() => Project, (project) => project.id, {
    eager: true,
    onDelete: 'CASCADE'
  })
  project: Project

  @Field(() => [Tag], { defaultValue: [] })
  @JoinTable({ name: 'task_tags' })
  @ManyToMany(() => Tag, (tag) => tag.id, {
    eager: true,
    onDelete: 'CASCADE'
  })
  tags: Tag[]

  @Field(() => User)
  @JoinColumn({ name: 'user' })
  @ManyToOne(() => User, (user) => user.id, {
    eager: true,
    onDelete: 'CASCADE'
  })
  user: User

  @Field(() => Category)
  @JoinColumn({ name: 'category' })
  @ManyToOne(() => Category, (category) => category.id, {
    eager: true,
    onDelete: 'CASCADE'
  })
  category: Category

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

  @Field(() => ID)
  categoryId: string

  @Field(() => String, { nullable: true })
  title?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  assignee?: string

  @Field(() => [ID], { nullable: true })
  tagIds?: string[]

  @Field(() => Date, { nullable: true })
  startDate?: Date

  @Field(() => Date, { nullable: true })
  endDate?: Date

  @Field(() => String, {
    defaultValue: 'Open',
    nullable: true
  })
  status?: string

  @Field(() => Int, { nullable: true })
  displayOrder?: number
}

@InputType()
export class OrderAndPositionInput {
  @Field(() => ID)
  taskId: string

  @Field(() => String)
  status: string

  @Field(() => ID)
  oldCategoryId: string

  @Field(() => ID)
  newCategoryId: string

  @Field(() => Int)
  oldPosition: number

  @Field(() => Int)
  newPosition: number
}
