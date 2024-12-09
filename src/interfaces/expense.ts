import { Document, Types } from 'mongoose'

export interface IExpenseResponse extends Omit<Document, '__v'> {
  ruc?: string
  companyName?: string
  description?: string
  category?: string
  total?: number
  currency?: string
  serie?: string
  date?: string
  typeDocument?: string
  createdBy?: Types.ObjectId
  urlFile?: string
  urlFileVisa?: string
  urlFileRxh?: string
  status?: StatusExpense
  company?: Types.ObjectId
  area?: Types.ObjectId
  corporation?: Types.ObjectId
  currentApprover?: Types.ObjectId
  history?: HistoryExpense[]
}

export interface IExpenseRequest {
  id?: string
  ruc?: string
  companyName?: string
  description?: string
  category?: string
  total?: number
  currency?: string
  serie?: string
  date?: string
  typeDocument?: string
  urlFile?: string
  urlFileVisa?: string
  urlFileRxh?: string
}

export type StatusExpense = 'IN_REPORT' | 'APPROVED' | 'DRAFT' | 'REJECTED' | 'IN_REVISION'

export type StatusExpenseHistory = 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_REVISION'

export interface HistoryExpense {
  status?: StatusExpenseHistory
  comment?: string
  order?: number
  createdBy?: string
}
