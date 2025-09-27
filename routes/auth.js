const express = require('express')

const router = express.Router()

// Signup
router.post('/signup', (req, res) => {
  const { alias, interests } = req.body
  
  if (!alias || !interests) {
    return res.status(400).json({ error: 'Alias and interests required' })
  }
  
  const walletAddress = 'demo_wallet_' + Math.random().toString(36).substr(2, 9)
  
  res.json({ 
    id: Date.now(), 
    alias, 
    interests, 
    wallet_address: walletAddress, 
    cs_balance: 100 
  })
})

// Get user
router.get('/user/:alias', (req, res) => {
  const { alias } = req.params
  res.json({ 
    alias, 
    interests: 'AI, Blockchain, DAO', 
    wallet_address: 'demo_wallet_123', 
    cs_balance: 250 
  })
})

// Leaderboard
router.get('/leaderboard', (req, res) => {
  res.json([
    { alias: 'alice.builder', cs_balance: 1250 },
    { alias: 'bob.creator', cs_balance: 980 },
    { alias: 'charlie.dev', cs_balance: 750 }
  ])
})

module.exports = router