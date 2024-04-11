import { postgresdb } from '../config/postgres-db.js'
import { User, Category, Tag } from '../entities/index.js'

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
