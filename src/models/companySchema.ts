import mongoose, { Types, Schema, Document } from 'mongoose'

export interface ICompany extends Document {
  id: string
  createdBy?: string
  name?: string
  username?: string
  ruc?: string
  token?: string
}

const CompanySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    default: ''
  },
  username: {
    type: String,
    required: true,
    trim: true,
    default: ''
  },
  ruc: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    default: ''
  },
  token: {
    type: String,
    trim: true,
    default: ''
  },
  createdBy: {
    type: Types.ObjectId,
    ref: 'User'
  }
})

export const CompanyModel = mongoose.model<ICompany>('Company', CompanySchema, 'Company')
