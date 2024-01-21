import { DataSource, DataSourceOptions } from 'typeorm'
import dotenv from 'dotenv'
import { TerminalColors } from '../types.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const entityPaths = path.join(__dirname, '../entities/*{.js,.ts}')
const postgresTerminalSuccess =
  '[postgres]: 🚀 ✨ data source has been initialized'
const postgresTerminalError =
  '[postgres]: 🧨 error during data source initialization'

dotenv.config()

const postgresDatasourceOptions: DataSourceOptions = {
  type: 'postgres',
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  entities: [entityPaths],
  synchronize: true,
  logging: true,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD
}

export const postgresdb: DataSource = new DataSource(postgresDatasourceOptions)

export const initializePostgresDatabase = async (): Promise<void> => {
  try {
    await postgresdb.initialize()
    console.log(TerminalColors.Magenta, postgresTerminalSuccess)
  } catch (error) {
    console.log(TerminalColors.Red, postgresTerminalError)
    console.log(TerminalColors.Red, error)
  }
}
