const express = require('express')
const { Pool } = require('pg')
const { generateWallet } = require('../utils/solana')

const router = express.Router()
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// Signup
router.post('/signup', async (req, res) => {
  const { alias, interests } = req.body
  
  try {
    // Generate Solana wallet
    const walletAddress = generateWallet()
    
    const result = await pool.query(
      'INSERT INTO users (alias, interests, wallet_address, cs_balance) VALUES ($1, $2, $3, $4) RETURNING *',
      [alias, interests, walletAddress, 0]
    )
    
    res.json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Alias already exists' })
    } else {
      res.status(500).json({ error: 'Database error' })
    }
  }
})

// Get user
router.get('/user/:alias', async (req, res) => {
  const { alias } = req.params
  
  try {
    const result = await pool.query('SELECT * FROM users WHERE alias = $1', [alias])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Database error' })
  }
})

// Leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT alias, cs_balance FROM users ORDER BY cs_balance DESC LIMIT 20'
    )
    
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Database error' })
  }
})

module.exports = router