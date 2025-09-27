const express = require('express')

const router = express.Router()

// Get all projects
router.get('/projects', (req, res) => {
  const db = req.app.locals.db
  
  db.all('SELECT * FROM projects ORDER BY id DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Database error' })
    } else {
      res.json(rows)
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
      res.json(row)
    }
  })
})

// Create project
router.post('/projects', (req, res) => {
  const { name, description, skills_needed } = req.body
  const db = req.app.locals.db
  
  db.run(
    'INSERT INTO projects (name, description, skills_needed) VALUES (?, ?, ?)',
    [name, description, skills_needed],
    function(err) {
      if (err) {
        res.status(500).json({ error: 'Database error' })
      } else {
        res.json({ id: this.lastID, name, description, skills_needed })
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

module.exports = router