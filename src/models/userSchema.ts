import bcrypt from 'bcrypt'
import mongoose, { Document, Schema, Types } from 'mongoose'
import { ICompany } from './companySchema'
import { Role } from '../interfaces/user'

export interface IUser extends Document {
  id: string
  name: string
  document: string
  lastname: string
  email: string
  phone: string
  verify_email: boolean
  role: Role
  token: string
  password: string
  company?: ICompany
  areas: string[]
  createdBy?: string
}

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    default: ''
  },
  document: {
    type: String,
    trim: true,
    default: ''
  },
  lastname: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  password: {
    type: String,
    required: true,
    trim: true,
    default: ''
  },
  verify_email: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['ADMIN', 'CORPORATION', 'GLOBAL_APPROVER', 'APPROVER', 'SUBMITTER'],
    default: 'Borrador'
  },
  company: {
    type: Types.ObjectId,
    ref: 'Company'
  },
  areas: [
    {
      type: Types.ObjectId,
      ref: 'Area',
      default: []
    }
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  token: {
    type: String,
    trim: true,
    default: ''
  }
})

UserSchema.pre('save', async function (next) {
  const user = this

  if (!user.isModified('password')) {
    return next()
  }

  const salt = await bcrypt.genSalt(10)
  user.password = await bcrypt.hash(user.password, salt)
  next()
})

UserSchema.methods.comparePassword = async function (currentPassword: string): Promise<boolean> {
  const user = this
  return bcrypt.compare(currentPassword, user.password)
}

export const UserModel = mongoose.model<IUser>('User', UserSchema, 'User')
