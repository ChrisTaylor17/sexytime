const express = require('express')
const { Pool } = require('pg')

const router = express.Router()
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// Get all projects
router.get('/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY id DESC')
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Database error' })
  }
})

// Get single project
router.get('/projects/:id', async (req, res) => {
  const { id } = req.params
  
  try {
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Database error' })
  }
})

// Create project
router.post('/projects', async (req, res) => {
  const { name, description, skills_needed } = req.body
  
  try {
    const result = await pool.query(
      'INSERT INTO projects (name, description, skills_needed) VALUES ($1, $2, $3) RETURNING *',
      [name, description, skills_needed]
    )
    
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Database error' })
  }
})

// Buy project
router.post('/buy-project', async (req, res) => {
  const { alias, projectId, price } = req.body
  
  try {
    await pool.query('BEGIN')
    
    // Check user balance
    const userResult = await pool.query('SELECT cs_balance FROM users WHERE alias = $1', [alias])
    if (userResult.rows[0].cs_balance < price) {
      await pool.query('ROLLBACK')
      return res.status(400).json({ error: 'Insufficient balance' })
    }
    
    // Deduct CS from user
    await pool.query(
      'UPDATE users SET cs_balance = cs_balance - $1 WHERE alias = $2',
      [price, alias]
    )
    
    // Transfer project ownership (simplified - just log the transaction)
    await pool.query(
      'INSERT INTO transactions (from_alias, to_alias, amount, type) VALUES ($1, $2, $3, $4)',
      [alias, 'system', price, 'project_purchase']
    )
    
    await pool.query('COMMIT')
    res.json({ success: true })
  } catch (error) {
    await pool.query('ROLLBACK')
    res.status(500).json({ error: 'Transaction failed' })
  }
})

module.exports = router