import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import axios from 'axios'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [profileImage, setProfileImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({ interests: '' })
  const { connected, publicKey } = useWallet()
  const router = useRouter()

  useEffect(() => {
    const alias = localStorage.getItem('userAlias')
    if (!alias) {
      router.push('/')
      return
    }
    fetchUserData(alias)
  }, [])

  const fetchUserData = async (alias) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
      const response = await axios.get(`${backendUrl}/api/user/${alias}`)
      setUser(response.data)
      setFormData({ interests: response.data.interests })
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      // Convert to base64 for demo (in production, use proper image hosting)
      const reader = new FileReader()
      reader.onload = async () => {
        const imageData = reader.result
        setProfileImage(imageData)
        
        // Save to backend
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
        await axios.post(`${backendUrl}/api/update-profile`, {
          alias: user.alias,
          profileImage: imageData
        })
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Image upload failed:', error)
    }
    setUploading(false)
  }

  const updateProfile = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
      await axios.post(`${backendUrl}/api/update-profile`, {
        alias: user.alias,
        interests: formData.interests
      })
      setUser({ ...user, interests: formData.interests })
      setEditing(false)
    } catch (error) {
      console.error('Profile update failed:', error)
    }
  }

  if (!user) return <div className="loading">Loading profile...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-white hover:text-purple-300 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <div></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              
              {/* Profile Image */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-white text-4xl font-bold">
                      {user.alias.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full cursor-pointer transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-white mb-2">{user.alias}</h2>
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                    💰 {user.cs_balance} CS Tokens
                  </div>
                  {connected && (
                    <div className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                      🔗 Wallet Connected
                    </div>
                  )}
                </div>
                
                {/* Interests */}
                <div className="mb-4">
                  <label className="block text-purple-300 text-sm font-medium mb-2">Interests & Skills</label>
                  {editing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.interests}
                        onChange={(e) => setFormData({...formData, interests: e.target.value})}
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50"
                        placeholder="e.g., blockchain, AI, design"
                      />
                      <button onClick={updateProfile} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                        Save
                      </button>
                      <button onClick={() => setEditing(false)} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-white/80">{user.interests}</p>
                      <button 
                        onClick={() => setEditing(true)}
                        className="text-purple-300 hover:text-purple-200 transition-colors"
                      >
                        ✏️
                      </button>
                    </div>
                  )}
                </div>

                {/* Wallet Connection */}
                <div className="mb-4">
                  <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700" />
                </div>
              </div>
            </div>
          </div>

          {/* Funding Instructions */}
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-2xl border border-orange-300/30 p-6 mb-8">
            <h3 className="text-xl font-bold text-orange-300 mb-4">🚀 Fund Your AI Asset Manager</h3>
            <div className="space-y-4 text-white/90">
              <p>To enable your AI to create real tokens and NFTs on Solana, fund this wallet:</p>
              
              <div className="bg-black/30 rounded-lg p-4 border border-orange-300/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-orange-300 font-medium">AI Wallet Address:</span>
                  <button 
                    onClick={() => navigator.clipboard.writeText('FcgjXDi62rzFT5eMVxQQy6WPvKLZVcRHakDYTM5E6k6W')}
                    className="text-orange-300 hover:text-orange-200 transition-colors"
                  >
                    📋 Copy
                  </button>
                </div>
                <code className="text-orange-200 text-sm break-all">
                  FcgjXDi62rzFT5eMVxQQy6WPvKLZVcRHakDYTM5E6k6W
                </code>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-black/20 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-300 mb-2">📱 For Devnet Testing:</h4>
                  <ol className="text-sm space-y-1">
                    <li>1. Visit <a href="https://faucet.solana.com" target="_blank" className="text-blue-300 hover:underline">faucet.solana.com</a></li>
                    <li>2. Paste the AI wallet address</li>
                    <li>3. Request 2 SOL for testing</li>
                    <li>4. Your AI can now mint tokens/NFTs!</li>
                  </ol>
                </div>
                
                <div className="bg-black/20 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-300 mb-2">💰 For Mainnet Production:</h4>
                  <ol className="text-sm space-y-1">
                    <li>1. Send real SOL to the AI wallet</li>
                    <li>2. Minimum 0.1 SOL recommended</li>
                    <li>3. AI will create real blockchain assets</li>
                    <li>4. Tokens appear in your wallet instantly</li>
                  </ol>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-300/20 rounded-lg p-4">
                <p className="text-green-300 text-sm">
                  ✅ <strong>Why fund the AI wallet?</strong> Your AI assistant needs SOL to pay transaction fees when creating tokens and NFTs on the Solana blockchain. Once funded, it can mint assets directly to your connected wallet!
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 text-center">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-2xl font-bold text-white">{user.cs_balance}</div>
              <div className="text-white/60">CS Tokens Earned</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 text-center">
              <div className="text-3xl mb-2">🎨</div>
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-white/60">NFTs Created</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 text-center">
              <div className="text-3xl mb-2">🤝</div>
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-white/60">Projects Joined</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}