const { Connection, Keypair, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } = require('@solana/web3.js')
const { createMint, createAssociatedTokenAccount, mintTo, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } = require('@solana/spl-token')
const { Metaplex, keypairIdentity, bundlrStorage } = require('@metaplex-foundation/js')

const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com')

// Load AI wallet from environment
const AI_WALLET_PRIVATE_KEY = process.env.AI_WALLET_PRIVATE_KEY || process.env.FOUNDER_PRIVATE_KEY
let aiWallet = null

if (AI_WALLET_PRIVATE_KEY) {
  try {
    const secretKey = JSON.parse(AI_WALLET_PRIVATE_KEY)
    aiWallet = Keypair.fromSecretKey(new Uint8Array(secretKey))
    console.log('AI Wallet loaded:', aiWallet.publicKey.toString())
  } catch (error) {
    console.error('Failed to load AI wallet:', error)
    aiWallet = Keypair.generate()
    console.log('Generated temporary AI wallet:', aiWallet.publicKey.toString())
  }
} else {
  aiWallet = Keypair.generate()
  console.log('No AI wallet key found, generated temporary:', aiWallet.publicKey.toString())
}

// Initialize Metaplex
const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(aiWallet))
  .use(bundlrStorage())

class RealSolanaManager {
  constructor() {
    this.connection = connection
    this.aiWallet = aiWallet
    this.metaplex = metaplex
  }

  // Create real SPL token
  async createRealToken(name, symbol, supply, decimals, creatorWallet) {
    try {
      console.log(`Creating real SPL token: ${symbol}`)
      
      // Create mint
      const mint = await createMint(
        this.connection,
        this.aiWallet, // Payer
        this.aiWallet.publicKey, // Mint authority
        this.aiWallet.publicKey, // Freeze authority
        decimals
      )

      // Create token account for creator
      const creatorTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.aiWallet,
        mint,
        new PublicKey(creatorWallet)
      )

      // Mint tokens to creator
      await mintTo(
        this.connection,
        this.aiWallet,
        mint,
        creatorTokenAccount.address,
        this.aiWallet.publicKey,
        supply * Math.pow(10, decimals)
      )

      console.log(`Real token ${symbol} created:`, mint.toString())
      
      return {
        mint: mint.toString(),
        name,
        symbol,
        supply,
        decimals,
        creatorTokenAccount: creatorTokenAccount.address.toString(),
        success: true
      }
    } catch (error) {
      console.error('Real token creation failed:', error)
      return { success: false, error: error.message }
    }
  }

  // Create real NFT with Metaplex
  async createRealNFT(name, description, imageUrl, recipientWallet) {
    try {
      console.log(`Creating real NFT: ${name}`)

      const { nft } = await this.metaplex.nfts().create({
        uri: await this.uploadMetadata(name, description, imageUrl),
        name: name,
        symbol: 'TASK',
        sellerFeeBasisPoints: 500, // 5%
        creators: [
          {
            address: this.aiWallet.publicKey,
            share: 100,
          },
        ],
        collection: null,
        uses: null,
      })

      // Transfer to recipient
      if (recipientWallet !== this.aiWallet.publicKey.toString()) {
        await this.metaplex.nfts().transfer({
          nftOrSft: nft,
          toOwner: new PublicKey(recipientWallet),
        })
      }

      console.log(`Real NFT created and transferred:`, nft.address.toString())
      
      return {
        mint: nft.address.toString(),
        name: nft.name,
        symbol: nft.symbol,
        image: imageUrl,
        recipient: recipientWallet,
        success: true
      }
    } catch (error) {
      console.error('Real NFT creation failed:', error)
      return { success: false, error: error.message }
    }
  }

  // Upload metadata to Arweave via Bundlr
  async uploadMetadata(name, description, imageUrl) {
    try {
      const metadata = {
        name,
        description,
        image: imageUrl,
        attributes: [
          {
            trait_type: "Type",
            value: "Achievement"
          },
          {
            trait_type: "Created",
            value: new Date().toISOString().split('T')[0]
          }
        ],
        properties: {
          files: [
            {
              uri: imageUrl,
              type: "image/png"
            }
          ],
          category: "image"
        }
      }

      const { uri } = await this.metaplex.nfts().uploadMetadata(metadata)
      console.log('Metadata uploaded to:', uri)
      return uri
    } catch (error) {
      console.error('Metadata upload failed:', error)
      throw error
    }
  }

  // Send real SOL
  async sendSOL(recipientWallet, amount) {
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.aiWallet.publicKey,
          toPubkey: new PublicKey(recipientWallet),
          lamports: amount * 1000000000, // Convert SOL to lamports
        })
      )

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.aiWallet]
      )

      console.log(`Sent ${amount} SOL to ${recipientWallet}:`, signature)
      return { success: true, signature }
    } catch (error) {
      console.error('SOL transfer failed:', error)
      return { success: false, error: error.message }
    }
  }

  // Get wallet balance
  async getWalletBalance(walletAddress) {
    try {
      const balance = await this.connection.getBalance(new PublicKey(walletAddress))
      return balance / 1000000000 // Convert lamports to SOL
    } catch (error) {
      console.error('Balance check failed:', error)
      return 0
    }
  }

  // Distribute real tokens to multiple recipients
  async distributeTokens(mintAddress, recipients) {
    try {
      const results = []
      
      for (const recipient of recipients) {
        const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
          this.connection,
          this.aiWallet,
          new PublicKey(mintAddress),
          new PublicKey(recipient.wallet)
        )

        await mintTo(
          this.connection,
          this.aiWallet,
          new PublicKey(mintAddress),
          recipientTokenAccount.address,
          this.aiWallet.publicKey,
          recipient.amount
        )

        results.push({
          wallet: recipient.wallet,
          amount: recipient.amount,
          tokenAccount: recipientTokenAccount.address.toString(),
          success: true
        })
      }

      return { success: true, distributions: results }
    } catch (error) {
      console.error('Token distribution failed:', error)
      return { success: false, error: error.message }
    }
  }
}

const realSolanaManager = new RealSolanaManager()

module.exports = {
  realSolanaManager,
  aiWallet: aiWallet.publicKey.toString()
}