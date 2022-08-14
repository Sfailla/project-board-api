import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { UserEntity } from '../entities/user'
import { Context, User } from '../types/shared'
import { postgresdb } from '../config/postgres-db'
import { decryptPassword, encryptPassword, generateAuthToken } from '../utils/helper-fns'

@Resolver()
export class UserResolver {
	@Query(() => UserEntity)
	async getUserByEmail(@Arg('email', () => String) email: string): Promise<UserEntity> {
		const user = await postgresdb.getRepository(UserEntity).findOne({ where: { email } })

		if (!user) throw new Error('User not found')
		return user
	}

	@Query(() => UserEntity, { nullable: true, complexity: 5 })
	async me(@Ctx() ctx: Context): Promise<User | undefined> {
		if (!ctx.req.user.id) {
			return undefined
		}

		const user = await postgresdb
			.getRepository(UserEntity)
			.findOne({ where: { id: ctx.req.user.id } })

		if (!user) {
			return undefined
		}

		return user
	}

	@Mutation(() => UserEntity)
	async register(
		@Arg('email', () => String) email: string,
		@Arg('username', () => String) username: string,
		@Arg('password', () => String) password: string,
		@Ctx() ctx: Context
	): Promise<User> {
		const user = await postgresdb
			.getRepository(UserEntity)
			.create({
				email,
				username,
				password: await encryptPassword(password)
			})
			.save()

		const token = generateAuthToken(user)
		ctx.res.set('x-auth-token', token)

		return user
	}

	@Mutation(() => UserEntity)
	async login(
		@Arg('email', () => String) email: string,
		@Arg('password', () => String) password: string,
		@Ctx() ctx: Context
	): Promise<UserEntity> {
		const user = await postgresdb.getRepository(UserEntity).findOne({ where: { email } })

		if (!user) {
			throw new Error('User not found with that email')
		}

		const isPasswordValid = await decryptPassword(password, user.password)

		if (!isPasswordValid) {
			throw new Error('Invalid password')
		}

		const token = generateAuthToken(user)
		ctx.res.set('x-auth-token', token)

		return user
	}
}
