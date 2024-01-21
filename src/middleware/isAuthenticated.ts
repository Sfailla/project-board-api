import { MiddlewareFn, NextFn } from 'type-graphql'
import jwt from 'jsonwebtoken'
import { Context, JwtTokenUser } from '../types.js'

export const isAuthenticated: MiddlewareFn<Context> = async (
  { context: { req, token } },
  next
): Promise<void | NextFn | Error> => {
  console.log({ reqHeaders: req.headers, token })

  // const cookieToken = req.signedCookies['x-auth-token'] as string

  console.log({ tokenHeader: token })

  if (!token) {
    throw new Error('Not authenticated')
  }

  try {
    const payload = jwt.verify(
      token as string,
      process.env.JWT_TOKEN_SECRET as string
    ) as { user: JwtTokenUser }

    req.user = payload.user
  } catch (err) {
    const error = err as Error
    throw new Error(error.message)
  }

  await next()
}
