import bcrypt from 'bcryptjs'
import { CookieOptions, Response } from 'express'
import { sign, verify, JwtPayload, SignOptions, Secret } from 'jsonwebtoken'
import { JwtCredentials, JwtTokenUser } from '../types/shared'

export const encryptPassword = async (password: string): Promise<string> => {
	return await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS))
}

export const decryptPassword = async (
	password: string,
	hashedPassword: string
): Promise<boolean> => {
	return await bcrypt.compare(password, hashedPassword)
}

export const verifyToken = (token: string, secret: Secret): string | JwtPayload => {
	return verify(token, secret)
}

export const generateAuthToken = (user: JwtTokenUser): string => {
	const credentials: JwtCredentials = {
		iss: process.env.JWT_TOKEN_ISSUER as string,
		aud: process.env.JWT_TOKEN_AUDIENCE as string,
		user: {
			id: user.id,
			username: user.username,
			email: user.email
		}
	}
	const exp: SignOptions = { expiresIn: process.env.JWT_TOKEN_EXPIRATION as string }
	return sign(credentials, process.env.JWT_TOKEN_SECRET as string, exp)
}

export const setCookie = (
	res: Response,
	cookieName: string,
	cookieValue: string,
	options?: CookieOptions
) => {
	const cookieOptions: CookieOptions = {
		secure: process.env.NODE_ENV === 'production',
		signed: true,
		sameSite: 'lax',
		httpOnly: true,
		maxAge: 1000 * 60 * 60 * 24 * 7,
		domain: 'localhost'
	}

	res.cookie(cookieName, cookieValue, { ...cookieOptions, ...options })
}
