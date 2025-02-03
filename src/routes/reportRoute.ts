import express from 'express'
import { isAuthenticated } from '../middlewares/authenticated'
import { isValidRole } from '../middlewares/isValidRole'
import { createReport, getReports } from '../controllers/reportController'

export const reportRoute = express.Router()

reportRoute.get('/', isAuthenticated, isValidRole(['CORPORATION', 'APPROVER', 'GLOBAL_APPROVER', 'SUBMITTER']), getReports)

reportRoute.post('/create', isAuthenticated, isValidRole(['SUBMITTER']), createReport)
