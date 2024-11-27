import express from 'express'
import { checkToken, forgotPassword, login, newPassword, newPasswordWithAuth } from '../controllers/authController'
import { isAuthenticated } from '../middlewares/authenticated'

export const authRoute = express.Router()

authRoute.post('/login', login)
authRoute.get('/forgot-password/:token', checkToken)

authRoute.post('/forgot-password', forgotPassword)
authRoute.post('/forgot-password/:token', newPassword)
authRoute.post('/change-password', isAuthenticated, newPasswordWithAuth)
