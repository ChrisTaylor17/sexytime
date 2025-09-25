const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const { Pool } = require('pg')
require('dotenv').config()

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api', require('./routes/auth'))
app.use('/api', require('./routes/projects'))
app.use('/api', require('./routes/ai'))
app.use('/api', require('./routes/solana'))

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('join-room', ({ alias, projectId }) => {
    socket.join(`project-${projectId}`)
    console.log(`${alias} joined project ${projectId}`)
  })

  socket.on('send-message', ({ alias, projectId, message }) => {
    const messageData = {
      alias,
      message,
      timestamp: new Date()
    }
    
    io.to(`project-${projectId}`).emit('message', messageData)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})