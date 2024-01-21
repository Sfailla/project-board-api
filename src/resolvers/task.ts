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
    const tasks = await postgresdb.getRepository(Task).find({
      where: { userId: req.user?.id, projectId },
      relations: ['user']
    })

    return tasks
  }

  @UseMiddleware(isAuthenticated)
  @Query(() => Task)
  async getTaskById(
    @Arg('id', () => ID) id: string,
    @Ctx() { req }: Context
  ): Promise<Task> {
    const task = await postgresdb.getRepository(Task).findOne({
      where: { id, userId: req.user?.id },
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
    @Arg('input') taskInput: TaskInput,
    @Ctx() { req }: Context
  ): Promise<Task> {
    const task = await postgresdb.getRepository(Task).findOne({
      where: { id: taskInput.id, userId: req.user?.id },
      relations: ['user']
    })

    if (!task) throw new Error('Task not found with that id')

    const updatedTask = {
      ...task,
      ...taskInput
    }

    return await postgresdb.getRepository(Task).save(updatedTask)
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => Task)
  async deleteTask(
    @Arg('id', () => ID) id: string,
    @Ctx() { req }: Context
  ): Promise<Task> {
    const task = await postgresdb.getRepository(Task).findOne({
      where: { id, userId: req.user?.id },
      relations: ['user']
    })

    if (!task) throw new Error('Task not found with that id')

    return await postgresdb.getRepository(Task).remove(task)
  }
}
