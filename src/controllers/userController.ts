import { Request, Response } from 'express'
import { emailConfirmAccount, emailRegister } from '../helpers/email'
import { generateJWT, verifyJWT } from '../helpers/jwt'
import { responseData, responseError } from '../helpers/response'
import { CompanyRepository } from '../repositories/companyRepository'
import { UserRepository } from '../repositories/userRepository'

const userRepository = new UserRepository()
const companyRepository = new CompanyRepository()

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role, id, company } = req?.user

    if (role == 'ADMIN') {
      const users = await userRepository.getByCorporation()
      res.json(responseData(true, 'Éxito al obtener la lista de usuarios', users))
    }

    if (role == 'CORPORATION') {
      const createdBy = req.user.id

      const users = await userRepository.getByCreatedBy(createdBy)
      res.json(responseData(true, 'Éxito al obtener la lista de usuarios', users))
    }

    if (role == 'SUBMITTER') {
      const users = await userRepository.getBySubmitter(company?.id)
      res.json(responseData(true, 'Éxito al obtener la lista de usuarios', users))
    }
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message))
  }
}

export const getGlobalApprovers = async (req: Request, res: Response) => {
  try {
    const createdBy = req.user.id

    const users = await userRepository.getGlobalApproversByCorporationId(createdBy)
    res.json(responseData(true, 'Éxito al obtener la lista de usuarios', users))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message))
  }
}

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id
    const user = await userRepository.getByIdWithoutPassword(id)

    if (!user) return responseError('Él usuario no existe', 404)

    res.json(responseData(true, 'Éxito al obtener el usuario', user))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message))
  }
}

export const getUserByToken = async (req: Request, res: Response) => {
  try {
    const id = req.user?.id
    const user = await userRepository.getByIdWithoutPassword(String(id))
    res.json(responseData(true, 'Éxito al obtener el usuario', user))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message))
  }
}

export const createCorporation = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) return responseError('Ingrese todos los datos', 404)

    const userEmail = await userRepository.getByEmail(email)

    if (userEmail) return responseError('El corporativo ya existe', 409)

    const newUser = await userRepository.create({ name, email, role: 'CORPORATION', password })

    const token = generateJWT({ email: newUser.email })

    await emailConfirmAccount({ email: newUser.email, name: newUser.name, token })

    res.json(responseData(true, 'Corporativo', newUser))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message, {}))
  }
}

export const createUser = async (req: Request, res: Response) => {
  try {
    const createdBy = req?.user?.id!

    const { email, name, lastname, document, phone, password, role, areas, company } = req.body

    if (!email || !name || !lastname || !document || !phone || !password || !role || !areas || !company)
      return responseError('El email, nombre, apellido, dni, contraseña y el celular son obligatorios', 400)

    const user = await userRepository.getByEmail(email)

    if (user) return responseError('El usuario ya existe', 409)

    const data = await userRepository.create({ name, lastname, document, phone, email, password, createdBy, role, areas, company })

    const tokengen = generateJWT({ email: data.email })

    await emailConfirmAccount({ email: data.email, name: data.name, token: tokengen })

    res.json(responseData(true, 'Éxito al crear empleado', data))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message, {}))
  }
}

export const createGlobalApprover = async (req: Request, res: Response) => {
  try {
    const createdBy = req?.user?.id!

    const { email, name, lastname, document, phone, password } = req.body

    if (!email || !name || !lastname) return responseError('El email, nombre, apellido, dni, contraseña y el celular son obligatorios', 400)

    const user = await userRepository.getByEmail(email)

    if (user) return responseError('El empleado ya existe', 409)

    const newUser = await userRepository.create({ name, lastname, document, phone, email, password, createdBy, role: 'GLOBAL_APPROVER' })

    const tokengen = generateJWT({ email: newUser.email })

    await emailConfirmAccount({ email: newUser.email, name: newUser.name, token: tokengen })

    res.json(responseData(true, 'Éxito al crear empleado', { newUser, tokengen }))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message, {}))
  }
}

