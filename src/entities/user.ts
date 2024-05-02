import { Field, ID, InputType, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn
} from 'typeorm'

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  firstname?: string

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  lastname?: string

  @Field(() => String, { nullable: true })
  get fullname(): string {
    if (this.firstname && this.lastname) {
      return `${this.firstname} ${this.lastname}`
    }
    return null
  }

  @Field(() => String)
  @Column({ unique: true })
  username: string

  @Field(() => String)
  @Column({ unique: true })
  email: string

  @Field(() => String, { nullable: true })
  @Column()
  password?: string

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  company?: string

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  position?: string

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  avatar?: string

  @Field(() => Date, { nullable: true })
  @CreateDateColumn()
  createdAt?: Date

  @Field(() => Date, { nullable: true })
  @CreateDateColumn()
  updatedAt?: Date
}

@ObjectType()
export class AuthUser {
  @Field(() => User)
  user: User

  @Field(() => String)
  token: string
}

@ObjectType()
export class LogoutUser {
  @Field(() => String, { nullable: true })
  user: null
}

@InputType()
export class UserInput implements Partial<User> {
  @Field(() => String, { nullable: true })
  username: string

  @Field(() => String, { nullable: true })
  email: string

  @Field(() => String, { nullable: true })
  password: string

  @Field(() => String, { nullable: true })
  firstname?: string

  @Field(() => String, { nullable: true })
  lastname?: string

  @Field(() => String, { nullable: true })
  company?: string

  @Field(() => String, { nullable: true })
  position?: string

  @Field(() => String, { nullable: true })
  avatar?: string
}
