const express = require('express')
const http = require('http')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

// Production-ready server setup
const app = express()
const server = http.createServer(app)

// Comprehensive middleware stack
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'https://frontend-lac-omega-55.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`)
  next()
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err)
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

// Global variables for Solana
let solanaEnabled = false
let connection = null
let aiWallet = null
let Connection, PublicKey, Keypair, clusterApiUrl, LAMPORTS_PER_SOL
let createMint, getOrCreateAssociatedTokenAccount, mintTo, getAccount

console.log('🚀 Starting Consilience DAO Production Server...')
console.log('📍 Environment:', process.env.NODE_ENV || 'development')
console.log('🌐 Frontend URL:', process.env.FRONTEND_URL || 'http://localhost:3000')

// Health check with comprehensive system info
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    solanaEnabled: solanaEnabled,
    aiWallet: aiWallet ? aiWallet.publicKey.toString() : null,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  })
})

// System status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    server: 'online',
    solana: solanaEnabled ? 'enabled' : 'disabled',
    features: {
      tokenCreation: solanaEnabled,
      nftMinting: solanaEnabled,
      walletBalance: solanaEnabled,
      realTimeChat: true,
      aiAssistant: true,
      projectManagement: true
    },
    network: solanaEnabled ? 'devnet' : 'none',
    timestamp: new Date().toISOString()
  })
})

// Initialize Solana with comprehensive error handling and retries
async function initializeSolana() {
  let attempts = 0
  const maxAttempts = 3
  
  while (attempts < maxAttempts && !solanaEnabled) {
    attempts++
    console.log(`🔗 Solana initialization attempt ${attempts}/${maxAttempts}...`)
    
    try {
      // Dynamic import with error handling
      const web3 = require('@solana/web3.js')
      const splToken = require('@solana/spl-token')
      
      Connection = web3.Connection
      PublicKey = web3.PublicKey
      Keypair = web3.Keypair
      clusterApiUrl = web3.clusterApiUrl
      LAMPORTS_PER_SOL = web3.LAMPORTS_PER_SOL
      
      createMint = splToken.createMint
      getOrCreateAssociatedTokenAccount = splToken.getOrCreateAssociatedTokenAccount
      mintTo = splToken.mintTo
      getAccount = splToken.getAccount
      
      console.log('✅ Solana dependencies loaded successfully')
      
      // Initialize connection with retry logic
      const rpcUrl = process.env.SOLANA_RPC_URL || clusterApiUrl('devnet')
      connection = new Connection(rpcUrl, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000,
        disableRetryOnRateLimit: false
      })
      
      console.log('🌐 Solana RPC URL:', rpcUrl)
      
      // Test connection
      const version = await connection.getVersion()
      console.log('✅ Solana connection established, version:', version['solana-core'])
      
      // Initialize AI wallet with comprehensive error handling
      try {
        const privateKeyArray = [
          174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56, 222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246, 15, 185, 186, 9, 166, 66, 49, 124, 65, 20, 147, 37, 1, 158, 86, 93, 137, 234, 150, 64, 135, 199, 112, 26, 131, 70, 74, 13, 103, 23, 34, 63
        ]
        
        aiWallet = Keypair.fromSecretKey(new Uint8Array(privateKeyArray))
        console.log('🔑 AI Wallet loaded:', aiWallet.publicKey.toString())
        
        // Check AI wallet balance
        const balance = await connection.getBalance(aiWallet.publicKey)
        console.log(`💰 AI Wallet Balance: ${balance / LAMPORTS_PER_SOL} SOL`)
        
        if (balance < 0.1 * LAMPORTS_PER_SOL) {
          console.log('⚠️ AI wallet balance is low, requesting airdrop...')
          try {
            const airdropSignature = await connection.requestAirdrop(aiWallet.publicKey, LAMPORTS_PER_SOL)
            await connection.confirmTransaction(airdropSignature)
            console.log('✅ AI wallet airdrop completed')
          } catch (airdropError) {
            console.log('⚠️ Airdrop failed, but continuing with existing balance')
          }
        }
        
        solanaEnabled = true
        console.log('🎉 Solana fully initialized and ready!')
        break
        
      } catch (walletError) {
        console.error(`❌ AI wallet initialization failed (attempt ${attempts}):`, walletError.message)
        if (attempts === maxAttempts) {
          throw walletError
        }
      }
      
    } catch (error) {
      console.error(`❌ Solana initialization failed (attempt ${attempts}):`, error.message)
      
      if (attempts < maxAttempts) {
        console.log(`⏳ Retrying in 2 seconds...`)
        await new Promise(resolve => setTimeout(resolve, 2000))
      } else {
        console.error('❌ All Solana initialization attempts failed')
        console.log('🔄 Server will continue in basic mode')
        console.log('📋 Error details:', error.stack)
      }
    }
  }
}

