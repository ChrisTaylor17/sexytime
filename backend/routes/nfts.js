const express = require('express')
const { Connection, PublicKey } = require('@solana/web3.js')
const { apiLimiter } = require('../middleware/security')

const router = express.Router()
const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com')

// Metaplex Token Metadata Program ID
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

// Get NFTs for connected wallet
router.get('/nfts/:walletAddress', apiLimiter, async (req, res) => {
  const { walletAddress } = req.params
  
  try {
    const publicKey = new PublicKey(walletAddress)
    
    // Get all token accounts for the wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
    })
    
    console.log(`Found ${tokenAccounts.value.length} token accounts for ${walletAddress}`)
    
    // Filter for potential NFTs (tokens with 0 decimals and amount = 1)
    const potentialNFTs = tokenAccounts.value.filter(account => {
      const tokenInfo = account.account.data.parsed.info
      return tokenInfo.tokenAmount.decimals === 0 && 
             parseFloat(tokenInfo.tokenAmount.amount) === 1
    })
    
    console.log(`Found ${potentialNFTs.length} potential NFTs`)
    
    // Get metadata for each potential NFT
    const nfts = await Promise.all(
      potentialNFTs.map(async (account) => {
        const mint = account.account.data.parsed.info.mint
        
        try {
          // Derive metadata PDA
          const [metadataPDA] = PublicKey.findProgramAddressSync(
            [
              Buffer.from('metadata'),
              TOKEN_METADATA_PROGRAM_ID.toBuffer(),
              new PublicKey(mint).toBuffer()
            ],
            TOKEN_METADATA_PROGRAM_ID
          )
          
          // Get metadata account
          const metadataAccount = await connection.getAccountInfo(metadataPDA)
          
          if (metadataAccount) {
            // Parse basic metadata (simplified)
            const data = metadataAccount.data
            let name = 'Unknown NFT'
            let uri = ''
            
            try {
              // Basic parsing of metadata (this is simplified)
              const nameLength = data[64]
              if (nameLength > 0 && nameLength < 50) {
                name = data.slice(65, 65 + nameLength).toString('utf8').replace(/\0/g, '')
              }
              
              const uriStart = 65 + nameLength + 4 + 4 // name + symbol + uri length
              const uriLength = data.readUInt32LE(uriStart - 4)
              if (uriLength > 0 && uriLength < 200) {
                uri = data.slice(uriStart, uriStart + uriLength).toString('utf8').replace(/\0/g, '')
              }
            } catch (parseError) {
              console.log('Metadata parsing error for', mint)
            }
            
            // Fetch off-chain metadata if URI exists
            let image = null
            let description = null
            
            if (uri && uri.startsWith('http')) {
              try {
                const response = await fetch(uri)
                if (response.ok) {
                  const offChainData = await response.json()
                  image = offChainData.image
                  description = offChainData.description
                  if (offChainData.name) name = offChainData.name
                }
              } catch (fetchError) {
                console.log('Off-chain metadata fetch failed for', mint)
              }
            }
            
            return {
              mint,
              name: name || `NFT ${mint.slice(0, 8)}...`,
              image,
              description,
              uri
            }
          }
        } catch (error) {
          console.log('Metadata fetch error for', mint, error.message)
        }
        
        return {
          mint,
          name: `Token ${mint.slice(0, 8)}...`,
          image: null,
          description: null,
          uri: null
        }
      })
    )
    
    console.log(`Returning ${nfts.length} NFTs with metadata`)
    res.json({ nfts })
    
  } catch (error) {
    console.error('NFT fetch error:', error)
    res.json({ nfts: [] })
  }
})



module.exports = router