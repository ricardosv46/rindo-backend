import express from 'express'
import { isAuthenticated } from '../middlewares/authenticated'
import { isValidRole } from '../middlewares/isValidRole'
import {
  createReport,
  deleteReport,
  getReport,
  getReports,
  getReportsApproved,
  getReportWithExpenses,
  updateReport,
  updateReportApprove,
  updateReportSendProcess
} from '../controllers/reportController'

export const reportRoute = express.Router()

reportRoute.get('/', isAuthenticated, isValidRole(['CORPORATION', 'APPROVER', 'GLOBAL_APPROVER', 'SUBMITTER']), getReports)

reportRoute.get('/approved', isAuthenticated, isValidRole(['APPROVER', 'GLOBAL_APPROVER']), getReportsApproved)

reportRoute.post('/create', isAuthenticated, isValidRole(['SUBMITTER']), createReport)

reportRoute.post('/create', isAuthenticated, isValidRole(['SUBMITTER']), createReport)

reportRoute.delete('/:id/delete', isAuthenticated, isValidRole(['SUBMITTER']), deleteReport)

reportRoute.get('/:id', isAuthenticated, isValidRole(['SUBMITTER', 'APPROVER', 'GLOBAL_APPROVER', 'CORPORATION']), getReport)

reportRoute.get(
  '/:id/expenses',
  isAuthenticated,
  isValidRole(['SUBMITTER', 'APPROVER', 'GLOBAL_APPROVER', 'CORPORATION']),
  getReportWithExpenses
)

reportRoute.put('/:id/update', isAuthenticated, isValidRole(['SUBMITTER']), updateReport)

reportRoute.put('/:id/send-process', isAuthenticated, isValidRole(['SUBMITTER']), updateReportSendProcess)

reportRoute.put('/:id/approve', isAuthenticated, isValidRole(['APPROVER', 'GLOBAL_APPROVER']), updateReportApprove)
