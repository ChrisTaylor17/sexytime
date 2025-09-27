import { useState } from 'react'
import axios from 'axios'

export default function TokenCreator() {
  const [tokenData, setTokenData] = useState({
    name: '',
    symbol: '',
    supply: '',
    decimals: '18'
  })
  const [creating, setCreating] = useState(false)
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCreating(true)
    
    try {
      const alias = localStorage.getItem('userAlias')
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
      
      const response = await axios.post(`${backendUrl}/api/create-token`, {
        ...tokenData,
        alias
      })
      
      setResult(response.data)
      setTokenData({ name: '', symbol: '', supply: '', decimals: '18' })
      
    } catch (error) {
      setResult({ 
        success: false, 
        message: error.response?.data?.error || 'Token creation failed' 
      })
    }
    
    setCreating(false)
  }

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold">🪙 Create Custom Token</h2>
        <div className="text-right">
          <p className="text-xs text-gray-500">AI Wallet:</p>
          <code className="text-xs bg-gray-100 px-2 py-1 rounded">FcgjXDi62rzFT5eMVxQQy6WPvKLZVcRHakDYTM5E6k6W</code>
        </div>
      </div>
      
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-orange-800">
          💡 <strong>Fund the AI wallet above with devnet SOL to enable real token creation!</strong>
          <br />Visit <a href="https://faucet.solana.com" target="_blank" className="text-blue-600 hover:underline">faucet.solana.com</a> to get free devnet SOL.
        </p>
      </div>
      
      {result && (
        <div className={`p-4 rounded mb-4 ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <p className="font-medium">{result.message}</p>
          {result.token && (
            <div className="mt-2 text-sm">
              <p>Token: {result.token.name} ({result.token.symbol})</p>
              <p>Supply: {result.token.supply}</p>
            </div>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Token Name</label>
          <input
            type="text"
            value={tokenData.name}
            onChange={(e) => setTokenData({...tokenData, name: e.target.value})}
            className="input-field w-full"
            placeholder="e.g., Sexy Token"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Symbol</label>
          <input
            type="text"
            value={tokenData.symbol}
            onChange={(e) => setTokenData({...tokenData, symbol: e.target.value.toUpperCase()})}
            className="input-field w-full"
            placeholder="e.g., SEXY"
            maxLength="5"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Total Supply</label>
            <input
              type="number"
              value={tokenData.supply}
              onChange={(e) => setTokenData({...tokenData, supply: e.target.value})}
              className="input-field w-full"
              placeholder="1000"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Decimals</label>
            <input
              type="number"
              value={tokenData.decimals}
              onChange={(e) => setTokenData({...tokenData, decimals: e.target.value})}
              className="input-field w-full"
              min="0"
              max="18"
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={creating}
          className="btn-primary w-full"
        >
          {creating ? 'Creating Token...' : '🚀 Create & Mint Token'}
        </button>
      </form>
    </div>
  )
}