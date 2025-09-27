import { useState, useEffect } from 'react'
import axios from 'axios'

export default function TransparencyDashboard() {
  const [transactions, setTransactions] = useState([])
  const [aiAllocations, setAiAllocations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransparencyData()
  }, [])

  const fetchTransparencyData = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
      const response = await axios.get(`${backendUrl}/api/transparency`)
      setTransactions(response.data.transactions || [])
      setAiAllocations(response.data.allocations || [])
    } catch (error) {
      console.error('Failed to fetch transparency data:', error)
    }
    setLoading(false)
  }

  if (loading) return <div className="text-center">Loading transparency data...</div>

  return (
    <div className="space-y-6">
      {/* AI Asset Manager Status */}
      <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <div className="flex items-center mb-4">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
          <h2 className="text-xl font-bold text-blue-800">🤖 AI Asset Manager</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-3 rounded">
            <p className="font-medium text-gray-600">Status</p>
            <p className="text-green-600 font-bold">ACTIVE</p>
          </div>
          <div className="bg-white p-3 rounded">
            <p className="font-medium text-gray-600">Total Allocated</p>
            <p className="text-blue-600 font-bold">{transactions.reduce((sum, t) => sum + t.amount, 0)} CS</p>
          </div>
          <div className="bg-white p-3 rounded">
            <p className="font-medium text-gray-600">NFTs Minted</p>
            <p className="text-purple-600 font-bold">{transactions.filter(t => t.type === 'task_reward').length}</p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">🔍 Recent AI Decisions</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {transactions.slice(0, 10).map((tx, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-sm">
                  {tx.type === 'task_reward' ? '🎯 Task Reward' : 
                   tx.type === 'founder_fee' ? '💼 Founder Fee' : 
                   tx.type === 'checkin_reward' ? '📍 Check-in' : tx.type}
                </p>
                <p className="text-xs text-gray-500">
                  {tx.from_alias} → {tx.to_alias}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">+{tx.amount} CS</p>
                <p className="text-xs text-gray-400">
                  {new Date(tx.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Token Distribution */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">📊 Token Distribution</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">User Rewards (80%)</span>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{width: '80%'}}></div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Founder Fee (20%)</span>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{width: '20%'}}></div>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={fetchTransparencyData}
        className="w-full btn-secondary"
      >
        🔄 Refresh Transparency Data
      </button>
    </div>
  )
}