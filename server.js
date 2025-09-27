const express = require('express')
const cors = require('cors')

// Basic working server first
const app = express()
app.use(cors())
app.use(express.json())

console.log('🚀 Starting Consilience DAO server...')

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' })
})

// Signup
app.post('/api/signup', (req, res) => {
  const { alias, interests } = req.body
  res.json({ 
    alias, 
    interests, 
    wallet_address: 'connect_wallet', 
    cs_balance: 100 
  })
})

// Get user
app.get('/api/user/:alias', (req, res) => {
  res.json({ 
    alias: req.params.alias, 
    interests: 'AI, Blockchain', 
    cs_balance: 250 
  })
})

// Projects
app.get('/api/projects', (req, res) => {
  res.json({
    projects: [
      { id: 1, name: 'Mars Colony DAO', description: 'Building on Mars', owner_alias: 'mars.builder' },
      { id: 2, name: 'Ocean Cleanup', description: 'Clean the oceans', owner_alias: 'ocean.saver' }
    ]
  })
})

// Now add Solana functionality with error handling
let solanaEnabled = false
let connection = null
let aiWallet = null

try {
  console.log('🔗 Loading Solana dependencies...')
  const { Connection, PublicKey, Keypair, clusterApiUrl, LAMPORTS_PER_SOL } = require('@solana/web3.js')
  const { createMint, getOrCreateAssociatedTokenAccount, mintTo } = require('@solana/spl-token')
  
  // Initialize Solana
  connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
  
  // AI wallet
  aiWallet = Keypair.fromSecretKey(new Uint8Array([
    174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56, 222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246, 15, 185, 186, 9, 166, 66, 49, 124, 65, 20, 147, 37, 1, 158, 86, 93, 137, 234, 150, 64, 135, 199, 112, 26, 131, 70, 74, 13, 103, 23, 34, 63
  ]))
  
  solanaEnabled = true
  console.log('✅ Solana enabled! AI Wallet:', aiWallet.publicKey.toString())
  
  // Real Solana endpoints
  
  // Create real token
  app.post('/api/create-token', async (req, res) => {
    try {
      const { name, symbol, supply, walletAddress } = req.body
      
      if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address required' })
      }
      
      const userPublicKey = new PublicKey(walletAddress)
      
      const mint = await createMint(
        connection,
        aiWallet,
        aiWallet.publicKey,
        null,
        6
      )
      
      const userTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        aiWallet,
        mint,
        userPublicKey
      )
      
      const userAmount = Math.floor(supply * 0.8) * 1000000
      await mintTo(
        connection,
        aiWallet,
        mint,
        userTokenAccount.address,
        aiWallet,
        userAmount
      )
      
      res.json({
        success: true,
        message: `Real token ${symbol} created on Solana!`,
        mintAddress: mint.toString(),
        explorerUrl: `https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`,
        userTokens: Math.floor(supply * 0.8)
      })
      
    } catch (error) {
      console.error('Token creation error:', error)
      res.status(500).json({ error: 'Token creation failed: ' + error.message })
    }
  })
  
  // Create real NFT
  app.post('/api/create-nft', async (req, res) => {
    try {
      const { name, description, walletAddress } = req.body
      
      if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address required' })
      }
      
      const userPublicKey = new PublicKey(walletAddress)
      
      const mint = await createMint(
        connection,
        aiWallet,
        aiWallet.publicKey,
        null,
        0  // 0 decimals = NFT
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
        message: `Real NFT "${name}" created and sent to your wallet!`,
        mintAddress: mint.toString(),
        explorerUrl: `https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`,
        name: name,
        description: description
      })
      
    } catch (error) {
      console.error('NFT creation error:', error)
      res.status(500).json({ error: 'NFT creation failed: ' + error.message })
    }
  })
  
  // Mint NFT
  app.post('/api/mint-nft', async (req, res) => {
    try {
      const { recipient } = req.body
      const userPublicKey = new PublicKey(recipient)
      
      const mint = await createMint(connection, aiWallet, aiWallet.publicKey, null, 0)
      const userTokenAccount = await getOrCreateAssociatedTokenAccount(connection, aiWallet, mint, userPublicKey)
      await mintTo(connection, aiWallet, mint, userTokenAccount.address, aiWallet, 1)
      
      res.json({
        success: true,
        message: 'Real NFT minted to your wallet!',
        mintAddress: mint.toString(),
        explorerUrl: `https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`
      })
      
    } catch (error) {
      res.status(500).json({ error: 'NFT minting failed: ' + error.message })
    }
  })
  
  // Get wallet balance
  app.get('/api/wallet-balance/:address', async (req, res) => {
    try {
      const publicKey = new PublicKey(req.params.address)
      const balance = await connection.getBalance(publicKey)
      res.json({ balance: balance / LAMPORTS_PER_SOL })
    } catch (error) {
      res.status(400).json({ error: 'Invalid wallet address' })
    }
  })
  
  // Get wallet tokens
  app.get('/api/wallet-tokens/:address', async (req, res) => {
    try {
      const publicKey = new PublicKey(req.params.address)
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      })
      
      const tokens = tokenAccounts.value.map(account => {
        const tokenInfo = account.account.data.parsed.info
        return {
          symbol: tokenInfo.mint.slice(0, 8) + '...',
          balance: parseFloat(tokenInfo.tokenAmount.uiAmount) || 0,
          mint: tokenInfo.mint
        }
      }).filter(token => token.balance > 0)
      
      res.json({ tokens })
    } catch (error) {
      res.json({ tokens: [] })
    }
  })
  
  // Get wallet NFTs
  app.get('/api/wallet-nfts/:address', async (req, res) => {
    try {
      const publicKey = new PublicKey(req.params.address)
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      })
      
      const nfts = tokenAccounts.value
        .filter(account => {
          const tokenInfo = account.account.data.parsed.info
          return tokenInfo.tokenAmount.decimals === 0 && parseFloat(tokenInfo.tokenAmount.amount) === 1
        })
        .map(account => {
          const tokenInfo = account.account.data.parsed.info
          return {
            mint: tokenInfo.mint,
            name: `Consilience NFT ${tokenInfo.mint.slice(0, 8)}...`,
            description: 'NFT created on Consilience DAO'
          }
        })
      
      res.json({ nfts })
    } catch (error) {
      res.json({ nfts: [] })
    }
  })
  
  // Request airdrop
  app.post('/api/request-airdrop', async (req, res) => {
    try {
      const { walletAddress } = req.body
      const publicKey = new PublicKey(walletAddress)
      
      const signature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL)
      await connection.confirmTransaction(signature)
      
      res.json({ 
        success: true, 
        message: '1 SOL airdropped to your wallet!',
        signature,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      })
    } catch (error) {
      res.status(500).json({ error: 'Airdrop failed: ' + error.message })
    }
  })
  
} catch (error) {
  console.error('❌ Solana initialization failed:', error.message)
  console.log('⚠️ Running in basic mode without Solana features')
  
  // Fallback endpoints
  app.post('/api/create-token', (req, res) => {
    res.status(503).json({ error: 'Solana features unavailable - server needs Solana dependencies' })
  })
  
  app.post('/api/create-nft', (req, res) => {
    res.status(503).json({ error: 'Solana features unavailable - server needs Solana dependencies' })
  })
  
  app.get('/api/wallet-balance/:address', (req, res) => {
    res.json({ balance: 0 })
  })
  
  app.get('/api/wallet-tokens/:address', (req, res) => {
    res.json({ tokens: [] })
  })
  
  app.get('/api/wallet-nfts/:address', (req, res) => {
    res.json({ nfts: [] })
  })
}

// Basic endpoints that always work
app.get('/api/user-nfts/:alias', (req, res) => {
  res.json({ nfts: [] })
})

app.post('/api/connect-wallet', (req, res) => {
  res.json({ success: true })
})

app.post('/api/ai-matchmaker', (req, res) => {
  const { alias, query } = req.body
  let response = `Hi ${alias}! `
  
  if (solanaEnabled) {
    response += `I can create real tokens and NFTs on Solana blockchain! Connect your wallet to get started.`
  } else {
    response += `I'm your AI assistant. Server is running in basic mode - Solana features need to be configured.`
  }
  
  res.json({ response })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🔗 Solana enabled: ${solanaEnabled}`)
  if (solanaEnabled && aiWallet) {
    console.log(`💰 AI Wallet: ${aiWallet.publicKey.toString()}`)
  }
  console.log('✅ Server ready!')
})