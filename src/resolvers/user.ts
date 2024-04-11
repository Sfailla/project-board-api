import { Context } from '../types.js'
import { postgresdb } from '../config/postgres-db.js'
import { isAuthenticated } from '../middleware/isAuthenticated.js'
import {
  decryptPassword,
  encryptPassword,
  generateAuthToken
} from '../utils/helper-fns.js'
import {
  createDefaultCategories,
  createDefaultTags
} from '../utils/db-utils.js'
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware
} from 'type-graphql'
import { UserInput, User, AuthUser, LogoutUser } from '../entities/user.js'

@Resolver()
export class UserResolver {
  @Query(() => User)
  async getUserByEmail(
    @Arg('email', () => String) email: string
  ): Promise<User> {
    const user = await postgresdb
      .getRepository(User)
      .findOne({ where: { email } })

    if (!user) throw new Error('User not found')
    return user
  }

  @UseMiddleware(isAuthenticated)
  @Query(() => User, { nullable: true, complexity: 5 })
  async me(@Ctx() { req }: Context): Promise<User | null> {
    if (!req.user?.id) {
      return null
    }

    const user = await postgresdb
      .getRepository(User)
      .findOne({ where: { id: req.user.id } })

    if (!user) {
      return null
    }

    return user
  }

  @Query(() => LogoutUser, { nullable: true })
  logout(@Ctx() { req }: Context): { user: null } {
    req.user = null
    req.headers['x-auth-token'] = null
    return { user: null }
  }

  @Mutation(() => AuthUser)
  async createUser(
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

    await createDefaultCategories(user)
    await createDefaultTags(user)

    return { user, token }
  }

  @Mutation(() => AuthUser)
  async login(
    @Arg('email', () => String) email: string,
    @Arg('password', () => String) password: string,
    @Ctx() { res }: Context
  ): Promise<{ user: User; token: string }> {
    const user = await postgresdb
      .getRepository(User)
      .findOne({ where: { email } })

    if (!user) {
      throw new Error('User not found with that email')
    }

    const isPasswordValid =
      user.password && (await decryptPassword(password, user.password))

    if (!isPasswordValid) {
      throw new Error(`Invalid password for email: ${email}`)
    }

    const token = generateAuthToken(user)

    res.header('x-auth-token', token)

    return { user, token }
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => User)
  async updateUser(
    @Arg('input') userInput: UserInput,
    @Ctx() { req }: Context
  ): Promise<User> {
    const user = await postgresdb
      .getRepository(User)
      .findOne({ where: { id: req.user?.id } })

    if (!user) {
      throw new Error('User not found')
    }

    await postgresdb.getRepository(User).update(req.user?.id, userInput)

    return await postgresdb
      .getRepository(User)
      .findOne({ where: { id: req.user?.id } })
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => Boolean)
  async deleteUser(@Ctx() { req }: Context): Promise<boolean> {
    const user = await postgresdb
      .getRepository(User)
      .findOne({ where: { id: req.user?.id } })

    if (!user) {
      throw new Error('User not found')
    }

    await postgresdb.getRepository(User).delete(req.user?.id)

    return true
  }
}
