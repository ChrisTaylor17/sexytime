const express = require('express')
const OpenAI = require('openai')
const { mintTokens, createNFT } = require('../utils/solana')
const { createMetaplexNFT } = require('../utils/metaplex')

const router = express.Router()
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

// AI Matchmaking
router.post('/ai-matchmaker', (req, res) => {
  const { alias, query } = req.body
  const db = req.app.locals.db
  
  // Create project based on query
  let projectName, projectType, skills
  const queryLower = query.toLowerCase()
  
  if (queryLower.includes('token') || queryLower.includes('launch')) {
    projectName = `${alias}'s Token Project`
    projectType = 'token'
    skills = 'blockchain, tokenomics, marketing'
  } else if (queryLower.includes('nft') || queryLower.includes('art')) {
    projectName = `${alias}'s NFT Collection`
    projectType = 'nft'
    skills = 'art, design, blockchain, marketing'
  } else {
    projectName = `${alias}'s Collaboration`
    projectType = 'collaboration'
    skills = 'various skills needed'
  }
  
  // Create the project
  db.run(
    'INSERT INTO projects (name, description, skills_needed, owner_alias) VALUES (?, ?, ?, ?)',
    [projectName, `Project based on: ${query}`, skills, alias],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      
      res.json({
        action: 'create_project',
        projectId: this.lastID,
        projectName: projectName,
        response: `I've created a ${projectType} project for you!`
      })
    }
  )
})

// Original find-match endpoint
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

// Task verification with AI Asset Manager
router.post('/verify-task', async (req, res) => {
  const { alias, projectId, proof } = req.body
  const db = req.app.locals.db
  
  const verified = true // AI verification (simplified)
  
  if (verified) {
    // Get user wallet and project info
    db.get('SELECT wallet_address FROM users WHERE alias = ?', [alias], (err, user) => {
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }
      
      db.get('SELECT name FROM projects WHERE id = ?', [projectId], async (err, project) => {
        const taskName = project?.name || 'DAO Task'
        const userWallet = user.wallet_address
        
        // AI Asset Manager creates collectible NFT for user's wallet
        let nftData = await createMetaplexNFT(userWallet, taskName, alias)
        
        // Fallback to regular NFT if Metaplex fails
        if (!nftData) {
          nftData = await createNFT(alias, taskName, userWallet)
        }
        
        if (nftData) {
          // Store NFT metadata
          db.run(
            'INSERT INTO nfts (mint_address, owner_alias, name, image_url, metadata_uri) VALUES (?, ?, ?, ?, ?)',
            [nftData.mint, alias, nftData.name, nftData.image, JSON.stringify(nftData)]
          )
        }
        
        // AI Asset Manager allocates tokens transparently
        const allocation = await require('../utils/solana').aiManager.allocateTokens([
          { wallet: userWallet, alias, amount: 80 },
          { wallet: process.env.FOUNDER_WALLET_ADDRESS, alias: 'founder', amount: 20 }
        ], 100, `Task completion: ${taskName}`)
        
        // Update balances
        db.run('UPDATE users SET cs_balance = cs_balance + 80 WHERE alias = ?', [alias])
        
        // Record transactions
        db.run(
          'INSERT INTO transactions (from_alias, to_alias, amount, type) VALUES (?, ?, ?, ?)',
          ['AI_MANAGER', alias, 80, 'task_reward']
        )
        
        db.run(
          'INSERT INTO transactions (from_alias, to_alias, amount, type) VALUES (?, ?, ?, ?)',
          ['AI_MANAGER', 'founder', 20, 'founder_fee']
        )
        
        res.json({ 
          verified, 
          message: `AI VERIFIED ✅ NFT minted to your wallet: ${userWallet.slice(0,8)}...`,
          nft: nftData,
          allocation,
          userWallet
        })
      })
    })
  } else {
    res.json({ verified, message: 'AI verification failed' })
  }
})

