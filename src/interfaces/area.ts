import { Document, Types } from 'mongoose'

export interface IAreaResponse extends Omit<Document, '__v'> {
  approvers?: Types.ObjectId[]
  company?: Types.ObjectId
  name?: string
  status?: boolean
  createdBy?: string
}

export interface IAreaRequest {
  id?: string
  approvers?: string[]
  company?: string
  name?: string
  status?: boolean
  createdBy?: string
}
