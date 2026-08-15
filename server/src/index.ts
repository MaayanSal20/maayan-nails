import dns from 'dns'
dns.setDefaultResultOrder('ipv4first')

import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import authRoutes from './routes/auth'
import appointmentsRoutes from './routes/appointments'
import adminRoutes from './routes/admin'
import analyticsRoutes from './routes/analytics'
import servicesRoutes from './routes/services'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', authRoutes)
app.use('/api', appointmentsRoutes)
app.use('/api', adminRoutes)
app.use('/api', analyticsRoutes)
app.use('/api', servicesRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})