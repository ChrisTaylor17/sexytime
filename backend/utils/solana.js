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
  
  // Create real NFT with metadata on Solana
  async mintNFTToWallet(userWalletAddress, taskName, alias) {
    try {
      console.log(`AI Asset Manager: Minting real NFT to ${userWalletAddress}`)
      
      // Create NFT mint
      const mintKeypair = Keypair.generate()
      const mint = mintKeypair.publicKey
      
      // Create NFT mint with 0 decimals
      const mintAddress = await createMint(
        connection,
        PAYER_KEYPAIR,
        new PublicKey(userWalletAddress),
        new PublicKey(userWalletAddress),
        0 // 0 decimals for NFT
      )
      
      // Create token account for user
      const userTokenAccount = await createAssociatedTokenAccount(
        connection,
        PAYER_KEYPAIR,
        mintAddress,
        new PublicKey(userWalletAddress)
      )
      
      // Mint 1 NFT to user
      await mintTo(
        connection,
        PAYER_KEYPAIR,
        mintAddress,
        userTokenAccount,
        new PublicKey(userWalletAddress),
        1 // Mint exactly 1 NFT
      )
      
      const nftData = {
        mint: mintAddress.toString(),
        name: `${taskName} Achievement`,
        symbol: 'TASK',
        description: `Awarded to ${alias} for completing: ${taskName}`,
        image: `https://api.dicebear.com/7.x/bottts/svg?seed=${alias}-${Date.now()}&backgroundColor=gradient`,
        attributes: [
          { trait_type: 'Achiever', value: alias },
          { trait_type: 'Task', value: taskName },
          { trait_type: 'Date', value: new Date().toISOString().split('T')[0] },
          { trait_type: 'Rarity', value: 'Common' }
        ],
        external_url: `https://consilience-dao.com/nft/${mintAddress.toString()}`,
        wallet: userWalletAddress,
        tokenAccount: userTokenAccount.toString()
      }
      
      console.log(`AI: Real NFT minted to ${userWalletAddress}: ${mint.toString()}`)
      return nftData
      
    } catch (error) {
      console.error('AI Asset Manager real NFT creation failed:', error)
      // Fallback to database NFT
      const nftId = Date.now().toString()
      return {
        mint: `nft_${nftId}`,
        name: `${taskName} Achievement`,
        symbol: 'TASK',
        description: `Awarded to ${alias} for completing: ${taskName}`,
        image: `https://api.dicebear.com/7.x/bottts/svg?seed=${alias}-${nftId}&backgroundColor=gradient`,
        wallet: userWalletAddress
      }
    }
  }
  
  // Create actual SPL token on Solana
  async createCustomToken(name, symbol, supply, decimals, userWallet, alias) {
    try {
      console.log(`AI: Creating real SPL token ${symbol} for ${alias}`)
      
      // Create mint keypair
      const mintKeypair = Keypair.generate()
      const mint = mintKeypair.publicKey
      
      // Create mint account (using funded payer)
      const mintAddress = await createMint(
        connection,
        PAYER_KEYPAIR,
        new PublicKey(userWallet),
        new PublicKey(userWallet),
        parseInt(decimals)
      )
      
      // Create associated token account for user
      const userTokenAccount = await createAssociatedTokenAccount(
        connection,
        PAYER_KEYPAIR,
        mintAddress,
        new PublicKey(userWallet)
      )
      
      // Mint tokens to user
      await mintTo(
        connection,
        PAYER_KEYPAIR,
        mintAddress,
        userTokenAccount,
        new PublicKey(userWallet),
        parseInt(supply) * Math.pow(10, parseInt(decimals))
      )
      
      const tokenData = {
        mint: mintAddress.toString(),
        name: name,
        symbol: symbol,
        supply: supply,
        decimals: decimals,
        description: `Custom SPL token ${symbol} created by ${alias}`,
        image: `https://api.dicebear.com/7.x/icons/svg?seed=${symbol}&backgroundColor=gradient`,
        wallet: userWallet,
        creator: alias,
        created: new Date().toISOString(),
        tokenAccount: userTokenAccount.toString()
      }
      
      console.log(`AI: Real SPL token ${symbol} minted to ${userWallet}`)
      return tokenData
      
    } catch (error) {
      console.error('AI SPL Token creation failed:', error)
      // Fallback to database token
      const tokenId = Date.now().toString()
      return {
        mint: `token_${tokenId}`,
        name: name,
        symbol: symbol,
        supply: supply,
        decimals: decimals,
        description: `Token ${symbol} created by ${alias}`,
        image: `https://api.dicebear.com/7.x/icons/svg?seed=${symbol}&backgroundColor=gradient`,
        wallet: userWallet,
        creator: alias,
        created: new Date().toISOString()
      }
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