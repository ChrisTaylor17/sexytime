import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export default function WalletConnection({ userAlias }) {
  const { connected, publicKey, disconnect } = useWallet()
  const [walletBalance, setWalletBalance] = useState(0)
  const [tokens, setTokens] = useState([])
  const [nfts, setNfts] = useState([])

  useEffect(() => {
    if (connected && publicKey) {
      updateWalletInfo()
      saveWalletConnection()
    }
  }, [connected, publicKey])

  const saveWalletConnection = async () => {
    if (!connected || !publicKey || !userAlias) return

    try {
      await fetch('https://sexytime-production.up.railway.app/api/connect-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alias: userAlias,
          walletAddress: publicKey.toString()
        })
      })
    } catch (error) {
      console.error('Failed to save wallet connection:', error)
    }
  }

  const updateWalletInfo = async () => {
    if (!connected || !publicKey) return

    try {
      // Get wallet balance
      const balanceResponse = await fetch(`https://sexytime-production.up.railway.app/api/wallet-balance/${publicKey.toString()}`)
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json()
        setWalletBalance(balanceData.balance || 0)
      }

      // Get wallet tokens
      const tokensResponse = await fetch(`https://sexytime-production.up.railway.app/api/wallet-tokens/${publicKey.toString()}`)
      if (tokensResponse.ok) {
        const tokensData = await tokensResponse.json()
        setTokens(tokensData.tokens || [])
      }

      // Get wallet NFTs
      const nftsResponse = await fetch(`https://sexytime-production.up.railway.app/api/wallet-nfts/${publicKey.toString()}`)
      if (nftsResponse.ok) {
        const nftsData = await nftsResponse.json()
        setNfts(nftsData.nfts || [])
      }
    } catch (error) {
      console.error('Failed to update wallet info:', error)
    }
  }

  const requestAirdrop = async () => {
    if (!connected || !publicKey) return

    try {
      const response = await fetch('https://sexytime-production.up.railway.app/api/request-airdrop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          amount: 1 // 1 SOL
        })
      })

      if (response.ok) {
        alert('🎉 1 SOL airdropped to your wallet!')
        updateWalletInfo()
      } else {
        alert('Airdrop failed. Try again later.')
      }
    } catch (error) {
      console.error('Airdrop failed:', error)
      alert('Airdrop failed. Network error.')
    }
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '15px'
      }}>
        <h3 style={{ margin: 0, color: 'white' }}>
          {connected ? '🟢 Wallet Connected' : '🔴 Wallet Disconnected'}
        </h3>
        <WalletMultiButton />
      </div>

      {connected && publicKey && (
        <div>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '15px'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '5px' }}>
              Wallet Address
            </div>
            <div style={{ 
              fontSize: '12px', 
              fontFamily: 'monospace',
              color: '#3b82f6',
              wordBreak: 'break-all'
            }}>
              {publicKey.toString()}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '10px',
            marginBottom: '15px'
          }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              padding: '10px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>SOL Balance</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#3b82f6' }}>
                {walletBalance.toFixed(4)}
              </div>
            </div>

            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              padding: '10px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>Tokens</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#22c55e' }}>
                {tokens.length}
              </div>
            </div>

            <div style={{
              background: 'rgba(168, 85, 247, 0.1)',
              padding: '10px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>NFTs</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#a855f7' }}>
                {nfts.length}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={requestAirdrop}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              🪂 Get SOL (Devnet)
            </button>
            <button
              onClick={updateWalletInfo}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🔄 Refresh
            </button>
          </div>

          {tokens.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>
                Your Tokens
              </div>
              {tokens.slice(0, 3).map((token, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '6px',
                  marginBottom: '5px'
                }}>
                  <span style={{ fontSize: '12px' }}>{token.symbol}</span>
                  <span style={{ fontSize: '12px', color: '#22c55e' }}>
                    {token.balance?.toLocaleString() || '0'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!connected && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          opacity: 0.7
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>👛</div>
          <div style={{ fontSize: '14px', marginBottom: '10px' }}>
            Connect your Solana wallet to receive real tokens and NFTs
          </div>
          <div style={{ fontSize: '12px', opacity: 0.6 }}>
            Supports Phantom, Solflare, and other Solana wallets
          </div>
        </div>
      )}
    </div>
  )
}