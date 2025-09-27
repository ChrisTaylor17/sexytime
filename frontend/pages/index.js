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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Consilience DAO</h1>
          <p className="text-gray-600">AI-powered collaboration platform</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Alias
            </label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="input-field w-full"
              placeholder="e.g., Zoe.starBuilder"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Interests & Skills
            </label>
            <textarea
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="input-field w-full h-20 resize-none"
              placeholder="e.g., blockchain, AI, design"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Creating Account...' : 'Join DAO'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button 
            onClick={() => {
              const existingAlias = prompt('Enter your alias:')
              if (existingAlias) {
                localStorage.setItem('userAlias', existingAlias)
                router.push('/dashboard')
              }
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Already have an account? Sign In
          </button>
        </div>
      </div>
    </div>
  )
}