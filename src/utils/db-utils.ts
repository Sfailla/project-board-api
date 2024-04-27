import { postgresdb } from '../config/postgres-db.js'
import {
  User,
  Category,
  Tag,
  OrderAndPositionInput,
  Task
} from '../entities/index.js'
import { Context } from '../types.js'

export const createDefaultCategories = async (user: User): Promise<void> => {
  await postgresdb
    .getRepository(Category)
    .createQueryBuilder('category')
    .insert()
    .values([
      { name: 'Open', status: 'open', user: { id: user.id } },
      { name: 'In Progress', status: 'in-progress', user: { id: user.id } },
      { name: 'In Review', status: 'in-review', user: { id: user.id } },
      { name: 'Complete', status: 'complete', user: { id: user.id } }
    ])
    .execute()
}

export const createDefaultTags = async (user: User): Promise<void> => {
  await postgresdb
    .getRepository(Tag)
    .createQueryBuilder('tag')
    .insert()
    .values([
      { name: 'Feature', color: '#5CFFBC', user: { id: user.id } },
      { name: 'Testing', color: '#6FCCF6', user: { id: user.id } },
      { name: 'UI/UX', color: '#8F6BED', user: { id: user.id } },
      { name: 'Enhancement', color: '#FF55EE', user: { id: user.id } }
    ])
    .execute()
}

export const updateDisplayOrder = async (
  orderAndPositionInput: OrderAndPositionInput,
  ctx: Context
): Promise<void> => {
  const entityManager = postgresdb.manager
  const {
    taskId,
    projectId,
    status,
    oldCategoryId,
    newCategoryId,
    oldPosition,
    newPosition
  } = orderAndPositionInput

  await entityManager.transaction(async (transactionalEntityManager) => {
    const taskRepository = transactionalEntityManager.getRepository(Task)

    await taskRepository.update(taskId, {
      category: { id: newCategoryId },
      displayOrder: newPosition,
      status
    })

    // If the category has changed, update the displayOrder of other tasks
    if (oldCategoryId !== newCategoryId) {
      // Decrease the displayOrder of tasks in the old category
      await taskRepository
        .createQueryBuilder()
        .update()
        .set({ displayOrder: () => '"displayOrder" - 1' })
        .where(
          '"user" = :userId and "project" = :projectId and "category" = :oldCategoryId and "displayOrder" > :oldPosition',
          { userId: ctx.req.user?.id, projectId, oldCategoryId, oldPosition }
        )
        .execute()

      // Increase the displayOrder of tasks in the new category if newPosition is !== 0
      await taskRepository
        .createQueryBuilder()
        .update()
        .set({ displayOrder: () => '"displayOrder" + 1' })
        .where(
          '"user" = :userId and "project" = :projectId and "category" = :newCategoryId and "displayOrder" >= :newPosition and "id" != :taskId',
          {
            userId: ctx.req.user?.id,
            projectId,
            newCategoryId,
            newPosition,
            taskId
          }
        )
        .execute()
    } else {
      // The category hasn't changed, so just update the displayOrder of tasks that come before the moved task
      if (newPosition > oldPosition) {
        await taskRepository
          .createQueryBuilder()
          .update()
          .set({ displayOrder: () => '"displayOrder" - 1' })
          .where(
            '"user" = :userId and "project" = :projectId and "category" = :categoryId and "displayOrder" > :oldPosition and "displayOrder" <= :newPosition and "id" != :taskId',
            {
              userId: ctx.req.user?.id,
              projectId,
              categoryId: newCategoryId,
              oldPosition,
              newPosition,
              taskId
            }
          )
          .execute()
      }
      // Increase the displayOrder of tasks that come after the moved task
      else {
        await taskRepository
          .createQueryBuilder()
          .update()
          .set({ displayOrder: () => '"displayOrder" + 1' })
          .where(
            '"user" = :userId and "project" = :projectId and "category" = :categoryId and "displayOrder" >= :newPosition and "displayOrder" < :oldPosition and "id" != :taskId',
            {
              userId: ctx.req.user?.id,
              projectId,
              categoryId: newCategoryId,
              oldPosition,
              newPosition,
              taskId
            }
          )
          .execute()
      }
    }
  })
}
