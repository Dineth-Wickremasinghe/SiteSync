const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')

dotenv.config()
connectDB()

const app = express()
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth',      require('./routes/authRoutes'))
app.use('/api/workers',   require('./routes/workerRoutes'))
app.use('/api/projects',  require('./routes/projectRoutes'))
app.use('/api/equipment', require('./routes/equipmentRoutes'))
app.use('/api/reports',   require('./routes/reportRoutes'))
app.use('/api/incidents', require('./routes/incidentRoutes'))
app.use('/api/notices',   require('./routes/noticeRoutes'))

// Base route to confirm server is live
app.get('/', (req, res) => {
  res.json({ message: 'SiteSync API is running' })
})

app.use((err, req, res, next) => {
  console.error('Server error:', err.message)
  res.status(500).json({ message: err.message })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
