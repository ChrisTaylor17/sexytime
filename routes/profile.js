const express = require('express')
const { apiLimiter } = require('../middleware/security')

const router = express.Router()

// Update user profile
router.post('/update-profile', apiLimiter, (req, res) => {
  const { alias, interests, profileImage } = req.body
  const db = req.app.locals.db
  
  let updateQuery = 'UPDATE users SET '
  let updateParams = []
  let updateFields = []
  
  if (interests !== undefined) {
    updateFields.push('interests = ?')
    updateParams.push(interests)
  }
  
  if (profileImage !== undefined) {
    updateFields.push('profile_image = ?')
    updateParams.push(profileImage)
  }
  
  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' })
  }
  
  updateQuery += updateFields.join(', ') + ' WHERE alias = ?'
  updateParams.push(alias)
  
  db.run(updateQuery, updateParams, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update profile' })
    }
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      changes: this.changes
    })
  })
})

// Get user stats
router.get('/user-stats/:alias', apiLimiter, (req, res) => {
  const { alias } = req.params
  const db = req.app.locals.db
  
  // Get NFT count
  db.get('SELECT COUNT(*) as nft_count FROM nfts WHERE owner_alias = ?', [alias], (err, nftResult) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }
    
    // Get project participation count
    db.get('SELECT COUNT(DISTINCT project_id) as project_count FROM messages WHERE alias = ?', [alias], (err, projectResult) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      
      res.json({
        nfts: nftResult.nft_count || 0,
        projects: projectResult.project_count || 0
      })
    })
  })
})

module.exports = router