const express = require('express')
const { Connection, PublicKey, Keypair } = require('@solana/web3.js')
const { createMint, getOrCreateAssociatedTokenAccount, mintTo } = require('@solana/spl-token')

const router = express.Router()

// Solana connection
const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com')

// Get wallet balance
router.get('/wallet/:address', async (req, res) => {
  const { address } = req.params
  
  try {
    const publicKey = new PublicKey(address)
    const balance = await connection.getBalance(publicKey)
    
    res.json({ 
      address,
      balance: balance / 1000000000, // Convert lamports to SOL
      network: 'devnet'
    })
  } catch (error) {
    res.status(400).json({ error: 'Invalid wallet address' })
  }
})

// Simulate token mint (for development)
router.post('/mint-tokens', async (req, res) => {
  const { alias, amount } = req.body
  
  try {
    // In a real implementation, this would mint actual SPL tokens
    // For now, we'll just simulate the process
    
    const simulatedTxHash = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    res.json({
      success: true,
      transaction: simulatedTxHash,
      amount,
      recipient: alias,
      network: 'devnet'
    })
  } catch (error) {
    res.status(500).json({ error: 'Token minting failed' })
  }
})

module.exports = router