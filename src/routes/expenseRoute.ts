import express from 'express'
import { createArea } from '../controllers/areaController'
import { createExpense, getExpenses } from '../controllers/expenseController'
import { isAuthenticated } from '../middlewares/authenticated'
import { isValidRole } from '../middlewares/isValidRole'
import { multipleFileUpload } from '../middlewares/multiplefiles'
import { getOcrData } from '../controllers/ocrController'

export const expenseRoute = express.Router()

expenseRoute.get('/', isAuthenticated, isValidRole(['CORPORATION', 'APPROVER', 'GLOBAL_APPROVER', 'SUBMITTER']), getExpenses)

expenseRoute.post('/create', isAuthenticated, isValidRole(['SUBMITTER']), multipleFileUpload, createExpense)

expenseRoute.post('/ocr', isAuthenticated, isValidRole(['SUBMITTER']), multipleFileUpload, getOcrData)
