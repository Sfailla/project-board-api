import { User } from '../entities/user'
import { isAuthenticated } from '../middleware/isAuthenticated'
import { Arg, Ctx, ID, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql'
import { postgresdb } from '../config/postgres-db'
import { Project } from '../entities/project'
import { Context } from '../types/shared'

@Resolver()
export class ProjectResolver {
	@UseMiddleware(isAuthenticated)
	@Query(() => [Project])
	async getProjects(@Ctx() { req }: Context): Promise<Project[]> {
		const projects = await postgresdb.getRepository(Project).find({
			where: { userId: req.user?.id as Partial<User> },
			relations: ['user']
		})
		return projects
	}

	@UseMiddleware(isAuthenticated)
	@Query(() => Project)
	async getProjectById(@Arg('id', () => ID) id: number, @Ctx() { req }: Context): Promise<Project> {
		const project = await postgresdb
			.getRepository(Project)
			.findOne({ where: { id, userId: req.user?.id as Partial<User> }, relations: ['user'] })

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
		const userId = req.user?.id as Partial<User>

		const project = await postgresdb
			.getRepository(Project)
			.create({ name, description, userId })
			.save()

		return project
	}
}
