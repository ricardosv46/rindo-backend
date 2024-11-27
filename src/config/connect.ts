import mongoose from 'mongoose'
import { UserRepository } from '../repositories/userRepository'
import { AreaModel } from '../models/areaSchema'

const userRepository = new UserRepository()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_MONGO!)
    console.log('database conectada')

    console.log(mongoose.models)

    await AreaModel.find()

    await userRepository.createAdmin()
  } catch (error: any) {
    console.log(`error: ${error?.message}`)
  }
}

export { connectDB }
