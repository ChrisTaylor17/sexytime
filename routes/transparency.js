const express = require('express')
const { apiLimiter } = require('../middleware/security')

const router = express.Router()

// Get transparency data
router.get('/transparency', apiLimiter, (req, res) => {
  const db = req.app.locals.db
  
  // Get recent transactions
  db.all(
    'SELECT * FROM transactions ORDER BY created_at DESC LIMIT 20',
    (err, transactions) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      
      // Get AI allocation summary
      const allocations = transactions.reduce((acc, tx) => {
        if (tx.from_alias === 'AI_MANAGER') {
          acc.push({
            type: tx.type,
            amount: tx.amount,
            recipient: tx.to_alias,
            timestamp: tx.created_at
          })
        }
        return acc
      }, [])
      
      res.json({
        transactions,
        allocations,
        summary: {
          totalAllocated: transactions.reduce((sum, tx) => sum + tx.amount, 0),
          aiDecisions: transactions.filter(tx => tx.from_alias === 'AI_MANAGER').length,
          nftsMinted: transactions.filter(tx => tx.type === 'task_reward').length
        }
      })
    }
  )
})

module.exports = router