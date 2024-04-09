import { Field, ID, InputType, ObjectType } from 'type-graphql'
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Column
} from 'typeorm'
import { User } from './user.js'

@Entity()
@ObjectType()
export class Category extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field(() => String)
  @Column({ unique: true })
  name: string

  @Field(() => String)
  @Column()
  status: string

  @Field(() => User, { nullable: true })
  @JoinColumn({ name: 'user' })
  @ManyToOne(() => User, (user) => user.id)
  user: User | null

  @Field(() => Date, { nullable: true })
  @CreateDateColumn()
  createdAt?: Date

  @Field(() => Date, { nullable: true })
  @UpdateDateColumn()
  updatedAt?: Date
}

@InputType()
export class CategoryInput implements Partial<Category> {
  @Field(() => ID, { nullable: true })
  id: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  status?: string
}
