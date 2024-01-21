import bcrypt from 'bcryptjs'
import { CookieOptions, Response } from 'express'
import { JwtCredentials, JwtTokenUser } from '../types.js'
// eslint-disable-next-line @typescript-eslint/no-var-requires
import jwt from 'jsonwebtoken'

// const { verify, sign } = jwt

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
): string | jwt.JwtPayload => {
  return jwt.verify(token, secret)
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
  const exp: jwt.SignOptions = {
    expiresIn: process.env.JWT_TOKEN_EXPIRATION as string
  }
  return jwt.sign(credentials, process.env.JWT_TOKEN_SECRET as string, exp)
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

  console.log({ cookieOptions, cookieToken: cookieValue })

  res.cookie(cookieName, cookieValue, { ...cookieOptions, ...options })
}
