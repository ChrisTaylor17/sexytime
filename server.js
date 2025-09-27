const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())

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
    wallet_address: 'demo_wallet_123', 
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

// Create NFT
app.post('/api/create-nft', (req, res) => {
  const { name, description, creator } = req.body
  res.json({ 
    message: `NFT "${name}" created successfully!`,
    nftId: Date.now(),
    name,
    description,
    creator
  })
})

// Mint NFT
app.post('/api/mint-nft', (req, res) => {
  res.json({ message: 'NFT minted successfully!' })
})

// Get user NFTs
app.get('/api/user-nfts/:alias', (req, res) => {
  res.json({ nfts: [] })
})

// Wallet balance
app.get('/api/wallet-balance/:address', (req, res) => {
  res.json({ balance: 1.5 })
})

// Wallet tokens
app.get('/api/wallet-tokens/:address', (req, res) => {
  res.json({ 
    tokens: [
      { symbol: 'CS', balance: 250 },
      { symbol: 'USDC', balance: 100 }
    ]
  })
})

// Wallet NFTs
app.get('/api/wallet-nfts/:address', (req, res) => {
  res.json({ nfts: [] })
})

// Connect wallet
app.post('/api/connect-wallet', (req, res) => {
  res.json({ success: true })
})

// Request airdrop
app.post('/api/request-airdrop', (req, res) => {
  res.json({ success: true, message: '1 SOL airdropped!' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})