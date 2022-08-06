import { DataSource, DataSourceOptions } from 'typeorm'

const postgresDatasourceOptions: DataSourceOptions = {
	type: 'postgres',
	port: Number(process.env.DB_PORT),
	database: process.env.DB_NAME,
	host: process.env.DB_HOST,
	entities: [],
	synchronize: true,
	logging: true,
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD
}

export const dbConnection: DataSource = new DataSource(postgresDatasourceOptions)
