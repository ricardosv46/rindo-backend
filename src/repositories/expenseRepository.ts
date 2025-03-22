import { IExpenseRequest, StatusExpense } from '../interfaces/expense'
import { ExpenseModel } from '../models/expenseSchema'
import { Types } from 'mongoose'

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
    ])
  }
}
