import mongoose, { Document, Schema, Types } from 'mongoose'

export interface IArea extends Document {
  id: string
  name?: string
  status?: boolean
  approvers: {
    approver: string
    order: number
  }[]
  company: string
  createdBy?: string
}

const AreaSchema = new Schema({
  approvers: [
    {
      approver: {
        type: Types.ObjectId,
        ref: 'User'
      },
      order: Number
    }
  ],
  name: {
    type: String
  },
  company: {
    type: Types.ObjectId,
    ref: 'Company'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: Boolean,
    default: true
  }
})

export const AreaModel = mongoose.model<IArea>('Area', AreaSchema, 'Area')
