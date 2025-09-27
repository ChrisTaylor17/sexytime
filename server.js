const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose()
const OpenAI = require('openai')
const { Connection, PublicKey, Keypair, clusterApiUrl, LAMPORTS_PER_SOL } = require('@solana/web3.js')
const { createMint, getOrCreateAssociatedTokenAccount, mintTo, getAccount } = require('@solana/spl-token')
require('dotenv').config()

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key'
})

// Solana connection
const connection = new Connection(process.env.SOLANA_RPC_URL || clusterApiUrl('devnet'), 'confirmed')

// AI wallet (funded) - using the provided private key
const aiWallet = Keypair.fromSecretKey(new Uint8Array([
  174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56, 222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246, 15, 185, 186, 9, 166, 66, 49, 124, 65, 20, 147, 37, 1, 158, 86, 93, 137, 234, 150, 64, 135, 199, 112, 26, 131, 70, 74, 13, 103, 23, 34, 63
]))

console.log('🚀 AI Wallet Address:', aiWallet.publicKey.toString())

// Check AI wallet balance
async function checkAIWalletBalance() {
  try {
    const balance = await connection.getBalance(aiWallet.publicKey)
    console.log(`💰 AI Wallet Balance: ${balance / LAMPORTS_PER_SOL} SOL`)
    if (balance < 0.1 * LAMPORTS_PER_SOL) {
      console.log('⚠️ AI wallet needs more SOL for transactions')
      console.log('🚰 Fund at: https://faucet.solana.com')
      console.log('📍 Address:', aiWallet.publicKey.toString())
    }
    return balance
  } catch (error) {
    console.error('❌ Failed to check AI wallet balance:', error.message)
    return 0
  }
}

// Initialize database
const db = new sqlite3.Database('./consilience.db')
app.locals.db = db

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alias VARCHAR(50) UNIQUE NOT NULL,
    interests TEXT NOT NULL,
    wallet_address VARCHAR(100),
    cs_balance INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)
  
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    skills_needed TEXT NOT NULL,
    owner_alias VARCHAR(50),
    type VARCHAR(50) DEFAULT 'collaboration',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)
  
  db.run(`CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    supply INTEGER NOT NULL,
    description TEXT,
    creator VARCHAR(50) NOT NULL,
    mint_address VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)
  
  db.run(`CREATE TABLE IF NOT EXISTS nft_collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image TEXT,
    supply INTEGER NOT NULL,
    creator VARCHAR(50) NOT NULL,
    mint_address VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)
})

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    aiWallet: aiWallet.publicKey.toString()
  })
})

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Full-service Solana API is working!' })
})

// Signup
app.post('/api/signup', (req, res) => {
  const { alias, interests } = req.body
  
  if (!alias || !interests) {
    return res.status(400).json({ error: 'Alias and interests required' })
  }
  
  db.run(
    'INSERT INTO users (alias, interests, cs_balance) VALUES (?, ?, ?)',
    [alias, interests, 100],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          res.status(400).json({ error: 'Alias already exists' })
        } else {
          res.status(500).json({ error: 'Database error: ' + err.message })
        }
      } else {
        res.json({ 
          id: this.lastID, 
          alias, 
          interests, 
          wallet_address: 'connect_wallet_for_real_tokens', 
          cs_balance: 100 
        })
      }
    }
  )
})

// Get user
app.get('/api/user/:alias', (req, res) => {
  const { alias } = req.params
  
  db.get('SELECT * FROM users WHERE alias = ?', [alias], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Database error' })
    } else if (!row) {
      res.status(404).json({ error: 'User not found' })
    } else {
      res.json(row)
    }
  })
})

// Projects
app.get('/api/projects', (req, res) => {
  db.all('SELECT * FROM projects ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Database error' })
    } else {
      res.json({ projects: rows || [] })
    }
  })
})

// Create project
app.post('/api/create-project', (req, res) => {
  const { name, description, skills_needed, owner_alias } = req.body
  
  db.run(
    'INSERT INTO projects (name, description, skills_needed, owner_alias) VALUES (?, ?, ?, ?)',
    [name, description, skills_needed, owner_alias],
    function(err) {
      if (err) {
        res.status(500).json({ error: 'Database error: ' + err.message })
      } else {
        res.json({ 
          id: this.lastID, 
          name, 
          description, 
          skills_needed, 
          owner_alias,
          message: 'Project created successfully!' 
        })
      }
    }
  )
})

