import { responseData, responseError } from '../helpers/response'
import { Request, Response, NextFunction } from 'express'
import { Role } from '../interfaces/user'
export const isValidRole = (roles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role } = req?.user!

      if (!roles.includes(role)) {
        console.log('afafafafafaf')
        return responseError('Tipo de usuario no autorizado para realizar esta acción', 401)
      }
      next()
    } catch (error: any) {
      res.status(error?.statusCode ?? 500).json(responseData(false, error.message))
    }
  }
}
