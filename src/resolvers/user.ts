import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver, UseMiddleware } from 'type-graphql'
import { User } from '../entities/user'
import { Context } from '../types/shared'
import { postgresdb } from '../config/postgres-db'
import { decryptPassword, encryptPassword, generateAuthToken, setCookie } from '../utils/helper-fns'
import { isAuthenticated } from '../middleware/isAuthenticated'

@ObjectType()
export class NullUser {
	@Field(() => String, { nullable: true })
	user: null
}

@ObjectType()
export class UserWithToken {
	@Field(() => User)
	user: User

	@Field(() => String)
	token: string
}

@Resolver()
export class UserResolver {
	@Query(() => User)
	async getUserByEmail(@Arg('email', () => String) email: string): Promise<User> {
		const user = await postgresdb.getRepository(User).findOne({ where: { email } })

		if (!user) throw new Error('User not found')
		return user
	}

	@UseMiddleware(isAuthenticated)
	@Query(() => User, { nullable: true, complexity: 5 })
	async me(@Ctx() { req }: Context): Promise<User | undefined> {
		if (!req.user?.id) {
			return undefined
		}

		const user = await postgresdb.getRepository(User).findOne({ where: { id: req.user.id } })

		if (!user) {
			return undefined
		}

		return user
	}

	@Mutation(() => UserWithToken)
	async register(
		@Arg('email', () => String) email: string,
		@Arg('username', () => String) username: string,
		@Arg('password', () => String) password: string,
		@Ctx() { res }: Context
	): Promise<{ user: User; token: string }> {
		const user = await postgresdb
			.getRepository(User)
			.create({
				email,
				username,
				password: await encryptPassword(password)
			})
			.save()

		const token = generateAuthToken(user)

		res.set('x-auth-token', token)
		setCookie(res, 'x-auth-token', token)

		return { user, token }
	}

	@Mutation(() => UserWithToken)
	async login(
		@Arg('email', () => String) email: string,
		@Arg('password', () => String) password: string,
		@Ctx() { res }: Context
	): Promise<{ user: User; token: string }> {
		const user = await postgresdb.getRepository(User).findOne({ where: { email } })

		if (!user) {
			throw new Error('User not found with that email')
		}

		const isPasswordValid = user.password && (await decryptPassword(password, user.password))

		if (!isPasswordValid) {
			throw new Error('Invalid password')
		}

		const token = generateAuthToken(user)

		res.set('x-auth-token', token)
		setCookie(res, 'x-auth-token', token)

		return { user, token }
	}

	@Mutation(() => NullUser)
	logout(@Ctx() { res, req }: Context): NullUser {
		const user = null
		res.clearCookie('x-auth-token', { maxAge: 0 })
		req.user = null
		return { user }
	}
}
