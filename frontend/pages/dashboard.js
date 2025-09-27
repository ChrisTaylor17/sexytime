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
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #475569;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        .loading-text {
          color: #cbd5e1;
          font-weight: 500;
          font-size: 18px;
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
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          display: flex;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .sidebar {
          width: ${sidebarOpen ? '288px' : '80px'};
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
          transition: width 0.3s ease;
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
          font-size: 24px;
          font-weight: bold;
          background: linear-gradient(135deg, #a855f7 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .logo-subtitle {
          color: #a855f7;
          font-size: 14px;
        }
        .sidebar-toggle {
          padding: 12px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .sidebar-toggle:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }
        .nav {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          padding: 16px;
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }
        .nav-item.active {
          background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
          color: white;
        }
        .nav-item:hover:not(.active) {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        .nav-icon {
          width: 24px;
          height: 24px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          background: rgba(255, 255, 255, 0.2);
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
          padding: 16px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .user-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          margin-right: 12px;
        }
        .user-details {
          flex: 1;
          min-width: 0;
        }
        .user-name {
          color: white;
          font-weight: 600;
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .user-balance {
          color: #a855f7;
          font-size: 12px;
        }
        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${connected ? '#10b981' : '#ef4444'};
        }
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .header {
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 24px 32px;
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
          font-size: 32px;
          font-weight: bold;
          color: white;
          margin-bottom: 4px;
        }
        .status {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #a855f7;
        }
        .status-indicator {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        .status-text {
          font-size: 14px;
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
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 16px;
          padding: 24px;
          color: white;
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.25);
          transition: transform 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-4px);
        }
        .stat-card.blue {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.25);
        }
        .stat-card.purple {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          box-shadow: 0 10px 25px rgba(139, 92, 246, 0.25);
        }
        .stat-card.orange {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          box-shadow: 0 10px 25px rgba(245, 158, 11, 0.25);
        }
        .stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .stat-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        .stat-badge {
          font-size: 12px;
          font-weight: bold;
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 12px;
          border-radius: 20px;
        }
        .stat-number {
          font-size: 36px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .stat-label {
          opacity: 0.9;
          font-size: 14px;
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
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .card-header {
          padding: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        .card-title {
          font-size: 20px;
          font-weight: bold;
          color: white;
        }
        .card-subtitle {
          color: #a855f7;
          font-size: 14px;
        }
        .card-button {
          background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
          color: white;
          font-weight: 600;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .card-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
        }
        .card-content {
          padding: 24px;
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
                <span className="nav-text">AI Tasks</span>
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
                              index % 4 === 0 ? '#3b82f6, #2563eb' :
                              index % 4 === 1 ? '#10b981, #059669' :
                              index % 4 === 2 ? '#8b5cf6, #7c3aed' :
                              '#f59e0b, #d97706'
                            })`,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '18px'
                          }}>
                            {project.name.charAt(0)}
                          </div>
                          <div style={{flex: 1, minWidth: 0}}>
                            <h4 style={{fontWeight: 'bold', color: 'white', marginBottom: '8px'}}>{project.name}</h4>
                            <p style={{color: '#a855f7', fontSize: '14px', marginBottom: '12px'}}>{project.description}</p>
                            <div>
                              <span style={{
                                fontSize: '12px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: '#a855f7',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                              }}>
                                {project.skills_needed}
                              </span>
                            </div>
                          </div>
                          <button style={{
                            color: '#a855f7',
                            background: 'none',
                            border: 'none',
                            fontWeight: '600',
                            cursor: 'pointer'
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
                            background: index === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                                       index === 1 ? 'linear-gradient(135deg, #6b7280, #4b5563)' :
                                       index === 2 ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                                       'linear-gradient(135deg, #3b82f6, #2563eb)',
                            color: 'white'
                          }}>
                            {index + 1}
                          </div>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: `linear-gradient(135deg, ${
                              index % 3 === 0 ? '#3b82f6, #2563eb' :
                              index % 3 === 1 ? '#10b981, #059669' :
                              '#8b5cf6, #7c3aed'
                            })`,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold'
                          }}>
                            {leader.alias.charAt(0).toUpperCase()}
                          </div>
                          <div style={{flex: 1, minWidth: 0}}>
                            <p style={{fontWeight: 'bold', color: 'white', fontSize: '14px'}}>{leader.alias}</p>
                            <p style={{color: '#a855f7', fontSize: '12px'}}>{leader.cs_balance} CS tokens</p>
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