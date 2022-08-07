import 'reflect-metadata'
import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core'
import { TerminalColors } from './types/shared'
import { postgresdb } from './config/postgres-db'

dotenv.config()

const resolverPaths = path.join(__dirname, '/resolvers/*{.js,.ts}')
export const entityPaths = path.join(__dirname, '/entities/*{.js,.ts}')
const terminalStatus = `🚀🎉 [server]: running on http://localhost:${process.env.PORT}/graphql`

const app: Application = express()

const main = async () => {
	const server = new ApolloServer({
		schema: await buildSchema({
			resolvers: [resolverPaths],
			emitSchemaFile: true,
			validate: false
		}),
		context: ({ req, res }: { req: Request; res: Response }) => ({ req, res }),
		plugins: [ApolloServerPluginLandingPageGraphQLPlayground()]
	})

	app.use(express.json())
	app.use(express.urlencoded({ extended: true }))
	app.use(cors())

	postgresdb
		.initialize()
		.then(() => console.log(TerminalColors.Cyan, 'data source has been initialized!'))
		.catch(err => console.error(TerminalColors.Red, 'error during data source initialization', err))

	await server.start()
	server.applyMiddleware({ app })

	app.listen(process.env.PORT, () => console.log(TerminalColors.Green, terminalStatus))
}

main()
