import jwt, { JwtPayload } from 'jsonwebtoken'
import { responseError } from './response'
import { Role } from '../interfaces/user'

interface JwtData {
  token?: string
  userId?: string
  role?: Role
  id?: string
  email?: string
  company?: string
  areas?: string[]
}

export const generateJWT = <T extends object>(data: T): string => {
  return jwt.sign(data, process.env.JWT_SECRET!, {
    expiresIn: '24h'
  })
}

export const verifyJWT = (token: string): JwtData => {
  try {
    const { iat, exp, ...data } = jwt.verify(token, process.env.JWT_SECRET!) as JwtData & JwtPayload
    return data
  } catch (error) {
    throw responseError('Token no válido', 401)
  }
}