export const confirmAccount = async (req: Request, res: Response) => {
  try {
    const { token } = req.params

    const { email } = verifyJWT(token)

    if (!email) return responseError('Token inválido o expirado', 400)

    const user = await userRepository.getByEmail(email)

    if (!user) res.json(responseData(true, 'Cuenta ya confirmada', { confirm: true }))

    if (!user) return responseError('Usuario No existe', 404)

    if (user?.verify_email) {
      res.json(responseData(true, 'Cuenta ya confirmada', { confirm: true }))
      return
    }

    user.verify_email = true
    user.save()
    res.json(responseData(true, 'Éxito al confirmar cuenta', { confirm: false }))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message, {}))
  }
}

// export const sendInvitationByCompany = async (req: Request, res: Response) => {
//   try {
//     const business = req?.user?.company?.id!
//     const razonSocial = req?.user?.company?.name!

//     const { email, name, lastname, role, areas } = req.body

//     if (!email || !name || !lastname || !role || !areas)
//       return responseError('El email, nombre, apellido, rol y las áreas son obligatorios', 400)

//     const token = generateJWT({ business, role, areas })
//     await emailRegister({ email, name, lastname, razonSocial, token })
//     res.json(responseData(true, 'Éxito al enviar invitación', { token }))
//   } catch (error: any) {
//     res.status(error?.statusCode ?? 500).json(responseData(false, error.message, {}))
//   }
// }

// export const createEmployeeByCompany = async (req: Request, res: Response) => {
//   try {
//     const company = req?.user?.company?.id!

//     const { email, name, lastname, role, areas, document, phone, password } = req.body

//     if (!email || !name || !lastname || !role || !areas)
//       return responseError('El email, nombre, apellido, rol, dni, contraseña y celular y las áreas son obligatorios', 400)

//     const user = await userRepository.getByEmail(email)

//     if (user) return responseError('El empleado ya existe', 404)

//     if (!company) return responseError('No se pudo encontrar la empresa', 404)

//     const newUser = await userRepository.create({ name, lastname, document, phone, email, password, company, role, areas })

//     const tokengen = generateJWT({ email: newUser.email })

//     await emailConfirmAccount({ email: newUser.email, name: newUser.name, token: tokengen })

//     res.json(responseData(true, 'Éxito al crear empleado', { newUser, tokengen }))
//   } catch (error: any) {
//     res.status(error?.statusCode ?? 500).json(responseData(false, error.message, {}))
//   }
// }

// export const createEmployeeByToken = async (req: Request, res: Response) => {
//   try {
//     const { name, lastname, document, phone, email, password, token } = req.body

//     if (!name || !lastname || !document || !phone || !email || !password || !token)
//       return responseError('El email, nombre, apellido, dni, contraseña y celular son obligatorios', 400)

//     const user = await userRepository.getByEmail(email)

//     if (user) return responseError('El empleado ya existe', 404)

//     const data = verifyJWT(token)

//     const { company, role, areas } = data

//     if (!role) return responseError('No se pudo encontrar el rol', 404)

//     if (!company) return responseError('No se pudo encontrar la empresa', 404)

//     const newUser = await userRepository.create({ name, lastname, document, phone, email, password, company, role, areas })

//     const tokengen = generateJWT({ email: newUser.email })

//     await emailConfirmAccount({ email: newUser.email, name: newUser.name, token: tokengen })

//     res.json(responseData(true, 'Éxito al crear empleado', { newUser, tokengen }))
//   } catch (error: any) {
//     res.status(error?.statusCode ?? 500).json(responseData(false, error.message, {}))
//   }
// }

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const user = await userRepository.update({ ...req.body, id })
    if (!user) return responseError('El usuario no existe', 404)

    res.json(responseData(true, 'Éxito al actualizar usuario', user))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message, {}))
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const user = await userRepository.delete(id)
    if (!user) return responseError('El usuario no existe', 404)

    res.json(responseData(true, 'Éxito al eliminar usuario', user))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message, {}))
  }
}
