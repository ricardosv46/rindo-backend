import { Request, Response } from 'express'
import { responseData } from '../helpers/response'
import { ReportRepository } from '../repositories/reportRepository'
import dayjs from 'dayjs'
import { ExpenseRepository } from '../repositories/expenseRepository'

const reportRepository = new ReportRepository()
const expenseRepository = new ExpenseRepository()
export interface MulterFiles {
  file?: Express.Multer.File[]
  fileVisa?: Express.Multer.File[]
  fileRxh?: Express.Multer.File[]
}

export const getReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const data = await reportRepository.getById(id)
    res.json(responseData(true, 'Éxito al obtener el reporte', data))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message))
  }
}

export const getReports = async (req: Request, res: Response) => {
  try {
    const { id, role } = req?.user

    if (role == 'CORPORATION') {
      const data = await reportRepository.getByCoporation(id)
      res.json(responseData(true, 'Éxito al obtener los reportes', data))
    }

    if (role == 'SUBMITTER') {
      const data = await reportRepository.getByCreatedBy(id)
      res.json(responseData(true, 'Éxito al obtener los reportes', data))
    }

    if (role == 'APPROVER') {
      const data = await reportRepository.getByCreatedBy(id)
      res.json(responseData(true, 'Éxito al obtener los reportes', data))
    }
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message))
  }
}

export const createReport = async (req: Request, res: Response) => {
  try {
    const { name, expenses } = req.body

    const createdBy = req?.user?.id
    const corporation = req?.user?.createdBy
    const area = req?.user?.areas[0]?._id
    const company = req?.user?.company?._id

    const created = dayjs().format('DD/MM/YYYY')

    const props = {
      createdBy,
      corporation,
      area,
      company,
      name,
      expenses,
      created
    }

    const data = await reportRepository.create(props)

    await expenseRepository.updateStatus(expenses, 'IN_REPORT')

    res.json(responseData(true, 'Éxito crear el informe', data))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message))
  }
}
