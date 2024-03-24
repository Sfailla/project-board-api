import { ObjectType, Field, ID, InputType } from 'type-graphql'
import {
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Unique
} from 'typeorm'
import { User } from './user.js'

@Entity()
@ObjectType()
@Unique('UQ_USERID_NAME', ['userId', 'name'])
export class Project extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.id)
  user: User

  @Field(() => ID)
  @Column()
  userId: string

  @Field(() => String)
  @Column()
  name: string

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  description?: string

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
