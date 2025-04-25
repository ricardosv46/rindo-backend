import { FiltersPagination, paginateWithFilters, PaginationResult } from '../helpers/pagination'
import { IReportRequest } from '../interfaces/report'
import { IReport, ReportModel } from '../models/reportSchema'

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
    return await ReportModel.find({ createdBy }).populate('expenses').populate('history')
  }

  async getByCreatedByFilter(
    createdBy: string,
    { search = '', from = '', to = '', pageSize = 10, pageIndex = 1 }: FiltersPagination
  ): Promise<PaginationResult<any>> {
    const baseFilter = {
      createdBy
    }
    return await paginateWithFilters(ReportModel, baseFilter, {
      search,
      from,
      to,
      pageSize,
      pageIndex,
      searchFields: ['name'],
      populate: [{ path: 'expenses' }, { path: 'history' }]
    })
  }

  async getByCoporation(corporation: string) {
    return await ReportModel.find({ corporation })
  }

  async getByCoporationFilter(
    corporation: string,
    { search = '', from = '', to = '', pageSize = 10, pageIndex = 1 }: FiltersPagination
  ): Promise<PaginationResult<IReport>> {
    const baseFilter = {
      corporation
    }

    return await paginateWithFilters(ReportModel, baseFilter, {
      search,
      from,
      to,
      pageSize,
      pageIndex,
      searchFields: ['name']
    })
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
      .populate('expenses')
      .populate('history')
  }

  async getByAreaAndApproverOrderFilter(
    areaOrders: [string, number][],
    { search = '', from = '', to = '', pageSize = 10, pageIndex = 1 }: FiltersPagination
  ): Promise<PaginationResult<any>> {
    const conditions = areaOrders.map(([areaId, order]) => ({
      $and: [{ area: areaId }, { index: order }]
    }))

    const baseFilter = {
      $or: conditions
    }

    return await paginateWithFilters(ReportModel, baseFilter, {
      search,
      from,
      to,
      pageSize,
      pageIndex,
      searchFields: ['name'],
      populate: [{ path: 'expenses' }, { path: 'history' }]
    })
  }

  async getApproved(areaOrders: [string, number][]) {
    const conditions = areaOrders.map(([areaId, order]) => ({
      $and: [{ area: areaId }, { index: { $gt: order } }]
    }))

    return await ReportModel.find({
      $or: conditions
    })
      .populate('expenses')
      .populate('history')
  }

  async getApprovedFilter(
    areaOrders: [string, number][],
    { search = '', from = '', to = '', pageSize = 10, pageIndex = 1 }: FiltersPagination
  ): Promise<PaginationResult<any>> {
    const conditions = areaOrders.map(([areaId, order]) => ({
      $and: [{ area: areaId }, { index: { $gt: order } }]
    }))

    const baseFilter = {
      $or: conditions
    }

    return await paginateWithFilters(ReportModel, baseFilter, {
      search,
      from,
      to,
      pageSize,
      pageIndex,
      searchFields: ['name'],
      populate: [{ path: 'expenses' }, { path: 'history' }]
    })
  }
}
