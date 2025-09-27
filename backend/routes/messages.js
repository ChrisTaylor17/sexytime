const express = require('express')
const { messageValidation, validate, apiLimiter } = require('../middleware/security')

const router = express.Router()

// Get messages for a project
router.get('/messages/:projectId', apiLimiter, (req, res) => {
  const { projectId } = req.params
  const db = req.app.locals.db
  
  db.all(
    'SELECT * FROM messages WHERE project_id = ? ORDER BY timestamp ASC',
    [projectId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Failed to fetch messages' })
      } else {
        res.json(rows)
      }
    }
  )
})

// Save message
router.post('/messages', apiLimiter, messageValidation, validate, (req, res) => {
  const { projectId, alias, message } = req.body
  const db = req.app.locals.db
  
  db.run(
    'INSERT INTO messages (project_id, alias, message) VALUES (?, ?, ?)',
    [projectId, alias, message],
    function(err) {
      if (err) {
        res.status(500).json({ error: 'Failed to save message' })
      } else {
        res.json({ 
          id: this.lastID, 
          project_id: projectId, 
          alias, 
          message, 
          timestamp: new Date().toISOString() 
        })
      }
    }
  )
})

module.exports = router