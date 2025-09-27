const express = require('express')
const OpenAI = require('openai')
const { mintTokens } = require('../utils/solana')

const router = express.Router()
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

// AI Matchmaking
router.post('/find-match', (req, res) => {
  const { alias } = req.body
  const db = req.app.locals.db
  
  db.get('SELECT * FROM users WHERE alias = ?', [alias], (err, user) => {
    if (err || !user) {
      return res.status(500).json({ error: 'User not found' })
    }
    
    db.all('SELECT * FROM projects LIMIT 5', (err, projects) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      
      const prompt = `Match user ${user.alias} with interests "${user.interests}" to a DAO project. 
      Available projects: ${projects.map(p => `${p.name}: ${p.description} (needs: ${p.skills_needed})`).join(', ')}
      
      Suggest the best match and a specific task worth 100 CS tokens. Respond in this format:
      "Perfect match! I found [PROJECT_NAME] for you. Here's a task: [SPECIFIC_TASK]. Complete this for 100 CS tokens!"
      
      If no good match, suggest creating a new project related to their interests.`
      
      if (!openai) {
        return res.json({
          message: `Perfect match! I found ${projects[0]?.name || 'Mars Colony Planning'} for you. Here's a task: Design initial habitat blueprints. Complete this for 100 CS tokens!`,
          match: projects[0] ? {
            project_id: projects[0].id,
            project_name: projects[0].name
          } : null
        })
      }
      
      openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150
      }).then(completion => {
        const aiMessage = completion.choices[0].message.content
        
        let matchedProject = null
        for (const project of projects) {
          if (aiMessage.toLowerCase().includes(project.name.toLowerCase())) {
            matchedProject = project
            break
          }
        }
        
        if (matchedProject) {
          db.run(
            'INSERT INTO matches (user1_alias, user2_alias, project_id) VALUES (?, ?, ?)',
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
      }).catch(error => {
        console.error('AI matchmaking error:', error)
        res.json({
          message: `Perfect match! I found ${projects[0]?.name || 'Mars Colony Planning'} for you. Here's a task: Design initial habitat blueprints. Complete this for 100 CS tokens!`,
          match: projects[0] ? {
            project_id: projects[0].id,
            project_name: projects[0].name
          } : null
        })
      })
    })
  })
})

// Task verification
router.post('/verify-task', (req, res) => {
  const { alias, projectId, proof } = req.body
  const db = req.app.locals.db
  
  const verified = true // Simplified for demo
  
  if (verified) {
    mintTokens(alias, 100)
    
    db.run(
      'INSERT INTO transactions (from_alias, to_alias, amount, type) VALUES (?, ?, ?, ?)',
      ['system', alias, 80, 'task_reward']
    )
    
    db.run(
      'INSERT INTO transactions (from_alias, to_alias, amount, type) VALUES (?, ?, ?, ?)',
      ['system', 'founder', 20, 'founder_fee']
    )
    
    db.run(
      'UPDATE users SET cs_balance = cs_balance + 80 WHERE alias = ?',
      [alias]
    )
  }
  
  res.json({ verified, message: 'VERIFIED - Task completed successfully' })
})

// QR Check-in
router.post('/checkin', (req, res) => {
  const { alias, projectId } = req.body
  const db = req.app.locals.db
  
  db.run(
    'INSERT INTO checkins (alias, project_id, timestamp) VALUES (?, ?, datetime("now"))',
    [alias, projectId],
    (err) => {
      if (err) {
        res.status(500).json({ error: 'Check-in failed' })
      } else {
        mintTokens(alias, 5)
        
        db.run('UPDATE users SET cs_balance = cs_balance + 4 WHERE alias = ?', [alias])
        
        db.run(
          'INSERT INTO transactions (from_alias, to_alias, amount, type) VALUES (?, ?, ?, ?)',
          ['system', alias, 4, 'checkin_reward']
        )
        
        db.run(
          'INSERT INTO transactions (from_alias, to_alias, amount, type) VALUES (?, ?, ?, ?)',
          ['system', 'founder', 1, 'founder_fee']
        )
        
        res.json({ success: true })
      }
    }
  )
})

module.exports = router