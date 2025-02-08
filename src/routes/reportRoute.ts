import express from 'express'
import { isAuthenticated } from '../middlewares/authenticated'
import { isValidRole } from '../middlewares/isValidRole'
import { createReport, deleteReport, getReport, getReports, updateReport } from '../controllers/reportController'

export const reportRoute = express.Router()

reportRoute.get('/', isAuthenticated, isValidRole(['CORPORATION', 'APPROVER', 'GLOBAL_APPROVER', 'SUBMITTER']), getReports)

reportRoute.post('/create', isAuthenticated, isValidRole(['SUBMITTER']), createReport)

reportRoute.post('/create', isAuthenticated, isValidRole(['SUBMITTER']), createReport)

reportRoute.delete('/:id/delete', isAuthenticated, isValidRole(['SUBMITTER']), deleteReport)

reportRoute.get('/:id', isAuthenticated, isValidRole(['SUBMITTER']), getReport)

reportRoute.put('/:id/update', isAuthenticated, isValidRole(['SUBMITTER']), updateReport)
