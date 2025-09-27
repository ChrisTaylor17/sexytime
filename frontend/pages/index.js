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
    <>
      <style jsx>{`
        .container {
          min-height: 100vh;
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .nav {
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #475569;
          padding: 12px 0;
        }
        .nav-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .logo-icon {
          width: 28px;
          height: 28px;
          background: #3b82f6;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        }
        .logo-text {
          color: white;
          font-weight: 600;
          font-size: 18px;
        }
        .nav-links {
          display: flex;
          gap: 24px;
        }
        .nav-link {
          color: #cbd5e1;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s;
        }
        .nav-link:hover {
          color: white;
        }
        .main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px 16px;
        }
        .hero {
          text-align: center;
          margin-bottom: 64px;
        }
        .hero-title {
          font-size: 48px;
          font-weight: bold;
          color: white;
          margin-bottom: 16px;
          line-height: 1.1;
        }
        .hero-subtitle {
          font-size: 20px;
          color: #cbd5e1;
          margin-bottom: 32px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: start;
        }
        .signup-card {
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid #475569;
          border-radius: 16px;
          padding: 32px;
        }
        .signup-title {
          font-size: 24px;
          font-weight: bold;
          color: white;
          margin-bottom: 24px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .label {
          display: block;
          color: #cbd5e1;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
        }
        .input {
          width: 100%;
          padding: 12px 16px;
          background: #475569;
          border: 1px solid #64748b;
          border-radius: 8px;
          color: white;
          font-size: 14px;
          transition: border-color 0.2s;
        }
        .input:focus {
          outline: none;
          border-color: #3b82f6;
        }
        .input::placeholder {
          color: #94a3b8;
        }
        .textarea {
          height: 96px;
          resize: none;
        }
        .button {
          width: 100%;
          background: #3b82f6;
          color: white;
          font-weight: 600;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .button:hover {
          background: #2563eb;
        }
        .button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .signin-link {
          text-align: center;
          margin-top: 24px;
        }
        .signin-link button {
          background: none;
          border: none;
          color: #60a5fa;
          font-size: 14px;
          cursor: pointer;
          transition: color 0.2s;
        }
        .signin-link button:hover {
          color: #93c5fd;
        }
        .features {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .feature-card {
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(10px);
          border: 1px solid #475569;
          border-radius: 12px;
          padding: 24px;
        }
        .feature-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .feature-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        .feature-title {
          font-size: 18px;
          font-weight: 600;
          color: white;
        }
        .feature-description {
          color: #cbd5e1;
          font-size: 14px;
          line-height: 1.5;
        }
        .stats {
          margin-top: 64px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .stat-card {
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(10px);
          border: 1px solid #475569;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
        }
        .stat-number {
          font-size: 24px;
          font-weight: bold;
          color: white;
          margin-bottom: 4px;
        }
        .stat-label {
          color: #94a3b8;
          font-size: 14px;
        }
        @media (max-width: 1024px) {
          .content-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .hero-title {
            font-size: 36px;
          }
          .nav-links {
            display: none;
          }
          .stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      
      <div className="container">
        <nav className="nav">
          <div className="nav-content">
            <div className="logo">
              <div className="logo-icon">C</div>
              <span className="logo-text">Consilience</span>
            </div>
            <div className="nav-links">
              <button 
                onClick={() => router.push('/features')}
                className="nav-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Features
              </button>
              <button 
                onClick={() => router.push('/about')}
                className="nav-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                About
              </button>
            </div>
          </div>
        </nav>

        <div className="main">
          <div className="hero">
            <h1 className="hero-title">AI-Powered DAO Platform</h1>
            <p className="hero-subtitle">
              Connect, collaborate, and earn rewards in the decentralized economy
            </p>
          </div>

          <div className="content-grid">
            <div className="signup-card">
              <h2 className="signup-title">Join the Platform</h2>
              
              <form onSubmit={handleSignup}>
                <div className="form-group">
                  <label className="label">Your Alias</label>
                  <input
                    type="text"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    className="input"
                    placeholder="alex.builder"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label">Skills & Interests</label>
                  <textarea
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    className="input textarea"
                    placeholder="AI, blockchain, design, marketing..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="button"
                >
                  {loading ? 'Creating Account...' : 'Get Started'}
                </button>
              </form>

              <div className="signin-link">
                <button 
                  onClick={() => {
                    const existingAlias = prompt('Enter your alias:')
                    if (existingAlias) {
                      localStorage.setItem('userAlias', existingAlias)
                      router.push('/dashboard')
                    }
                  }}
                >
                  Already have an account? Sign in
                </button>
              </div>
            </div>

            <div className="features">
              <div className="feature-card">
                <div className="feature-header">
                  <div className="feature-icon" style={{background: '#8b5cf6'}}>🤖</div>
                  <h3 className="feature-title">AI Matching</h3>
                </div>
                <p className="feature-description">Smart project and collaborator matching powered by GPT-3.5</p>
              </div>

              <div className="feature-card">
                <div className="feature-header">
                  <div className="feature-icon" style={{background: '#10b981'}}>💰</div>
                  <h3 className="feature-title">Earn Rewards</h3>
                </div>
                <p className="feature-description">Get CS tokens and NFTs for completed tasks and contributions</p>
              </div>

              <div className="feature-card">
                <div className="feature-header">
                  <div className="feature-icon" style={{background: '#3b82f6'}}>🔗</div>
                  <h3 className="feature-title">Web3 Integration</h3>
                </div>
                <p className="feature-description">Seamless Solana wallet integration for decentralized rewards</p>
              </div>

              <div className="feature-card">
                <div className="feature-header">
                  <div className="feature-icon" style={{background: '#f59e0b'}}>💬</div>
                  <h3 className="feature-title">Real-time Chat</h3>
                </div>
                <p className="feature-description">Collaborate with team members in dedicated project rooms</p>
              </div>
            </div>
          </div>

          <div className="stats">
            <div className="stat-card">
              <div className="stat-number">1,200+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">350+</div>
              <div className="stat-label">Projects</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">50K+</div>
              <div className="stat-label">CS Tokens</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">24/7</div>
              <div className="stat-label">AI Support</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}