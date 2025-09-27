const express = require('express')
const cors = require('cors')
const { Connection, PublicKey, Keypair, clusterApiUrl } = require('@solana/web3.js')
const { createMint, getOrCreateAssociatedTokenAccount, mintTo } = require('@solana/spl-token')

const app = express()
app.use(cors())
app.use(express.json())

// Solana connection
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')

// AI wallet (funded)
const aiWallet = Keypair.fromSecretKey(new Uint8Array([
  174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56, 222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246, 15, 185, 186, 9, 166, 66, 49, 124, 65, 20, 147, 37, 1, 158, 86, 93, 137, 234, 150, 64, 135, 199, 112, 26, 131, 70, 74, 13, 103, 23, 34, 63
]))

console.log('AI Wallet:', aiWallet.publicKey.toString())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' })
})

// Signup
app.post('/api/signup', (req, res) => {
  const { alias, interests } = req.body
  res.json({ 
    alias, 
    interests, 
    wallet_address: 'connect_wallet', 
    cs_balance: 0 
  })
})

// Get user
app.get('/api/user/:alias', (req, res) => {
  res.json({ 
    alias: req.params.alias, 
    interests: 'AI, Blockchain', 
    cs_balance: 0 
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

// Create real token
app.post('/api/create-token', async (req, res) => {
  try {
    const { name, symbol, supply, walletAddress } = req.body
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' })
    }
    
    const userPublicKey = new PublicKey(walletAddress)
    
    // Create mint
    const mint = await createMint(
      connection,
      aiWallet,
      aiWallet.publicKey,
      null,
      6
    )
    
    // Create token account for user
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      aiWallet,
      mint,
      userPublicKey
    )
    
    // Mint tokens to user (80% of supply)
    const userAmount = Math.floor(supply * 0.8) * 1000000
    await mintTo(
      connection,
      aiWallet,
      mint,
      tokenAccount.address,
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

// Create NFT (simplified - creates a token with 0 decimals)
app.post('/api/create-nft', async (req, res) => {
  try {
    const { name, description, walletAddress } = req.body
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' })
    }
    
    const userPublicKey = new PublicKey(walletAddress)
    
    // Create NFT mint (0 decimals = NFT)
    const mint = await createMint(
      connection,
      aiWallet,
      aiWallet.publicKey,
      null,
      0  // 0 decimals = NFT
    )
    
    // Create token account for user
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      aiWallet,
      mint,
      userPublicKey
    )
    
    // Mint 1 NFT to user
    await mintTo(
      connection,
      aiWallet,
      mint,
      tokenAccount.address,
      aiWallet,
      1  // Mint exactly 1 NFT
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

// Mint NFT (creates new NFT)
app.post('/api/mint-nft', async (req, res) => {
  try {
    const { recipient } = req.body
    const userPublicKey = new PublicKey(recipient)
    
    const mint = await createMint(
      connection,
      aiWallet,
      aiWallet.publicKey,
      null,
      0
    )
    
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      aiWallet,
      mint,
      userPublicKey
    )
    
    await mintTo(
      connection,
      aiWallet,
      mint,
      tokenAccount.address,
      aiWallet,
      1
    )
    
    res.json({
      success: true,
      message: 'Real NFT minted to your wallet!',
      mintAddress: mint.toString(),
      explorerUrl: `https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`
    })
    
  } catch (error) {
    console.error('NFT minting error:', error)
    res.status(500).json({ error: 'NFT minting failed: ' + error.message })
  }
})

// Get real wallet balance
app.get('/api/wallet-balance/:address', async (req, res) => {
  try {
    const publicKey = new PublicKey(req.params.address)
    const balance = await connection.getBalance(publicKey)
    res.json({ balance: balance / 1000000000 })
  } catch (error) {
    res.status(400).json({ error: 'Invalid wallet address' })
  }
})

// Get real wallet tokens
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

// Get wallet NFTs (tokens with 0 decimals)
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
          name: `NFT ${tokenInfo.mint.slice(0, 8)}...`,
          description: 'Consilience NFT',
          image: null
        }
      })
    
    res.json({ nfts })
  } catch (error) {
    res.json({ nfts: [] })
  }
})

// Get user NFTs
app.get('/api/user-nfts/:alias', (req, res) => {
  res.json({ nfts: [] })
})

// Connect wallet
app.post('/api/connect-wallet', (req, res) => {
  res.json({ success: true })
})

// Request airdrop
app.post('/api/request-airdrop', async (req, res) => {
  try {
    const { walletAddress } = req.body
    const publicKey = new PublicKey(walletAddress)
    
    const signature = await connection.requestAirdrop(publicKey, 1000000000) // 1 SOL
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

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Real Solana server running on port ${PORT}`)
})