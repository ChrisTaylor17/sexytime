const express = require('express')
const cors = require('cors')

console.log('🚀 Starting Consilience DAO Server...')

const app = express()
app.use(cors())
app.use(express.json())

// Force load Solana dependencies at startup
let solanaEnabled = false
let connection = null
let aiWallet = null

console.log('🔗 Force loading Solana dependencies...')

try {
  // Force require with explicit paths
  const web3 = require('@solana/web3.js')
  const splToken = require('@solana/spl-token')
  
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
    
    // Check AI wallet balance
    connection.getBalance(aiWallet.publicKey).then(balance => {
      console.log(`💰 AI Wallet Balance: ${balance / LAMPORTS_PER_SOL} SOL`)
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
  
  // Create real NFT with metadata
  app.post('/api/create-nft', async (req, res) => {
    try {
      const { name, description, walletAddress } = req.body
      
      if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address required' })
      }
      
      console.log(`🎨 Creating real NFT "${name}" for ${walletAddress}`)
      
      const userPublicKey = new PublicKey(walletAddress)
      
      // Import Metaplex for real NFT creation
      const { createCreateMetadataAccountInstruction, createUpdateMetadataAccountInstruction } = require('@metaplex-foundation/mpl-token-metadata')
      const { SystemProgram, Transaction } = require('@solana/web3.js')
      
      // Metaplex Token Metadata Program ID
      const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
      
      // Create mint for NFT
      const mint = await createMint(
        connection,
        aiWallet,
        aiWallet.publicKey,
        aiWallet.publicKey, // freeze authority
        0  // 0 decimals = NFT
      )
      
      console.log('✅ NFT mint created:', mint.toString())
      
      // Create metadata account
      const [metadataPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.toBuffer()
        ],
        TOKEN_METADATA_PROGRAM_ID
      )
      
      // Create metadata
      const metadata = {
        name: name || 'Consilience NFT',
        symbol: 'CNSL',
        uri: `https://arweave.net/metadata-${mint.toString().slice(0, 8)}`,
        sellerFeeBasisPoints: 500, // 5% royalty
        creators: [
          {
            address: aiWallet.publicKey,
            verified: true,
            share: 100
          }
        ],
        collection: null,
        uses: null
      }
      
      const createMetadataInstruction = createCreateMetadataAccountInstruction(
        {
          metadata: metadataPDA,
          mint: mint,
          mintAuthority: aiWallet.publicKey,
          payer: aiWallet.publicKey,
          updateAuthority: aiWallet.publicKey,
          systemProgram: SystemProgram.programId,
          rent: new PublicKey('SysvarRent111111111111111111111111111111111')
        },
        {
          createMetadataAccountArgs: {
            data: metadata,
            isMutable: true
          }
        }
      )
      
      // Create and send transaction
      const transaction = new Transaction().add(createMetadataInstruction)
      const signature = await connection.sendTransaction(transaction, [aiWallet])
      await connection.confirmTransaction(signature)
      
      console.log('✅ NFT metadata created, signature:', signature)
      
      // Create token account and mint NFT to user
      const userTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        aiWallet,
        mint,
        userPublicKey
      )
      
      const mintSignature = await mintTo(
        connection,
        aiWallet,
        mint,
        userTokenAccount.address,
        aiWallet,
        1
      )
      
      console.log('✅ NFT minted to user, signature:', mintSignature)
      
      res.json({
        success: true,
        message: `🎨 Real NFT "${name}" with metadata created and sent to your wallet!`,
        mintAddress: mint.toString(),
        metadataAddress: metadataPDA.toString(),
        transactions: {
          metadata: signature,
          mint: mintSignature
        },
        explorerUrl: `https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`,
        name: name,
        description: description,
        symbol: 'CNSL'
      })
      
    } catch (error) {
      console.error('NFT creation error:', error)
      res.status(500).json({ error: 'Real NFT creation failed: ' + error.message })
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
  
  // Wallet NFTs endpoint
  app.get('/api/wallet-nfts/:address', async (req, res) => {
    try {
      const publicKey = new PublicKey(req.params.address)
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      })
      
      const nfts = tokenAccounts.value
        .filter(account => {
          const tokenInfo = account.account.data.parsed.info
          return tokenInfo.tokenAmount.decimals === 0 && parseFloat(tokenInfo.tokenAmount.amount) === 1
        })
        .map(account => {
          const tokenInfo = account.account.data.parsed.info
          return {
            mint: tokenInfo.mint,
            name: `Consilience NFT ${tokenInfo.mint.slice(0, 8)}...`,
            description: 'NFT created on Consilience DAO'
          }
        })
      
      res.json({ nfts })
    } catch (error) {
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
    const { recipient, nftId } = req.body
    const { createCreateMetadataAccountInstruction } = require('@metaplex-foundation/mpl-token-metadata')
    const { SystemProgram, Transaction } = require('@solana/web3.js')
    
    const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
    const userPublicKey = new PublicKey(recipient)
    
    // Create mint with metadata
    const mint = await createMint(connection, aiWallet, aiWallet.publicKey, aiWallet.publicKey, 0)
    
    // Create metadata
    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      TOKEN_METADATA_PROGRAM_ID
    )
    
    const metadata = {
      name: `Consilience NFT #${nftId || Date.now()}`,
      symbol: 'CNSL',
      uri: `https://arweave.net/nft-${mint.toString().slice(0, 8)}`,
      sellerFeeBasisPoints: 500,
      creators: [{ address: aiWallet.publicKey, verified: true, share: 100 }],
      collection: null,
      uses: null
    }
    
    const createMetadataInstruction = createCreateMetadataAccountInstruction(
      {
        metadata: metadataPDA,
        mint: mint,
        mintAuthority: aiWallet.publicKey,
        payer: aiWallet.publicKey,
        updateAuthority: aiWallet.publicKey,
        systemProgram: SystemProgram.programId,
        rent: new PublicKey('SysvarRent111111111111111111111111111111111')
      },
      { createMetadataAccountArgs: { data: metadata, isMutable: true } }
    )
    
    const transaction = new Transaction().add(createMetadataInstruction)
    const metadataSignature = await connection.sendTransaction(transaction, [aiWallet])
    await connection.confirmTransaction(metadataSignature)
    
    // Mint to user
    const userTokenAccount = await getOrCreateAssociatedTokenAccount(connection, aiWallet, mint, userPublicKey)
    const mintSignature = await mintTo(connection, aiWallet, mint, userTokenAccount.address, aiWallet, 1)
    
    res.json({
      success: true,
      message: 'Real NFT with metadata minted to your wallet!',
      mintAddress: mint.toString(),
      metadataAddress: metadataPDA.toString(),
      transactions: { metadata: metadataSignature, mint: mintSignature },
      explorerUrl: `https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`
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