const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const OpenAI = require('openai')
const { Keypair, Connection, clusterApiUrl } = require('@solana/web3.js')
const { createMint, getOrCreateAssociatedTokenAccount, mintTo } = require('@solana/spl-token')
require('dotenv').config()

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Initialize Solana
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
const payer = Keypair.generate()

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

// Real Solana token creation
async function createRealToken(projectName) {
  try {
    const mint = await createMint(
      connection,
      payer,
      payer.publicKey,
      payer.publicKey,
      6 // decimals
    )
    return {
      mintAddress: mint.toString(),
      symbol: projectName.toUpperCase().slice(0, 4) + Math.floor(Math.random() * 99),
      supply: 1000000
    }
  } catch (error) {
    console.error('Token creation failed:', error)
    return null
  }
}

// Real Solana NFT creation
async function createRealNFT(description) {
  try {
    const mint = await createMint(
      connection,
      payer,
      payer.publicKey,
      payer.publicKey,
      0 // NFT has 0 decimals
    )
    
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey
    )
    
    await mintTo(
      connection,
      payer,
      mint,
      tokenAccount.address,
      payer.publicKey,
      1 // mint 1 NFT
    )
    
    return {
      mintAddress: mint.toString(),
      tokenId: Math.floor(Math.random() * 10000),
      explorerUrl: `https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`
    }
  } catch (error) {
    console.error('NFT creation failed:', error)
    return null
  }
}

app.post('/api/ai-chat', async (req, res) => {
  const { message, alias } = req.body
  
  try {
    // Determine intent from user message
    const lowerMessage = message.toLowerCase()
    let intent = 'GENERAL'
    
    if (lowerMessage.includes('nft') || lowerMessage.includes('mint')) {
      intent = 'NFT_MINT'
    } else if (lowerMessage.includes('token') && (lowerMessage.includes('create') || lowerMessage.includes('launch'))) {
      intent = 'TOKEN_CREATE'
    } else if (lowerMessage.includes('project') || lowerMessage.includes('find')) {
      intent = 'PROJECT_FIND'
    } else if (lowerMessage.includes('whitepaper') || lowerMessage.includes('document')) {
      intent = 'WHITEPAPER'
    }
    
    // Get OpenAI response for general conversation
    let aiResponse = ''
    if (intent === 'GENERAL') {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful DAO AI assistant for Consilience DAO. Be friendly and helpful. Mention that you can help create tokens, mint NFTs, and find projects. Keep responses concise."
            },
            {
              role: "user",
              content: message
            }
          ],
          max_tokens: 100
        })
        aiResponse = completion.choices[0].message.content
      } catch (error) {
        aiResponse = `Hey ${alias}! 👋 I'm your DAO AI assistant. I can help you create tokens, mint NFTs, and find projects!`
      }
    }
    let response = ''
    
    if (intent === 'NFT_MINT') {
      // Create real NFT on Solana
      const nft = await createRealNFT(message)
      if (nft) {
        response = `🎨 REAL NFT Created on Solana!\n\n✅ Mint: ${nft.mintAddress}\n🏷️ ID: #${nft.tokenId}\n🔍 Explorer: ${nft.explorerUrl}\n💰 +25 CS tokens!\n\n✨ Your NFT is live on Solana devnet!`
      } else {
        response = '❌ NFT creation failed. Solana devnet may be busy. Try again!'
      }
    } else if (intent === 'TOKEN_CREATE') {
      // Create real token on Solana
      const token = await createRealToken(message)
      if (token) {
        response = `🪙 REAL Token Created on Solana!\n\n🔗 Symbol: ${token.symbol}\n✅ Mint: ${token.mintAddress}\n💎 Supply: ${token.supply.toLocaleString()}\n🔍 Explorer: https://explorer.solana.com/address/${token.mintAddress}?cluster=devnet\n\n✨ Your token is live on Solana devnet!`
      } else {
        response = '❌ Token creation failed. Solana devnet may be busy. Try again!'
      }
    } else if (intent === 'PROJECT_FIND') {
      response = `🎯 AI-Matched Projects for ${alias}:\n\n• Mars Colony DAO - Terraform Mars with blockchain\n• Ocean Cleanup Protocol - DeFi for environmental impact\n• Neural Network DAO - Decentralized AI research\n• Quantum Computing Collective - Future tech development\n\nClick any project to join the team!`
    } else if (intent === 'WHITEPAPER') {
      // Generate whitepaper content
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a blockchain whitepaper writer. Create a concise whitepaper section for the user's project."
            },
            {
              role: "user",
              content: message
            }
          ],
          max_tokens: 300
        })
        response = `📄 CONSILIENCE Whitepaper Draft:\n\n${completion.choices[0].message.content}\n\n💡 This is AI-generated. Refine as needed!`
      } catch (error) {
        response = `📄 CONSILIENCE Whitepaper Outline:\n\n**Executive Summary**\nConsilience is a blockchain-powered project management platform targeting younger men who want to build and collaborate on meaningful projects.\n\n**Problem Statement**\nTraditional project management lacks incentivization and community engagement.\n\n**Solution**\nDAO-based collaboration with token rewards and NFT achievements.\n\n**Tokenomics**\nCS tokens reward contributions and unlock platform features.`
      }
    } else {
      // General AI response
      response = aiResponse
    }
    
    res.json({ response, timestamp: new Date().toISOString() })
  } catch (error) {
    console.error('AI Chat error:', error)
    res.json({ 
      response: `⚠️ AI/Blockchain temporarily unavailable.\n\nError: ${error.message}\n\nTry again in a moment!`, 
      timestamp: new Date().toISOString() 
    })
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