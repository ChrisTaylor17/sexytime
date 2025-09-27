const { Connection, Keypair, PublicKey } = require('@solana/web3.js')
const { Metaplex, keypairIdentity, bundlrStorage } = require('@metaplex-foundation/js')

const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com')

// Create proper NFT using Metaplex
async function createMetaplexNFT(userWalletAddress, taskName, alias) {
  try {
    console.log('Creating Metaplex NFT...')
    
    // Generate payer keypair (in production, use funded wallet)
    const payer = Keypair.generate()
    
    // Initialize Metaplex
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(payer))
      .use(bundlrStorage())
    
    const nftId = Date.now().toString()
    
    // Upload metadata
    const { uri } = await metaplex.nfts().uploadMetadata({
      name: `${taskName} Achievement`,
      symbol: 'TASK',
      description: `🏆 Awarded to ${alias} for completing: ${taskName}`,
      image: `https://api.dicebear.com/7.x/bottts/svg?seed=${alias}-${nftId}&backgroundColor=gradient`,
      attributes: [
        { trait_type: 'Achiever', value: alias },
        { trait_type: 'Task', value: taskName },
        { trait_type: 'Date', value: new Date().toISOString().split('T')[0] },
        { trait_type: 'Type', value: 'Achievement Certificate' }
      ],
      properties: {
        files: [{
          uri: `https://api.dicebear.com/7.x/bottts/svg?seed=${alias}-${nftId}&backgroundColor=gradient`,
          type: 'image/svg+xml'
        }],
        category: 'image'
      }
    })
    
    // Create NFT
    const { nft } = await metaplex.nfts().create({
      uri,
      name: `${taskName} Achievement`,
      symbol: 'TASK',
      sellerFeeBasisPoints: 0,
      creators: [{
        address: new PublicKey(userWalletAddress),
        share: 100
      }]
    })
    
    console.log('Metaplex NFT created:', nft.address.toString())
    
    return {
      mint: nft.address.toString(),
      name: nft.name,
      symbol: nft.symbol,
      description: `🏆 Awarded to ${alias} for completing: ${taskName}`,
      image: `https://api.dicebear.com/7.x/bottts/svg?seed=${alias}-${nftId}&backgroundColor=gradient`,
      wallet: userWalletAddress,
      type: 'metaplex_nft',
      uri,
      created: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('Metaplex NFT creation failed:', error)
    return null
  }
}

module.exports = {
  createMetaplexNFT
}