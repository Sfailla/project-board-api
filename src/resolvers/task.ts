import { postgresdb } from '../config/postgres-db.js'
import { OrderAndPositionInput, Task, TaskInput } from '../entities/task.js'
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
import { updateDisplayOrder } from '../utils/db-utils.js'

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
      relations: ['user', 'project', 'tags', 'category'],
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
      category: { id: taskInput.categoryId },
      tags
    })

    if (!task) throw new Error('Error creating task')

    try {
      await taskRepository.save(task)
    } catch (error) {
      throw new Error('Error saving task')
    }

    return await taskRepository.findOne({
      where: { id: task.id, user: { id: req.user?.id } },
      relations: ['user', 'project', 'tags', 'category']
    })
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => Task)
  async updateTask(
    @Arg('input') taskInput: TaskInput,
    @Ctx() { req }: Context
  ): Promise<Task> {
    const taskRepository = postgresdb.getRepository(Task)

    const task = await taskRepository.findOne({
      where: {
        id: taskInput.id,
        user: { id: req.user?.id },
        project: { id: taskInput.projectId }
      },
      relations: ['user', 'project']
    })

    if (!task) throw new Error('Task not found with that id')

    const updates = { ...task, ...taskInput }

    try {
      await taskRepository.update(task.id, updates)
    } catch (error) {
      throw new Error('Error updating task')
    }

    return await taskRepository.findOne({
      where: { id: taskInput.id, user: { id: req.user?.id } },
      relations: ['user', 'project', 'tags', 'category']
    })
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => [Task])
  async updateTaskOrderAndPosition(
    @Arg('input') orderAndPositionInput: OrderAndPositionInput,
    @Ctx() ctx: Context
  ): Promise<Task[]> {
    try {
      updateDisplayOrder(orderAndPositionInput, ctx)

      return await postgresdb.getRepository(Task).find({
        where: {
          project: { id: orderAndPositionInput.projectId },
          user: { id: ctx.req.user?.id }
        },
        relations: ['user', 'project', 'tags', 'category'],
        order: { createdAt: 'ASC' }
      })
    } catch (error) {
      throw new Error('Error updating task order and position')
    }
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

    try {
      await postgresdb.getRepository(Task).remove(task)
      return true
    } catch (error) {
      throw new Error('Error deleting task')
    }
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

    try {
      task.tags = [...task.tags, ...tags]
      await taskRepository.save(task)
    } catch (error) {
      throw new Error('Error adding tags to task')
    }

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

    try {
      task.tags = task.tags.filter((t) => !tagIds.includes(t.id))
      await taskRepository.save(task)
    } catch (error) {
      throw new Error('Error removing tags from task')
    }

    return await taskRepository.findOne({
      where: { id: taskId, user: { id: req.user?.id } },
      relations: ['user', 'project', 'tags']
    })
  }
}
