import { useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

export default function Signup() {
  const [alias, setAlias] = useState('')
  const [interests, setInterests] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await axios.post(`${process.env.BACKEND_URL}/api/signup`, {
        alias,
        interests
      })
      
      localStorage.setItem('userAlias', alias)
      router.push('/dashboard')
    } catch (error) {
      alert('Signup failed: ' + error.response?.data?.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-center text-black">Consilience</h1>
          <p className="mt-2 text-center text-gray-600">General-purpose DAO collaboration platform</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Alias</label>
              <input
                type="text"
                required
                className="input-field w-full"
                placeholder="e.g., Zoe.starBuilder"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Interests</label>
              <input
                type="text"
                required
                className="input-field w-full"
                placeholder="e.g., space apps"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Creating Account...' : 'Join Consilience'}
          </button>
        </form>
      </div>
    </div>
  )
}