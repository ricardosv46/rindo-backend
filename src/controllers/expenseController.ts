import { Request, Response } from 'express'
import { responseData, responseError } from '../helpers/response'
import { deleteFile, uploadFile } from '../helpers/s3'
import { ExpenseRepository } from '../repositories/expenseRepository'
import { Types } from 'mongoose'
import { ReportRepository } from '../repositories/reportRepository'
import { AreaRepository } from '../repositories/areaRepository'
import dayjs from 'dayjs'

const expenseRepository = new ExpenseRepository()
const reportRepository = new ReportRepository()
const areaRepository = new AreaRepository()

export interface MulterFiles {
  file?: Express.Multer.File[]
  fileVisa?: Express.Multer.File[]
  fileRxh?: Express.Multer.File[]
}

export const getExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const data = await expenseRepository.getById(id)
    res.json(responseData(true, 'Éxito al obtener el reporte', data))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message))
  }
}

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const { id, role } = req?.user

    if (role == 'CORPORATION') {
      const data = await expenseRepository.getByCoporation(id)
      res.json(responseData(true, 'Éxito al obtener los gastos', data))
    }

    if (role == 'SUBMITTER') {
      const data = await expenseRepository.getByCreatedBy(id)
      res.json(responseData(true, 'Éxito al obtener los gastos', data))
    }
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message))
  }
}

export const createExpense = async (req: Request, res: Response) => {
  try {
    const createdBy = req?.user?.id
    const corporation = req?.user?.createdBy
    const area = req?.user?.areas[0]?._id
    const company = req?.user?.company?._id
    const { ruc, companyName, description, category, total, currency, date, typeDocument, serie } = req.body

    if (!ruc || !companyName || !description || !category || !total || !currency || !date || !typeDocument || !serie)
      return responseError('Ingrese todos los datos', 404)

    const files = req.files as unknown as MulterFiles

    const fileUpload = files?.file
    const fileVisaeUpload = files?.fileVisa
    const fileRxheUpload = files?.fileRxh

    let file: string = ''
    let fileVisa: string = ''
    let fileRxh: string = ''

    if (fileUpload) {
      const upload = await uploadFile(fileUpload[0])
      file = upload?.Location || ''
    }
    if (fileVisaeUpload) {
      const upload = await uploadFile(fileVisaeUpload[0])
      fileVisa = upload?.Location || ''
    }
    if (fileRxheUpload) {
      const upload = await uploadFile(fileRxheUpload[0])
      fileRxh = upload?.Location || ''
    }

    const props = {
      ruc,
      companyName,
      description,
      category,
      total: total.replace(',', ''),
      currency,
      date,
      typeDocument,
      createdBy,
      area,
      company,
      file,
      fileVisa,
      fileRxh,
      serie,
      corporation
    }

    const data = await expenseRepository.create(props)

    res.json(responseData(true, 'Éxito al crear el gasto', data))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message, {}))
  }
}

export const updateExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { ruc, companyName, description, category, total, currency, date, typeDocument, serie } = req.body

    const files = req.files as unknown as MulterFiles

    const fileUpload = files?.file
    const fileVisaeUpload = files?.fileVisa
    const fileRxheUpload = files?.fileRxh

    let file: string = ''
    let fileVisa: string = ''
    let fileRxh: string = ''

    const expense = await expenseRepository.getById(id)
    if (!expense) return responseError('El gasto no existe', 404)

    if (fileUpload) {
      const upload = await uploadFile(fileUpload[0])
      file = upload?.Location || ''
    }
    if (fileVisaeUpload) {
      const upload = await uploadFile(fileVisaeUpload[0])
      fileVisa = upload?.Location || ''
    }
    if (fileRxheUpload) {
      const upload = await uploadFile(fileRxheUpload[0])
      fileRxh = upload?.Location || ''
    }

    if (file && expense?.file) {
      await deleteFile(expense?.file)
    }

    if (fileVisa && expense?.fileVisa) {
      await deleteFile(expense?.fileVisa)
    }

    if (fileRxh && expense?.fileRxh) {
      await deleteFile(expense?.fileRxh)
    }

    expense.ruc = ruc || expense.ruc || ''
    expense.companyName = companyName || expense.companyName || ''
    expense.description = description || expense.description || ''
    expense.category = category || expense.category || ''
    expense.total = total?.replace(',', '') || expense.total || ''
    expense.currency = currency || expense.currency || ''
    expense.date = date || expense.date || ''
    expense.typeDocument = typeDocument || expense.typeDocument || ''
    expense.serie = serie || expense.serie || ''
    expense.file = file || expense.file || ''
    expense.fileVisa = fileVisa || expense.fileVisa || ''
    expense.fileRxh = fileRxh || expense.fileRxh || ''

    await expense.save()

    res.json(responseData(true, 'Éxito al actualizar el gasto', expense))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message, {}))
  }
}

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const data = await expenseRepository.delete(id)
    if (!data) return responseError('El gasto no existe', 404)

    res.json(responseData(true, 'Éxito al eliminar gasto', data))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message, {}))
  }
}

export const updateStatusExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req?.params
    const { status, expenses, comment } = req.body

    if (expenses?.length === 0) return responseError('No se encontraron gastos para actualizar', 404)

    const report = await reportRepository.getById(id)
    const area = await areaRepository.getById(report?.area)
    const approver = area?.approvers.find((i) => i.approver.toString() === req?.user?.id && i.order === report?.index)

    let historyEntry = {
      status,
      comment: comment || '',
      createdBy: new Types.ObjectId(req?.user?.id),
      order: Number(approver?.order),
      date: dayjs().format('DD-MM-YYYY')
    }

    const data = await expenseRepository.updateStatusAndHistory(expenses, status, historyEntry)

    res.json(responseData(true, 'Éxito al actualizar el estado del gasto', data))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message, {}))
  }
}

// export const addApprover = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params
//     const { approver } = req.body

//     const data = await areaRepository.getById(id)
//     if (!data) return responseError('El área no existe', 404)

//     const existingApprover = data.approvers.find((a: { approver: string }) => a.approver.toString() === approver)
//     if (existingApprover) {
//       return responseError('El aprobador ya está agregado', 400)
//     }

//     data.approvers = [...data.approvers, { approver, order: data.approvers.length + 1 }]
//     await data.save()

//     res.json(responseData(true, 'Éxito al actualizar el área', data))
//   } catch (error: any) {
//     res.status(error?.statusCode ?? 500).json(responseData(false, error.message, {}))
//   }
// }

// export const deleteApprover = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params

//     const { approver } = req.body

//     const data = await areaRepository.getById(id)
//     if (!data) return responseError('El area no existe', 404)
//     const newApprovers = data.approvers.filter((i) => i.approver.toString() !== approver).map((i, index) => ({ ...i, order: index + 1 }))
//     data.approvers = newApprovers
//     data.save()

//     res.json(responseData(true, 'Éxito al actualizar el area', data))
//   } catch (error: any) {
//     res.status(error?.statusCode ?? 500).json(responseData(false, error.message, {}))
//   }
// }
