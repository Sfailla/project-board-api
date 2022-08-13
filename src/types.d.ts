import { User } from './types/shared'

declare module 'express' {
	interface Request {
		user: User
	}
}
