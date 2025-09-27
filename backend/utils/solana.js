const { Keypair } = require('@solana/web3.js')

// Generate a new Solana wallet
function generateWallet() {
  const keypair = Keypair.generate()
  return keypair.publicKey.toString()
}

// Mint CS tokens (simplified for demo)
function mintTokens(alias, amount) {
  console.log(`Minting ${amount} CS tokens for ${alias}`)
  // In production, this would interact with Solana blockchain
  return true
}

module.exports = {
  generateWallet,
  mintTokens
}