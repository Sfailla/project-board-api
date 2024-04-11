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
  async tasks(
    @Arg('projectId', () => ID) projectId: string,
    @Ctx() { req }: Context
  ): Promise<Task[]> {
    return await postgresdb.getRepository(Task).find({
      where: { project: { id: projectId }, user: { id: req.user?.id } },
      relations: ['user', 'project', 'tags'],
      order: { createdAt: 'ASC' }
    })
  }

  @UseMiddleware(isAuthenticated)
  @Query(() => Task)
  async task(
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

    const tags =
      (await tagRepository.findBy({ id: In(taskInput.tagIds) })) || []

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
  @Mutation(() => Boolean)
  async deleteTask(
    @Arg('id', () => ID) id: string,
    @Ctx() { req }: Context
  ): Promise<boolean> {
    const task = await postgresdb.getRepository(Task).findOne({
      where: { id, user: { id: req.user?.id } },
      relations: ['user', 'project']
    })

    if (!task) throw new Error('No task found with that id')

    await postgresdb.getRepository(Task).remove(task)

    return true
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

    const task = await taskRepository.findOne({
      where: { id: taskId, user: { id: req.user?.id } },
      relations: ['user', 'project', 'tags']
    })

    if (!task) throw new Error('Task not found with that id')

    const tags = await tagRepository.find({
      where: { id: In(tagIds), user: { id: req.user?.id } },
      relations: ['user']
    })

    if (tags.length !== tagIds.length)
      throw new Error('Some tags were not found')

    task.tags = [...task.tags, ...tags]

    await taskRepository.save(task)

    return await taskRepository.findOne({
      where: { id: taskId, user: { id: req.user?.id } },
      relations: ['user', 'project', 'tags']
    })
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => Task)
  async removeTags(
    @Arg('taskId', () => ID) taskId: string,
    @Arg('tagIds', () => [ID]) tagIds: string[],
    @Ctx() { req }: Context
  ): Promise<Task> {
    const taskRepository = postgresdb.getRepository(Task)
    const tagRepository = postgresdb.getRepository(Tag)

    const task = await taskRepository.findOne({
      where: { id: taskId, user: { id: req.user?.id } },
      relations: ['user', 'project', 'tags']
    })

    if (!task) throw new Error('Task not found with that id')

    const tags = await tagRepository.find({
      where: { id: In(tagIds), user: { id: req.user?.id } },
      relations: ['user']
    })

    if (tags.length !== tagIds.length)
      throw new Error('Some tags were not found')

    task.tags = task.tags.filter((t) => !tagIds.includes(t.id))

    await taskRepository.save(task)

    return await taskRepository.findOne({
      where: { id: taskId, user: { id: req.user?.id } },
      relations: ['user', 'project', 'tags']
    })
  }
}
