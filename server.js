const express = require('express')
const cors = require('cors')

console.log('🚀 Starting Consilience DAO Server v2.1...')

const app = express()
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Force load Solana dependencies at startup
let solanaEnabled = false
let connection = null
let aiWallet = null

console.log('🔗 Force loading Solana dependencies...')

try {
  // Force require with explicit paths
  const web3 = require('@solana/web3.js')
  const splToken = require('@solana/spl-token')
  const { Metaplex, keypairIdentity, bundlrStorage, mockStorage } = require('@metaplex-foundation/js')
  const { createCreateMetadataAccountV3Instruction } = require('@metaplex-foundation/mpl-token-metadata')
  
  console.log('✅ @solana/web3.js loaded:', !!web3.Connection)
  console.log('✅ @solana/spl-token loaded:', !!splToken.createMint)
  
  const { Connection, PublicKey, Keypair, clusterApiUrl, LAMPORTS_PER_SOL } = web3
  const { createMint, getOrCreateAssociatedTokenAccount, mintTo } = splToken
  
  // Initialize connection
  connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
  console.log('✅ Solana connection created')
  
  // Initialize AI wallet with valid keypair
  aiWallet = Keypair.fromSecretKey(new Uint8Array([
    0,46,47,103,69,243,32,227,111,4,19,115,29,104,206,194,143,87,106,165,154,238,229,42,120,76,194,178,113,146,160,176,102,53,107,181,41,161,184,189,64,196,126,101,49,186,197,17,185,228,184,25,23,28,187,43,45,34,82,83,246,213,17,165
  ]))
  
  console.log('✅ AI Wallet loaded:', aiWallet.publicKey.toString())
  
  // Test connection
  connection.getVersion().then(version => {
    console.log('✅ Solana RPC connected, version:', version['solana-core'])
    solanaEnabled = true
    
    // Check AI wallet balance and fund if needed
    connection.getBalance(aiWallet.publicKey).then(async balance => {
      console.log(`💰 AI Wallet Balance: ${balance / LAMPORTS_PER_SOL} SOL`)
      if (balance < LAMPORTS_PER_SOL * 0.1) {
        try {
          console.log('💰 AI Wallet low on SOL, requesting airdrop...')
          const signature = await connection.requestAirdrop(aiWallet.publicKey, LAMPORTS_PER_SOL)
          await connection.confirmTransaction(signature)
          console.log('✅ AI Wallet funded with 1 SOL')
        } catch (err) {
          console.log('⚠️ AI Wallet airdrop failed:', err.message)
        }
      }
    }).catch(err => console.log('Balance check failed:', err.message))
    
  }).catch(err => {
    console.log('❌ Solana RPC connection failed:', err.message)
  })
  
  // Create token endpoint
  app.post('/api/create-token', async (req, res) => {
    try {
      const { name, symbol, supply, walletAddress } = req.body
      
      if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address required' })
      }
      
      console.log(`🪙 Creating token ${symbol} for ${walletAddress}`)
      
      const userPublicKey = new PublicKey(walletAddress)
      
      const mint = await createMint(
        connection,
        aiWallet,
        aiWallet.publicKey,
        null,
        6
      )
      
      const userTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        aiWallet,
        mint,
        userPublicKey
      )
      
      const userAmount = Math.floor(supply * 0.8) * 1000000
      await mintTo(
        connection,
        aiWallet,
        mint,
        userTokenAccount.address,
        aiWallet,
        userAmount
      )
      
      console.log('✅ Token created:', mint.toString())
      
      res.json({
        success: true,
        message: `Real token ${symbol} created on Solana!`,
        mintAddress: mint.toString(),
        explorerUrl: `https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`,
        userTokens: Math.floor(supply * 0.8)
      })
      
    } catch (error) {
      console.error('Token creation error:', error)
      res.status(500).json({ error: 'Token creation failed: ' + error.message })
    }
  })
  
  // Create real Metaplex NFT
  app.post('/api/create-nft', async (req, res) => {
    try {
      const { name, description, walletAddress } = req.body
      
      if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address required' })
      }
      
      console.log(`🎨 Creating Metaplex NFT for ${walletAddress}`)
      
      // Add request timeout handling
      const startTime = Date.now()
      const timeout = setTimeout(() => {
        console.log('⚠️ NFT creation taking longer than expected...')
      }, 30000)
      
      const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(aiWallet))
        .use(mockStorage())
      
      const nftMetaplex = Metaplex.make(connection)
        .use(keypairIdentity(aiWallet))
        .use(mockStorage())
      
      const userPublicKey = new PublicKey(walletAddress)
      
      // Generate AI image from description
      let imageUrl
      const hasOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy'
      console.log('🔑 OpenAI API Key available:', !!hasOpenAI)
      
      if (hasOpenAI) {
        try {
          const OpenAI = require('openai')
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
          
          const imagePrompt = description || `${name} digital art NFT`
          console.log('🎨 Generating AI image for prompt:', imagePrompt)
          
          const response = await openai.images.generate({
            model: 'dall-e-3',
            prompt: imagePrompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard'
          })
          
          imageUrl = response.data[0].url
          console.log('✅ AI image generated successfully:', imageUrl)
        } catch (error) {
          console.log('⚠️ AI generation failed:', error.message)
          imageUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(description || name || 'nft')}&backgroundColor=ff6b6b,4ecdc4,45b7d1`
        }
      } else {
        console.log('⚠️ No OpenAI API key, using fallback image')
        imageUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(description || name || 'nft')}&backgroundColor=ff6b6b,4ecdc4,45b7d1`
      }
      
      console.log('✅ Creating NFT with Metaplex...')
      
      // Ensure all parameters are properly typed
      const nftName = String(name || 'Consilience NFT')
      const nftDescription = String(description || 'Created on Consilience DAO')
      const nftSymbol = String('CNSL')
      
      // Validate all parameters before Metaplex call
      if (!nftName || !nftDescription || !imageUrl || !nftSymbol || !aiWallet?.publicKey) {
        throw new Error(`Missing required parameters: name=${!!nftName}, desc=${!!nftDescription}, image=${!!imageUrl}, symbol=${!!nftSymbol}, wallet=${!!aiWallet?.publicKey}`)
      }
      
      console.log('Creating NFT with validated params:', {
        name: nftName,
        description: nftDescription,
        image: imageUrl,
        symbol: nftSymbol,
        creatorAddress: aiWallet.publicKey.toString()
      })
      
      console.log('Final image URL for metadata:', imageUrl)
      
      // Create metadata object
      const metadata = {
        name: String(nftName),
        description: String(nftDescription),
        image: String(imageUrl),
        external_url: 'https://consilience-dao.com',
        attributes: [
          { trait_type: 'Platform', value: 'Consilience DAO' },
          { trait_type: 'AI Generated', value: hasOpenAI ? 'Yes' : 'No' },
          { trait_type: 'Image Type', value: hasOpenAI ? 'DALL-E 3' : 'Generated SVG' }
        ],
        properties: {
          files: [{
            uri: String(imageUrl),
            type: imageUrl.includes('openai') ? 'image/png' : 'image/svg+xml'
          }],
          category: 'image'
        }
      }
      
      console.log('Uploading metadata:', JSON.stringify(metadata, null, 2))
      
      // Use shorter URI to avoid Solana length limit
      const shortUri = imageUrl.length > 200 ? 
        `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(nftName)}&backgroundColor=ff6b6b,4ecdc4,45b7d1` : 
        String(imageUrl)
      
      console.log('Using URI (length:', shortUri.length, '):', shortUri)
      
      // Use Metaplex to create NFT
      const { nft } = await nftMetaplex.nfts().create({
        uri: shortUri,
        name: String(nftName),
        sellerFeeBasisPoints: 500,
        symbol: String(nftSymbol),
        creators: [{
          address: aiWallet.publicKey,
          share: 100
        }],
        toOwner: userPublicKey
      })
      
      console.log('✅ NFT created with AI image URL and sent to user')
      
      const mint = nft.address
      
      console.log('✅ NFT created:', nft.address.toString())
      
      // Transfer to user
      await nftMetaplex.nfts().transfer({
        nftOrSft: nft,
        toOwner: userPublicKey
      })
      
      console.log('✅ NFT transferred to user')
      
      if (!nft || !nft.address) {
        throw new Error('NFT creation failed - no address returned')
      }
      
      const mintAddress = nft.address.toString()
      const metadataUri = nft.uri || 'No URI'
      
      clearTimeout(timeout)
      const duration = Date.now() - startTime
      
      console.log(`✅ NFT SUCCESSFULLY CREATED (${duration}ms):`)
      console.log('  🎯 MINT ADDRESS:', mintAddress)
      console.log('  🔗 EXPLORER:', `https://explorer.solana.com/address/${mintAddress}?cluster=devnet`)
      console.log('  🔗 SOLSCAN:', `https://solscan.io/token/${mintAddress}?cluster=devnet`)
      console.log('  🇺🇷 METADATA URI:', metadataUri)
      console.log('  🇮🇲 IMAGE URL:', imageUrl)
      console.log('  🅰️ AI GENERATED:', hasOpenAI)
      
      res.json({
        success: true,
        message: `🎨 NFT CREATED! Mint: ${mintAddress}`,
        mintAddress: mintAddress,
        metadataUri: metadataUri,
        image: imageUrl,
        explorerUrl: `https://explorer.solana.com/address/${mintAddress}?cluster=devnet`,
        solscanUrl: `https://solscan.io/token/${mintAddress}?cluster=devnet`,
        name: nft.name || name,
        description: nft.description || description,
        symbol: nft.symbol || 'CNSL',
        isRealNFT: true,
        hasAIImage: hasOpenAI,
        aiImageUrl: hasOpenAI ? imageUrl : null
      })
      
    } catch (error) {
      console.error('❌ Metaplex NFT creation error:')
      console.error('Error message:', error.message)
      res.status(500).json({ 
        error: 'Real NFT creation failed: ' + error.message
      })
    }
  })
  
  // Wallet balance endpoint
  app.get('/api/wallet-balance/:address', async (req, res) => {
    try {
      const publicKey = new PublicKey(req.params.address)
      const balance = await connection.getBalance(publicKey)
      res.json({ balance: balance / LAMPORTS_PER_SOL })
    } catch (error) {
      res.status(400).json({ error: 'Invalid wallet address' })
    }
  })
  
  // Wallet tokens endpoint
  app.get('/api/wallet-tokens/:address', async (req, res) => {
    try {
      const publicKey = new PublicKey(req.params.address)
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      })
      
      const tokens = tokenAccounts.value.map(account => {
        const tokenInfo = account.account.data.parsed.info
        return {
          symbol: tokenInfo.mint.slice(0, 8) + '...',
          balance: parseFloat(tokenInfo.tokenAmount.uiAmount) || 0,
          mint: tokenInfo.mint
        }
      }).filter(token => token.balance > 0)
      
      res.json({ tokens })
    } catch (error) {
      res.json({ tokens: [] })
    }
  })
  
  // Wallet NFTs endpoint with Metaplex
  app.get('/api/wallet-nfts/:address', async (req, res) => {
    try {
      const { Metaplex, keypairIdentity } = require('@metaplex-foundation/js')
      const metaplex = Metaplex.make(connection).use(keypairIdentity(aiWallet))
      
      const publicKey = new PublicKey(req.params.address)
      console.log(`🔍 Fetching NFTs for: ${publicKey.toString()}`)
      
      const nfts = await metaplex.nfts().findAllByOwner({ owner: publicKey })
      console.log(`📦 Found ${nfts.length} NFTs`)
      
      const nftData = await Promise.all(
        nfts.map(async (nft) => {
          try {
            const fullNft = await metaplex.nfts().load({ metadata: nft })
            return {
              mint: nft.address.toString(),
              name: nft.name || `NFT ${nft.address.toString().slice(0, 8)}...`,
              description: nft.description || 'Consilience DAO NFT',
              image: fullNft.json?.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${nft.address.toString()}&backgroundColor=00ff88`,
              symbol: nft.symbol || 'CNSL',
              uri: nft.uri,
              explorerUrl: `https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`,
              isRealNFT: true
            }
          } catch (error) {
            return {
              mint: nft.address.toString(),
              name: `NFT ${nft.address.toString().slice(0, 8)}...`,
              description: 'Consilience DAO NFT',
              image: `https://api.dicebear.com/7.x/shapes/svg?seed=${nft.address.toString()}&backgroundColor=ff6b6b`,
              symbol: 'CNSL',
              explorerUrl: `https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`,
              isRealNFT: true
            }
          }
        })
      )
      
      console.log(`✅ Returning ${nftData.length} NFTs`)
      res.json({ nfts: nftData })
      
    } catch (error) {
      console.error('NFT fetch error:', error)
      res.json({ nfts: [] })
    }
  })
  
  // Request airdrop endpoint
  app.post('/api/request-airdrop', async (req, res) => {
    try {
      const { walletAddress } = req.body
      const publicKey = new PublicKey(walletAddress)
      
      const signature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL)
      await connection.confirmTransaction(signature)
      
      res.json({ 
        success: true, 
        message: '1 SOL airdropped to your wallet!',
        signature,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      })
    } catch (error) {
      res.status(500).json({ error: 'Airdrop failed: ' + error.message })
    }
  })
  
  console.log('🎉 All Solana endpoints loaded successfully!')
  
} catch (error) {
  console.error('❌ CRITICAL: Solana dependencies failed to load:', error.message)
  console.error('Stack:', error.stack)
  
  // Fallback endpoints
  app.post('/api/create-token', (req, res) => {
    res.status(503).json({ error: 'Solana dependencies not available: ' + error.message })
  })
  
  app.post('/api/create-nft', (req, res) => {
    res.status(503).json({ error: 'Solana dependencies not available: ' + error.message })
  })
  
  app.get('/api/wallet-balance/:address', (req, res) => {
    res.json({ balance: 0, error: 'Solana not available' })
  })
  
  app.get('/api/wallet-tokens/:address', (req, res) => {
    res.json({ tokens: [] })
  })
  
  app.get('/api/wallet-nfts/:address', (req, res) => {
    res.json({ nfts: [] })
  })
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    solanaEnabled: solanaEnabled,
    aiWallet: aiWallet ? aiWallet.publicKey.toString() : null,
    timestamp: new Date().toISOString()
  })
})

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    server: 'online',
    solana: solanaEnabled ? 'enabled' : 'disabled',
    features: {
      tokenCreation: solanaEnabled,
      nftMinting: solanaEnabled,
      walletBalance: solanaEnabled
    },
    timestamp: new Date().toISOString()
  })
})

