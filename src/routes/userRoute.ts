import express from 'express'
import {
  createCorporation,
  createGlobalApprover,
  createUser,
  createUserByExcel,
  deleteUser,
  downloadExcelTemplate,
  getGlobalApprovers,
  getUserByToken,
  getUsers,
  updateUser
} from '../controllers/userController'
import { isAuthenticated } from '../middlewares/authenticated'
import { isValidRole } from '../middlewares/isValidRole'
import { fileUpload } from '../middlewares/files'

export const userRoute = express.Router()

userRoute.get('/', isAuthenticated, isValidRole(['CORPORATION', 'ADMIN', 'SUBMITTER']), getUsers)
userRoute.get('/global-approvers', isAuthenticated, isValidRole(['CORPORATION']), getGlobalApprovers)

userRoute.get('/detail', isAuthenticated, getUserByToken)
// userRoute.get('/:id', isAuthenticated, getUserById)

// userRoute.post('/company/update', isAuthenticated, isValidRole(['CORPORATION']), updateCompanyUser)
// userRoute.post('/employee/invitation', isAuthenticated, isValidRole(['CORPORATION']), sendInvitationByCompany)
userRoute.post('/corporation/create', isAuthenticated, isValidRole(['ADMIN']), createCorporation)
userRoute.post('/create', isAuthenticated, isValidRole(['CORPORATION']), createUser)
userRoute.post('/create/excel', isAuthenticated, isValidRole(['CORPORATION']), fileUpload, createUserByExcel)
userRoute.get('/download/template', isAuthenticated, isValidRole(['CORPORATION']), downloadExcelTemplate)
userRoute.post('/global-approver/create', isAuthenticated, isValidRole(['CORPORATION']), createGlobalApprover)
// userRoute.post('/employee/create', createEmployeeByToken)

userRoute.delete('/:id/delete', isAuthenticated, deleteUser)

userRoute.put('/:id/update', isAuthenticated, updateUser)
