import { MiddlewareFn, NextFn } from 'type-graphql'
import jwt from 'jsonwebtoken'
import { Context, JwtTokenUser } from '../types.js'

export const isAuthenticated: MiddlewareFn<Context> = async (
  { context: { req, token } },
  next
): Promise<void | NextFn | Error> => {
  console.log({ token })
  // const cookieToken = req.signedCookies['x-auth-token'] as string
  if (!token) {
    throw new Error('Not authenticated')
  }

  try {
    const payload = jwt.verify(
      String(token),
      String(process.env.JWT_TOKEN_SECRET)
    ) as { user: JwtTokenUser }

    req.user = payload.user
  } catch (err) {
    throw new Error(err.message)
  }

  await next()
}
