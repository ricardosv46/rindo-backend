import { IReportRequest } from '../interfaces/report'
import { ReportModel } from '../models/reportSchema'

export class ReportRepository {
  async getById(id?: string) {
    return await ReportModel.findById(id)
  }

  async getByIdWithExpenses(id?: string) {
    return await ReportModel.findById(id).populate({
      path: 'expenses',
      populate: [
        {
          path: 'history.createdBy',
          select: 'name lastName email'
        }
      ]
    })
  }
  async getByCreatedBy(createdBy: string) {
    return await ReportModel.find({ createdBy })
  }

  async getByCoporation(corporation: string) {
    return await ReportModel.find({ corporation })
  }

  async create(report: IReportRequest) {
    const newData = new ReportModel(report)
    return await newData.save()
  }

  async update(report: IReportRequest) {
    return await ReportModel.findByIdAndUpdate(report?.id, report, { new: true })
  }

  async delete(id?: string) {
    return await ReportModel.findByIdAndDelete(id)
  }

  async getByAreaAndApproverOrder(areaOrders: [string, number][]) {
    const conditions = areaOrders.map(([areaId, order]) => ({
      $and: [{ area: areaId }, { index: order }]
    }))

    return await ReportModel.find({
      $or: conditions
    })
  }
  async getApproved(areaOrders: [string, number][]) {
    const conditions = areaOrders.map(([areaId, order]) => ({
      $and: [{ area: areaId }, { index: { $gt: order } }]
    }))

    return await ReportModel.find({
      $or: conditions
    })
  }
}
