import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class UserEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ nullable: true })
	firstname?: string | null

	@Column({ nullable: true })
	lastname?: string | null

	@Column({ unique: true })
	username: string

	@Column({ unique: true })
	email: string

	@Column()
	password: string

	@Column({ nullable: true })
	company?: string | null

	@Column({ nullable: true })
	position?: string | null

	@Column({ nullable: true })
	avatar?: Buffer | string | null

	@CreateDateColumn()
	createdAt: Date
}
