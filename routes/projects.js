const express = require('express')

const router = express.Router()

// Get all projects
router.get('/projects', (req, res) => {
  const db = req.app.locals.db
  
  db.all('SELECT * FROM projects ORDER BY id DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Database error' })
    } else {
      res.json({ projects: rows })
    }
  })
})

// Get single project
router.get('/projects/:id', (req, res) => {
  const { id } = req.params
  const db = req.app.locals.db
  
  db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Database error' })
    } else if (!row) {
      res.status(404).json({ error: 'Project not found' })
    } else {
      res.json({ project: row })
    }
  })
})

// Create project
router.post('/projects', (req, res) => {
  const { name, description, skills_needed, owner_alias, type } = req.body
  const db = req.app.locals.db
  
  db.run(
    'INSERT INTO projects (name, description, skills_needed, owner_alias, type) VALUES (?, ?, ?, ?, ?)',
    [name, description, skills_needed, owner_alias, type || 'collaboration'],
    function(err) {
      if (err) {
        res.status(500).json({ error: 'Database error' })
      } else {
        res.json({ 
          projectId: this.lastID, 
          project: { id: this.lastID, name, description, skills_needed, owner_alias, type }
        })
      }
    }
  )
})

// Buy project
router.post('/buy-project', (req, res) => {
  const { alias, projectId, price } = req.body
  const db = req.app.locals.db
  
  db.get('SELECT cs_balance FROM users WHERE alias = ?', [alias], (err, user) => {
    if (err) {
      res.status(500).json({ error: 'Database error' })
    } else if (!user || user.cs_balance < price) {
      res.status(400).json({ error: 'Insufficient balance' })
    } else {
      db.run('UPDATE users SET cs_balance = cs_balance - ? WHERE alias = ?', [price, alias], (err) => {
        if (err) {
          res.status(500).json({ error: 'Transaction failed' })
        } else {
          db.run(
            'INSERT INTO transactions (from_alias, to_alias, amount, type) VALUES (?, ?, ?, ?)',
            [alias, 'system', price, 'project_purchase'],
            (err) => {
              if (err) {
                res.status(500).json({ error: 'Transaction failed' })
              } else {
                res.json({ success: true })
              }
            }
          )
        }
      })
    }
  })
})

// Workroom endpoints
router.get('/workroom/:projectId/messages', (req, res) => {
  const { projectId } = req.params
  const db = req.app.locals.db
  
  db.all(
    'SELECT * FROM messages WHERE project_id = ? ORDER BY created_at ASC',
    [projectId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Database error' })
      } else {
        res.json({ messages: rows })
      }
    }
  )
})

router.post('/workroom/:projectId/messages', (req, res) => {
  const { projectId } = req.params
  const { message, sender } = req.body
  const db = req.app.locals.db
  
  db.run(
    'INSERT INTO messages (project_id, sender, content, created_at) VALUES (?, ?, ?, datetime("now"))',
    [projectId, sender, message],
    function(err) {
      if (err) {
        res.status(500).json({ error: 'Database error' })
      } else {
        res.json({ success: true, messageId: this.lastID })
      }
    }
  )
})

router.get('/workroom/:projectId/participants', (req, res) => {
  const { projectId } = req.params
  const db = req.app.locals.db
  
  db.all(
    'SELECT DISTINCT sender as alias FROM messages WHERE project_id = ? UNION SELECT owner_alias as alias FROM projects WHERE id = ?',
    [projectId, projectId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Database error' })
      } else {
        res.json({ participants: rows })
      }
    }
  )
})

router.post('/workroom/:projectId/ai-response', async (req, res) => {
  const { projectId } = req.params
  const { userMessage, projectContext } = req.body
  const db = req.app.locals.db
  
  // AI generates contextual response
  let aiResponse = "I'm here to help with your project! "
  
  if (userMessage.includes('token')) {
    aiResponse += "Would you like me to create a project token for your team?"
  } else if (userMessage.includes('nft')) {
    aiResponse += "I can help create NFT badges for project participants."
  } else if (userMessage.includes('help')) {
    aiResponse += "I can assist with project management, token creation, and team coordination."
  } else {
    aiResponse += "Feel free to ask me about tokens, NFTs, or project coordination!"
  }
  
  // Store AI response as message
  db.run(
    'INSERT INTO messages (project_id, sender, content, created_at) VALUES (?, ?, ?, datetime("now"))',
    [projectId, 'AI Assistant', aiResponse],
    function(err) {
      if (err) {
        res.status(500).json({ error: 'Database error' })
      } else {
        res.json({ success: true, response: aiResponse })
      }
    }
  )
})

module.exports = router