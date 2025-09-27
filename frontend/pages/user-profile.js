import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import axios from 'axios'

export default function UserProfile() {
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
      const reader = new FileReader()
      reader.onload = async () => {
        const imageData = reader.result
        setProfileImage(imageData)
        
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl border-b-4 border-purple-200">
        <div className="container mx-auto px-6 py-6 flex justify-between items-center">
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-3 text-purple-700 hover:text-purple-900 font-bold text-lg transition-all hover:scale-105"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            User Profile
          </h1>
          <div className="w-32"></div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Main Profile Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border-4 border-white/30 p-12 mb-12 hover:shadow-3xl transition-all duration-500">
            <div className="flex flex-col xl:flex-row items-center xl:items-start gap-12">
              
              {/* Profile Image Section */}
              <div className="relative group">
                <div className="w-56 h-56 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl ring-8 ring-white/60 group-hover:ring-purple-200 transition-all duration-500">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-white text-7xl font-black drop-shadow-2xl">
                      {user.alias.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <label className="absolute bottom-4 right-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white p-5 rounded-full cursor-pointer transition-all duration-300 shadow-2xl hover:scale-125 group-hover:rotate-12">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
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
                  <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-8 border-white border-t-transparent"></div>
                  </div>
                )}
              </div>

              {/* Profile Info Section */}
              <div className="flex-1 text-center xl:text-left">
                <h2 className="text-6xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8 leading-tight">
                  {user.alias}
                </h2>
                
                <div className="flex flex-wrap justify-center xl:justify-start gap-6 mb-10">
                  <div className="bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-xl hover:scale-110 transition-transform">
                    💰 {user.cs_balance} CS Tokens
                  </div>
                  {connected && (
                    <div className="bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-xl hover:scale-110 transition-transform">
                      🔗 Wallet Connected
                    </div>
                  )}
                </div>
                
                {/* Interests Section */}
                <div className="mb-10">
                  <label className="block text-gray-800 text-2xl font-black mb-6">Interests & Skills</label>
                  {editing ? (
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={formData.interests}
                        onChange={(e) => setFormData({...formData, interests: e.target.value})}
                        className="flex-1 px-6 py-4 border-4 border-purple-200 rounded-2xl focus:border-purple-500 focus:outline-none transition-all text-lg"
                        placeholder="e.g., blockchain, AI, design"
                      />
                      <button onClick={updateProfile} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105">
                        Save
                      </button>
                      <button onClick={() => setEditing(false)} className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-6">
                      <p className="text-gray-700 text-2xl font-semibold">{user.interests}</p>
                      <button 
                        onClick={() => setEditing(true)}
                        className="text-purple-600 hover:text-purple-800 transition-colors font-bold text-xl hover:scale-110 transition-transform"
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  )}
                </div>

                {/* Wallet Connection */}
                <div className="mb-8">
                  <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !via-blue-600 !to-indigo-600 hover:!from-purple-700 hover:!via-blue-700 hover:!to-indigo-700 !rounded-2xl !px-12 !py-5 !font-bold !text-xl !shadow-xl hover:!scale-105 !transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* AI Wallet Funding Section */}
          <div className="bg-gradient-to-r from-orange-100 via-red-50 to-pink-100 border-4 border-orange-300 rounded-[2rem] p-10 mb-12 shadow-2xl">
            <h3 className="text-3xl font-black text-orange-800 mb-8 flex items-center gap-4">
              🚀 Fund Your AI Asset Manager
              <span className="bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold animate-pulse">REQUIRED</span>
            </h3>
            
            <div className="space-y-8">
              <p className="text-gray-800 text-xl font-semibold">To enable your AI to create real tokens and NFTs on Solana, fund this wallet:</p>
              
              <div className="bg-white rounded-3xl p-8 border-4 border-orange-300 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-orange-800 font-black text-2xl">AI Wallet Address:</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText('FcgjXDi62rzFT5eMVxQQy6WPvKLZVcRHakDYTM5E6k6W')
                      alert('✅ Address copied to clipboard!')
                    }}
                    className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-700 hover:via-red-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all hover:scale-110 shadow-xl"
                  >
                    📋 Copy Address
                  </button>
                </div>
                <code className="text-orange-800 text-xl break-all bg-gradient-to-r from-orange-200 via-red-200 to-pink-200 p-6 rounded-2xl block font-mono font-black">
                  FcgjXDi62rzFT5eMVxQQy6WPvKLZVcRHakDYTM5E6k6W
                </code>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-8 border-4 border-blue-300 shadow-xl">
                  <h4 className="font-black text-blue-800 mb-6 text-2xl flex items-center gap-3">
                    📱 For Devnet Testing
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">FREE</span>
                  </h4>
                  <ol className="space-y-4 text-gray-800">
                    <li className="flex items-start gap-4">
                      <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold">1</span>
                      <span className="text-lg">Visit <a href="https://faucet.solana.com" target="_blank" className="text-blue-700 hover:underline font-bold">faucet.solana.com</a></span>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold">2</span>
                      <span className="text-lg">Paste the AI wallet address</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold">3</span>
                      <span className="text-lg">Request 2 SOL for testing</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold">✓</span>
                      <span className="text-lg font-bold text-green-700">Your AI can now mint tokens/NFTs!</span>
                    </li>
                  </ol>
                </div>
                
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl p-8 border-4 border-green-300 shadow-xl">
                  <h4 className="font-black text-green-800 mb-6 text-2xl flex items-center gap-3">
                    💰 For Mainnet Production
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">REAL</span>
                  </h4>
                  <ol className="space-y-4 text-gray-800">
                    <li className="flex items-start gap-4">
                      <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold">1</span>
                      <span className="text-lg">Send real SOL to the AI wallet</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold">2</span>
                      <span className="text-lg">Minimum 0.1 SOL recommended</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold">3</span>
                      <span className="text-lg">AI creates real blockchain assets</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold">✓</span>
                      <span className="text-lg font-bold text-purple-700">Tokens appear in your wallet instantly!</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-[2rem] p-10 text-center shadow-2xl border-4 border-yellow-300 hover:scale-110 transition-all duration-500 hover:rotate-2">
              <div className="text-8xl mb-6">🏆</div>
              <div className="text-5xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">{user.cs_balance}</div>
              <div className="text-gray-800 font-bold text-xl">CS Tokens Earned</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-[2rem] p-10 text-center shadow-2xl border-4 border-purple-300 hover:scale-110 transition-all duration-500 hover:rotate-2">
              <div className="text-8xl mb-6">🎨</div>
              <div className="text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">0</div>
              <div className="text-gray-800 font-bold text-xl">NFTs Created</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-[2rem] p-10 text-center shadow-2xl border-4 border-blue-300 hover:scale-110 transition-all duration-500 hover:rotate-2">
              <div className="text-8xl mb-6">🤝</div>
              <div className="text-5xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">0</div>
              <div className="text-gray-800 font-bold text-xl">Projects Joined</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}