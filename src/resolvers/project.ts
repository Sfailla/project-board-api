import { isAuthenticated } from '../middleware/isAuthenticated.js'
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
import { Project, ProjectInput } from '../entities/project.js'
import { Context } from '../types.js'
import { Category } from '../entities/category.js'

@Resolver(Project)
export class ProjectResolver {
  @UseMiddleware(isAuthenticated)
  @Query(() => [Project])
  async projects(@Ctx() { req }: Context): Promise<Project[]> {
    return await postgresdb.getRepository(Project).find({
      where: { user: { id: req.user?.id } },
      relations: ['user', 'categories'],
      order: { createdAt: 'ASC' }
    })
  }

  @UseMiddleware(isAuthenticated)
  @Query(() => Project)
  async project(
    @Arg('id', () => ID) id: string,
    @Ctx() { req }: Context
  ): Promise<Project> {
    const project = await postgresdb.getRepository(Project).findOne({
      where: { id, user: { id: req.user?.id } },
      relations: ['user', 'categories']
    })

    if (!project) throw new Error('Project not found with that id')

    return project
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => Project)
  async createProject(
    @Arg('name', () => String) name: string,
    @Arg('description', () => String, { nullable: true }) description: string,
    @Ctx() { req }: Context
  ): Promise<Project> {
    const categoryRepository = postgresdb.getRepository(Category)
    const projectRepository = postgresdb.getRepository(Project)

    const categories = await categoryRepository.find({
      where: { user: { id: req.user?.id } }
    })

    await projectRepository
      .create({
        name,
        description,
        categories,
        user: { id: req.user?.id }
      })
      .save()

    return await postgresdb.getRepository(Project).findOne({
      where: { name, user: { id: req.user?.id } },
      relations: ['user', 'categories']
    })
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => Project)
  async updateProject(
    @Arg('input') projectInput: ProjectInput,
    @Ctx() { req }: Context
  ): Promise<Project> {
    const { id } = projectInput
    const project = await postgresdb.getRepository(Project).findOne({
      where: { id, user: { id: req.user?.id } },
      relations: ['user']
    })

    if (!project) throw new Error('Project not found with that id')

    await postgresdb.getRepository(Project).update(id, projectInput)

    return await postgresdb.getRepository(Project).findOne({
      where: { id, user: { id: req.user?.id } },
      relations: ['user']
    })
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => Boolean)
  async deleteProject(
    @Arg('id', () => ID) id: string,
    @Ctx() { req }: Context
  ): Promise<boolean> {
    const project = await postgresdb
      .getRepository(Project)
      .findOne({ where: { id, user: { id: req.user?.id } } })

    if (!project) throw new Error('Project not found with that id')

    await postgresdb.getRepository(Project).delete({ id })

    return true
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => Project)
  async addCategory(
    @Arg('projectId', () => ID) projectId: string,
    @Arg('categoryId', () => ID) categoryId: string,
    @Ctx() { req }: Context
  ): Promise<Project> {
    const projectRepository = postgresdb.getRepository(Project)
    const categoryRepository = postgresdb.getRepository(Category)

    const project = await projectRepository.findOne({
      where: { id: projectId, user: { id: req.user?.id } },
      relations: ['user', 'categories']
    })

    if (!project) throw new Error('Project not found with that id')

    const category = await categoryRepository.findOneBy({ id: categoryId })

    if (!category) throw new Error('Category not found with that id')

    project.categories.push(category)

    await projectRepository.save(project)

    return await projectRepository.findOne({
      where: { id: projectId, user: { id: req.user?.id } },
      relations: ['user', 'categories']
    })
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => Project)
  async removeCategory(
    @Arg('projectId', () => ID) projectId: string,
    @Arg('categoryId', () => ID) categoryId: string,
    @Ctx() { req }: Context
  ): Promise<Project> {
    const projectRepository = postgresdb.getRepository(Project)
    const categoryRepository = postgresdb.getRepository(Category)

    const project = await projectRepository.findOne({
      where: { id: projectId, user: { id: req.user?.id } },
      relations: ['user', 'categories']
    })

    if (!project) throw new Error('Project not found with that id')

    const category = await categoryRepository.findOneBy({ id: categoryId })

    if (!category) throw new Error('Category not found with that id')

    project.categories = project.categories.filter((c) => c.id !== category.id)

    await projectRepository.save(project)

    return await projectRepository.findOne({
      where: { id: projectId, user: { id: req.user?.id } },
      relations: ['user', 'categories']
    })
  }
}
