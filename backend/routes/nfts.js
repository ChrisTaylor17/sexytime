const express = require('express')
const { Connection, PublicKey } = require('@solana/web3.js')
const { apiLimiter } = require('../middleware/security')

const router = express.Router()
const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com')

// Get NFTs for connected wallet
router.get('/nfts/:walletAddress', apiLimiter, async (req, res) => {
  const { walletAddress } = req.params
  
  try {
    const publicKey = new PublicKey(walletAddress)
    
    // Get all token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
    })
    
    // Filter for NFTs (tokens with 0 decimals and supply of 1)
    const nftAccounts = tokenAccounts.value.filter(account => {
      const tokenInfo = account.account.data.parsed.info
      return tokenInfo.tokenAmount.decimals === 0 && tokenInfo.tokenAmount.uiAmount === 1
    })
    
    // Fetch metadata for each NFT
    const nfts = await Promise.all(
      nftAccounts.map(async (account) => {
        const mint = account.account.data.parsed.info.mint
        try {
          // Try to fetch metadata from common metadata URI patterns
          const response = await fetch(`https://api.solana.fm/v1/tokens/${mint}`)
          if (response.ok) {
            const data = await response.json()
            return {
              mint,
              name: data.name || 'Unknown NFT',
              image: data.image || null,
              description: data.description || null
            }
          }
        } catch (error) {
          console.log('Metadata fetch failed for', mint)
        }
        
        return {
          mint,
          name: `NFT ${mint.slice(0, 8)}...`,
          image: null,
          description: null
        }
      })
    )
    
    res.json({ nfts })
  } catch (error) {
    console.error('NFT fetch error:', error)
    res.json({ nfts: [] })
  }
})



module.exports = router