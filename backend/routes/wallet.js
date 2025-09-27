const express = require('express')
const { apiLimiter } = require('../middleware/security')

const router = express.Router()

// Connect wallet to user account
router.post('/connect-wallet', apiLimiter, (req, res) => {
  const { alias, walletAddress } = req.body
  const db = req.app.locals.db
  
  // Update user's wallet address
  db.run(
    'UPDATE users SET wallet_address = ? WHERE alias = ?',
    [walletAddress, alias],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to connect wallet' })
      }
      
      // Create or update session
      const sessionToken = Date.now().toString() + Math.random().toString(36)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      
      db.run(
        'INSERT OR REPLACE INTO user_sessions (alias, wallet_address, session_token, expires_at) VALUES (?, ?, ?, ?)',
        [alias, walletAddress, sessionToken, expiresAt.toISOString()],
        (err) => {
          if (err) {
            console.error('Session creation failed:', err)
          }
          
          res.json({ 
            success: true, 
            message: 'Wallet connected successfully',
            sessionToken 
          })
        }
      )
    }
  )
})

// Get user by wallet address
router.get('/user-by-wallet/:walletAddress', apiLimiter, (req, res) => {
  const { walletAddress } = req.params
  const db = req.app.locals.db
  
  db.get(
    'SELECT * FROM users WHERE wallet_address = ?',
    [walletAddress],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      
      if (user) {
        res.json(user)
      } else {
        res.status(404).json({ error: 'User not found' })
      }
    }
  )
})

module.exports = router