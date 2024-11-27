import { NextFunction, Request, Response } from 'express'
import { verifyJWT } from '../helpers/jwt'
import { responseData, responseError } from '../helpers/response'
import { IUser } from '../models/userSchema'
import { UserRepository } from '../repositories/userRepository'

const userRepository = new UserRepository()

declare global {
  namespace Express {
    interface Request {
      user: IUser
    }
  }
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tokens = req.headers.authorization
    const token = tokens ? tokens.split(' ')[1] : null

    if (!token) {
      return responseError('Acceso no autorizado', 401)
    }

    const user = verifyJWT(token)

    const currentUser = await userRepository.getByIdWithoutPassword(user?.id)
    if (!currentUser) {
      return responseError('El usuario no existe', 404)
    }

    req.user = currentUser

    next()
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message))
  }
}
