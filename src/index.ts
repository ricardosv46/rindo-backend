import express from 'express'
import dotenv from 'dotenv'
import http from 'http'
import cors, { CorsOptions } from 'cors'
import { Server as SocketServer } from 'socket.io'

import { connectDB } from './config/connect'
import { userRoute } from './routes/userRoute'
import { authRoute } from './routes/authRoute'
import { companyRoute } from './routes/companyRoute'
import { areaRoute } from './routes/areaRoute'
import { expenseRoute } from './routes/expenseRoute'

dotenv.config()
const app = express()
const server = http.createServer(app)
export const io = new SocketServer(server, {
  cors: {
    origin: 'http://localhost:3000'
    // origin: 'https://qa-rindo.analytia.pe'
  }
})

app.use(express.json())
const whitelist = ['http://localhost:3000', 'http://localhost:4000', 'http://localhost:5000', 'http://localhost:5001']

const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.includes(origin || '')) {
      callback(null, true)
    } else {
      callback(new Error('Error de CORS'))
    }
  }
}

app.use(cors(corsOptions))
connectDB()

app.use('/auth', authRoute)
app.use('/users', userRoute)
app.use('/companies', companyRoute)
app.use('/areas', areaRoute)
app.use('/expenses', expenseRoute)

// app.use('/spends', routerSpend)
// app.use('/reports', routerReport)
// app.use('/notification', routerNotification)
// app.use('/areas', routerArea)
// app.use('/clavesol', routerClaveSol)
// app.get('/approvals/:id', isAuthenticated, getApprovals)

// app.get('/roles', async () => {
//   await Role.find()
// })

const PORT = process.env.PORT || 4000

server.listen(PORT, () => {
  console.log(`Escuchando puerto ${PORT}`)
})

io.on('connection', (socket) => {
  socket.on('register', async (userId) => {
    try {
      // Unir al usuario a una sala con su ID
      socket.join(userId.toString())
      console.log(`Usuario ${userId} unido a la sala ${userId}`)
    } catch (error) {
      console.error('Error en el registro del socket:', error)
    }
  })
})
