import { Field, ID, InputType, ObjectType } from 'type-graphql'
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  Unique
} from 'typeorm'
import { User } from './user.js'

@Entity()
@ObjectType()
@Unique('UQ_CATEGORY_NAME', ['name', 'user'])
export class Category extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field(() => String)
  @Column()
  name: string

  @Field(() => String)
  @Column()
  status: string

  @Field(() => User, { nullable: true })
  @JoinColumn({ name: 'user' })
  @ManyToOne(() => User, (user) => user.id, {
    eager: true,
    onDelete: 'CASCADE'
  })
  user: User

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
