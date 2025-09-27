import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import axios from 'axios'
import NFTGallery from '../components/NFTGallery'
import TransparencyDashboard from '../components/TransparencyDashboard'
import TokenCreator from '../components/TokenCreator'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [projects, setProjects] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { connected, publicKey } = useWallet()

  useEffect(() => {
    const alias = localStorage.getItem('userAlias')
    if (!alias) {
      router.push('/')
      return
    }
    
    fetchDashboardData(alias)
  }, [])
  
  // Save wallet connection to user profile
  useEffect(() => {
    if (connected && publicKey && user) {
      const saveWalletConnection = async () => {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
          await axios.post(`${backendUrl}/api/connect-wallet`, {
            alias: user.alias,
            walletAddress: publicKey.toString()
          })
          console.log('Wallet connected and saved')
        } catch (error) {
          console.error('Failed to save wallet connection:', error)
        }
      }
      saveWalletConnection()
    }
  }, [connected, publicKey, user])

  const fetchDashboardData = async (alias) => {
    try {
      const [userRes, projectsRes, leaderboardRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/user/${alias}`),
        axios.get(`http://localhost:5000/api/projects`),
        axios.get(`http://localhost:5000/api/leaderboard`)
      ])
      
      setUser(userRes.data)
      setProjects(projectsRes.data)
      setLeaderboard(leaderboardRes.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
    
    setLoading(false)
  }

  const findMatches = () => {
    router.push('/chatbot')
  }

  const buyProject = () => {
    router.push('/marketplace')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-black">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.alias}</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/profile')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              👤 Profile
            </button>
            <WalletMultiButton />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Stats */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
            <div className="space-y-2">
              <p><span className="font-medium">CS Balance:</span> {user?.cs_balance || 0}</p>
              <p><span className="font-medium">Interests:</span> {user?.interests}</p>
              {connected && <p><span className="font-medium">Wallet:</span> Connected</p>}
            </div>
            <button onClick={findMatches} className="btn-primary w-full mt-4">
              Find Matches
            </button>
          </div>
          
          {/* Token Creator */}
          <div className="lg:col-span-2">
            <TokenCreator />
          </div>

          {/* Projects */}
          <div className="card lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">DAO Projects</h2>
              <button onClick={buyProject} className="btn-secondary">
                Buy Project
              </button>
            </div>
            <div className="space-y-3">
              {projects.map(project => (
                <div key={project.id} className="border border-gray-200 rounded p-4">
                  <h3 className="font-medium">{project.name}</h3>
                  <p className="text-gray-600 text-sm">{project.description}</p>
                  <p className="text-xs text-gray-500 mt-1">Skills: {project.skills_needed}</p>
                </div>
              ))}
            </div>
          </div>

          {/* NFT Gallery */}
          <div className="lg:col-span-3">
            <NFTGallery />
          </div>

          {/* AI Transparency Dashboard */}
          <div className="lg:col-span-2">
            <TransparencyDashboard />
          </div>
          
          {/* Leaderboard */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">🏆 Leaderboard</h2>
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((leader, index) => (
                <div key={leader.alias} className="flex justify-between items-center p-2 border-b">
                  <span className="font-medium">#{index + 1} {leader.alias}</span>
                  <span className="text-gray-600">{leader.cs_balance} CS</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}