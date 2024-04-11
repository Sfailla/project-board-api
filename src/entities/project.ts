import { ObjectType, Field, ID, InputType } from 'type-graphql'
import {
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Unique,
  JoinColumn,
  JoinTable,
  ManyToMany
} from 'typeorm'
import { User } from './user.js'
import { Category } from './category.js'

@Entity()
@ObjectType()
@Unique('UQ_USER_NAME', ['name', 'user'])
export class Project extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field(() => String)
  @Column()
  name: string

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  description?: string

  @Field(() => [Category])
  @JoinTable({ name: 'project_category' })
  @ManyToMany(() => Category, (category) => category.id, {
    onDelete: 'CASCADE'
  })
  categories: Category[]

  @Field(() => User)
  @JoinColumn({ name: 'user' })
  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE'
  })
  user: User

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  dueDate?: Date

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date
}

@InputType()
export class ProjectInput implements Partial<Project> {
  @Field(() => ID)
  id: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Date, { nullable: true })
  dueDate?: Date
}
