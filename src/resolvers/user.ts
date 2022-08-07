import { Arg, Mutation, Query, Resolver } from 'type-graphql'
import { UserEntity } from '../entities/user'
import { User } from '../types/shared'
import { postgresdb } from '../config/postgres-db'
import { encryptPassword } from '../utils/helper-fns'

@Resolver()
export class UserResolver {
	@Query(() => UserEntity)
	async getUserByEmail(@Arg('email', () => String) email: string): Promise<UserEntity> {
		const user = await postgresdb.manager.findOne(UserEntity, { where: { email } })

		if (!user) throw new Error('User not found')
		return user
	}

	@Mutation(() => UserEntity)
	async register(
		@Arg('email', () => String) email: string,
		@Arg('username', () => String) username: string,
		@Arg('password', () => String) password: string
	): Promise<User> {
		const user = postgresdb.manager.create(UserEntity, {
			email,
			username,
			password: await encryptPassword(password)
		})
		await postgresdb.manager.save(user)

		return user
	}
}