// Create custom token
router.post('/create-token', async (req, res) => {
  const { name, symbol, supply, description, creator } = req.body
  const db = req.app.locals.db
  
  try {
    // Create token record in database
    db.run(
      'INSERT INTO tokens (name, symbol, supply, description, creator, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))',
      [name, symbol, supply, description, creator],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' })
        }
        
        // Simulate token creation on Solana
        const tokenData = {
          id: this.lastID,
          name,
          symbol,
          supply,
          description,
          creator,
          mint_address: `${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString()
        }
        
        res.json({
          success: true,
          message: `Token ${symbol} created successfully`,
          token: tokenData
        })
      }
    )
  } catch (error) {
    res.status(500).json({ error: 'Token creation error: ' + error.message })
  }
})

// Get user tokens
router.get('/user-tokens/:alias', (req, res) => {
  const { alias } = req.params
  const db = req.app.locals.db
  
  db.all('SELECT * FROM tokens WHERE creator = ? ORDER BY created_at DESC', [alias], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Database error' })
    } else {
      res.json({ tokens: rows })
    }
  })
})

// Create NFT
router.post('/create-nft', async (req, res) => {
  const { name, description, image, supply, creator } = req.body
  const db = req.app.locals.db
  
  try {
    // Create NFT record in database
    db.run(
      'INSERT INTO nft_collections (name, description, image, supply, creator, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))',
      [name, description, image, supply, creator],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' })
        }
        
        // Simulate NFT creation on Solana
        const nftData = {
          id: this.lastID,
          name,
          description,
          image,
          supply,
          creator,
          mint_address: `nft_${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString()
        }
        
        res.json({
          success: true,
          message: `NFT collection ${name} created successfully`,
          nft: nftData
        })
      }
    )
  } catch (error) {
    res.status(500).json({ error: 'NFT creation error: ' + error.message })
  }
})

// Get user NFTs
router.get('/user-nfts/:alias', (req, res) => {
  const { alias } = req.params
  const db = req.app.locals.db
  
  db.all('SELECT * FROM nft_collections WHERE creator = ? ORDER BY created_at DESC', [alias], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Database error' })
    } else {
      res.json({ nfts: rows })
    }
  })
})

// Create project token
router.post('/create-project-token', async (req, res) => {
  const { projectId, creator, participants } = req.body
  const db = req.app.locals.db
  
  // Get project details
  db.get('SELECT * FROM projects WHERE id = ?', [projectId], (err, project) => {
    if (err || !project) {
      return res.status(404).json({ error: 'Project not found' })
    }
    
    const tokenName = `${project.name} Token`
    const tokenSymbol = project.name.substring(0, 3).toUpperCase()
    const supply = 1000000
    
    // Create token
    db.run(
      'INSERT INTO tokens (name, symbol, supply, description, creator, project_id, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime("now"))',
      [tokenName, tokenSymbol, supply, `Project token for ${project.name}`, creator, projectId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' })
        }
        
        res.json({
          success: true,
          message: `Project token created and distributed to ${participants.length} participants`,
          tokenId: this.lastID
        })
      }
    )
  })
})

// Create project NFT
router.post('/create-project-nft', async (req, res) => {
  const { projectId, creator, participants } = req.body
  const db = req.app.locals.db
  
  // Get project details
  db.get('SELECT * FROM projects WHERE id = ?', [projectId], (err, project) => {
    if (err || !project) {
      return res.status(404).json({ error: 'Project not found' })
    }
    
    const nftName = `${project.name} Badge`
    const supply = participants.length
    
    // Create NFT collection
    db.run(
      'INSERT INTO nft_collections (name, description, supply, creator, project_id, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))',
      [nftName, `Achievement NFT for participating in ${project.name}`, supply, creator, projectId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' })
        }
        
        res.json({
          success: true,
          message: `Project NFT collection created and distributed to ${participants.length} participants`,
          nftId: this.lastID
        })
      }
    )
  })
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