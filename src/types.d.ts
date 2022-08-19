import { JwtTokenUser } from './types/shared'

declare module 'express' {
	interface Request {
		user: JwtTokenUser | null
	}
}
