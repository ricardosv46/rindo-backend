import { IExpenseRequest, StatusExpense } from '../interfaces/expense'
import { ExpenseModel } from '../models/expenseSchema'
import { Types } from 'mongoose'
import dayjs from 'dayjs'
import { convertToDate } from '../helpers/date'
import { FiltersPagination, paginateWithFilters, PaginationResult } from '../helpers/pagination'

export class ExpenseRepository {
  async getById(id?: string) {
    return await ExpenseModel.findById(id)
  }

  async getByCreatedBy(createdBy: string) {
    return await ExpenseModel.find({ createdBy })
  }

  async getByCreatedByApprover(index: number) {
    return await ExpenseModel.find({ index })
  }

  async getByCoporation(corporation: string) {
    return await ExpenseModel.find({ corporation })
  }

  async getByCoporationFilter(
    corporation: string,
    { search = '', from = '', to = '', pageSize = 10, pageIndex = 1 }: FiltersPagination
  ): Promise<PaginationResult<IExpenseRequest>> {
    const baseFilter = {
      corporation
    }

    return await paginateWithFilters(ExpenseModel, baseFilter, {
      search,
      from,
      to,
      pageSize,
      pageIndex,
      searchFields: ['companyName', 'description', 'ruc']
    })
  }

  async getByCreatedByWithoutReview(createdBy: string) {
    return await ExpenseModel.find({ createdBy, status: { $ne: 'IN_REVIEW' } })
  }

  async getByCreatedByWithoutReviewFilter(
    createdBy: string,
    { search = '', from = '', to = '', pageSize = 10, pageIndex = 1 }: FiltersPagination
  ): Promise<PaginationResult<IExpenseRequest>> {
    const baseFilter = {
      createdBy,
      status: { $ne: 'IN_REVIEW' }
    }

    return await paginateWithFilters(ExpenseModel, baseFilter, {
      search,
      from,
      to,
      pageSize,
      pageIndex,
      searchFields: ['companyName', 'description', 'ruc']
    })
  }

  async getByCreatedByReviewFilter(
    createdBy: string,
    { search = '', from = '', to = '', pageSize = 10, pageIndex = 1 }: FiltersPagination
  ): Promise<PaginationResult<IExpenseRequest>> {
    const baseFilter = {
      createdBy,
      status: 'IN_REVIEW'
    }

    return await paginateWithFilters(ExpenseModel, baseFilter, {
      search,
      from,
      to,
      pageSize,
      pageIndex,
      searchFields: ['companyName', 'description', 'ruc']
    })
  }

  async getByCreatedByDraftFilter(
    createdBy: string,
    { search = '', from = '', to = '', pageSize = 10, pageIndex = 1 }: FiltersPagination
  ): Promise<PaginationResult<IExpenseRequest>> {
    const baseFilter = {
      createdBy,
      status: 'DRAFT'
    }

    return await paginateWithFilters(ExpenseModel, baseFilter, {
      search,
      from,
      to,
      pageSize,
      pageIndex,
      searchFields: ['companyName', 'description', 'ruc']
    })
  }

  async getByReportIdDraftFilter(
    createdBy: string,
    expenses: string[],
    { search = '', from = '', to = '', pageSize = 10, pageIndex = 1 }: FiltersPagination
  ): Promise<PaginationResult<IExpenseRequest>> {
    const baseFilter = {
      createdBy,
      $or: [{ status: 'DRAFT' }, { _id: { $in: expenses } }]
    }

    return await paginateWithFilters(ExpenseModel, baseFilter, {
      search,
      from,
      to,
      pageSize,
      pageIndex,
      searchFields: ['companyName', 'description', 'ruc']
    })
  }

  async create(expense: IExpenseRequest) {
    const newData = new ExpenseModel(expense)
    return await newData.save()
  }

  async update(expense: IExpenseRequest) {
    return await ExpenseModel.findByIdAndUpdate(expense?.id, expense, { new: true })
  }

  async updateStatus(expenseIds: string[], newStatus: StatusExpense) {
    return await ExpenseModel.updateMany({ _id: { $in: expenseIds } }, { $set: { status: newStatus } })
  }

  async delete(id?: string) {
    return await ExpenseModel.findByIdAndDelete(id)
  }

  async updateStatusAndHistory(
    expenseIds: string[],
    newStatus: StatusExpense,
    historyEntry: { status: string; comment: string; createdBy: Types.ObjectId; order: number }
  ) {
    return await ExpenseModel.updateMany({ _id: { $in: expenseIds } }, [
      {
        $set: {
          status: newStatus,
          history: {
            $cond: {
              if: {
                $and: [{ $gt: [{ $size: { $ifNull: ['$history', []] } }, 0] }, { $eq: [{ $last: '$history.order' }, 0] }]
              },
              then: {
                $concatArrays: [{ $ifNull: ['$history', []] }, [historyEntry]]
              },
              else: {
                $cond: {
                  if: {
                    $gt: [
                      {
                        $size: {
                          $filter: {
                            input: { $ifNull: ['$history', []] },
                            as: 'item',
                            cond: {
                              $and: [{ $eq: ['$$item.order', historyEntry.order] }, { $eq: ['$$item.createdBy', historyEntry.createdBy] }]
                            }
                          }
                        }
                      },
                      0
                    ]
                  },
                  then: {
                    $map: {
                      input: '$history',
                      as: 'item',
                      in: {
                        $cond: {
                          if: {
                            $and: [{ $eq: ['$$item.order', historyEntry.order] }, { $eq: ['$$item.createdBy', historyEntry.createdBy] }]
                          },
                          then: historyEntry,
                          else: '$$item'
                        }
                      }
                    }
                  },
                  else: {
                    $concatArrays: [{ $ifNull: ['$history', []] }, [historyEntry]]
                  }
                }
              }
            }
          }
        }
      }
    ])
  }
}