// Create real token on Solana
app.post('/api/create-token', async (req, res) => {
  try {
    const { name, symbol, supply, description, walletAddress } = req.body
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required for real token creation' })
    }
    
    if (!name || !symbol || !supply) {
      return res.status(400).json({ error: 'Name, symbol, and supply are required' })
    }
    
    console.log(`🪙 Creating token: ${symbol} for ${walletAddress}`)
    
    const userPublicKey = new PublicKey(walletAddress)
    
    // Create mint
    const mint = await createMint(
      connection,
      aiWallet,
      aiWallet.publicKey, // mint authority
      null, // freeze authority
      6 // decimals
    )
    
    console.log('✅ Mint created:', mint.toString())
    
    // Create token account for user (80% of supply)
    const userTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      aiWallet,
      mint,
      userPublicKey
    )
    
    // Create token account for platform (20% of supply)
    const platformTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      aiWallet,
      mint,
      aiWallet.publicKey
    )
    
    // Calculate distribution (80% user, 20% platform)
    const totalSupply = supply * 1000000 // Convert to token units (6 decimals)
    const userAmount = Math.floor(totalSupply * 0.8)
    const platformAmount = Math.floor(totalSupply * 0.2)
    
    // Mint tokens to user
    await mintTo(
      connection,
      aiWallet,
      mint,
      userTokenAccount.address,
      aiWallet,
      userAmount
    )
    
    // Mint tokens to platform
    await mintTo(
      connection,
      aiWallet,
      mint,
      platformTokenAccount.address,
      aiWallet,
      platformAmount
    )
    
    console.log(`✅ Minted ${userAmount / 1000000} tokens to user, ${platformAmount / 1000000} to platform`)
    
    // Store in database
    db.run(
      'INSERT INTO tokens (name, symbol, supply, description, creator, mint_address) VALUES (?, ?, ?, ?, ?, ?)',
      [name, symbol, supply, description, 'user', mint.toString()],
      function(err) {
        if (err) {
          console.error('Database storage error:', err)
        }
      }
    )
    
    res.json({
      success: true,
      message: `🪙 Real token "${symbol}" created on Solana devnet!`,
      mintAddress: mint.toString(),
      explorerUrl: `https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`,
      userTokens: Math.floor(supply * 0.8),
      platformTokens: Math.floor(supply * 0.2),
      distribution: '80% to you, 20% to platform'
    })
    
  } catch (error) {
    console.error('❌ Token creation error:', error)
    res.status(500).json({ 
      error: 'Token creation failed: ' + error.message,
      details: 'Make sure your wallet has enough SOL and the AI wallet is funded'
    })
  }
})

// Create real NFT on Solana
app.post('/api/create-nft', async (req, res) => {
  try {
    const { name, description, walletAddress } = req.body
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required for real NFT creation' })
    }
    
    if (!name) {
      return res.status(400).json({ error: 'NFT name is required' })
    }
    
    console.log(`🎨 Creating NFT: ${name} for ${walletAddress}`)
    
    const userPublicKey = new PublicKey(walletAddress)
    
    // Create NFT mint (0 decimals = NFT standard)
    const mint = await createMint(
      connection,
      aiWallet,
      aiWallet.publicKey, // mint authority
      null, // freeze authority
      0 // 0 decimals = NFT
    )
    
    console.log('✅ NFT mint created:', mint.toString())
    
    // Create token account for user
    const userTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      aiWallet,
      mint,
      userPublicKey
    )
    
    // Mint exactly 1 NFT to user
    await mintTo(
      connection,
      aiWallet,
      mint,
      userTokenAccount.address,
      aiWallet,
      1 // Mint exactly 1 NFT
    )
    
    console.log('✅ NFT minted to user wallet')
    
    // Store in database
    db.run(
      'INSERT INTO nft_collections (name, description, supply, creator, mint_address) VALUES (?, ?, ?, ?, ?)',
      [name, description || 'Consilience DAO NFT', 1, 'user', mint.toString()],
      function(err) {
        if (err) {
          console.error('Database storage error:', err)
        }
      }
    )
    
    res.json({
      success: true,
      message: `🎨 Real NFT "${name}" created and sent to your wallet!`,
      mintAddress: mint.toString(),
      explorerUrl: `https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`,
      name: name,
      description: description || 'Consilience DAO NFT',
      supply: 1
    })
    
  } catch (error) {
    console.error('❌ NFT creation error:', error)
    res.status(500).json({ 
      error: 'NFT creation failed: ' + error.message,
      details: 'Make sure your wallet has enough SOL and the AI wallet is funded'
    })
  }
})

// Mint additional NFT
app.post('/api/mint-nft', async (req, res) => {
  try {
    const { nftId, recipient, recipientAlias } = req.body
    
    if (!recipient) {
      return res.status(400).json({ error: 'Recipient wallet address required' })
    }
    
    const userPublicKey = new PublicKey(recipient)
    
    // Create new NFT mint
    const mint = await createMint(
      connection,
      aiWallet,
      aiWallet.publicKey,
      null,
      0
    )
    
    const userTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      aiWallet,
      mint,
      userPublicKey
    )
    
    await mintTo(
      connection,
      aiWallet,
      mint,
      userTokenAccount.address,
      aiWallet,
      1
    )
    
    res.json({
      success: true,
      message: `🎨 New NFT minted to ${recipientAlias || 'your wallet'}!`,
      mintAddress: mint.toString(),
      explorerUrl: `https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`
    })
    
  } catch (error) {
    console.error('❌ NFT minting error:', error)
    res.status(500).json({ error: 'NFT minting failed: ' + error.message })
  }
})

