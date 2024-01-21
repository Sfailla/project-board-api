import { Field, ID, InputType, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  Entity,
  ManyToOne
} from 'typeorm'
import { User } from './user.js'

@Entity()
@ObjectType()
export class Tag extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field(() => String)
  @Column({ unique: true })
  name: string

  @Field(() => String)
  @Column()
  color: string

  @Field(() => [User], { nullable: true })
  @ManyToOne(() => User, (user) => user.id)
  user?: User[]

  @Field(() => ID, { nullable: true })
  @Column({ nullable: true })
  userId?: string

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date
}

@InputType()
export class TagInput {
  @Field(() => ID, { nullable: true })
  id?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  color?: string
}
