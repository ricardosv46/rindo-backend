import { IAreaRequest } from '../interfaces/area'
import { AreaModel } from '../models/areaSchema'

export class AreaRepository {
  async getById(id?: string) {
    return await AreaModel.findById(id)
  }

  async getByCreatedBy(createdBy: string) {
    return await AreaModel.find({ createdBy }).populate('company')
  }

  async getByApproverId(approverId: string) {
    return await AreaModel.find({
      'approvers.approver': approverId
    })
  }

  async create(area: IAreaRequest) {
    const newData = new AreaModel(area)
    return await newData.save()
  }

  async update(area: IAreaRequest) {
    return await AreaModel.findByIdAndUpdate(area?.id, area, { new: true })
  }

  async delete(id?: string) {
    return await AreaModel.findByIdAndDelete(id)
  }
}
