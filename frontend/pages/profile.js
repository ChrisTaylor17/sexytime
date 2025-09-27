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

  if (!user) return (
    <>
      <style jsx>{`
        .loading-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #475569;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    </>
  )

  return (
    <>
      <style jsx>{`
        .profile-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .nav {
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 20px 0;
        }
        .nav-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .back-button {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #cbd5e1;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
        }
        .back-button:hover {
          color: white;
        }
        .page-title {
          font-size: 28px;
          font-weight: bold;
          color: white;
          margin: 0;
        }
        .main {
          max-width: 1000px;
          margin: 0 auto;
          padding: 32px 24px;
        }
        .profile-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 40px;
          margin-bottom: 32px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .profile-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
          margin-bottom: 40px;
        }
        .avatar-section {
          position: relative;
        }
        .avatar {
          width: 128px;
          height: 128px;
          border-radius: 50%;
          overflow: hidden;
          background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 48px;
          font-weight: bold;
          box-shadow: 0 8px 32px rgba(139, 92, 246, 0.3);
        }
        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .upload-button {
          position: absolute;
          bottom: 0;
          right: 0;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          transition: all 0.2s ease;
        }
        .upload-button:hover {
          transform: scale(1.1);
        }
        .upload-input {
          display: none;
        }
        .loading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        .profile-info {
          text-align: center;
          flex: 1;
        }
        .user-name {
          font-size: 36px;
          font-weight: bold;
          color: white;
          margin-bottom: 16px;
        }
        .badges {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }
        .badge.tokens {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }
        .badge.wallet {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
        }
        .interests-section {
          margin-bottom: 32px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: white;
          margin-bottom: 16px;
        }
        .interests-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .interests-text {
          color: #cbd5e1;
          font-size: 16px;
          flex: 1;
        }
        .edit-form {
          display: flex;
          gap: 12px;
          width: 100%;
        }
        .edit-input {
          flex: 1;
          padding: 12px 16px;
          background: rgba(71, 85, 105, 0.5);
          border: 1px solid #64748b;
          border-radius: 8px;
          color: white;
          font-size: 16px;
        }
        .edit-input:focus {
          outline: none;
          border-color: #3b82f6;
        }
        .edit-input::placeholder {
          color: #94a3b8;
        }
        .button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
        }
        .button.primary {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }
        .button.secondary {
          background: rgba(107, 114, 128, 0.8);
          color: white;
        }
        .button:hover {
          transform: translateY(-1px);
        }
        .edit-button {
          background: none;
          border: none;
          color: #60a5fa;
          cursor: pointer;
          font-size: 16px;
          transition: color 0.2s;
        }
        .edit-button:hover {
          color: #93c5fd;
        }
        .wallet-section {
          text-align: center;
        }
        .funding-section {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%);
          border: 2px solid rgba(245, 158, 11, 0.3);
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 32px;
        }
        .funding-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        .funding-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        .funding-title {
          font-size: 24px;
          font-weight: bold;
          color: #fbbf24;
        }
        .funding-subtitle {
          color: #f59e0b;
          font-size: 16px;
        }
        .wallet-address-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .wallet-address-header {
          display: flex;
          justify-content: between;
          align-items: center;
          margin-bottom: 16px;
        }
        .wallet-address-label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }
        .copy-button {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .copy-button:hover {
          transform: scale(1.05);
        }
        .wallet-address {
          font-family: monospace;
          font-size: 14px;
          color: #374151;
          background: #f3f4f6;
          padding: 12px;
          border-radius: 8px;
          word-break: break-all;
        }
        .funding-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }
        .step-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
        }
        .step-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .step-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
        }
        .step-icon.devnet {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
        }
        .step-icon.mainnet {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }
        .step-title {
          font-size: 18px;
          font-weight: bold;
          color: #111827;
        }
        .step-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .step-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
          font-size: 14px;
          color: #374151;
        }
        .step-number {
          width: 20px;
          height: 20px;
          background: #e5e7eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          color: #6b7280;
          flex-shrink: 0;
        }
        .step-number.success {
          background: #10b981;
          color: white;
        }
        .faucet-link {
          color: #3b82f6;
          text-decoration: underline;
          font-weight: 600;
        }
        .faucet-link:hover {
          color: #1d4ed8;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
        }
        .stat-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 24px;
          text-align: center;
          transition: transform 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-4px);
        }
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin: 0 auto 16px;
        }
        .stat-icon.tokens {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }
        .stat-icon.nfts {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        }
        .stat-icon.projects {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        }
        .stat-number {
          font-size: 32px;
          font-weight: bold;
          color: white;
          margin-bottom: 8px;
        }
        .stat-label {
          color: #cbd5e1;
          font-size: 14px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .profile-header {
            flex-direction: column;
            text-align: center;
          }
          .funding-steps {
            grid-template-columns: 1fr;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      
      <div className="profile-page">
        {/* Navigation */}
        <nav className="nav">
          <div className="nav-content">
            <button 
              onClick={() => router.push('/dashboard')}
              className="back-button"
            >
              ← Back to Dashboard
            </button>
            <h1 className="page-title">Profile Settings</h1>
            <div style={{width: '120px'}}></div>
          </div>
        </nav>

        <div className="main">
          {/* Profile Header */}
          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar-section">
                <div className="avatar">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" />
                  ) : (
                    user.alias.charAt(0).toUpperCase()
                  )}
                </div>
                <label className="upload-button">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="upload-input"
                    disabled={uploading}
                  />
                </label>
                {uploading && (
                  <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                  </div>
                )}
              </div>

              <div className="profile-info">
                <h2 className="user-name">{user.alias}</h2>
                
                <div className="badges">
                  <div className="badge tokens">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    {user.cs_balance} CS Tokens
                  </div>
                  {connected && (
                    <div className="badge wallet">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Wallet Connected
                    </div>
                  )}
                </div>
                
                <div className="interests-section">
                  <h3 className="section-title">Skills & Expertise</h3>
                  {editing ? (
                    <div className="edit-form">
                      <input
                        type="text"
                        value={formData.interests}
                        onChange={(e) => setFormData({...formData, interests: e.target.value})}
                        className="edit-input"
                        placeholder="e.g., Full-stack development, AI/ML, Product strategy"
                      />
                      <button onClick={updateProfile} className="button primary">
                        Save
                      </button>
                      <button onClick={() => setEditing(false)} className="button secondary">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="interests-content">
                      <p className="interests-text">{user.interests}</p>
                      <button 
                        onClick={() => setEditing(true)}
                        className="edit-button"
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  )}
                </div>

                <div className="wallet-section">
                  <WalletMultiButton />
                </div>
              </div>
            </div>
          </div>

          {/* AI Wallet Funding */}
          <div className="funding-section">
            <div className="funding-header">
              <div className="funding-icon">⚡</div>
              <div>
                <h3 className="funding-title">Fund Your AI Asset Manager</h3>
                <p className="funding-subtitle">Enable your AI to create real tokens and NFTs on Solana</p>
              </div>
            </div>
            
            <div className="wallet-address-section">
              <div className="wallet-address-header">
                <span className="wallet-address-label">AI Wallet Address</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText('FcgjXDi62rzFT5eMVxQQy6WPvKLZVcRHakDYTM5E6k6W')
                    alert('✅ Address copied to clipboard!')
                  }}
                  className="copy-button"
                >
                  📋 Copy
                </button>
              </div>
              <div className="wallet-address">
                FcgjXDi62rzFT5eMVxQQy6WPvKLZVcRHakDYTM5E6k6W
              </div>
            </div>

            <div className="funding-steps">
              <div className="step-card">
                <div className="step-header">
                  <div className="step-icon devnet">DEV</div>
                  <h4 className="step-title">Devnet Testing</h4>
                </div>
                <ol className="step-list">
                  <li className="step-item">
                    <span className="step-number">1</span>
                    <span>Visit <a href="https://faucet.solana.com" target="_blank" className="faucet-link">faucet.solana.com</a></span>
                  </li>
                  <li className="step-item">
                    <span className="step-number">2</span>
                    <span>Paste the AI wallet address above</span>
                  </li>
                  <li className="step-item">
                    <span className="step-number">3</span>
                    <span>Request 2 SOL for testing</span>
                  </li>
                  <li className="step-item">
                    <span className="step-number success">✓</span>
                    <span>AI can now mint tokens/NFTs!</span>
                  </li>
                </ol>
              </div>
              
              <div className="step-card">
                <div className="step-header">
                  <div className="step-icon mainnet">LIVE</div>
                  <h4 className="step-title">Mainnet Production</h4>
                </div>
                <ol className="step-list">
                  <li className="step-item">
                    <span className="step-number">1</span>
                    <span>Send real SOL to AI wallet</span>
                  </li>
                  <li className="step-item">
                    <span className="step-number">2</span>
                    <span>Minimum 0.1 SOL recommended</span>
                  </li>
                  <li className="step-item">
                    <span className="step-number">3</span>
                    <span>AI creates real blockchain assets</span>
                  </li>
                  <li className="step-item">
                    <span className="step-number success">✓</span>
                    <span>Tokens appear in wallet instantly</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon tokens">💰</div>
              <div className="stat-number">{user.cs_balance}</div>
              <div className="stat-label">CS Tokens Earned</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon nfts">🎨</div>
              <div className="stat-number">0</div>
              <div className="stat-label">NFTs Created</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon projects">🤝</div>
              <div className="stat-number">0</div>
              <div className="stat-label">Projects Joined</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}