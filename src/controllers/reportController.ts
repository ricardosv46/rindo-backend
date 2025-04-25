import { Request, Response } from 'express'
import { responseData, responseError } from '../helpers/response'
import { ReportRepository } from '../repositories/reportRepository'
import { AreaRepository } from '../repositories/areaRepository'
import dayjs from 'dayjs'
import { ExpenseRepository } from '../repositories/expenseRepository'
import { Types } from 'mongoose'
import { filtersDTO } from '../helpers/filtersDTO'
import { convertToDate } from '../helpers/date'

const reportRepository = new ReportRepository()
const expenseRepository = new ExpenseRepository()
const areaRepository = new AreaRepository()

export interface MulterFiles {
  file?: Express.Multer.File[]
  fileVisa?: Express.Multer.File[]
  fileRxh?: Express.Multer.File[]
}

export const getReports = async (req: Request, res: Response) => {
  try {
    const { id, role } = req?.user
    const filters = filtersDTO(req.query)
    if (role === 'CORPORATION') {
      const data = await reportRepository.getByCoporationFilter(id, filters)
      res.json(responseData(true, 'Éxito al obtener los reportes', data))
    }

    if (role === 'SUBMITTER') {
      const data = await reportRepository.getByCreatedByFilter(id, filters)
      res.json(responseData(true, 'Éxito al obtener los reportes', data))
    }

    if (role === 'APPROVER' || role === 'GLOBAL_APPROVER') {
      const userAreas = await areaRepository.getByApproverId(id)

      const areaOrderMap = new Map()
      userAreas.forEach((area) => {
        const approverData = area.approvers.find((a) => a.approver.toString() === id)
        if (approverData) {
          areaOrderMap.set(area.id.toString(), approverData.order)
        }
      })

      const data = await reportRepository.getByAreaAndApproverOrderFilter(Array.from(areaOrderMap.entries()), filters)
      res.json(responseData(true, 'Éxito al obtener los reportes', data))
    }
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message))
  }
}

export const getReportsApproved = async (req: Request, res: Response) => {
  try {
    const { id } = req?.user
    const filters = filtersDTO(req.query)

    const userAreas = await areaRepository.getByApproverId(id)

    const areaOrderMap = new Map()
    userAreas.forEach((area) => {
      const approverData = area.approvers.find((a) => a.approver.toString() === id)
      if (approverData) {
        areaOrderMap.set(area.id.toString(), approverData.order)
      }
    })

    const data = await reportRepository.getApprovedFilter(Array.from(areaOrderMap.entries()), filters)
    res.json(responseData(true, 'Éxito al obtener los reportes', data))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message))
  }
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

export const getReportWithExpenses = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const data = await reportRepository.getByIdWithExpenses(id)
    res.json(responseData(true, 'Éxito al obtener el reporte', data))
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
    const dateObj = convertToDate(created).toISOString()

    const props = {
      createdBy,
      corporation,
      area,
      company,
      name,
      dateFormat: dateObj, // Guardar el objeto Date
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

export const updateReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { name, expenses } = req.body

    const report = await reportRepository.getById(id)
    if (!report) return responseError('El informe no existe', 404)

    const currentExpensesChange = report?.expenses?.filter((i) => !expenses?.includes(i)).map((i) => String(i))
    await expenseRepository.updateStatus(currentExpensesChange!, 'DRAFT')
    await expenseRepository.updateStatus(expenses!, 'IN_REPORT')

    report.name = name || report.name || ''
    report.expenses = expenses || report.expenses || []
    await report.save()

    res.json(responseData(true, 'Éxito crear el informe', report))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message))
  }
}

export const updateReportSendProcess = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const report = await reportRepository.getById(id)
    if (!report) return responseError('El informe no existe', 404)

    report.index = 1
    report.status = 'IN_PROCESS'
    report.history = report.history || []
    report.history.push({
      status: 'SENT',
      createdBy: new Types.ObjectId(req?.user?.id),
      comment: 'El informe se ha enviado'
    })
    await report.save()

    res.json(responseData(true, 'Éxito al enviar el informe', report))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message))
  }
}

export const updateReportApprove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const report = await reportRepository.getById(id)

    const area = await areaRepository.getById(report?.area)

    const approver = area?.approvers.find((i) => i.approver.toString() === req?.user?.id && i.order === report?.index)

    const maxIndex = area?.approvers.length

    // const AllexpensesApproved = report?.expenses?.every((i) => i.status === 'APPROVED' || i.status === 'REJECTED')

    // if (!AllexpensesApproved) return responseError('Todos los gastos deben ser aprobados o rechazados', 400)

    if (!approver) return responseError('No tienes permisos para aprobar este informe', 403)

    if (!report) return responseError('El informe no existe', 404)
    report.history = report.history || []
    if (report.index === maxIndex) {
      report.status = 'CLOSED'
      report.history.push({
        status: 'CLOSED',
        createdBy: new Types.ObjectId(req?.user?.id),
        comment: 'El informe se ha cerrado'
      })
    } else {
      const expenses = report?.expenses?.map((i) => String(i))
      await expenseRepository.updateStatus(expenses!, 'IN_REPORT')
      report.status = 'IN_PROCESS'
      report.history.push({
        status: 'APPROVED',
        createdBy: new Types.ObjectId(req?.user?.id),
        comment: 'El informe se ha aprobado'
      })
    }
    report.index = report.index! + 1
    await report.save()

    res.json(responseData(true, 'Éxito al enviar el informe', report))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message))
  }
}

export const deleteReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const data = await reportRepository.delete(id)
    if (!data) return responseError('El gasto no existe', 404)

    const expenses = data?.expenses?.map((i) => String(i))

    await expenseRepository.updateStatus(expenses!, 'DRAFT')

    res.json(responseData(true, 'Éxito al eliminar el informe', data))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message))
  }
}
