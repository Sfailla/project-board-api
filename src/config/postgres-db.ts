import { DataSource, DataSourceOptions } from 'typeorm'
import dotenv from 'dotenv'
import path from 'path'

const entityPaths = path.join(__dirname, '../entities/*{.js,.ts}')

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
