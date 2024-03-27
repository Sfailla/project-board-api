import { postgresdb } from '../config/postgres-db.js'
import { Task, TaskInput } from '../entities/task.js'
import {
  Arg,
  Ctx,
  ID,
  Mutation,
  Query,
  Resolver,
  UseMiddleware
} from 'type-graphql'
import { Context } from '../types.js'
import { isAuthenticated } from '../middleware/isAuthenticated.js'

@Resolver()
export class TaskResolver {
  @UseMiddleware(isAuthenticated)
  @Query(() => [Task])
  async getTasks(
    @Arg('projectId', () => ID) projectId: string,
    @Ctx() { req }: Context
  ): Promise<Task[]> {
    return await postgresdb.getRepository(Task).find({
      where: { user: { id: req.user?.id }, project: { id: projectId } },
      relations: ['user', 'project'],
      order: { createdAt: 'ASC' }
    })
  }

  @UseMiddleware(isAuthenticated)
  @Query(() => Task)
  async getTaskById(
    @Arg('id', () => ID) id: string,
    @Ctx() { req }: Context
  ): Promise<Task> {
    const task = await postgresdb.getRepository(Task).findOne({
      where: { id, user: { id: req.user?.id } },
      relations: ['user']
    })

    if (!task) throw new Error('Task not found with that id')

    return task
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => Task)
  async createTask(
    @Arg('input') taskInput: TaskInput,
    @Ctx() { req }: Context
  ): Promise<Task> {
    await postgresdb
      .getRepository(Task)
      .create({
        ...taskInput,
        user: { id: req.user?.id },
        project: { id: taskInput.projectId }
      })
      .save()

    return await postgresdb.getRepository(Task).findOne({
      where: {
        title: taskInput.title,
        user: { id: req.user?.id },
        project: { id: taskInput.projectId }
      },
      relations: ['user', 'project']
    })
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => Task)
  async updateTask(
    @Arg('input') taskInput: TaskInput,
    @Ctx() { req }: Context
  ): Promise<Task> {
    const task = await postgresdb.getRepository(Task).findOne({
      where: { id: taskInput.id, user: { id: req.user?.id } },
      relations: ['user']
    })

    if (!task) throw new Error('Task not found with that id')

    await postgresdb.getRepository(Task).update(task.id, taskInput)

    return await postgresdb.getRepository(Task).findOne({
      where: { id: taskInput.id, user: { id: req.user?.id } },
      relations: ['user']
    })
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => Task)
  async deleteTask(
    @Arg('id', () => ID) id: string,
    @Ctx() { req }: Context
  ): Promise<Task> {
    const task = await postgresdb.getRepository(Task).findOne({
      where: { id, user: { id: req.user?.id } },
      relations: ['user']
    })

    if (!task) throw new Error('No task found with that id')

    return await postgresdb.getRepository(Task).remove(task)
  }
}
