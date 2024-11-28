import axios from 'axios'
import { Request, Response } from 'express'
import { responseData, responseError } from '../helpers/response'
import { CompanyRepository } from '../repositories/companyRepository'
const tokenVouchers = process.env.TOKEN_VOUCHERS

const companyRepository = new CompanyRepository()

export const getCompanies = async (req: Request, res: Response) => {
  try {
    const { role, id } = req?.user

    if (role == 'CORPORATION') {
      const data = await companyRepository.getByCreatedBy(id)
      res.json(responseData(true, 'Éxito al obtener las empresas', data))
    }
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message))
  }
}

export const createCompany = async (req: Request, res: Response) => {
  try {
    const createdBy = req?.user?.id
    const { ruc, username, password, name } = req.body

    if (!ruc || !username || !password || !name) return responseError('Ingrese todos los datos', 404)

    const props = { name, username, password, token: tokenVouchers, ruc }

    const company = await companyRepository.getByRuc(ruc)
    if (company) return responseError('La empresa ya existe', 409)
    const { data: dataAPI } = await axios.post(`https://server-datafact.analytia.pe/api/create-userclavesol-public`, props)

    const tokenUserClaveSol = dataAPI?.data?.token
    if (!tokenUserClaveSol) responseError(dataAPI?.data, 409)

    const data = await companyRepository.create({ ruc, name, username, createdBy, token: tokenUserClaveSol })

    res.json(responseData(true, 'Éxito al crear la empresa', data))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message, {}))
  }
}

export const deleteCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const data = await companyRepository.delete(id)
    if (!data) return responseError('La empresa no existe', 404)

    res.json(responseData(true, 'Éxito al eliminar empresa', data))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message, {}))
  }
}
