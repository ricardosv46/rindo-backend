import mongoose, { Document, Schema, Types } from 'mongoose'
import { HistoryExpense, StatusExpense } from '../interfaces/expense'

export interface IExpense extends Document {
  id: string
  ruc?: string
  companyName?: string
  description?: string
  category?: string
  total?: number
  currency?: string
  serie?: string
  date?: string
  typeDocument?: string
  createdBy?: string
  file?: string
  fileVisa?: string
  fileRxh?: string
  status?: StatusExpense
  company?: string
  area?: string
  corporation?: string
  currentApprover?: string
  history?: HistoryExpense[]
}

const ExpenseSchema = new Schema({
  ruc: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  total: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    required: true,
    trim: true
  },
  serie: {
    type: String,
    default: ''
  },
  file: {
    type: String,
    default: ''
  },
  fileVisa: {
    type: String,
    default: ''
  },
  fileRxh: {
    type: String,
    default: ''
  },
  date: {
    type: String,
    required: true,
    trim: true
  },
  typeDocument: {
    type: String,
    required: true,
    trim: true
  },

  status: {
    type: String,
    enum: ['IN_REPORT', 'APPROVED', 'DRAFT', 'REJECTED', 'IN_REVISION'],
    default: 'DRAFT'
  },

  createdBy: { type: Types.ObjectId, ref: 'User', required: true },

  corporation: { type: Types.ObjectId, ref: 'User', required: true },

  company: { type: Types.ObjectId, ref: 'Company', required: true },

  area: { type: Types.ObjectId, ref: 'Area', required: true },

  currentApprover: { type: Types.ObjectId, ref: 'User' },

  history: [
    {
      status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'IN_REVISION'],
        required: true
      },
      comment: {
        type: String,
        default: ''
      },
      order: {
        type: Number,
        default: 0
      },
      createdBy: {
        type: Types.ObjectId,
        ref: 'User'
      }
    }
  ]
})

export const ExpenseModel = mongoose.model<IExpense>('Expense', ExpenseSchema, 'Expense')
