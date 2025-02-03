import { IExpenseRequest } from '../interfaces/expense'
import { ExpenseModel } from '../models/expenseSchema'

export class ExpenseRepository {
  async getById(id?: string) {
    return await ExpenseModel.findById(id)
  }

  async getByCreatedBy(createdBy: string) {
    return await ExpenseModel.find({ createdBy })
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

  async updateStatus(expenseIds: string[], newStatus: string) {
    return await ExpenseModel.updateMany({ _id: { $in: expenseIds } }, { $set: { status: newStatus } })
  }

  async delete(id?: string) {
    return await ExpenseModel.findByIdAndDelete(id)
  }
}
