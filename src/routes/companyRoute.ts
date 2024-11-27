import express from 'express'
import { createCompany, deleteCompany, getCompanies } from '../controllers/companyController'
import { isAuthenticated } from '../middlewares/authenticated'
import { isValidRole } from '../middlewares/isValidRole'

export const companyRoute = express.Router()

companyRoute.get('/', isAuthenticated, isValidRole(['CORPORATION', 'APPROVER', 'GLOBAL_APPROVER', 'SUBMITTER']), getCompanies)

companyRoute.post('/create', isAuthenticated, isValidRole(['CORPORATION']), createCompany)

companyRoute.delete('/:id/delete', isAuthenticated, isValidRole(['CORPORATION']), deleteCompany)
