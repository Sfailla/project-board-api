import { Field, ID, InputType, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  Unique
} from 'typeorm'
import { User } from './user.js'

@Entity()
@Unique('UQ_TAG_NAME', ['name', 'user'])
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

  @Field(() => User, { nullable: true })
  @JoinColumn({ name: 'user' })
  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE'
  })
  user: User

  @Field(() => Date)
  @CreateDateColumn()
  createdAt?: Date

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt?: Date
}

@InputType()
export class TagInput implements Partial<Tag> {
  @Field(() => ID, { nullable: true })
  id?: string

  @Field(() => String)
  name: string

  @Field(() => String)
  color: string
}
