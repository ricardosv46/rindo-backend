import { generateJWT } from '../helpers/jwt'
import { responseData, responseError } from '../helpers/response'
import { Request, Response } from 'express'
import { UserRepository } from '../repositories/userRepository'
import bcrypt from 'bcrypt'
import { generarId } from '../helpers/generateId'
import { emailForgotPassword } from '../helpers/email'

const userRepository = new UserRepository()

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) return responseError('El email y contraseña son obligatorios', 400)
    const user = await userRepository.getByEmail(email)

    if (!user) return responseError('Él usuario no existe', 401)

    const passwordMatch = await bcrypt.compare(password, user?.password)

    if (!passwordMatch) return responseError('La contraseña es incorrecta', 401)

    if (!user.verify_email) return responseError('Tú cuenta no esta confirmada', 401)

    const token = generateJWT({ id: user?.id })

    res.json(responseData(true, 'Éxito', { token }))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message))
  }
}

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    const user = await userRepository.getByEmail(email)

    if (!user) return responseError('Él usuario no existe', 404)

    const token = generarId()
    user.token = token
    await user?.save()

    emailForgotPassword({
      email: user.email,
      name: user.name,
      token: user.token
    })

    res.json(responseData(true, 'Se ha enviado un correo para restablecer la contraseña', { token }))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message))
  }
}

export const checkToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params
    const user = await userRepository.getBytoken(token)
    if (!user) return responseError('Token invalido', 404)

    res.json(responseData(true, 'Token válido y el usuario existe'))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message))
  }
}

export const newPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params
    const { password } = req.body

    const user = await userRepository.getBytoken(token)
    if (!user) return responseError('Él usuario no existe', 404)

    user.password = password
    user.token = ''
    await user.save()
    res.json(responseData(true, 'Éxito al modificar la contraseña'))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message))
  }
}

export const newPasswordWithAuth = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await userRepository.getById(req.user?.id)
    if (!user) return responseError('Él usuario no existe', 404)
    const passwordMatch = await bcrypt.compare(currentPassword, user.password)

    if (!passwordMatch) return responseError('La contraseña es incorrecta', 401)

    user.password = newPassword
    await user.save()
    res.json(responseData(true, 'Éxito al modificar contraseña'))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message))
  }
}
