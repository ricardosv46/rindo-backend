import { Document, Types } from 'mongoose'
import { IExpense } from '../models/expenseSchema'

export interface IReportResponse extends Omit<Document, '__v'> {
  name?: string
  index?: number
  status?: ReportStatus
  created?: string
  createdBy?: Types.ObjectId
  company?: Types.ObjectId
  area?: Types.ObjectId
  corporation?: Types.ObjectId
  currentApprover?: Types.ObjectId
  expenses?: IExpense[]
  history?: IReportHistory[]
}

export interface IReportHistory {
  status: ReportHistoryStatus
  createdBy: Types.ObjectId
  comment?: string
}

export interface IReportRequest {
  id?: string
  name?: string
  expenses?: string[]
}

export type ReportStatus = 'OBSERVED' | 'DRAFT' | 'CLOSED' | 'IN_PROCESS'

export type ReportHistoryStatus = 'SENT' | 'CLOSED' | 'APPROVED' | 'OBSERVED'
