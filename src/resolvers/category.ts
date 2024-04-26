import { postgresdb } from '../config/postgres-db.js'
import { Context } from '../types.js'
import { isAuthenticated } from '../middleware/isAuthenticated.js'
import { Category, CategoryInput } from '../entities/category.js'
import {
  Arg,
  Ctx,
  ID,
  Mutation,
  Query,
  Resolver,
  UseMiddleware
} from 'type-graphql'

@Resolver()
export class CategoryResolver {
  @UseMiddleware(isAuthenticated)
  @Query(() => [Category])
  async categories(@Ctx() { req }: Context): Promise<Category[]> {
    return await postgresdb.getRepository(Category).find({
      where: { user: { id: req.user?.id } },
      relations: ['user']
    })
  }

  @UseMiddleware(isAuthenticated)
  @Query(() => Category)
  async category(
    @Arg('id', () => ID) id: string,
    @Ctx() { req }: Context
  ): Promise<Category> {
    const category = await postgresdb
      .getRepository(Category)
      .findOne({ where: { id, user: { id: req.user?.id } } })

    if (!category) throw new Error('category not found with that id')

    return category
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => Category)
  async createCategory(
    @Arg('name', () => String) name: string,
    @Arg('status', () => String) status: string,
    @Ctx() { req }: Context
  ): Promise<Category> {
    try {
      await postgresdb
        .getRepository(Category)
        .create({ name, status, user: { id: req.user?.id } })
        .save()
    } catch (error) {
      throw new Error('Error creating category')
    }

    return await postgresdb.getRepository(Category).findOne({
      where: { name, user: { id: req.user?.id } },
      relations: ['user']
    })
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => Category)
  async updateCategory(
    @Arg('input') categoryInput: CategoryInput,
    @Ctx() { req }: Context
  ): Promise<Category> {
    const category = await postgresdb.getRepository(Category).findOne({
      where: { id: categoryInput.id, user: { id: req.user?.id } }
    })

    if (!category) throw new Error('category not found with that id')

    try {
      await postgresdb
        .getRepository(Category)
        .update(category.id, categoryInput)
    } catch (error) {
      throw new Error('Error updating category')
    }

    return await postgresdb.getRepository(Category).findOne({
      where: { id: categoryInput.id, user: { id: req.user?.id } },
      relations: ['user']
    })
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => [Category])
  async updateCategoriesDisplayOrder(
    @Arg('updatedCategories', () => [CategoryInput])
    updatedCategories: CategoryInput[],
    @Ctx() { req }: Context
  ): Promise<Category[]> {
    const entityManager = postgresdb.manager

    try {
      await entityManager.transaction(async (transactionalEntityManager) => {
        for (const category of updatedCategories) {
          await transactionalEntityManager
            .getRepository(Category)
            .update(category.id, {
              displayOrder: category.displayOrder
            })
        }
      })
    } catch (error) {
      throw new Error('Error updating category display order')
    }

    return await postgresdb.getRepository(Category).find({
      where: { user: { id: req.user?.id } },
      relations: ['user']
    })
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => Boolean)
  async deleteCategory(
    @Arg('id', () => ID) id: string,
    @Ctx() { req }: Context
  ): Promise<boolean> {
    const category = await postgresdb.getRepository(Category).findOne({
      where: { id, user: { id: req.user?.id } }
    })

    if (!category) throw new Error('category not found with that id')

    try {
      await postgresdb.getRepository(Category).remove(category)
      return true
    } catch (error) {
      throw new Error('Error deleting category')
    }
  }
}
