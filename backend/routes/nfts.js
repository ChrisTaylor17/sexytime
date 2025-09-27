const express = require('express')
const { Connection, PublicKey } = require('@solana/web3.js')
const { apiLimiter } = require('../middleware/security')

const router = express.Router()
const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com')

// Get NFTs for a user
router.get('/nfts/:alias', apiLimiter, async (req, res) => {
  const { alias } = req.params
  const db = req.app.locals.db
  
  try {
    // Get user's wallet address
    db.get('SELECT wallet_address FROM users WHERE alias = ?', [alias], async (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'User not found' })
      }
      
      try {
        // Fetch NFTs from Solana (simplified - in production use Metaplex)
        const publicKey = new PublicKey(user.wallet_address)
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
        })
        
        const nfts = tokenAccounts.value
          .filter(account => account.account.data.parsed.info.tokenAmount.decimals === 0)
          .map(account => ({
            mint: account.account.data.parsed.info.mint,
            amount: account.account.data.parsed.info.tokenAmount.uiAmount
          }))
        
        // Get stored NFT metadata
        db.all('SELECT * FROM nfts WHERE owner_alias = ?', [alias], (err, storedNfts) => {
          res.json({
            onChain: nfts,
            metadata: storedNfts || []
          })
        })
      } catch (error) {
        res.json({ onChain: [], metadata: [] })
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch NFTs' })
  }
})

// Store NFT metadata
router.post('/nfts', apiLimiter, (req, res) => {
  const { mintAddress, ownerAlias, name, imageUrl, metadataUri } = req.body
  const db = req.app.locals.db
  
  db.run(
    'INSERT OR REPLACE INTO nfts (mint_address, owner_alias, name, image_url, metadata_uri) VALUES (?, ?, ?, ?, ?)',
    [mintAddress, ownerAlias, name, imageUrl, metadataUri],
    function(err) {
      if (err) {
        res.status(500).json({ error: 'Failed to store NFT metadata' })
      } else {
        res.json({ success: true, id: this.lastID })
      }
    }
  )
})

module.exports = router