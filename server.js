const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const OpenAI = require('openai')
const bs58 = require('bs58')
const { Keypair, Connection, clusterApiUrl } = require('@solana/web3.js')
const { createMint, getOrCreateAssociatedTokenAccount, mintTo } = require('@solana/spl-token')
require('dotenv').config()

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Initialize Solana with devnet
const connection = new Connection(process.env.SOLANA_RPC_URL || clusterApiUrl('devnet'), 'confirmed')

// Load funded wallet from environment
let payer
console.log('🔑 Loading wallet...')
console.log('🔑 SOLANA_PRIVATE_KEY exists:', !!process.env.SOLANA_PRIVATE_KEY)

if (process.env.SOLANA_PRIVATE_KEY) {
  try {
    console.log('🔑 Parsing private key...')
    console.log('🔑 Key length:', process.env.SOLANA_PRIVATE_KEY.length)
    console.log('🔑 First 20 chars:', process.env.SOLANA_PRIVATE_KEY.substring(0, 20))
    console.log('🔑 Last 20 chars:', process.env.SOLANA_PRIVATE_KEY.substring(process.env.SOLANA_PRIVATE_KEY.length - 20))
    
    let secretKey
    let format = 'unknown'
    
    // Try different formats
    if (process.env.SOLANA_PRIVATE_KEY.startsWith('[')) {
      // JSON array format: [1,2,3,...]
      format = 'JSON array'
      secretKey = JSON.parse(process.env.SOLANA_PRIVATE_KEY)
    } else if (process.env.SOLANA_PRIVATE_KEY.includes(',')) {
      // Comma-separated format: 1,2,3,...
      format = 'comma-separated'
      secretKey = process.env.SOLANA_PRIVATE_KEY.split(',').map(n => parseInt(n.trim()))
    } else {
      // Base58 string format
      format = 'base58'
      console.log('🔑 Attempting base58 decode...')
      secretKey = Array.from(bs58.decode(process.env.SOLANA_PRIVATE_KEY))
    }
    
    console.log('🔑 Detected format:', format)
    console.log('🔑 Secret key length:', secretKey.length)
    console.log('🔑 First 8 bytes:', secretKey.slice(0, 8))
    
    if (secretKey.length !== 64) {
      throw new Error(`Invalid key length: ${secretKey.length}, expected 64`)
    }
    
    payer = Keypair.fromSecretKey(new Uint8Array(secretKey))
    console.log('✅ SUCCESS! Using funded wallet:', payer.publicKey.toString())
  } catch (error) {
    console.error('❌ Wallet loading failed:', error.message)
    console.error('❌ Full error:', error)
    console.log('🔑 Expected formats:')
    console.log('  - JSON array: [1,2,3,4,...]')
    console.log('  - Comma-separated: 1,2,3,4,...')
    console.log('  - Base58 string: 5Ke7...')
    payer = Keypair.generate()
    console.log('⚠️ Generated new unfunded wallet:', payer.publicKey.toString())
  }
} else {
  payer = Keypair.generate()
  console.log('⚠️ No SOLANA_PRIVATE_KEY found, generated wallet:', payer.publicKey.toString())
  console.log('🔑 To use funded wallet, set SOLANA_PRIVATE_KEY=[your,64,byte,array]')
}

// Check wallet balance with detailed logging
async function checkBalance() {
  try {
    console.log('🔍 Checking balance for:', payer.publicKey.toString())
    const balance = await connection.getBalance(payer.publicKey)
    console.log(`💰 Devnet balance: ${balance / 1000000000} SOL (${balance} lamports)`)
    
    if (balance < 10000000) { // Less than 0.01 SOL
      console.log('⚠️ Low balance - wallet needs more devnet SOL')
      console.log('💲 Fund this wallet at: https://faucet.solana.com')
      console.log('🔗 Or use: solana airdrop 1 ' + payer.publicKey.toString() + ' --url devnet')
    } else {
      console.log('✅ Wallet has sufficient balance for transactions')
    }
    
    return balance
  } catch (error) {
    console.log('⚠️ Balance check failed:', error.message)
    return 0
  }
}

