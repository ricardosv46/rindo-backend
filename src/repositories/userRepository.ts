import { IUserExcelRequest, IUserRequest } from '../interfaces/user'
import { UserModel } from '../models/userSchema'

export class UserRepository {
  async getByCorporation() {
    return await UserModel.find({ role: 'CORPORATION' }).select('-password -__v').lean()
  }

  async getByCreatedBy(createdBy: string) {
    return await UserModel.find({ createdBy, role: { $in: ['APPROVER', 'SUBMITTER', 'GLOBAL_APPROVER'] } })
      .select('-password -__v')
      .lean()
      .populate('company')
  }

  async getGlobalApproversByCorporationId(createdBy?: string) {
    return await UserModel.find({ createdBy, role: 'GLOBAL_APPROVER' }).select('-password -__v').lean().populate('company')
  }

  async getBySubmitter(company?: string) {
    return await UserModel.find({ company, role: 'SUBMITTER' }).select('-password -__v').lean().populate('company')
  }

  async getByEmail(email: string) {
    return await UserModel.findOne({ email })
  }

  async getBytoken(token: string) {
    return await UserModel.findOne({ token })
  }

  async getByIdWithoutPassword(id?: string) {
    return await UserModel.findById(id).populate('areas').populate('company').select('-__v')
  }

  async getById(id?: string) {
    return await UserModel.findById(id).populate('areas').populate('company').select('-__v -password')
  }

  async createAdmin() {
    const dataUser = {
      name: 'Ricardo',
      email: 'ricardosv46@gmail.com',
      role: 'ADMIN',
      password: '123456'
    }

    const user = await UserModel.findOne({ email: dataUser.email })

    if (!user) {
      const newUser = new UserModel(dataUser)
      await newUser.save()
    }
  }

  async create(user: IUserRequest) {
    const newUser = new UserModel(user)
    return await newUser.save()
  }

  async createByExcel(users: IUserExcelRequest[]) {
    try {
      const data = await UserModel.insertMany(users, { ordered: false })
      return data
    } catch (error) {
      throw error
    }
  }

  async update(user: IUserRequest) {
    return await UserModel.findByIdAndUpdate(user?.id, user, { new: true })
  }

  async delete(id?: string) {
    return await UserModel.findByIdAndDelete(id)
  }
}
