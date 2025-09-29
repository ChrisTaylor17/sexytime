import { useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

export default function Home() {
  const [alias, setAlias] = useState('')
  const [interests, setInterests] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!alias.trim() || !interests.trim()) return

    setLoading(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sexytime-production.up.railway.app'
      await axios.post(`${backendUrl}/api/signup`, {
        alias: alias.trim(),
        interests: interests.trim()
      })
      
      localStorage.setItem('userAlias', alias.trim())
      router.push('/dashboard')
    } catch (error) {
      console.error('Signup failed:', error)
      alert('Signup failed. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <nav className="p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold">Consilience DAO</span>
          </div>
          <div className="space-x-4">
            <button onClick={() => router.push('/features')} className="hover:text-blue-400">Features</button>
            <button onClick={() => router.push('/about')} className="hover:text-blue-400">About</button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Decentralized Innovation for Web3 Builders
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            AI-powered matchmaking, real-time collaboration, and blockchain rewards. Build the future with Consilience DAO.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-6">Join the Platform</h2>
            
            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Your Alias</label>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="alex.builder"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Skills & Interests</label>
                <textarea
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-24 resize-none"
                  placeholder="AI, blockchain, design, marketing..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Get Started'}
              </button>
            </form>

            <div className="text-center mt-6">
              <button 
                onClick={() => {
                  const existingAlias = prompt('Enter your alias:')
                  if (existingAlias) {
                    localStorage.setItem('userAlias', existingAlias)
                    router.push('/dashboard')
                  }
                }}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Already have an account? Sign in
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">🤖</span>
                <h3 className="text-lg font-semibold">AI Matching</h3>
              </div>
              <p className="text-gray-300 text-sm">Smart project and collaborator matching powered by GPT-3.5</p>
            </div>

            <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">💰</span>
                <h3 className="text-lg font-semibold">Earn Rewards</h3>
              </div>
              <p className="text-gray-300 text-sm">Get CS tokens and NFTs for completed tasks and contributions</p>
            </div>

            <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">🔗</span>
                <h3 className="text-lg font-semibold">Web3 Integration</h3>
              </div>
              <p className="text-gray-300 text-sm">Seamless Solana wallet integration for decentralized rewards</p>
            </div>

            <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">💬</span>
                <h3 className="text-lg font-semibold">Real-time Chat</h3>
              </div>
              <p className="text-gray-300 text-sm">Collaborate with team members in dedicated project rooms</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          <div className="text-center bg-gray-800/30 p-6 rounded-xl">
            <div className="text-3xl font-bold text-blue-400 mb-2">1,200+</div>
            <div className="text-sm text-gray-400">Active Users</div>
          </div>
          <div className="text-center bg-gray-800/30 p-6 rounded-xl">
            <div className="text-3xl font-bold text-blue-400 mb-2">350+</div>
            <div className="text-sm text-gray-400">Projects</div>
          </div>
          <div className="text-center bg-gray-800/30 p-6 rounded-xl">
            <div className="text-3xl font-bold text-blue-400 mb-2">50K+</div>
            <div className="text-sm text-gray-400">CS Tokens</div>
          </div>
          <div className="text-center bg-gray-800/30 p-6 rounded-xl">
            <div className="text-3xl font-bold text-blue-400 mb-2">24/7</div>
            <div className="text-sm text-gray-400">AI Support</div>
          </div>
        </div>
      </main>
    </div>
  )
}