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
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Consilience DAO</h1>
          <p className="text-white/80">AI-powered collaboration platform</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Choose Your Alias
            </label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Zoe.starBuilder"
              required
            />
          </div>

          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Your Interests & Skills
            </label>
            <textarea
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
              placeholder="e.g., blockchain, AI, design, engineering"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Join the DAO'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm">
            Already have an account?{' '}
            <button 
              onClick={() => {
                const existingAlias = prompt('Enter your alias:')
                if (existingAlias) {
                  localStorage.setItem('userAlias', existingAlias)
                  router.push('/dashboard')
                }
              }}
              className="text-purple-300 hover:text-purple-200 underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}