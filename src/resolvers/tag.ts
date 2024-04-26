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
  async tags(@Ctx() { req }: Context): Promise<Tag[]> {
    return await postgresdb.getRepository(Tag).find({
      where: { user: { id: req.user?.id } },
      relations: ['user']
    })
  }

  @UseMiddleware(isAuthenticated)
  @Query(() => Tag)
  async tag(
    @Arg('id', () => ID) id: string,
    @Ctx() { req }: Context
  ): Promise<Tag> {
    const tag = await postgresdb
      .getRepository(Tag)
      .findOne({ where: { id, user: { id: req.user?.id } } })

    if (!tag) throw new Error('tag not found with that id')

    return tag
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => Tag)
  async createTag(
    @Arg('input') tagInput: TagInput,
    @Ctx() { req }: Context
  ): Promise<Tag> {
    try {
      await postgresdb
        .getRepository(Tag)
        .create({ ...tagInput, user: { id: req.user?.id } })
        .save()
    } catch (error) {
      throw new Error('Error creating tag')
    }

    return await postgresdb.getRepository(Tag).findOne({
      where: { name: tagInput.name, user: { id: req.user?.id } },
      relations: ['user']
    })
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => Tag)
  async updateTag(
    @Arg('input') tagInput: TagInput,
    @Ctx() { req }: Context
  ): Promise<Tag> {
    const tag = await postgresdb.getRepository(Tag).findOne({
      where: { id: tagInput.id, user: { id: req.user?.id } }
    })

    if (!tag) throw new Error('tag not found with that id')

    try {
      await postgresdb.getRepository(Tag).update(tag.id, tagInput)
    } catch (error) {
      throw new Error('Error updating tag')
    }

    return await postgresdb.getRepository(Tag).findOne({
      where: { id: tagInput.id, user: { id: req.user?.id } },
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
      where: { id, user: { id: req.user?.id } }
    })

    if (!tag) throw new Error('tag not found with that id')

    try {
      await postgresdb.getRepository(Tag).remove(tag)
    } catch (error) {
      throw new Error('Error deleting tag')
    }

    return true
  }
}
