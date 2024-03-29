import { Tag, TagInput } from '../entities/tag.js'
import {
  Arg,
  Ctx,
  ID,
  Mutation,
  Query,
  Resolver,
  UseMiddleware
} from 'type-graphql'
import { postgresdb } from '../config/postgres-db.js'
import { Context } from '../types.js'
import { isAuthenticated } from '../middleware/isAuthenticated.js'

@Resolver()
export class TagResolver {
  @UseMiddleware(isAuthenticated)
  @Query(() => [Tag])
  async getTags(@Ctx() { req }: Context): Promise<Tag[]> {
    const tags = await postgresdb
      .getRepository(Tag)
      .createQueryBuilder('tag')
      .where('tag.userId = :userId', { userId: req.user?.id })
      .orWhere('tag.userId IS NULL')
      .getMany()

    return tags
  }

  @UseMiddleware(isAuthenticated)
  @Query(() => Tag)
  async getTagById(
    @Arg('id', () => ID) id: string,
    @Ctx() { req }: Context
  ): Promise<Tag> {
    const tag = await postgresdb
      .getRepository(Tag)
      .findOne({ where: { id, userId: req.user?.id } })

    if (!tag) throw new Error('tag not found with that id')

    return tag
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => Tag)
  async createTag(
    @Arg('input') tagInput: TagInput,
    @Ctx() { req }: Context
  ): Promise<Tag> {
    const tag = await postgresdb
      .getRepository(Tag)
      .create({ ...tagInput, userId: req.user?.id })
      .save()

    if (!tag) throw new Error('tag not found with that id')

    return tag
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => Tag)
  async updateTag(
    @Arg('input') tagInput: TagInput,
    @Ctx() { req }: Context
  ): Promise<Tag> {
    const tag = await postgresdb.getRepository(Tag).findOne({
      where: { id: tagInput.id, userId: req.user?.id }
    })

    if (!tag) throw new Error('tag not found with that id')

    await postgresdb.getRepository(Tag).update(tag.id, tagInput)

    return await postgresdb.getRepository(Tag).findOne({
      where: { id: tagInput.id, userId: req.user?.id },
      relations: ['user']
    })
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => Boolean)
  async deleteTag(
    @Arg('id', () => ID) id: string,
    @Ctx() { req }: Context
  ): Promise<boolean> {
    const tag = await postgresdb.getRepository(Tag).findOne({
      where: { id, userId: req.user?.id }
    })

    if (!tag) throw new Error('tag not found with that id')

    await postgresdb.getRepository(Tag).remove(tag)

    return true
  }
}
