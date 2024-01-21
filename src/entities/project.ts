import { ObjectType, Field, ID } from 'type-graphql'
import {
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne
} from 'typeorm'
import { User } from './user.js'

@Entity()
@ObjectType()
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
  @Column({ unique: true })
  name: string

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  description?: string

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date
}
