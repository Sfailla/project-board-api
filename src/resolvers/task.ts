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
import { Tag } from '../entities/tag.js'
import { In } from 'typeorm'

@Resolver()
export class TaskResolver {
  @UseMiddleware(isAuthenticated)
  @Query(() => [Task])
  async getTasks(
    @Arg('projectId', () => ID) projectId: string,
    @Ctx() { req }: Context
  ): Promise<Task[]> {
    const tasks = await postgresdb
      .getRepository(Task)
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.tags', 'tags')
      .leftJoinAndSelect('task.user', 'user')
      .leftJoinAndSelect('task.project', 'project')
      .where('task.project = :projectId', { projectId })
      .andWhere('task.user = :userId', { userId: req.user?.id })
      .getMany()

    return tasks
  }

  @UseMiddleware(isAuthenticated)
  @Query(() => Task)
  async getTaskById(
    @Arg('id', () => ID) id: string,
    @Ctx() { req }: Context
  ): Promise<Task> {
    const task = await postgresdb.getRepository(Task).findOne({
      where: { id, user: { id: req.user?.id } },
      relations: ['user', 'project', 'tags']
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
    const tagRepository = postgresdb.getRepository(Tag)
    const taskRepository = postgresdb.getRepository(Task)

    const tags = await tagRepository.findBy({ id: In([...taskInput.tagIds]) })

    const task = taskRepository.create({
      ...taskInput,
      user: { id: req.user?.id },
      project: { id: taskInput.projectId },
      tags
    })

    await taskRepository.save(task)

    return await taskRepository.findOne({
      where: { id: task.id, user: { id: req.user?.id } },
      relations: ['user', 'project', 'tags']
    })
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => Task)
  async addTags(
    @Arg('taskId', () => ID) taskId: string,
    @Arg('tagIds', () => [ID]) tagIds: string[],
    @Ctx() { req }: Context
  ): Promise<Task> {
    const taskRepository = postgresdb.getRepository(Task)
    const tagRepository = postgresdb.getRepository(Tag)

    const task = await taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.tags', 'tags')
      .leftJoinAndSelect('task.user', 'user')
      .leftJoinAndSelect('task.project', 'project')
      .where('task.id = :taskId', { taskId })
      .andWhere('task.user = :userId', { userId: req.user?.id })
      .getOne()

    if (!task) throw new Error('Task not found with that id')

    const tags = await tagRepository.find({ where: { id: In(tagIds) } })

    if (tags.length !== tagIds.length)
      throw new Error('Some tags were not found')

    task.tags = [...task.tags, ...tags]

    await taskRepository.save(task)

    return task
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => Task)
  async updateTask(
    @Arg('input') taskInput: TaskInput,
    @Ctx() { req }: Context
  ): Promise<Task> {
    const task = await postgresdb.getRepository(Task).findOne({
      where: {
        id: taskInput.id,
        user: { id: req.user?.id },
        project: { id: taskInput.projectId }
      },
      relations: ['user', 'project']
    })

    if (!task) throw new Error('Task not found with that id')

    const updates = Object.assign({
      id: taskInput.id,
      title: taskInput.title || task.title,
      description: taskInput.description || task.description,
      assignee: taskInput.assignee || task.assignee,
      startDate: taskInput.startDate || task.startDate,
      endDate: taskInput.endDate || task.endDate,
      status: taskInput.status || task.status
    })

    await postgresdb.getRepository(Task).update(task.id, updates)

    return await postgresdb.getRepository(Task).findOne({
      where: { id: taskInput.id, user: { id: req.user?.id } },
      relations: ['user', 'project', 'tags']
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
      relations: ['user', 'project']
    })

    if (!task) throw new Error('No task found with that id')

    return await postgresdb.getRepository(Task).remove(task)
  }
}
