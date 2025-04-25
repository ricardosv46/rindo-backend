import express from 'express'
import {
  createExpense,
  deleteExpense,
  getExpense,
  getExpenses,
  getExpensesByReportIdDraft,
  getExpensesDraft,
  getExpensesReview,
  updateExpense,
  updateStatusExpense
} from '../controllers/expenseController'
import { isAuthenticated } from '../middlewares/authenticated'
import { isValidRole } from '../middlewares/isValidRole'
import { multipleFileUpload } from '../middlewares/multiplefiles'
import { getOcrData } from '../controllers/ocrController'

export const expenseRoute = express.Router()

expenseRoute.get('/', isAuthenticated, isValidRole(['CORPORATION', 'APPROVER', 'GLOBAL_APPROVER', 'SUBMITTER']), getExpenses)

expenseRoute.get('/review', isAuthenticated, isValidRole(['SUBMITTER']), getExpensesReview)

expenseRoute.get('/draft', isAuthenticated, isValidRole(['SUBMITTER']), getExpensesDraft)

expenseRoute.get('/report/:id', isAuthenticated, isValidRole(['SUBMITTER']), getExpensesByReportIdDraft)

expenseRoute.post('/create', isAuthenticated, isValidRole(['SUBMITTER']), multipleFileUpload, createExpense)

expenseRoute.post('/ocr', isAuthenticated, isValidRole(['SUBMITTER']), multipleFileUpload, getOcrData)

expenseRoute.delete('/:id/delete', isAuthenticated, isValidRole(['SUBMITTER']), deleteExpense)

expenseRoute.get('/:id', isAuthenticated, isValidRole(['SUBMITTER', 'APPROVER', 'GLOBAL_APPROVER', 'CORPORATION']), getExpense)

expenseRoute.put('/:id/update', isAuthenticated, isValidRole(['SUBMITTER']), multipleFileUpload, updateExpense)

expenseRoute.put('/:id/status', isAuthenticated, isValidRole(['APPROVER', 'GLOBAL_APPROVER']), updateStatusExpense)