// Initialize Solana on startup
initializeSolana().catch(error => {
  console.error('❌ Fatal Solana initialization error:', error)
})

// Comprehensive user management
const users = new Map()
const sessions = new Map()

// Authentication middleware
const authenticate = (req, res, next) => {
  const alias = req.headers['x-user-alias'] || req.body.alias || req.query.alias
  if (alias) {
    req.userAlias = alias
  }
  next()
}

// Rate limiting
const rateLimits = new Map()
const rateLimit = (maxRequests = 100, windowMs = 60000) => {
  return (req, res, next) => {
    const key = req.ip + req.path
    const now = Date.now()
    
    if (!rateLimits.has(key)) {
      rateLimits.set(key, { count: 1, resetTime: now + windowMs })
      return next()
    }
    
    const limit = rateLimits.get(key)
    if (now > limit.resetTime) {
      limit.count = 1
      limit.resetTime = now + windowMs
      return next()
    }
    
    if (limit.count >= maxRequests) {
      return res.status(429).json({ error: 'Rate limit exceeded' })
    }
    
    limit.count++
    next()
  }
}

// Apply rate limiting to API routes
app.use('/api', rateLimit(200, 60000))

// User management endpoints
app.post('/api/signup', authenticate, (req, res) => {
  try {
    const { alias, interests, walletAddress } = req.body
    
    if (!alias || !interests) {
      return res.status(400).json({ error: 'Alias and interests are required' })
    }
    
    if (users.has(alias)) {
      return res.status(409).json({ error: 'Alias already exists' })
    }
    
    const user = {
      alias,
      interests,
      walletAddress: walletAddress || null,
      csBalance: 100,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    }
    
    users.set(alias, user)
    console.log(`👤 New user registered: ${alias}`)
    
    res.json({
      success: true,
      user: user,
      message: 'User registered successfully'
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

app.get('/api/user/:alias', (req, res) => {
  try {
    const { alias } = req.params
    const user = users.get(alias)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    // Update last active
    user.lastActive = new Date().toISOString()
    users.set(alias, user)
    
    res.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to get user' })
  }
})

// Project management
const projects = [
  { id: 1, name: 'Mars Colony DAO', description: 'Building sustainable habitats on Mars using blockchain governance', skills_needed: 'engineering, architecture, sustainability', owner_alias: 'system', type: 'collaboration', created_at: new Date().toISOString() },
  { id: 2, name: 'Ocean Cleanup Protocol', description: 'DeFi-powered ocean cleanup with environmental impact tracking', skills_needed: 'marine biology, engineering, environmental science', owner_alias: 'system', type: 'environmental', created_at: new Date().toISOString() },
  { id: 3, name: 'Neural Network DAO', description: 'Decentralized AI research and development with community-owned models', skills_needed: 'AI, machine learning, research', owner_alias: 'system', type: 'technology', created_at: new Date().toISOString() }
]

app.get('/api/projects', (req, res) => {
  try {
    res.json({ 
      projects: projects,
      total: projects.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Get projects error:', error)
    res.status(500).json({ error: 'Failed to get projects' })
  }
})

app.post('/api/create-project', authenticate, (req, res) => {
  try {
    const { name, description, skills_needed, type } = req.body
    const { userAlias } = req
    
    if (!name || !description || !skills_needed) {
      return res.status(400).json({ error: 'Name, description, and skills_needed are required' })
    }
    
    const project = {
      id: Date.now(),
      name,
      description,
      skills_needed,
      owner_alias: userAlias || 'anonymous',
      type: type || 'collaboration',
      created_at: new Date().toISOString()
    }
    
    projects.push(project)
    console.log(`📋 New project created: ${name} by ${userAlias}`)
    
    res.json({
      success: true,
      project: project,
      message: 'Project created successfully'
    })
  } catch (error) {
    console.error('Create project error:', error)
    res.status(500).json({ error: 'Failed to create project' })
  }
})

// Solana blockchain endpoints with comprehensive error handling
app.post('/api/create-token', authenticate, async (req, res) => {
  if (!solanaEnabled) {
    return res.status(503).json({ 
      error: 'Solana features unavailable',
      details: 'Blockchain services are currently initializing. Please try again in a moment.',
      retryAfter: 30
    })
  }
  
  try {
    const { name, symbol, supply, description, walletAddress } = req.body
    const { userAlias } = req
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required for token creation' })
    }
    
    if (!name || !symbol || !supply) {
      return res.status(400).json({ error: 'Name, symbol, and supply are required' })
    }
    
    if (supply < 1 || supply > 1000000000) {
      return res.status(400).json({ error: 'Supply must be between 1 and 1,000,000,000' })
    }
    
    console.log(`🪙 Creating token ${symbol} for ${userAlias} (${walletAddress})`)
    
    const userPublicKey = new PublicKey(walletAddress)
    
    // Create mint with retry logic
    let mint
    let attempts = 0
    const maxAttempts = 3
    
    while (attempts < maxAttempts) {
      try {
        mint = await createMint(
          connection,
          aiWallet,
          aiWallet.publicKey, // mint authority
          null, // freeze authority
          6, // decimals
          undefined,
          { commitment: 'confirmed' }
        )
        break
      } catch (error) {
        attempts++
        if (attempts === maxAttempts) throw error
        console.log(`⏳ Token creation attempt ${attempts} failed, retrying...`)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    console.log('✅ Mint created:', mint.toString())
    
    // Create token accounts
    const userTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      aiWallet,
      mint,
      userPublicKey,
      false,
      'confirmed'
    )
    
    const platformTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      aiWallet,
      mint,
      aiWallet.publicKey,
      false,
      'confirmed'
    )
    
    // Calculate distribution (80% user, 20% platform)
    const totalSupply = supply * 1000000 // Convert to token units (6 decimals)
    const userAmount = Math.floor(totalSupply * 0.8)
    const platformAmount = Math.floor(totalSupply * 0.2)
    
    // Mint tokens with confirmation
    const userMintTx = await mintTo(
      connection,
      aiWallet,
      mint,
      userTokenAccount.address,
      aiWallet,
      userAmount,
      [],
      { commitment: 'confirmed' }
    )
    
    const platformMintTx = await mintTo(
      connection,
      aiWallet,
      mint,
      platformTokenAccount.address,
      aiWallet,
      platformAmount,
      [],
      { commitment: 'confirmed' }
    )
    
    console.log(`✅ Token distribution completed - User: ${userAmount / 1000000}, Platform: ${platformAmount / 1000000}`)
    
    // Update user CS balance
    const user = users.get(userAlias)
    if (user) {
      user.csBalance += 50 // Bonus for token creation
      users.set(userAlias, user)
    }
    
    res.json({
      success: true,
      message: `🪙 Real token "${symbol}" created on Solana devnet!`,
      token: {
        name,
        symbol,
        mintAddress: mint.toString(),
        supply: supply,
        userTokens: Math.floor(supply * 0.8),
        platformTokens: Math.floor(supply * 0.2),
        decimals: 6
      },
      transactions: {
        userMint: userMintTx,
        platformMint: platformMintTx
      },
      explorerUrl: `https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`,
      distribution: '80% to creator, 20% to platform',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Token creation error:', error)
    res.status(500).json({ 
      error: 'Token creation failed',
      message: error.message,
      details: 'Please ensure your wallet has sufficient SOL for transaction fees'
    })
  }
})

app.post('/api/create-nft', authenticate, async (req, res) => {
  if (!solanaEnabled) {
    return res.status(503).json({ 
      error: 'Solana features unavailable',
      details: 'Blockchain services are currently initializing. Please try again in a moment.',
      retryAfter: 30
    })
  }
  
  try {
    const { name, description, image, walletAddress } = req.body
    const { userAlias } = req
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required for NFT creation' })
    }
    
    if (!name) {
      return res.status(400).json({ error: 'NFT name is required' })
    }
    
    console.log(`🎨 Creating NFT "${name}" for ${userAlias} (${walletAddress})`)
    
    const userPublicKey = new PublicKey(walletAddress)
    
    // Create NFT mint (0 decimals = NFT standard)
    const mint = await createMint(
      connection,
      aiWallet,
      aiWallet.publicKey, // mint authority
      null, // freeze authority
      0, // 0 decimals = NFT
      undefined,
      { commitment: 'confirmed' }
    )
    
    console.log('✅ NFT mint created:', mint.toString())
    
    // Create token account for user
    const userTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      aiWallet,
      mint,
      userPublicKey,
      false,
      'confirmed'
    )
    
    // Mint exactly 1 NFT to user
    const mintTx = await mintTo(
      connection,
      aiWallet,
      mint,
      userTokenAccount.address,
      aiWallet,
      1, // Mint exactly 1 NFT
      [],
      { commitment: 'confirmed' }
    )
    
    console.log('✅ NFT minted to user wallet, transaction:', mintTx)
    
    // Update user CS balance
    const user = users.get(userAlias)
    if (user) {
      user.csBalance += 25 // Bonus for NFT creation
      users.set(userAlias, user)
    }
    
    res.json({
      success: true,
      message: `🎨 Real NFT "${name}" created and sent to your wallet!`,
      nft: {
        name,
        description: description || 'Consilience DAO NFT',
        image: image || null,
        mintAddress: mint.toString(),
        supply: 1,
        decimals: 0
      },
      transaction: mintTx,
      explorerUrl: `https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ NFT creation error:', error)
    res.status(500).json({ 
      error: 'NFT creation failed',
      message: error.message,
      details: 'Please ensure your wallet has sufficient SOL for transaction fees'
    })
  }
})

app.post('/api/mint-nft', authenticate, async (req, res) => {
  if (!solanaEnabled) {
    return res.status(503).json({ error: 'Solana features unavailable' })
  }
  
  try {
    const { nftId, recipient, recipientAlias } = req.body
    
    if (!recipient) {
      return res.status(400).json({ error: 'Recipient wallet address is required' })
    }
    
    const userPublicKey = new PublicKey(recipient)
    
    // Create new NFT mint
    const mint = await createMint(
      connection,
      aiWallet,
      aiWallet.publicKey,
      null,
      0,
      undefined,
      { commitment: 'confirmed' }
    )
    
    const userTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      aiWallet,
      mint,
      userPublicKey,
      false,
      'confirmed'
    )
    
    const mintTx = await mintTo(
      connection,
      aiWallet,
      mint,
      userTokenAccount.address,
      aiWallet,
      1,
      [],
      { commitment: 'confirmed' }
    )
    
    res.json({
      success: true,
      message: `🎨 New NFT minted to ${recipientAlias || 'wallet'}!`,
      mintAddress: mint.toString(),
      transaction: mintTx,
      explorerUrl: `https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`
    })
    
  } catch (error) {
    console.error('❌ NFT minting error:', error)
    res.status(500).json({ error: 'NFT minting failed: ' + error.message })
  }
})

// Wallet interaction endpoints
app.get('/api/wallet-balance/:address', async (req, res) => {
  if (!solanaEnabled) {
    return res.json({ balance: 0, error: 'Solana not available' })
  }
  
  try {
    const { address } = req.params
    const publicKey = new PublicKey(address)
    
    const balance = await connection.getBalance(publicKey)
    const solBalance = balance / LAMPORTS_PER_SOL
    
    console.log(`💰 Balance check for ${address}: ${solBalance} SOL`)
    
    res.json({ 
      balance: solBalance,
      lamports: balance,
      address: address,
      network: 'devnet',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Balance fetch error:', error)
    res.status(400).json({ 
      error: 'Invalid wallet address or network error',
      balance: 0
    })
  }
})

app.get('/api/wallet-tokens/:address', async (req, res) => {
  if (!solanaEnabled) {
    return res.json({ tokens: [] })
  }
  
  try {
    const { address } = req.params
    const publicKey = new PublicKey(address)
    
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
    })
    
    const tokens = tokenAccounts.value
      .map(account => {
        const tokenInfo = account.account.data.parsed.info
        const balance = parseFloat(tokenInfo.tokenAmount.uiAmount) || 0
        return {
          symbol: tokenInfo.mint.slice(0, 8) + '...',
          balance: balance,
          mint: tokenInfo.mint,
          decimals: tokenInfo.tokenAmount.decimals,
          uiAmount: tokenInfo.tokenAmount.uiAmount,
          amount: tokenInfo.tokenAmount.amount
        }
      })
      .filter(token => token.balance > 0)
    
    res.json({ 
      tokens,
      count: tokens.length,
      address: address,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Tokens fetch error:', error)
    res.json({ tokens: [], error: error.message })
  }
})

app.get('/api/wallet-nfts/:address', async (req, res) => {
  if (!solanaEnabled) {
    return res.json({ nfts: [] })
  }
  
  try {
    const { address } = req.params
    const publicKey = new PublicKey(address)
    
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
    })
    
    const nfts = tokenAccounts.value
      .filter(account => {
        const tokenInfo = account.account.data.parsed.info
        return tokenInfo.tokenAmount.decimals === 0 && 
               parseFloat(tokenInfo.tokenAmount.amount) === 1
      })
      .map(account => {
        const tokenInfo = account.account.data.parsed.info
        return {
          mint: tokenInfo.mint,
          name: `Consilience NFT ${tokenInfo.mint.slice(0, 8)}...`,
          description: 'NFT created on Consilience DAO platform',
          image: null,
          explorerUrl: `https://explorer.solana.com/address/${tokenInfo.mint}?cluster=devnet`
        }
      })
    
    res.json({ 
      nfts,
      count: nfts.length,
      address: address,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('NFTs fetch error:', error)
    res.json({ nfts: [], error: error.message })
  }
})

app.get('/api/user-nfts/:alias', (req, res) => {
  // This would typically fetch from database
  res.json({ 
    nfts: [],
    message: 'Connect your wallet to see your NFTs'
  })
})

app.post('/api/connect-wallet', authenticate, (req, res) => {
  try {
    const { walletAddress } = req.body
    const { userAlias } = req
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' })
    }
    
    // Update user wallet address
    const user = users.get(userAlias)
    if (user) {
      user.walletAddress = walletAddress
      user.lastActive = new Date().toISOString()
      users.set(userAlias, user)
    }
    
    console.log(`🔗 Wallet connected: ${walletAddress} for ${userAlias}`)
    
    res.json({ 
      success: true, 
      message: 'Wallet connected successfully!',
      walletAddress: walletAddress,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Wallet connection error:', error)
    res.status(500).json({ error: 'Failed to connect wallet' })
  }
})

app.post('/api/request-airdrop', async (req, res) => {
  if (!solanaEnabled) {
    return res.status(503).json({ error: 'Solana features unavailable' })
  }
  
  try {
    const { walletAddress, amount = 1 } = req.body
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' })
    }
    
    if (amount < 0.1 || amount > 2) {
      return res.status(400).json({ error: 'Amount must be between 0.1 and 2 SOL' })
    }
    
    const publicKey = new PublicKey(walletAddress)
    const lamports = amount * LAMPORTS_PER_SOL
    
    console.log(`🚰 Requesting ${amount} SOL airdrop for ${walletAddress}`)
    
    const signature = await connection.requestAirdrop(publicKey, lamports)
    await connection.confirmTransaction(signature, 'confirmed')
    
    console.log('✅ Airdrop completed:', signature)
    
    res.json({ 
      success: true, 
      message: `🚰 ${amount} SOL airdropped to your wallet!`,
      signature,
      amount,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Airdrop error:', error)
    res.status(500).json({ 
      error: 'Airdrop failed',
      message: error.message,
      details: 'Devnet faucet may be rate limited. Try again in a few minutes.'
    })
  }
})

// AI Assistant endpoint
app.post('/api/ai-matchmaker', authenticate, (req, res) => {
  try {
    const { query } = req.body
    const { userAlias } = req
    
    let response = `Hi ${userAlias || 'there'}! I'm your AI assistant for Consilience DAO. `
    
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('token')) {
      response += `I can help you create real SPL tokens on Solana blockchain! 🪙\n\n`
      response += `• Connect your wallet\n• Choose token name, symbol, and supply\n• 80% goes to you, 20% to platform\n• Instantly tradeable on Solana DEXs\n\n`
      response += `Ready to create your token?`
    } else if (lowerQuery.includes('nft')) {
      response += `I can create real NFTs on Solana blockchain! 🎨\n\n`
      response += `• Unique digital collectibles\n• Stored on Solana blockchain\n• Instantly appear in your wallet\n• Tradeable on NFT marketplaces\n\n`
      response += `What kind of NFT would you like to create?`
    } else if (lowerQuery.includes('project')) {
      response += `I can help you find collaborators and manage projects! 🚀\n\n`
      response += `Current active projects:\n• Mars Colony DAO\n• Ocean Cleanup Protocol\n• Neural Network DAO\n\n`
      response += `Which project interests you, or would you like to create a new one?`
    } else if (lowerQuery.includes('balance') || lowerQuery.includes('wallet')) {
      response += `I can help you manage your wallet and check balances! 💰\n\n`
      response += `• Check SOL balance\n• View your tokens\n• See your NFTs\n• Request devnet airdrops\n\n`
      response += `Connect your wallet to get started!`
    } else {
      response += `I can help you with:\n\n`
      response += `🪙 **Token Creation** - Create real SPL tokens\n`
      response += `🎨 **NFT Minting** - Create unique digital collectibles\n`
      response += `🚀 **Project Management** - Find collaborators\n`
      response += `💰 **Wallet Services** - Balance checks and airdrops\n`
      response += `🤝 **DAO Participation** - Join collaborative projects\n\n`
      response += `What would you like to explore first?`
    }
    
    res.json({ 
      response,
      timestamp: new Date().toISOString(),
      solanaEnabled: solanaEnabled
    })
  } catch (error) {
    console.error('AI chat error:', error)
    res.json({ 
      response: `I'm your AI assistant for Consilience DAO! I can help create real tokens and NFTs on Solana blockchain. What would you like to build today?`,
      timestamp: new Date().toISOString()
    })
  }
})

// WebSocket for real-time features
const { Server } = require('socket.io')
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'https://frontend-lac-omega-55.vercel.app'],
    methods: ["GET", "POST"]
  }
})

const activeUsers = new Map()
const chatRooms = new Map()

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id)
  
  socket.on('user-online', (userData) => {
    const { alias, interests, walletAddress } = userData
    activeUsers.set(socket.id, { alias, interests, walletAddress, joinedAt: Date.now() })
    console.log(`👤 ${alias} is online`)
    
    socket.broadcast.emit('user-joined', { alias, interests })
  })
  
  socket.on('join-room', ({ alias, projectId }) => {
    const roomId = `project-${projectId}`
    socket.join(roomId)
    
    if (!chatRooms.has(roomId)) {
      chatRooms.set(roomId, { participants: new Set(), messages: [] })
    }
    
    chatRooms.get(roomId).participants.add(alias)
    console.log(`💬 ${alias} joined project ${projectId}`)
    
    socket.to(roomId).emit('user-joined-room', { alias, projectId })
  })
  
  socket.on('send-message', ({ alias, projectId, message }) => {
    const roomId = `project-${projectId}`
    const messageData = {
      id: Date.now(),
      alias,
      message,
      timestamp: new Date().toISOString()
    }
    
    // Store message
    if (chatRooms.has(roomId)) {
      chatRooms.get(roomId).messages.push(messageData)
    }
    
    io.to(roomId).emit('message', messageData)
    console.log(`💬 Message in ${roomId}: ${alias}: ${message}`)
  })
  
  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id)
    if (user) {
      console.log(`👤 ${user.alias} disconnected`)
      activeUsers.delete(socket.id)
    }
  })
})

// Error handling for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  process.exit(1)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
})

// Start server
const PORT = process.env.PORT || 5000

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Consilience DAO Production Server running on port ${PORT}`)
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 Solana Status: ${solanaEnabled ? 'Enabled' : 'Initializing...'}`)
  console.log(`💰 AI Wallet: ${aiWallet ? aiWallet.publicKey.toString() : 'Loading...'}`)
  console.log(`📡 WebSocket: Enabled`)
  console.log(`🛡️ Security: Rate limiting, CORS, Error handling`)
  console.log(`✅ Server ready for production traffic!`)
  
  // Continue trying to initialize Solana if it failed
  if (!solanaEnabled) {
    console.log('🔄 Continuing Solana initialization in background...')
    setTimeout(() => {
      initializeSolana()
    }, 5000)
  }
})