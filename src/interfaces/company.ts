import { Document, Types } from 'mongoose'

export interface ICompanyResponse extends Omit<Document, '__v'> {
  createdBy?: Types.ObjectId
  name?: string
  username?: string
  ruc?: string
  token?: string
}

export interface ICompanyRequest {
  id?: string
  createdBy?: string
  name?: string
  username?: string
  ruc?: string
  token?: string
}
