import { Request, Response } from 'express'
import { responseData, responseError } from '../helpers/response'
import { AreaRepository } from '../repositories/areaRepository'

const areaRepository = new AreaRepository()

export const getAreas = async (req: Request, res: Response) => {
  try {
    const { id } = req?.user

    const data = await areaRepository.getByCreatedBy(id)
    res.json(responseData(true, 'Éxito al obtener las areas', data))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message))
  }
}

export const createArea = async (req: Request, res: Response) => {
  try {
    const createdBy = req?.user?.id
    const { name, company } = req.body

    if (!name || !company) return responseError('Ingrese todos los datos', 404)

    const data = await areaRepository.create({ name, company, createdBy })

    res.json(responseData(true, 'Éxito al crear el area', data))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message, {}))
  }
}

export const updateArea = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const data = await areaRepository.update({ ...req.body, id })
    if (!data) return responseError('El area no existe', 404)

    res.json(responseData(true, 'Éxito al actualizar el area', data))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message, {}))
  }
}

export const deleteArea = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const data = await areaRepository.delete(id)
    if (!data) return responseError('El area no existe', 404)

    res.json(responseData(true, 'Éxito al eliminar area', data))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message, {}))
  }
}

export const addApprover = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { approver } = req.body

    const data = await areaRepository.getById(id)
    if (!data) return responseError('El área no existe', 404)

    const existingApprover = data.approvers.find((a: { approver: string }) => a.approver.toString() === approver)
    if (existingApprover) {
      return responseError('El aprobador ya está agregado', 400)
    }

    data.approvers = [...data.approvers, { approver, order: data.approvers.length + 1 }]
    await data.save()

    res.json(responseData(true, 'Éxito al actualizar el área', data))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message, {}))
  }
}

export const deleteApprover = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { approver } = req.body

    const data = await areaRepository.getById(id)
    if (!data) return responseError('El area no existe', 404)
    const newApprovers = data.approvers.filter((i) => i.approver.toString() !== approver).map((i, index) => ({ ...i, order: index + 1 }))
    data.approvers = newApprovers
    data.save()

    res.json(responseData(true, 'Éxito al actualizar el area', data))
  } catch (error: any) {
    res.status(error?.statusCode ?? 500).json(responseData(false, error.message, {}))
  }
}
