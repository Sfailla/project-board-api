import { MiddlewareFn } from 'type-graphql'
import { verify } from 'jsonwebtoken'
import { Context, JwtTokenUser } from '../types/shared'

export const isAuthenticated: MiddlewareFn<Context> = ({ context: { req } }, next) => {
	const token = req.headers.authorization

	console.log({ tokenHeader: token })

	if (!token) {
		throw new Error('Not authenticated')
	}

	try {
		const payload = verify(token, process.env.JWT_TOKEN_SECRET as string) as {
			user: JwtTokenUser
		}
		req.user = payload.user
	} catch (err) {
		const error = err as Error
		throw new Error(error.message)
	}
	return next()
}
