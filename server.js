const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
require('dotenv').config()

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static('public'))

// Serve frontend at root
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Consilience DAO API is running',
    features: ['Solana Tokens', 'NFT Minting', 'Real-time Chat', 'AI Integration'],
    timestamp: new Date().toISOString()
  })
})

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Simple API endpoints
app.post('/api/signup', (req, res) => {
  const { alias, interests } = req.body
  res.json({ 
    alias, 
    interests, 
    wallet_address: 'demo_wallet_' + Math.random().toString(36).substr(2, 9),
    cs_balance: 100,
    message: 'Demo user created - connect database for persistence'
  })
})

app.get('/api/user/:alias', (req, res) => {
  res.json({ 
    alias: req.params.alias,
    interests: 'AI, Blockchain, DAO',
    wallet_address: 'demo_wallet_123',
    cs_balance: 250
  })
})

app.get('/api/projects', (req, res) => {
  res.json([
    { id: 1, name: 'Mars Colony DAO', description: 'Building the future on Mars', owner_alias: 'mars.builder' },
    { id: 2, name: 'Ocean Cleanup', description: 'Cleaning our oceans with blockchain', owner_alias: 'ocean.saver' }
  ])
})

app.post('/api/ai-chat', async (req, res) => {
  const { message, alias } = req.body
  
  try {
    let response = ''
    
    if (message.toLowerCase().includes('nft') || message.toLowerCase().includes('mint')) {
      // Simulate NFT creation
      const nftId = Math.floor(Math.random() * 10000)
      const mintAddress = 'NFT' + Math.random().toString(36).substr(2, 9).toUpperCase()
      response = `🎨 NFT Created!\n\n✅ Mint Address: ${mintAddress}\n🏷️ Token ID: #${nftId}\n💰 Earned 25 CS tokens!\n\nYour NFT is now live on Solana devnet!`
    } else if (message.toLowerCase().includes('token') || message.toLowerCase().includes('create')) {
      // Simulate token creation
      const symbol = 'TKN' + Math.floor(Math.random() * 999)
      const mintAddress = 'TOKEN' + Math.random().toString(36).substr(2, 9).toUpperCase()
      response = `🪙 Token Created!\n\n🔗 Symbol: ${symbol}\n✅ Mint: ${mintAddress}\n💎 Supply: 1,000,000\n\nYour project token is ready!`
    } else if (message.toLowerCase().includes('project') || message.toLowerCase().includes('find')) {
      response = `🎯 Found matching projects:\n\n• Mars Colony DAO - Building on Mars\n• Ocean Cleanup - Blockchain for good\n• AI Research Hub - Future tech\n\nClick a project to join the team!`
    } else {
      response = `Hey ${alias}! 👋\n\nI can help you:\n• "mint an NFT" - Create digital art\n• "create tokens" - Launch project currency\n• "find projects" - Discover collaborations\n\nWhat would you like to do?`
    }
    
    res.json({ response, timestamp: new Date().toISOString() })
  } catch (error) {
    res.json({ response: 'AI temporarily unavailable. Try again!', timestamp: new Date().toISOString() })
  }
})

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

const PORT = process.env.PORT || 8080
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Consilience DAO API running on port ${PORT}`)
})