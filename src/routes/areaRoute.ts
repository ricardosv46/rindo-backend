import express from 'express'
import { addApprover, createArea, deleteApprover, deleteArea, getAreas, updateArea } from '../controllers/areaController'
import { isAuthenticated } from '../middlewares/authenticated'
import { isValidRole } from '../middlewares/isValidRole'

export const areaRoute = express.Router()

areaRoute.get('/', isAuthenticated, isValidRole(['CORPORATION', 'APPROVER', 'GLOBAL_APPROVER', 'SUBMITTER']), getAreas)

areaRoute.post('/create', isAuthenticated, isValidRole(['CORPORATION']), createArea)

areaRoute.put('/approver/:id/add', isAuthenticated, isValidRole(['CORPORATION']), addApprover)

areaRoute.put('/:id/update', isAuthenticated, isValidRole(['CORPORATION']), updateArea)

areaRoute.delete('/:id/delete', isAuthenticated, isValidRole(['CORPORATION']), deleteArea)

areaRoute.put('/approver/:id/delete', isAuthenticated, isValidRole(['CORPORATION']), deleteApprover)
