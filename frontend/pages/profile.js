import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import axios from 'axios'

// Updated profile page with better design - v2
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
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sexytime-production.up.railway.app'
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
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sexytime-production.up.railway.app'
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
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sexytime-production.up.railway.app'
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-indigo-100">
        <div className="container mx-auto px-6 py-5 flex justify-between items-center">
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Profile</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-10 mb-10">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10">
              
              {/* Profile Image */}
              <div className="relative group">
                <div className="w-48 h-48 rounded-full overflow-hidden bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl ring-4 ring-white/50">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-white text-6xl font-bold drop-shadow-lg">
                      {user.alias.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <label className="absolute bottom-3 right-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-4 rounded-full cursor-pointer transition-all duration-300 shadow-xl hover:scale-110">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">{user.alias}</h2>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
                  <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg">
                    💰 {user.cs_balance} CS Tokens
                  </div>
                  {connected && (
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg">
                      🔗 Wallet Connected
                    </div>
                  )}
                </div>
                
                {/* Interests */}
                <div className="mb-8">
                  <label className="block text-gray-800 text-lg font-bold mb-4">Interests & Skills</label>
                  {editing ? (
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={formData.interests}
                        onChange={(e) => setFormData({...formData, interests: e.target.value})}
                        className="flex-1 px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                        placeholder="e.g., blockchain, AI, design"
                      />
                      <button onClick={updateProfile} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all">
                        Save
                      </button>
                      <button onClick={() => setEditing(false)} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <p className="text-gray-700 text-xl font-medium">{user.interests}</p>
                      <button 
                        onClick={() => setEditing(true)}
                        className="text-indigo-600 hover:text-indigo-800 transition-colors font-semibold"
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  )}
                </div>

                {/* Wallet Connection */}
                <div className="mb-6">
                  <WalletMultiButton className="!bg-gradient-to-r !from-indigo-600 !to-purple-600 hover:!from-indigo-700 hover:!to-purple-700 !rounded-xl !px-8 !py-4 !font-semibold !text-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* AI Wallet Funding Instructions */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-3xl p-8 mb-10 shadow-xl">
            <h3 className="text-2xl font-bold text-orange-800 mb-6 flex items-center gap-3">
              🚀 Fund Your AI Asset Manager
              <span className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">Required</span>
            </h3>
            <div className="space-y-4">
              <p className="text-gray-700">To enable your AI to create real tokens and NFTs on Solana, fund this wallet:</p>
              
              <div className="bg-white rounded-2xl p-6 border-2 border-orange-200 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-orange-800 font-bold text-lg">AI Wallet Address:</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText('FcgjXDi62rzFT5eMVxQQy6WPvKLZVcRHakDYTM5E6k6W')
                      alert('✅ Address copied to clipboard!')
                    }}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
                  >
                    📋 Copy Address
                  </button>
                </div>
                <code className="text-orange-700 text-lg break-all bg-gradient-to-r from-orange-100 to-red-100 p-4 rounded-xl block font-mono font-bold">
                  FcgjXDi62rzFT5eMVxQQy6WPvKLZVcRHakDYTM5E6k6W
                </code>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
                  <h4 className="font-bold text-blue-800 mb-4 text-lg flex items-center gap-2">
                    📱 For Devnet Testing
                    <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs">FREE</span>
                  </h4>
                  <ol className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                      <span>Visit <a href="https://faucet.solana.com" target="_blank" className="text-blue-600 hover:underline font-semibold">faucet.solana.com</a></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                      <span>Paste the AI wallet address</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                      <span>Request 2 SOL for testing</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">✓</span>
                      <span className="font-semibold text-green-700">Your AI can now mint tokens/NFTs!</span>
                    </li>
                  </ol>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg">
                  <h4 className="font-bold text-green-800 mb-4 text-lg flex items-center gap-2">
                    💰 For Mainnet Production
                    <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs">REAL</span>
                  </h4>
                  <ol className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                      <span>Send real SOL to the AI wallet</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                      <span>Minimum 0.1 SOL recommended</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                      <span>AI creates real blockchain assets</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">✓</span>
                      <span className="font-semibold text-purple-700">Tokens appear in your wallet instantly!</span>
                    </li>
                  </ol>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg">
                <p className="text-green-800 text-lg font-medium">
                  ✅ <strong>Why fund the AI wallet?</strong> Your AI assistant needs SOL to pay transaction fees when creating tokens and NFTs on the Solana blockchain. Once funded, it can mint assets directly to your connected wallet!
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-8 text-center shadow-2xl border-2 border-yellow-200 hover:scale-105 transition-transform">
              <div className="text-6xl mb-4">🏆</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">{user.cs_balance}</div>
              <div className="text-gray-700 font-semibold text-lg">CS Tokens Earned</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 text-center shadow-2xl border-2 border-purple-200 hover:scale-105 transition-transform">
              <div className="text-6xl mb-4">🎨</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">0</div>
              <div className="text-gray-700 font-semibold text-lg">NFTs Created</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 text-center shadow-2xl border-2 border-blue-200 hover:scale-105 transition-transform">
              <div className="text-6xl mb-4">🤝</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">0</div>
              <div className="text-gray-700 font-semibold text-lg">Projects Joined</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}