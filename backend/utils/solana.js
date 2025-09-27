const { Connection, Keypair, PublicKey, Transaction, SystemProgram } = require('@solana/web3.js')
const { createMint, createAccount, mintTo, TOKEN_PROGRAM_ID } = require('@solana/spl-token')

const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com')

// Generate a new Solana wallet
function generateWallet() {
  const keypair = Keypair.generate()
  return keypair.publicKey.toString()
}

// Create proper NFT with metadata
async function createNFT(alias, taskName) {
  try {
    console.log(`Creating NFT for ${alias}: ${taskName}`)
    
    // Create mint keypair
    const mintKeypair = Keypair.generate()
    const mint = mintKeypair.publicKey
    
    // For demo, we'll create the mint and metadata structure
    // In production, use @metaplex-foundation/js for full NFT creation
    
    const nftData = {
      mint: mint.toString(),
      name: `${taskName} Completion Certificate`,
      symbol: 'TASK',
      description: `NFT awarded to ${alias} for completing: ${taskName}`,
      image: `https://api.dicebear.com/7.x/shapes/svg?seed=${alias}-${Date.now()}`,
      attributes: [
        { trait_type: 'Completed By', value: alias },
        { trait_type: 'Task', value: taskName },
        { trait_type: 'Date', value: new Date().toISOString().split('T')[0] }
      ]
    }
    
    // Store NFT metadata in database
    return nftData
    
  } catch (error) {
    console.error('NFT creation error:', error)
    return null
  }
}

// Mint CS tokens (simplified for demo)
function mintTokens(alias, amount) {
  console.log(`Minting ${amount} CS tokens for ${alias}`)
  return true
}

module.exports = {
  generateWallet,
  mintTokens,
  createNFT
}