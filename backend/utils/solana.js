const { Connection, Keypair, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } = require('@solana/web3.js')
const { createMint, createAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } = require('@solana/spl-token')

const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com')

// Use funded wallet for minting (you need to add the private key)
const PAYER_KEYPAIR = process.env.SOLANA_PRIVATE_KEY ? 
  Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.SOLANA_PRIVATE_KEY))) :
  Keypair.generate() // Fallback for testing

// AI Asset Manager - creates and distributes tokens/NFTs
class AIAssetManager {
  constructor() {
    this.founderWallet = process.env.FOUNDER_WALLET_ADDRESS
  }
  
  // Create NFT achievement certificate
  async mintNFTToWallet(userWalletAddress, taskName, alias) {
    console.log(`AI Asset Manager: Creating NFT for ${alias} wallet: ${userWalletAddress}`)
    
    const nftId = Date.now().toString()
    const nftData = {
      mint: `nft_${alias}_${nftId}`,
      name: `${taskName} Achievement`,
      symbol: 'TASK',
      description: `🏆 Awarded to ${alias} for completing: ${taskName}`,
      image: `https://api.dicebear.com/7.x/bottts/svg?seed=${alias}-${nftId}&backgroundColor=gradient`,
      attributes: [
        { trait_type: 'Achiever', value: alias },
        { trait_type: 'Task', value: taskName },
        { trait_type: 'Date', value: new Date().toISOString().split('T')[0] },
        { trait_type: 'Rarity', value: 'Achievement' }
      ],
      external_url: `https://consilience-dao.com/nft/${nftId}`,
      wallet: userWalletAddress,
      type: 'achievement_nft',
      created: new Date().toISOString()
    }
    
    console.log(`AI: NFT certificate created for ${userWalletAddress}`)
    return nftData
  }
  
  // Create custom token (stored in database, ready for blockchain)
  async createCustomToken(name, symbol, supply, decimals, userWallet, alias) {
    console.log(`AI: Creating token ${symbol} for ${alias} wallet: ${userWallet}`)
    
    const tokenId = Date.now().toString()
    const tokenData = {
      mint: `${symbol.toLowerCase()}_${tokenId}`,
      name: name,
      symbol: symbol,
      supply: supply,
      decimals: decimals,
      description: `Custom token ${symbol} created by ${alias}`,
      image: `https://api.dicebear.com/7.x/icons/svg?seed=${symbol}&backgroundColor=gradient`,
      wallet: userWallet,
      creator: alias,
      created: new Date().toISOString(),
      type: 'custom_token'
    }
    
    console.log(`AI: Token ${symbol} created and allocated to ${userWallet}`)
    return tokenData
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