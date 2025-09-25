const { Keypair, PublicKey } = require('@solana/web3.js')

// Generate new Solana wallet
function generateWallet() {
  const keypair = Keypair.generate()
  return keypair.publicKey.toString()
}

// Simulate token minting (80% to user, 20% to founder)
async function mintTokens(userAlias, totalAmount) {
  const userAmount = Math.floor(totalAmount * 0.8)
  const founderAmount = totalAmount - userAmount
  
  // In a real implementation, this would:
  // 1. Create SPL token mint if not exists
  // 2. Get user's associated token account
  // 3. Mint tokens to user (80%) and founder (20%)
  
  console.log(`Minting ${totalAmount} CS tokens:`)
  console.log(`- ${userAmount} to ${userAlias}`)
  console.log(`- ${founderAmount} to founder`)
  
  return {
    userAmount,
    founderAmount,
    transaction: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

module.exports = {
  generateWallet,
  mintTokens
}