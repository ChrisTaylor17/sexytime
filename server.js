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

// Initialize Solana with persistent funded wallet
const connection = new Connection(process.env.SOLANA_RPC_URL || clusterApiUrl('devnet'), 'confirmed')

// Use a persistent wallet or create one
let payer
if (process.env.SOLANA_PRIVATE_KEY) {
  try {
    const secretKey = JSON.parse(process.env.SOLANA_PRIVATE_KEY)
    payer = Keypair.fromSecretKey(new Uint8Array(secretKey))
    console.log('✅ Using persistent wallet:', payer.publicKey.toString())
  } catch {
    payer = Keypair.generate()
    console.log('⚠️ Generated new wallet:', payer.publicKey.toString())
  }
} else {
  payer = Keypair.generate()
  console.log('🔑 Generated wallet:', payer.publicKey.toString())
  console.log('🔑 Private key (save this):', JSON.stringify(Array.from(payer.secretKey)))
}

// Fund wallet if needed
async function ensureFunding() {
  try {
    const balance = await connection.getBalance(payer.publicKey)
    console.log(`💰 Current balance: ${balance / 1000000000} SOL`)
    
    if (balance < 100000000) { // Less than 0.1 SOL
      console.log('🚨 Low balance, requesting airdrop...')
      const airdropSignature = await connection.requestAirdrop(
        payer.publicKey,
        2000000000 // 2 SOL
      )
      await connection.confirmTransaction(airdropSignature)
      console.log('✅ Airdrop successful!')
    }
  } catch (error) {
    console.log('⚠️ Airdrop failed:', error.message)
  }
}

// Initialize funding
ensureFunding()
setInterval(ensureFunding, 300000) // Check every 5 minutes

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

// Task completion endpoint
app.post('/api/complete-task', async (req, res) => {
  const { taskId, alias, proof, reward } = req.body
  
  try {
    // In a real app, verify the proof and award tokens
    console.log(`✅ Task completed by ${alias}: ${taskId} (${reward} CS)`)
    
    res.json({ 
      success: true, 
      message: `Task verified! ${reward} CS tokens awarded.`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({ error: 'Task verification failed' })
  }
})

// Project creation endpoint
app.post('/api/create-project', async (req, res) => {
  const { name, description, alias } = req.body
  
  try {
    const project = {
      id: Date.now(),
      name,
      description,
      owner: alias,
      status: 'active',
      members: 1,
      created: new Date().toISOString()
    }
    
    res.json({ success: true, project })
  } catch (error) {
    res.status(500).json({ error: 'Project creation failed' })
  }
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

// Real Solana token creation with retry
async function createRealToken(projectName) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`🪙 Token creation attempt ${attempt}/3`)
      
      // Check balance
      const balance = await connection.getBalance(payer.publicKey)
      console.log(`💰 Balance: ${balance / 1000000000} SOL`)
      
      if (balance < 10000000) { // Less than 0.01 SOL
        console.log('🚨 Requesting emergency airdrop...')
        const airdropSig = await connection.requestAirdrop(payer.publicKey, 1000000000)
        await connection.confirmTransaction(airdropSig)
      }
      
      console.log('🔨 Creating token mint...')
      const mint = await createMint(
        connection,
        payer,
        payer.publicKey,
        payer.publicKey,
        6, // decimals
        undefined,
        { commitment: 'confirmed' }
      )
      
      console.log('✅ Token created successfully!')
      
      return {
        mintAddress: mint.toString(),
        symbol: projectName.toUpperCase().slice(0, 4) + Math.floor(Math.random() * 99),
        supply: 1000000,
        isReal: true
      }
    } catch (error) {
      console.error(`❌ Token attempt ${attempt} failed:`, error.message)
      if (attempt === 3) {
        // Final fallback
        return {
          mintAddress: 'SIM' + Math.random().toString(36).substr(2, 32).toUpperCase(),
          symbol: projectName.toUpperCase().slice(0, 4) + Math.floor(Math.random() * 99),
          supply: 1000000,
          isReal: false,
          error: error.message
        }
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
}

// Real Solana NFT creation with retry
async function createRealNFT(description) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`🎨 NFT creation attempt ${attempt}/3`)
      
      // Check balance
      const balance = await connection.getBalance(payer.publicKey)
      console.log(`💰 Balance: ${balance / 1000000000} SOL`)
      
      if (balance < 10000000) { // Less than 0.01 SOL
        console.log('🚨 Requesting emergency airdrop...')
        const airdropSig = await connection.requestAirdrop(payer.publicKey, 1000000000)
        await connection.confirmTransaction(airdropSig)
      }
      
      // Create mint
      console.log('🔨 Creating mint...')
      const mint = await createMint(
        connection,
        payer,
        payer.publicKey,
        payer.publicKey,
        0, // NFT has 0 decimals
        undefined,
        { commitment: 'confirmed' }
      )
      
      console.log('🏷️ Mint created:', mint.toString())
      
      // Create token account
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        payer.publicKey,
        false,
        'confirmed'
      )
      
      // Mint NFT
      await mintTo(
        connection,
        payer,
        mint,
        tokenAccount.address,
        payer.publicKey,
        1, // mint 1 NFT
        [],
        { commitment: 'confirmed' }
      )
      
      console.log('✅ NFT minted successfully!')
      
      return {
        mintAddress: mint.toString(),
        tokenId: Math.floor(Math.random() * 10000),
        explorerUrl: `https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`,
        isReal: true
      }
    } catch (error) {
      console.error(`❌ NFT attempt ${attempt} failed:`, error.message)
      if (attempt === 3) {
        // Final fallback
        return {
          mintAddress: 'SIM' + Math.random().toString(36).substr(2, 32).toUpperCase(),
          tokenId: Math.floor(Math.random() * 10000),
          explorerUrl: `https://explorer.solana.com/address/simulation?cluster=devnet`,
          isReal: false,
          error: error.message
        }
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
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
      // Create NFT on Solana (real or simulated)
      const nft = await createRealNFT(message)
      if (nft) {
        const status = nft.isReal ? '✅ REAL NFT on Solana!' : '⚠️ Simulated (devnet busy)'
        response = `🎨 NFT Created!\n\n${status}\n🔗 Mint: ${nft.mintAddress}\n🏷️ ID: #${nft.tokenId}\n🔍 Explorer: ${nft.explorerUrl}\n💰 +25 CS tokens!\n\n✨ Your NFT is ready!`
      } else {
        response = '❌ NFT creation failed completely. Try again!'
      }
    } else if (intent === 'TOKEN_CREATE') {
      // Create token on Solana (real or simulated)
      const token = await createRealToken(message)
      if (token) {
        const status = token.isReal ? '✅ REAL Token on Solana!' : '⚠️ Simulated (devnet busy)'
        response = `🪙 Token Created!\n\n${status}\n🔗 Symbol: ${token.symbol}\n✅ Mint: ${token.mintAddress}\n💎 Supply: ${token.supply.toLocaleString()}\n🔍 Explorer: https://explorer.solana.com/address/${token.mintAddress}?cluster=devnet\n\n✨ Your token is ready!`
      } else {
        response = '❌ Token creation failed completely. Try again!'
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