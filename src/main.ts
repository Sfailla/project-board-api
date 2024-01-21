// import cookieParser from 'cookie-parser'
import 'dotenv/config'
import 'reflect-metadata'
import http from 'node:http'
import express from 'express'
import cors, { CorsOptions } from 'cors'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { buildSchema } from 'type-graphql'
import { ApolloServer } from '@apollo/server'
import { Context, JwtTokenUser, TerminalColors } from './types.js'
import {
  UserResolver,
  TaskResolver,
  TagResolver,
  ProjectResolver
} from './resolvers/index.js'
import { initializePostgresDatabase } from './config/postgres-db.js'
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault
} from '@apollo/server/plugin/landingPage/default'

declare module 'express' {
  interface Request {
    user?: JwtTokenUser
  }
}

;(async (): Promise<void> => {
  const app = express()
  const httpServer = http.createServer(app)
  const corsOptions: CorsOptions = {
    credentials: true,
    origin: [
      'http://localhost:4000',
      'http://localhost:4000/graphql',
      'http://localhost:4200'
    ]
  }
  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, TaskResolver, TagResolver, ProjectResolver],
      emitSchemaFile: './schema.graphql',
      validate: false
    }),
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageProductionDefault({
            graphRef: '',
            footer: false
          })
        : ApolloServerPluginLandingPageLocalDefault({ footer: false })
    ]
  })

  initializePostgresDatabase()

  await server.start()

  app.use(
    '/',
    cors<cors.CorsRequest>(corsOptions),
    // cookieParser(process.env.COOKIE_SECRET as string),
    express.json({ limit: '5mb' }),
    express.urlencoded({ extended: true, limit: '5mb' }),

    expressMiddleware(server, {
      context: async ({ req, res }): Promise<Context> => ({
        req,
        res,
        token: req.headers['x-auth-token']
      })
    })
  )

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4000 }, resolve)
  )
  const terminalStatus = `[server]:🌏 running on http://localhost:${process.env.PORT}/graphql`
  console.log(TerminalColors.Green, terminalStatus)
})()
