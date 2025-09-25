const express = require('express')
const { Pool } = require('pg')
const OpenAI = require('openai')
const { mintTokens } = require('../utils/solana')

const router = express.Router()
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// AI Matchmaking
router.post('/find-match', async (req, res) => {
  const { alias } = req.body
  
  try {
    // Get user data
    const userResult = await pool.query('SELECT * FROM users WHERE alias = $1', [alias])
    const user = userResult.rows[0]
    
    // Get available projects
    const projectsResult = await pool.query('SELECT * FROM projects LIMIT 5')
    const projects = projectsResult.rows
    
    // AI prompt for matchmaking
    const prompt = `Match user ${user.alias} with interests "${user.interests}" to a DAO project. 
    Available projects: ${projects.map(p => `${p.name}: ${p.description} (needs: ${p.skills_needed})`).join(', ')}
    
    Suggest the best match and a specific task worth 100 CS tokens. Respond in this format:
    "Perfect match! I found [PROJECT_NAME] for you. Here's a task: [SPECIFIC_TASK]. Complete this for 100 CS tokens!"
    
    If no good match, suggest creating a new project related to their interests.`
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150
    })
    
    const aiMessage = completion.choices[0].message.content
    
    // Find mentioned project
    let matchedProject = null
    for (const project of projects) {
      if (aiMessage.toLowerCase().includes(project.name.toLowerCase())) {
        matchedProject = project
        break
      }
    }
    
    // Log match if found
    if (matchedProject) {
      await pool.query(
        'INSERT INTO matches (user1_alias, user2_alias, project_id) VALUES ($1, $2, $3)',
        [alias, 'ai_match', matchedProject.id]
      )
    }
    
    res.json({
      message: aiMessage,
      match: matchedProject ? {
        project_id: matchedProject.id,
        project_name: matchedProject.name
      } : null
    })
  } catch (error) {
    console.error('AI matchmaking error:', error)
    res.status(500).json({ error: 'AI service unavailable' })
  }
})

// Task verification
router.post('/verify-task', async (req, res) => {
  const { alias, projectId, proof } = req.body
  
  try {
    // AI verification prompt
    const prompt = `Verify if this task submission is valid: "${proof?.name || 'File uploaded'}"
    
    This is for a DAO collaboration project. The user claims to have completed a task worth 100 CS tokens.
    
    Respond with only "VERIFIED" or "REJECTED" followed by a brief reason.`
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 50
    })
    
    const aiResponse = completion.choices[0].message.content
    const verified = aiResponse.toLowerCase().includes('verified')
    
    if (verified) {
      // Mint 100 CS tokens (80% to user, 20% to founder)
      await mintTokens(alias, 100)
      
      // Log transaction
      await pool.query(
        'INSERT INTO transactions (from_alias, to_alias, amount, type) VALUES ($1, $2, $3, $4)',
        ['system', alias, 80, 'task_reward']
      )
      
      await pool.query(
        'INSERT INTO transactions (from_alias, to_alias, amount, type) VALUES ($1, $2, $3, $4)',
        ['system', 'founder', 20, 'founder_fee']
      )
      
      // Update user balance
      await pool.query(
        'UPDATE users SET cs_balance = cs_balance + 80 WHERE alias = $1',
        [alias]
      )
    }
    
    res.json({ verified, message: aiResponse })
  } catch (error) {
    console.error('Task verification error:', error)
    res.status(500).json({ error: 'Verification service unavailable' })
  }
})

// QR Check-in
router.post('/checkin', async (req, res) => {
  const { alias, projectId } = req.body
  
  try {
    // Log check-in
    await pool.query(
      'INSERT INTO checkins (alias, project_id, timestamp) VALUES ($1, $2, NOW())',
      [alias, projectId]
    )
    
    // Mint 5 CS tokens (80% to user, 20% to founder)
    await mintTokens(alias, 5)
    
    // Update user balance
    await pool.query(
      'UPDATE users SET cs_balance = cs_balance + 4 WHERE alias = $1',
      [alias]
    )
    
    // Log transactions
    await pool.query(
      'INSERT INTO transactions (from_alias, to_alias, amount, type) VALUES ($1, $2, $3, $4)',
      ['system', alias, 4, 'checkin_reward']
    )
    
    await pool.query(
      'INSERT INTO transactions (from_alias, to_alias, amount, type) VALUES ($1, $2, $3, $4)',
      ['system', 'founder', 1, 'founder_fee']
    )
    
    res.json({ success: true })
  } catch (error) {
    console.error('Check-in error:', error)
    res.status(500).json({ error: 'Check-in failed' })
  }
})

module.exports = router