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

@Resolver(Project)
export class ProjectResolver {
  @UseMiddleware(isAuthenticated)
  @Query(() => [Project])
  async getProjects(@Ctx() { req }: Context): Promise<Project[]> {
    return await postgresdb.getRepository(Project).find({
      where: { userId: req.user?.id },
      relations: ['user'],
      order: { createdAt: 'ASC' }
    })
  }

  @UseMiddleware(isAuthenticated)
  @Query(() => Project)
  async getProjectById(
    @Arg('id', () => ID) id: string,
    @Ctx() { req }: Context
  ): Promise<Project> {
    const project = await postgresdb.getRepository(Project).findOne({
      where: { id, userId: req.user?.id },
      relations: ['user']
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
    console.log({ name, description, userId: req.user?.id })

    const newProject = await postgresdb
      .getRepository(Project)
      .create({ name, description, userId: req.user?.id, user: req.user })
      .save()

    return newProject
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => Project)
  async updateProject(
    @Arg('input') projectInput: ProjectInput,
    @Ctx() { req }: Context
  ): Promise<Project> {
    const { id } = projectInput
    const project = await postgresdb.getRepository(Project).findOne({
      where: { id, userId: req.user?.id },
      relations: ['user']
    })

    if (!project) throw new Error('Project not found with that id')

    await postgresdb.getRepository(Project).update({ id }, projectInput)

    return await postgresdb.getRepository(Project).findOne({
      where: { id, userId: req.user?.id },
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
      .findOne({ where: { id, userId: req.user?.id } })

    if (!project) throw new Error('Project not found with that id')

    // assign to a variable to see what is returned after a delete is performed
    await postgresdb.getRepository(Project).delete({ id })

    return true
  }
}