// Get real wallet balance
app.get('/api/wallet-balance/:address', async (req, res) => {
  try {
    const publicKey = new PublicKey(req.params.address)
    const balance = await connection.getBalance(publicKey)
    res.json({ balance: balance / LAMPORTS_PER_SOL })
  } catch (error) {
    console.error('Balance fetch error:', error)
    res.status(400).json({ error: 'Invalid wallet address or network error' })
  }
})

// Get real wallet tokens
app.get('/api/wallet-tokens/:address', async (req, res) => {
  try {
    const publicKey = new PublicKey(req.params.address)
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
          decimals: tokenInfo.tokenAmount.decimals
        }
      })
      .filter(token => token.balance > 0)
    
    res.json({ tokens })
  } catch (error) {
    console.error('Tokens fetch error:', error)
    res.json({ tokens: [] })
  }
})

// Get real wallet NFTs (tokens with 0 decimals and amount = 1)
app.get('/api/wallet-nfts/:address', async (req, res) => {
  try {
    const publicKey = new PublicKey(req.params.address)
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
          description: 'NFT created on Consilience DAO',
          image: null
        }
      })
    
    res.json({ nfts })
  } catch (error) {
    console.error('NFTs fetch error:', error)
    res.json({ nfts: [] })
  }
})

// Get user NFTs from database
app.get('/api/user-nfts/:alias', (req, res) => {
  const { alias } = req.params
  
  db.all('SELECT * FROM nft_collections WHERE creator = ? ORDER BY created_at DESC', [alias], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Database error' })
    } else {
      res.json({ nfts: rows || [] })
    }
  })
})

// Connect wallet
app.post('/api/connect-wallet', (req, res) => {
  const { alias, walletAddress } = req.body
  
  if (alias && walletAddress) {
    db.run(
      'UPDATE users SET wallet_address = ? WHERE alias = ?',
      [walletAddress, alias],
      function(err) {
        if (err) {
          console.error('Wallet connection update error:', err)
        }
      }
    )
  }
  
  res.json({ success: true, message: 'Wallet connected successfully!' })
})

// Request SOL airdrop
app.post('/api/request-airdrop', async (req, res) => {
  try {
    const { walletAddress, amount = 1 } = req.body
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' })
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
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
    })
  } catch (error) {
    console.error('❌ Airdrop error:', error)
    res.status(500).json({ 
      error: 'Airdrop failed: ' + error.message,
      details: 'Devnet faucet may be rate limited. Try again in a few minutes.'
    })
  }
})

// AI Chat endpoint
app.post('/api/ai-matchmaker', async (req, res) => {
  try {
    const { alias, query } = req.body
    
    let response = `Hi ${alias}! I'm your AI assistant. `
    
    if (query.toLowerCase().includes('token')) {
      response += `I can help you create real tokens on Solana! Just connect your wallet and I'll mint them directly to you. 80% goes to you, 20% to the platform.`
    } else if (query.toLowerCase().includes('nft')) {
      response += `I can create real NFTs on Solana blockchain! Connect your wallet and I'll mint unique NFTs directly to your address.`
    } else if (query.toLowerCase().includes('project')) {
      response += `I can help you find collaborators and create projects. What kind of project are you interested in?`
    } else {
      response += `I can help you with:\n• Creating real Solana tokens\n• Minting real NFTs\n• Finding project collaborators\n• Managing your DAO participation\n\nWhat would you like to do?`
    }
    
    res.json({ response, timestamp: new Date().toISOString() })
  } catch (error) {
    console.error('AI chat error:', error)
    res.json({ 
      response: `I'm your AI assistant for Consilience DAO! I can help create real tokens and NFTs on Solana. What would you like to build?`,
      timestamp: new Date().toISOString()
    })
  }
})

// Socket.io for real-time features
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
      timestamp: new Date().toISOString()
    }
    
    io.to(`project-${projectId}`).emit('message', messageData)
  })
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Initialize server
const PORT = process.env.PORT || 5000

server.listen(PORT, async () => {
  console.log(`🚀 Full-service Consilience DAO server running on port ${PORT}`)
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
  console.log(`🔗 Solana Network: ${process.env.SOLANA_RPC_URL || 'devnet'}`)
  
  // Check AI wallet balance on startup
  await checkAIWalletBalance()
  
  console.log('✅ Server ready for real Solana token and NFT creation!')
})