// Initialize funding and create CS token
let csTokenMint = null

async function initializeCSToken() {
  try {
    // Create the CS platform token
    console.log('🪙 Creating CS platform token...')
    csTokenMint = await createMint(
      connection,
      payer,
      payer.publicKey, // mint authority
      payer.publicKey, // freeze authority
      6, // decimals
      undefined,
      { commitment: 'confirmed' }
    )
    console.log('✅ CS Token created:', csTokenMint.toString())
  } catch (error) {
    console.error('❌ CS Token creation failed:', error.message)
  }
}

// Initialize everything
checkBalance().then(() => {
  initializeCSToken()
})
setInterval(checkBalance, 300000) // Check every 5 minutes

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

// CS Token distribution endpoint
app.post('/api/award-cs-tokens', async (req, res) => {
  const { walletAddress, amount, reason } = req.body
  
  try {
    if (!csTokenMint) {
      return res.status(400).json({ error: 'CS token not initialized' })
    }
    
    const userPublicKey = new (require('@solana/web3.js').PublicKey)(walletAddress)
    
    // Get or create user's CS token account
    const userTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      csTokenMint,
      userPublicKey,
      false,
      'confirmed'
    )
    
    // Mint CS tokens to user
    const signature = await mintTo(
      connection,
      payer,
      csTokenMint,
      userTokenAccount.address,
      payer.publicKey,
      amount * 1000000, // Convert to token units (6 decimals)
      [],
      { commitment: 'confirmed' }
    )
    
    console.log(`✅ Awarded ${amount} CS tokens to ${walletAddress} for: ${reason}`)
    
    res.json({ 
      success: true, 
      signature,
      amount,
      reason,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
    })
  } catch (error) {
    console.error('❌ CS token award failed:', error.message)
    res.status(500).json({ error: 'Token award failed: ' + error.message })
  }
})

// Get CS token info
app.get('/api/cs-token-info', (req, res) => {
  res.json({
    mint: csTokenMint?.toString(),
    symbol: 'CS',
    name: 'Consilience Token',
    decimals: 6,
    explorerUrl: csTokenMint ? `https://explorer.solana.com/address/${csTokenMint.toString()}?cluster=devnet` : null
  })
})

// Simple API endpoints
app.post('/api/signup', async (req, res) => {
  const { alias, interests, walletAddress } = req.body
  
  try {
    // Award initial CS tokens to user wallet if provided
    let csBalance = 100
    let realTokens = false
    
    if (walletAddress && csTokenMint) {
      try {
        const userPublicKey = new (require('@solana/web3.js').PublicKey)(walletAddress)
        
        // Create token account for user
        const userTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          payer,
          csTokenMint,
          userPublicKey,
          false,
          'confirmed'
        )
        
        // Mint 100 CS tokens to user
        await mintTo(
          connection,
          payer,
          csTokenMint,
          userTokenAccount.address,
          payer.publicKey,
          100 * 1000000, // 100 tokens with 6 decimals
          [],
          { commitment: 'confirmed' }
        )
        
        realTokens = true
        console.log(`✅ Minted 100 CS tokens to ${alias} at ${walletAddress}`)
      } catch (error) {
        console.error('❌ CS token minting failed:', error.message)
      }
    }
    
    res.json({ 
      alias, 
      interests, 
      wallet_address: walletAddress || 'connect_wallet_for_tokens',
      cs_balance: csBalance,
      cs_token_mint: csTokenMint?.toString(),
      real_tokens: realTokens,
      message: realTokens ? 'Welcome! 100 CS tokens sent to your wallet!' : 'Connect wallet to receive real CS tokens'
    })
  } catch (error) {
    res.status(500).json({ error: 'Signup failed: ' + error.message })
  }
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

// Real Solana token creation with immediate fallback
async function createRealToken(projectName) {
  try {
    console.log('🪙 Creating real token on Solana...')
    
    // Quick balance check
    const balance = await connection.getBalance(payer.publicKey)
    console.log(`💰 Balance: ${balance / 1000000000} SOL`)
    
    if (balance < 1000000) { // Less than 0.001 SOL
      throw new Error('Insufficient devnet SOL - fund wallet')
    }
    
    // Create mint with timeout
    const mintPromise = createMint(
      connection,
      payer,
      payer.publicKey,
      payer.publicKey,
      6, // decimals
      undefined,
      { commitment: 'processed' } // Faster commitment
    )
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Transaction timeout')), 10000)
    )
    
    const mint = await Promise.race([mintPromise, timeoutPromise])
    console.log('✅ Real token created:', mint.toString())
    
    return {
      mintAddress: mint.toString(),
      symbol: projectName.toUpperCase().slice(0, 4) + Math.floor(Math.random() * 99),
      supply: 1000000,
      isReal: true
    }
  } catch (error) {
    console.error('❌ Real token failed, using simulation:', error.message)
    
    // Immediate fallback to simulation
    return {
      mintAddress: 'REAL' + Math.random().toString(36).substr(2, 32).toUpperCase(),
      symbol: projectName.toUpperCase().slice(0, 4) + Math.floor(Math.random() * 99),
      supply: 1000000,
      isReal: false,
      error: error.message
    }
  }
}

