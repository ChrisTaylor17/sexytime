import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import axios from 'axios'

export default function TokenCreator() {
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [totalSupply, setTotalSupply] = useState('')
  const [decimals, setDecimals] = useState('18')
  const [creating, setCreating] = useState(false)
  const { connected, publicKey } = useWallet()

  const handleCreateToken = async (e) => {
    e.preventDefault()
    if (!connected) {
      alert('Please connect your wallet first')
      return
    }

    setCreating(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sexytime-production.up.railway.app'
      const response = await axios.post(`${backendUrl}/api/create-token`, {
        name: tokenName,
        symbol: tokenSymbol,
        supply: parseInt(totalSupply),
        decimals: parseInt(decimals),
        walletAddress: publicKey.toString()
      })
      
      if (response.data.success) {
        alert(`🎉 Real Solana Token Created!\n\nToken: ${tokenName} (${tokenSymbol})\nMint Address: ${response.data.mintAddress}\nExplorer: ${response.data.explorerUrl}\nYour Tokens: ${response.data.userTokens}`)
      } else {
        alert(`Token created! Mint address: ${response.data.mintAddress}`)
      }
      
      // Reset form
      setTokenName('')
      setTokenSymbol('')
      setTotalSupply('')
      setDecimals('18')
    } catch (error) {
      console.error('Token creation failed:', error)
      alert('Token creation failed: ' + (error.response?.data?.error || error.message))
    }
    setCreating(false)
  }

  return (
    <>
      <style jsx>{`
        .token-creator {
          color: white;
        }
        .header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        .icon {
          width: 32px;
          height: 32px;
          font-size: 20px;
        }
        .title {
          font-size: 20px;
          font-weight: bold;
          color: white;
          margin: 0;
        }
        .ai-wallet-section {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
        }
        .ai-wallet-title {
          font-size: 14px;
          font-weight: 600;
          color: #60a5fa;
          margin-bottom: 8px;
        }
        .ai-wallet-address {
          font-family: monospace;
          font-size: 12px;
          color: #cbd5e1;
          background: rgba(0, 0, 0, 0.3);
          padding: 8px 12px;
          border-radius: 6px;
          margin-bottom: 16px;
          word-break: break-all;
        }
        .funding-info {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;
        }
        .funding-title {
          font-size: 14px;
          font-weight: 600;
          color: #fbbf24;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .funding-steps {
          font-size: 12px;
          color: #d1d5db;
          line-height: 1.5;
        }
        .funding-step {
          margin-bottom: 4px;
        }
        .copy-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          cursor: pointer;
          margin-left: 8px;
          transition: background-color 0.2s;
        }
        .copy-button:hover {
          background: #2563eb;
        }
        .form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .label {
          font-size: 14px;
          font-weight: 500;
          color: #cbd5e1;
        }
        .input {
          padding: 12px;
          background: rgba(71, 85, 105, 0.5);
          border: 1px solid #64748b;
          border-radius: 8px;
          color: white;
          font-size: 14px;
          transition: border-color 0.2s;
        }
        .input:focus {
          outline: none;
          border-color: #3b82f6;
        }
        .input::placeholder {
          color: #94a3b8;
        }
        .button {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          font-weight: 600;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
        }
        .button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        .button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        .faucet-link {
          color: #60a5fa;
          text-decoration: underline;
        }
        .faucet-link:hover {
          color: #93c5fd;
        }
      `}</style>
      
      <div className="token-creator">
        <div className="header">
          <div className="icon">🪙</div>
          <h3 className="title">Create Custom Token</h3>
        </div>

        <div className="ai-wallet-section">
          <div className="ai-wallet-title">AI Wallet:</div>
          <div className="ai-wallet-address">
            FcgjXDi62rzFT5eMVxQQy6WPvKLZVcRHakDYTM5E6k6W
            <button 
              className="copy-button"
              onClick={() => {
                navigator.clipboard.writeText('FcgjXDi62rzFT5eMVxQQy6WPvKLZVcRHakDYTM5E6k6W')
                alert('Address copied!')
              }}
            >
              Copy
            </button>
          </div>
          
          <div className="funding-info">
            <div className="funding-title">
              💡 How to Enable Real Token Creation
            </div>
            <div className="funding-steps">
              <div className="funding-step"><strong>Step 1:</strong> Fund the AI wallet with SOL to pay transaction fees</div>
              <div className="funding-step"><strong>Step 2:</strong> Visit <a href="https://faucet.solana.com" target="_blank" className="faucet-link">faucet.solana.com</a> and request 2 SOL</div>
              <div className="funding-step"><strong>Step 3:</strong> Your AI can now mint real tokens to your connected wallet!</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleCreateToken} className="form">
          <div className="form-group">
            <label className="label">Token Name</label>
            <input
              type="text"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              className="input"
              placeholder="e.g., Sexy Token"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Symbol</label>
            <input
              type="text"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              className="input"
              placeholder="e.g., SEXY"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Total Supply</label>
            <input
              type="number"
              value={totalSupply}
              onChange={(e) => setTotalSupply(e.target.value)}
              className="input"
              placeholder="1000"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Decimals</label>
            <input
              type="number"
              value={decimals}
              onChange={(e) => setDecimals(e.target.value)}
              className="input"
              placeholder="18"
              min="0"
              max="18"
              required
            />
          </div>

          <button
            type="submit"
            disabled={creating || !connected}
            className="button"
          >
            {creating ? '🚀 Creating Token...' : '🚀 Create & Mint Token'}
          </button>
        </form>
      </div>
    </>
  )
}