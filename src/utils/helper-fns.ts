import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { CookieOptions, Response } from 'express'
import { JwtCredentials, JwtTokenUser } from '../types.js'

export const encryptPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS))
}

export const decryptPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

export const verifyToken = (
  token: string,
  secret: jwt.Secret
): string | jwt.JwtPayload => jwt.verify(token, secret)

export const generateAuthToken = (user: JwtTokenUser): string => {
  const credentials: JwtCredentials = {
    iss: <string>process.env.JWT_TOKEN_ISSUER,
    aud: <string>process.env.JWT_TOKEN_AUDIENCE,
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  }

  const exp: jwt.SignOptions = {
    expiresIn: <string>process.env.JWT_TOKEN_EXPIRATION
  }

  return jwt.sign(credentials, <string>process.env.JWT_TOKEN_SECRET, exp)
}

export const setCookie = (
  res: Response,
  cookieName: string,
  cookieValue: string,
  options?: CookieOptions
): void => {
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
