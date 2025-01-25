import { Request, Response } from 'express'
import { responseData, responseError } from '../helpers/response'
import { ExpenseRepository } from '../repositories/expenseRepository'
import { uploadFile } from '../helpers/s3'

const expenseRepository = new ExpenseRepository()

export interface MulterFiles {
  file?: Express.Multer.File[]
  fileVisa?: Express.Multer.File[]
  fileRxh?: Express.Multer.File[]
}

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const { id, role } = req?.user

    if (role == 'CORPORATION') {
      const data = await expenseRepository.getByCoporation(id)
      res.json(responseData(true, 'Éxito al obtener las areas', data))
    }

    if (role == 'SUBMITTER') {
      const data = await expenseRepository.getByCreatedBy(id)
      res.json(responseData(true, 'Éxito al obtener las areas', data))
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

// export const updateArea = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params

//     const data = await areaRepository.update({ ...req.body, id })
//     if (!data) return responseError('El area no existe', 404)

//     res.json(responseData(true, 'Éxito al actualizar el area', data))
//   } catch (error: any) {
//     res.status(error?.statusCode ?? 500).json(responseData(false, error.message, {}))
//   }
// }

// export const deleteArea = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params

//     const data = await areaRepository.delete(id)
//     if (!data) return responseError('El area no existe', 404)

//     res.json(responseData(true, 'Éxito al eliminar area', data))
//   } catch (error: any) {
//     res.status(error?.statusCode ?? 500).json(responseData(false, error.message, {}))
//   }
// }

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
