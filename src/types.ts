import { Request, Response } from 'express'

export enum TerminalColors {
  Magenta = '\x1b[35m%s\x1b[0m',
  Cyan = '\x1b[36m%s\x1b[0m',
  Green = '\x1b[32m%s\x1b[0m',
  Red = '\x1b[31m%s\x1b[0m',
  Yellow = '\x1b[33m%s\x1b[0m',
  Blue = '\x1b[34m%s\x1b[0m',
  White = '\x1b[37m%s\x1b[0m',
  Gray = '\x1b[90m%s\x1b[0m',
  Black = '\x1b[30m%s\x1b[0m',
  Default = '%s'
}

export enum ProjectBoardStatus {
  Open = 'open',
  InProgress = 'in-progress',
  Review = 'review',
  Complete = 'complete'
}

export interface User {
  id: string
  firstname?: string | null
  lastname?: string | null
  username: string
  email: string
  password?: string
  company?: string | null
  position?: string | null
  avatar?: Buffer | string | null
  createdAt: Date
}

export type UserId = Pick<User, 'id'>

export type JwtTokenUser = Pick<User, 'id' | 'username' | 'email'>

export interface Tag {
  id: string
  name: string
  color: string
  createdAt: Date
  updatedAt: Date
}

export interface Context {
  req: Request
  res: Response
  token: string | string[] | undefined
}

export interface JwtCredentials {
  iss: string
  aud: string
  user: JwtTokenUser
}
