import { MiddlewareFn, NextFn } from 'type-graphql'
import jwt from 'jsonwebtoken'
import { Context, JwtTokenUser } from '../types.js'

export const isAuthenticated: MiddlewareFn<Context> = async (
  { context: { req, token } },
  next
): Promise<void | NextFn | Error> => {
  console.log({ token })
  if (!token) throw new Error('Not authenticated')

  try {
    const payload = <{ user: JwtTokenUser }>(
      jwt.verify(String(token), String(process.env.JWT_TOKEN_SECRET))
    )

    req.user = payload.user
  } catch (err) {
    throw new Error(err.message)
  }

  await next()
}
