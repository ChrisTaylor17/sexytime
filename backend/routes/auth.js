const express = require('express')
const { generateWallet } = require('../utils/solana')
const { signupLimiter, signupValidation, validate } = require('../middleware/security')

const router = express.Router()

// Signup
router.post('/signup', signupLimiter, signupValidation, validate, (req, res) => {
  const { alias, interests } = req.body
  const db = req.app.locals.db
  
  const walletAddress = generateWallet()
  
  db.run(
    'INSERT INTO users (alias, interests, wallet_address, cs_balance) VALUES (?, ?, ?, ?)',
    [alias, interests, walletAddress, 0],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          res.status(400).json({ error: 'Alias already exists' })
        } else {
          res.status(500).json({ error: 'Database error: ' + err.message })
        }
      } else {
        res.json({ id: this.lastID, alias, interests, wallet_address: walletAddress, cs_balance: 0 })
      }
    }
  )
})

// Get user
router.get('/user/:alias', (req, res) => {
  const { alias } = req.params
  const db = req.app.locals.db
  
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

// Leaderboard
router.get('/leaderboard', (req, res) => {
  const db = req.app.locals.db
  
  db.all(
    'SELECT alias, cs_balance FROM users ORDER BY cs_balance DESC LIMIT 20',
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Database error' })
      } else {
        res.json(rows)
      }
    }
  )
})

module.exports = router