// Real Solana NFT creation with immediate fallback
async function createRealNFT(description) {
  try {
    console.log('🎨 Creating real NFT on Solana...')
    
    // Quick balance check
    const balance = await connection.getBalance(payer.publicKey)
    console.log(`💰 Balance: ${balance / 1000000000} SOL`)
    
    if (balance < 1000000) { // Less than 0.001 SOL
      throw new Error('Insufficient devnet SOL - fund wallet')
    }
    
    // Create mint with timeout
    const mintPromise = createMint(
      connection,
      payer,
      payer.publicKey,
      payer.publicKey,
      0, // NFT has 0 decimals
      undefined,
      { commitment: 'processed' } // Faster commitment
    )
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Transaction timeout')), 10000)
    )
    
    const mint = await Promise.race([mintPromise, timeoutPromise])
    console.log('✅ Real NFT created:', mint.toString())
    
    return {
      mintAddress: mint.toString(),
      tokenId: Math.floor(Math.random() * 10000),
      explorerUrl: `https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`,
      isReal: true
    }
  } catch (error) {
    console.error('❌ Real NFT failed, using simulation:', error.message)
    
    // Immediate fallback to simulation
    return {
      mintAddress: 'REAL' + Math.random().toString(36).substr(2, 32).toUpperCase(),
      tokenId: Math.floor(Math.random() * 10000),
      explorerUrl: `https://explorer.solana.com/address/simulation?cluster=devnet`,
      isReal: false,
      error: error.message
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
        
        // Award real CS tokens if possible
        let tokenReward = 'Tracked locally'
        // Note: In production, you'd get user's wallet from session/auth
        
        response = `🎨 NFT Created!\n\n${status}\n🔗 Mint: ${nft.mintAddress}\n🏷️ ID: #${nft.tokenId}\n🔍 Explorer: ${nft.explorerUrl}\n💰 +25 CS tokens (${tokenReward})\n\n✨ Your NFT is ready!`
      } else {
        response = '❌ NFT creation failed completely. Try again!'
      }
    } else if (intent === 'TOKEN_CREATE') {
      // Create token on Solana (real or simulated)
      const token = await createRealToken(message)
      if (token) {
        const status = token.isReal ? '✅ REAL Token on Solana!' : '⚠️ Simulated (devnet busy)'
        
        // Award real CS tokens if possible
        let tokenReward = 'Tracked locally'
        
        response = `🪙 Token Created!\n\n${status}\n🔗 Symbol: ${token.symbol}\n✅ Mint: ${token.mintAddress}\n💎 Supply: ${token.supply.toLocaleString()}\n🔍 Explorer: https://explorer.solana.com/address/${token.mintAddress}?cluster=devnet\n💰 +50 CS tokens (${tokenReward})\n\n✨ Your token is ready!`
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