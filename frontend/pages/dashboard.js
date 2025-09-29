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
  const [sidebarOpen, setSidebarOpen] = useState(true)
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
  
  useEffect(() => {
    if (connected && publicKey && user) {
      const saveWalletConnection = async () => {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sexytime-production.up.railway.app'
          await axios.post(`${backendUrl}/api/connect-wallet`, {
            alias: user.alias,
            walletAddress: publicKey.toString()
          })
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
        axios.get(`https://sexytime-production.up.railway.app/api/user/${alias}`),
        axios.get(`https://sexytime-production.up.railway.app/api/projects`),
        axios.get(`https://sexytime-production.up.railway.app/api/leaderboard`)
      ])
      
      setUser(userRes.data)
      setProjects(projectsRes.data)
      setLeaderboard(leaderboardRes.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
    
    setLoading(false)
  }

  if (loading) return (
    <>
      <style jsx>{`
        .loading-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
          font-family: 'JetBrains Mono', 'Fira Code', 'Roboto Mono', monospace;
        }
        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .spinner {
          width: 52px;
          height: 52px;
          border: 4px solid #30363d;
          border-top: 4px solid #ff6b35;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          box-shadow: 0 0 15px rgba(255, 107, 53, 0.3);
        }
        .loading-text {
          color: #ff6b35;
          font-weight: 700;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner"></div>
          <p className="loading-text">Loading your workspace...</p>
        </div>
      </div>
    </>
  )

  return (
    <>
      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
          display: flex;
          font-family: 'JetBrains Mono', 'Fira Code', 'Roboto Mono', monospace;
        }
        .sidebar {
          width: ${sidebarOpen ? '300px' : '80px'};
          background: rgba(13, 17, 23, 0.9);
          backdrop-filter: blur(25px);
          border-right: 2px solid #30363d;
          flex-shrink: 0;
          transition: width 0.2s ease;
        }
        .sidebar-content {
          padding: 24px;
        }
        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        .logo {
          display: ${sidebarOpen ? 'block' : 'none'};
          transition: all 0.3s ease;
        }
        .logo-title {
          font-size: 26px;
          font-weight: 900;
          color: #ff6b35;
          text-transform: uppercase;
          letter-spacing: 2px;
          text-shadow: 0 0 15px rgba(255, 107, 53, 0.4);
        }
        .logo-subtitle {
          color: #8b949e;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .sidebar-toggle {
          padding: 14px;
          background: rgba(255, 107, 53, 0.1);
          border: 2px solid #30363d;
          border-radius: 4px;
          color: #ff6b35;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .sidebar-toggle:hover {
          background: rgba(255, 107, 53, 0.2);
          border-color: #ff6b35;
          box-shadow: 0 0 10px rgba(255, 107, 53, 0.3);
        }
        .nav {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          padding: 18px;
          border-radius: 4px;
          color: #8b949e;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
          border: 2px solid transparent;
          background: none;
          width: 100%;
          text-align: left;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .nav-item.active {
          background: linear-gradient(135deg, #ff6b35 0%, #f72585 100%);
          color: black;
          border-color: #ff6b35;
          font-weight: 900;
        }
        .nav-item:hover:not(.active) {
          background: rgba(255, 107, 53, 0.1);
          color: #ff6b35;
          border-color: #ff6b35;
        }
        .nav-icon {
          width: 28px;
          height: 28px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 18px;
          background: rgba(255, 107, 53, 0.2);
          border: 1px solid rgba(255, 107, 53, 0.3);
        }
        .nav-text {
          display: ${sidebarOpen ? 'block' : 'none'};
          font-weight: 500;
        }
        .user-info {
          position: absolute;
          bottom: 24px;
          left: 24px;
          right: 24px;
          display: ${sidebarOpen ? 'flex' : 'none'};
          align-items: center;
          padding: 18px;
          background: rgba(28, 33, 40, 0.8);
          backdrop-filter: blur(15px);
          border-radius: 6px;
          border: 2px solid #30363d;
        }
        .user-avatar {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #ff6b35 0%, #f72585 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: black;
          font-weight: 900;
          margin-right: 14px;
          border: 2px solid #ff6b35;
        }
        .user-details {
          flex: 1;
          min-width: 0;
        }
        .user-name {
          color: #f0f6fc;
          font-weight: 700;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .user-balance {
          color: #ff6b35;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: ${connected ? '#238636' : '#da3633'};
          border: 2px solid ${connected ? '#238636' : '#da3633'};
          box-shadow: 0 0 8px ${connected ? 'rgba(35, 134, 54, 0.5)' : 'rgba(218, 54, 51, 0.5)'};
        }
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .header {
          background: rgba(13, 17, 23, 0.9);
          backdrop-filter: blur(25px);
          border-bottom: 2px solid #30363d;
          padding: 28px 36px;
        }
        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .greeting {
          font-size: 36px;
          font-weight: 900;
          color: #ff6b35;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 2px;
          text-shadow: 0 0 15px rgba(255, 107, 53, 0.4);
        }
        .status {
          display: flex;
          align-items: center;
          gap: 14px;
          color: #8b949e;
        }
        .status-indicator {
          width: 10px;
          height: 10px;
          background: #238636;
          border-radius: 50%;
          animation: pulse 2s infinite;
          box-shadow: 0 0 8px rgba(35, 134, 54, 0.5);
        }
        .status-text {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .content {
          flex: 1;
          padding: 32px;
          overflow: auto;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }
        .stat-card {
          background: linear-gradient(135deg, #ff6b35 0%, #f72585 100%);
          border-radius: 6px;
          padding: 28px;
          color: black;
          box-shadow: 0 12px 30px rgba(255, 107, 53, 0.3);
          transition: all 0.2s ease;
          border: 2px solid #ff6b35;
        }
        .stat-card:hover {
          box-shadow: 0 15px 35px rgba(255, 107, 53, 0.4);
          border-color: #e55a2b;
        }
        .stat-card.blue {
          background: linear-gradient(135deg, #da3633 0%, #b91c1c 100%);
          box-shadow: 0 12px 30px rgba(218, 54, 51, 0.3);
          border-color: #da3633;
        }
        .stat-card.purple {
          background: linear-gradient(135deg, #fb8500 0%, #e85d04 100%);
          box-shadow: 0 12px 30px rgba(251, 133, 0, 0.3);
          border-color: #fb8500;
        }
        .stat-card.orange {
          background: linear-gradient(135deg, #238636 0%, #166534 100%);
          box-shadow: 0 12px 30px rgba(35, 134, 54, 0.3);
          border-color: #238636;
        }
        .stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .stat-icon {
          width: 52px;
          height: 52px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          border: 2px solid rgba(0, 0, 0, 0.3);
        }
        .stat-badge {
          font-size: 11px;
          font-weight: 900;
          background: rgba(0, 0, 0, 0.2);
          padding: 6px 14px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 1px;
          border: 1px solid rgba(0, 0, 0, 0.3);
        }
        .stat-number {
          font-size: 40px;
          font-weight: 900;
          margin-bottom: 6px;
          text-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        }
        .stat-label {
          opacity: 0.8;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 32px;
        }
        .left-column {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .right-column {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .card {
          background: rgba(28, 33, 40, 0.8);
          backdrop-filter: blur(25px);
          border-radius: 8px;
          border: 2px solid #30363d;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }
        .card-header {
          padding: 28px;
          border-bottom: 2px solid #30363d;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .card-title-group {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .card-icon {
          width: 52px;
          height: 52px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          border: 2px solid rgba(255, 107, 53, 0.3);
        }
        .card-title {
          font-size: 18px;
          font-weight: 900;
          color: #ff6b35;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .card-subtitle {
          color: #8b949e;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .card-button {
          background: linear-gradient(135deg, #ff6b35 0%, #f72585 100%);
          color: black;
          font-weight: 900;
          padding: 14px 28px;
          border: 2px solid #ff6b35;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 12px;
        }
        .card-button:hover {
          box-shadow: 0 6px 15px rgba(255, 107, 53, 0.4);
          border-color: #e55a2b;
        }
        .card-content {
          padding: 28px;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 1024px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .sidebar {
            width: ${sidebarOpen ? '100%' : '80px'};
            position: ${sidebarOpen ? 'fixed' : 'relative'};
            z-index: 50;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .greeting {
            font-size: 24px;
          }
        }
      `}</style>
      
      <div className="dashboard">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-content">
            <div className="sidebar-header">
              <div className="logo">
                <h1 className="logo-title">Consilience</h1>
                <p className="logo-subtitle">DAO Platform</p>
              </div>
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="sidebar-toggle"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <nav className="nav">
              <div className="nav-item active">
                <div className="nav-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  </svg>
                </div>
                <span className="nav-text">Dashboard</span>
              </div>
              
              <button 
                onClick={() => router.push('/profile')}
                className="nav-item"
              >
                <div className="nav-icon" style={{background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'}}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="nav-text">Profile</span>
              </button>

              <button 
                onClick={() => router.push('/projects')}
                className="nav-item"
              >
                <div className="nav-icon" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="nav-text">Projects</span>
              </button>

              <button 
                onClick={() => router.push('/tokens')}
                className="nav-item"
              >
                <div className="nav-icon" style={{background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="nav-text">Tokens</span>
              </button>

              <button 
                onClick={() => router.push('/nfts')}
                className="nav-item"
              >
                <div className="nav-icon" style={{background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)'}}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="nav-text">NFTs</span>
              </button>

              <button 
                onClick={() => router.push('/tasks')}
                className="nav-item"
              >
                <div className="nav-icon" style={{background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="nav-text">🤖 AI Tasks</span>
              </button>

              <button 
                onClick={() => router.push('/chatbot')}
                className="nav-item"
              >
                <div className="nav-icon" style={{background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'}}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="nav-text">AI Chat</span>
              </button>
            </nav>

            <div className="user-info">
              <div className="user-avatar">
                {user?.alias?.charAt(0)?.toUpperCase()}
              </div>
              <div className="user-details">
                <p className="user-name">{user?.alias}</p>
                <p className="user-balance">{user?.cs_balance} CS</p>
              </div>
              <div className="status-dot"></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Header */}
          <div className="header">
            <div className="header-content">
              <div className="header-left">
                <div>
                  <h2 className="greeting">Good morning, {user?.alias}</h2>
                  <div className="status">
                    <div className="status-indicator"></div>
                    <span className="status-text">All systems operational</span>
                  </div>
                </div>
              </div>
              <div>
                <WalletMultiButton />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="content">
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon">💰</div>
                  <span className="stat-badge">+12%</span>
                </div>
                <div className="stat-number">{user?.cs_balance || 0}</div>
                <div className="stat-label">CS Token Balance</div>
              </div>

              <div className="stat-card blue">
                <div className="stat-header">
                  <div className="stat-icon">📊</div>
                  <span className="stat-badge">Active</span>
                </div>
                <div className="stat-number">{projects.length}</div>
                <div className="stat-label">Available Projects</div>
              </div>

              <div className="stat-card purple">
                <div className="stat-header">
                  <div className="stat-icon">🎨</div>
                  <span className="stat-badge">New</span>
                </div>
                <div className="stat-number">0</div>
                <div className="stat-label">NFTs Collected</div>
              </div>

              <div className="stat-card orange">
                <div className="stat-header">
                  <div className="stat-icon">⚡</div>
                  <div className="status-dot"></div>
                </div>
                <div className="stat-number">{connected ? 'Connected' : 'Disconnected'}</div>
                <div className="stat-label">Wallet Status</div>
              </div>
            </div>

            {/* Main Grid */}
            <div className="main-grid">
              {/* Left Column */}
              <div className="left-column">
                {/* Token Creator */}
                <div className="card">
                  <div className="card-header">
                    <div className="card-title-group">
                      <div className="card-icon" style={{background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
                        💰
                      </div>
                      <div>
                        <h3 className="card-title">Token Creator</h3>
                        <p className="card-subtitle">Create custom tokens on Solana</p>
                      </div>
                    </div>
                    <button className="card-button">
                      Launch Token
                    </button>
                  </div>
                  <div className="card-content">
                    <TokenCreator />
                  </div>
                </div>

                {/* Projects */}
                <div className="card">
                  <div className="card-header">
                    <div className="card-title-group">
                      <div className="card-icon" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
                        📊
                      </div>
                      <div>
                        <h3 className="card-title">Active Projects</h3>
                        <p className="card-subtitle">Collaborate on DAO initiatives</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => router.push('/chatbot')}
                      className="card-button"
                    >
                      Find Matches
                    </button>
                  </div>
                  <div className="card-content">
                    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                      {projects.slice(0, 4).map((project, index) => (
                        <div key={project.id} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '16px',
                          padding: '16px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            background: `linear-gradient(135deg, ${
                              index % 4 === 0 ? '#ff6b35, #f72585' :
                              index % 4 === 1 ? '#da3633, #b91c1c' :
                              index % 4 === 2 ? '#fb8500, #e85d04' :
                              '#238636, #166534'
                            })`,
                            border: '2px solid #30363d',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'black',
                            fontWeight: '900',
                            fontSize: '18px'
                          }}>
                            {project.name.charAt(0)}
                          </div>
                          <div style={{flex: 1, minWidth: 0}}>
                            <h4 style={{fontWeight: '900', color: '#ff6b35', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '14px'}}>{project.name}</h4>
                            <p style={{color: '#8b949e', fontSize: '13px', marginBottom: '14px', fontWeight: '500'}}>{project.description}</p>
                            <div>
                              <span style={{
                                fontSize: '11px',
                                background: 'rgba(255, 107, 53, 0.1)',
                                color: '#ff6b35',
                                padding: '6px 14px',
                                borderRadius: '4px',
                                border: '2px solid rgba(255, 107, 53, 0.3)',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                              }}>
                                {project.skills_needed}
                              </span>
                            </div>
                          </div>
                          <button style={{
                            color: '#ff6b35',
                            background: 'none',
                            border: '2px solid #ff6b35',
                            borderRadius: '4px',
                            padding: '8px 16px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            fontSize: '11px'
                          }}>
                            Join →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="right-column">
                {/* Leaderboard */}
                <div className="card">
                  <div className="card-header">
                    <div className="card-title-group">
                      <div className="card-icon" style={{background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
                        🏆
                      </div>
                      <div>
                        <h3 className="card-title">Top Contributors</h3>
                        <p className="card-subtitle">Community leaderboard</p>
                      </div>
                    </div>
                  </div>
                  <div className="card-content">
                    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                      {leaderboard.slice(0, 5).map((leader, index) => (
                        <div key={leader.alias} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          padding: '12px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '12px'
                        }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            background: index === 0 ? 'linear-gradient(135deg, #ff6b35, #f72585)' :
                                       index === 1 ? 'linear-gradient(135deg, #da3633, #b91c1c)' :
                                       index === 2 ? 'linear-gradient(135deg, #fb8500, #e85d04)' :
                                       'linear-gradient(135deg, #238636, #166534)',
                            border: '2px solid #30363d',
                            color: 'black',
                            fontWeight: '900'
                          }}>
                            {index + 1}
                          </div>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: `linear-gradient(135deg, ${
                              index % 3 === 0 ? '#ff6b35, #f72585' :
                              index % 3 === 1 ? '#da3633, #b91c1c' :
                              '#fb8500, #e85d04'
                            })`,
                            border: '2px solid #30363d',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'black',
                            fontWeight: '900'
                          }}>
                            {leader.alias.charAt(0).toUpperCase()}
                          </div>
                          <div style={{flex: 1, minWidth: 0}}>
                            <p style={{fontWeight: '900', color: '#ff6b35', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px'}}>{leader.alias}</p>
                            <p style={{color: '#8b949e', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase'}}>{leader.cs_balance} CS</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* NFT Gallery */}
                <div className="card">
                  <div className="card-header">
                    <div className="card-title-group">
                      <div className="card-icon" style={{background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'}}>
                        🎨
                      </div>
                      <div>
                        <h3 className="card-title">NFT Collection</h3>
                        <p className="card-subtitle">Your achievement badges</p>
                      </div>
                    </div>
                  </div>
                  <div className="card-content">
                    <NFTGallery />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}