// Basic endpoints
app.post('/api/signup', (req, res) => {
  const { alias, interests } = req.body
  res.json({ 
    alias, 
    interests, 
    wallet_address: 'connect_wallet', 
    cs_balance: 100 
  })
})

app.get('/api/user/:alias', (req, res) => {
  res.json({ 
    alias: req.params.alias, 
    interests: 'AI, Blockchain', 
    cs_balance: 250 
  })
})

app.get('/api/projects', (req, res) => {
  res.json({
    projects: [
      { id: 1, name: 'Mars Colony DAO', description: 'Building on Mars', owner_alias: 'mars.builder' },
      { id: 2, name: 'Ocean Cleanup', description: 'Clean the oceans', owner_alias: 'ocean.saver' }
    ]
  })
})

app.get('/api/user-nfts/:alias', (req, res) => {
  res.json({ nfts: [] })
})

app.post('/api/connect-wallet', (req, res) => {
  res.json({ success: true })
})

app.post('/api/mint-nft', async (req, res) => {
  if (!solanaEnabled) {
    return res.status(503).json({ error: 'Solana features unavailable' })
  }
  
  try {
    const { recipient, nftId, name } = req.body
    const { Metaplex, keypairIdentity } = require('@metaplex-foundation/js')
    
    const metaplex = Metaplex.make(connection).use(keypairIdentity(aiWallet))
    const userPublicKey = new PublicKey(recipient)
    
    const nftName = name || `Consilience NFT #${nftId || Date.now()}`
    
    const mintMetaplex = Metaplex.make(connection).use(keypairIdentity(aiWallet)).use(bundlrStorage())
    
    const nftImage = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(nftName || 'NFT')}&backgroundColor=ff6b6b,4ecdc4,45b7d1`
    
    const { nft } = await mintMetaplex.nfts().create({
      name: nftName,
      description: 'Minted on Consilience DAO platform',
      image: nftImage,
      sellerFeeBasisPoints: 500,
      symbol: 'CNSL',
      creators: [{ address: aiWallet.publicKey, share: 100 }],
      attributes: [{ trait_type: 'Platform', value: 'Consilience DAO' }]
    })
    
    // Transfer to user
    await mintMetaplex.nfts().transfer({ nftOrSft: nft, toOwner: userPublicKey })
    
    res.json({
      success: true,
      message: 'Real NFT with image minted to your wallet!',
      mintAddress: nft.address.toString(),
      image: nftImage,
      explorerUrl: `https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`,
      isRealNFT: true
    })
  } catch (error) {
    res.status(500).json({ error: 'NFT minting failed: ' + error.message })
  }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🔗 Solana Status: ${solanaEnabled ? 'ENABLED ✅' : 'DISABLED ❌'}`)
  if (aiWallet) {
    console.log(`💰 AI Wallet: ${aiWallet.publicKey.toString()}`)
  }
  console.log('✅ Server ready!')
  
  // Log dependency status
  setTimeout(() => {
    console.log('📊 Final Status Report:')
    console.log(`   Solana Enabled: ${solanaEnabled}`)
    console.log(`   Connection: ${connection ? 'Active' : 'None'}`)
    console.log(`   AI Wallet: ${aiWallet ? 'Loaded' : 'None'}`)
  }, 3000)
})