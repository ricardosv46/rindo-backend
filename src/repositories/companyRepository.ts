import { ICompanyRequest } from '../interfaces/company'
import { CompanyModel } from '../models/companySchema'

export class CompanyRepository {
  async getByRuc(ruc: string) {
    return await CompanyModel.findOne({ ruc })
  }

  async getById(id?: string) {
    return await CompanyModel.findById(id)
  }

  async getByCreatedBy(createdBy: string) {
    return await CompanyModel.find({ createdBy })
  }

  async create(company: ICompanyRequest) {
    const newData = new CompanyModel(company)
    return await newData.save()
  }

  async delete(id?: string) {
    return await CompanyModel.findByIdAndDelete(id)
  }
}
