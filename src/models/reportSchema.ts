import mongoose, { Document, Schema, Types } from 'mongoose'
import { IExpense } from './expenseSchema'
import { IReportHistory, ReportStatus } from '../interfaces/report'

export interface IReport extends Document {
  id: string
  name?: string
  index?: number
  status?: ReportStatus
  created?: string
  createdBy?: string
  company?: string
  area?: string
  corporation?: string
  currentApprover?: string
  expenses?: IExpense[]
  history?: IReportHistory[]
}

const ReportSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['OBSERVED', 'DRAFT', 'CLOSED', 'IN_PROCESS'],
    default: 'DRAFT'
  },
  index: {
    type: Number,
    default: 0
  },
  created: {
    type: String,
    required: true,
    trim: true
  },
  dateFormat: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: { type: Types.ObjectId, ref: 'User', required: true },
  corporation: { type: Types.ObjectId, ref: 'User', required: true },
  currentApprover: { type: Types.ObjectId, ref: 'User' },
  company: { type: Types.ObjectId, ref: 'Company', required: true },
  area: { type: Types.ObjectId, ref: 'Area', required: true },
  expenses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
      required: true
    }
  ],
  history: [
    {
      status: {
        type: String,
        enum: ['SENT', 'CLOSED', 'APPROVED', 'OBSERVED'],
        required: true
      },
      comment: {
        type: String,
        default: ''
      },
      createdBy: {
        type: Types.ObjectId,
        ref: 'User'
      }
    }
  ]
})

export const ReportModel = mongoose.model<IReport>('Report', ReportSchema, 'Report')
