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
      <h2 className="text-xl font-semibold mb-4">🪙 Create Custom Token</h2>
      
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