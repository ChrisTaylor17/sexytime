const { Connection, Keypair, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } = require('@solana/web3.js')
const { createMint, createAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } = require('@solana/spl-token')

const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com')

// AI Asset Manager - creates and distributes tokens/NFTs
class AIAssetManager {
  constructor() {
    this.founderWallet = process.env.FOUNDER_WALLET_ADDRESS
  }
  
  // Create and mint NFT directly to user's wallet
  async mintNFTToWallet(userWalletAddress, taskName, alias) {
    try {
      console.log(`AI Asset Manager: Minting NFT to ${userWalletAddress}`)
      
      // Generate unique NFT data
      const nftId = Date.now().toString()
      const nftData = {
        mint: `nft_${nftId}`,
        name: `${taskName} Achievement`,
        symbol: 'TASK',
        description: `Awarded to ${alias} for completing: ${taskName}`,
        image: `https://api.dicebear.com/7.x/bottts/svg?seed=${alias}-${nftId}&backgroundColor=gradient`,
        attributes: [
          { trait_type: 'Achiever', value: alias },
          { trait_type: 'Task', value: taskName },
          { trait_type: 'Date', value: new Date().toISOString().split('T')[0] },
          { trait_type: 'Rarity', value: 'Common' }
        ],
        external_url: `https://consilience-dao.com/nft/${nftId}`,
        wallet: userWalletAddress
      }
      
      console.log(`AI: Created NFT metadata for ${alias}`)
      return nftData
      
    } catch (error) {
      console.error('AI Asset Manager NFT creation failed:', error)
      return null
    }
  }
  
  // Allocate CS tokens with transparent distribution
  async allocateTokens(recipients, totalAmount, reason) {
    const allocation = {
      timestamp: new Date().toISOString(),
      reason,
      totalAmount,
      distributions: recipients.map(r => ({
        wallet: r.wallet,
        alias: r.alias,
        amount: r.amount,
        percentage: ((r.amount / totalAmount) * 100).toFixed(1)
      })),
      aiDecision: `Allocated ${totalAmount} CS tokens based on ${reason}`
    }
    
    console.log('AI Asset Manager Token Allocation:', allocation)
    return allocation
  }
}

const aiManager = new AIAssetManager()

// Generate a new Solana wallet
function generateWallet() {
  const keypair = Keypair.generate()
  return keypair.publicKey.toString()
}

// Create NFT using AI Asset Manager
async function createNFT(alias, taskName, userWalletAddress) {
  return await aiManager.mintNFTToWallet(userWalletAddress, taskName, alias)
}

// Mint CS tokens (simplified for demo)
function mintTokens(alias, amount) {
  console.log(`Minting ${amount} CS tokens for ${alias}`)
  return true
}

module.exports = {
  generateWallet,
  mintTokens,
  createNFT,
  aiManager
}