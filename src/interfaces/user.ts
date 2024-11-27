import { Document, PopulatedDoc } from 'mongoose'
import { IArea } from '../models/areaSchema'
import { ICompany } from '../models/companySchema'

export interface IUserResponse extends Omit<Document, 'password' | '__v'> {
  company?: PopulatedDoc<ICompany & Document>
  areas?: PopulatedDoc<IArea & Document>
  name?: string
  document?: string
  lastname?: string
  email?: string
  phone?: string
  verify_email?: boolean
  role?: Role
  token?: string
}

export interface IUserRequest {
  id?: string
  password?: string
  company?: string
  areas?: string[]
  name?: string
  document?: string
  lastname?: string
  email?: string
  phone?: string
  verify_email?: boolean
  role?: Role
  token?: string
  createdBy?: string
}

export type Role = 'ADMIN' | 'CORPORATION' | 'SUBMITTER' | 'APPROVER' | 'GLOBAL_APPROVER'
