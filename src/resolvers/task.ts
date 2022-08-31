import { postgresdb } from '../config/postgres-db'
import { Task, TaskInput } from '../entities/task'
import { Arg, Ctx, ID, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql'
import { Context } from '../types/shared'
import { isAuthenticated } from '../middleware/isAuthenticated'

@Resolver()
export class TaskResolver {
	@UseMiddleware(isAuthenticated)
	@Query(() => [Task])
	async getTasks(@Ctx() { req }: Context): Promise<Task[]> {
		const tasks = await postgresdb
			.getRepository(Task)
			.find({ where: { userId: req.user?.id }, relations: ['user'] })

		return tasks
	}

	@UseMiddleware(isAuthenticated)
	@Query(() => Task)
	async getTaskById(@Arg('id', () => ID) id: string, @Ctx() { req }: Context): Promise<Task> {
		const task = await postgresdb
			.getRepository(Task)
			.findOne({ where: { id, userId: req.user?.id }, relations: ['user'] })

		if (!task) throw new Error('Task not found with that id')

		return task
	}

	@UseMiddleware(isAuthenticated)
	@Mutation(() => Task)
	async createTask(@Arg('input') taskInput: TaskInput, @Ctx() { req }: Context): Promise<Task> {
		const task = await postgresdb
			.getRepository(Task)
			.create({
				...taskInput,
				userId: req.user?.id
			})
			.save()

		if (!task) throw new Error('Task not found with that id')

		return task
	}

	@UseMiddleware(isAuthenticated)
	@Mutation(() => Task)
	async updateTask(
		@Arg('id', () => ID) id: string,
		@Arg('title') title: string,
		@Arg('description') description: string,
		@Ctx() { req }: Context
	): Promise<Task> {
		const task = await postgresdb
			.getRepository(Task)
			.findOne({ where: { id, userId: req.user?.id }, relations: ['user'] })

		if (!task) throw new Error('Task not found with that id')

		const updatedTask = {
			...task,
			title,
			description
		}

		return await postgresdb.getRepository(Task).save(updatedTask)
	}

	@UseMiddleware(isAuthenticated)
	@Mutation(() => Task)
	async deleteTask(@Arg('id', () => ID) id: string, @Ctx() { req }: Context): Promise<Task> {
		const task = await postgresdb
			.getRepository(Task)
			.findOne({ where: { id, userId: req.user?.id }, relations: ['user'] })

		if (!task) throw new Error('Task not found with that id')

		return await postgresdb.getRepository(Task).remove(task)
	}
}
