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
          background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
          font-family: 'JetBrains Mono', 'Fira Code', 'Roboto Mono', monospace;
        }
        .nav {
          background: rgba(13, 17, 23, 0.9);
          backdrop-filter: blur(15px);
          border-bottom: 2px solid #30363d;
          padding: 16px 0;
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
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #ff6b35 0%, #f72585 100%);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: black;
          font-weight: 900;
          font-size: 14px;
          border: 2px solid #ff6b35;
        }
        .logo-text {
          color: #ff6b35;
          font-weight: 900;
          font-size: 20px;
          text-transform: uppercase;
          letter-spacing: 2px;
          text-shadow: 0 0 10px rgba(255, 107, 53, 0.3);
        }
        .nav-links {
          display: flex;
          gap: 24px;
        }
        .nav-link {
          color: #8b949e;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.2s;
        }
        .nav-link:hover {
          color: #ff6b35;
          text-shadow: 0 0 8px rgba(255, 107, 53, 0.4);
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
          font-size: 52px;
          font-weight: 900;
          color: #ff6b35;
          margin-bottom: 20px;
          line-height: 1.1;
          text-transform: uppercase;
          letter-spacing: 3px;
          text-shadow: 0 0 20px rgba(255, 107, 53, 0.4);
        }
        .hero-subtitle {
          font-size: 18px;
          color: #8b949e;
          margin-bottom: 40px;
          max-width: 650px;
          margin-left: auto;
          margin-right: auto;
          font-weight: 500;
          letter-spacing: 1px;
        }
        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: start;
        }
        .signup-card {
          background: rgba(28, 33, 40, 0.8);
          backdrop-filter: blur(15px);
          border: 2px solid #30363d;
          border-radius: 8px;
          padding: 36px;
          position: relative;
        }
        .signup-title {
          font-size: 22px;
          font-weight: 900;
          color: #ff6b35;
          margin-bottom: 28px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .label {
          display: block;
          color: #f0f6fc;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .input {
          width: 100%;
          padding: 14px 18px;
          background: #21262d;
          border: 2px solid #30363d;
          border-radius: 4px;
          color: #f0f6fc;
          font-size: 14px;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 500;
          transition: all 0.2s;
        }
        .input:focus {
          outline: none;
          border-color: #ff6b35;
          box-shadow: 0 0 15px rgba(255, 107, 53, 0.3);
        }
        .input::placeholder {
          color: #484f58;
          font-style: italic;
        }
        .textarea {
          height: 96px;
          resize: none;
        }
        .button {
          width: 100%;
          background: linear-gradient(135deg, #ff6b35 0%, #f72585 100%);
          color: black;
          font-weight: 900;
          padding: 16px 28px;
          border: 2px solid #ff6b35;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-size: 13px;
        }
        .button:hover {
          box-shadow: 0 0 20px rgba(255, 107, 53, 0.4);
          border-color: #e55a2b;
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
          color: #ff6b35;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .signin-link button:hover {
          color: #f72585;
          text-shadow: 0 0 8px rgba(255, 107, 53, 0.4);
        }
        .features {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .feature-card {
          background: rgba(28, 33, 40, 0.6);
          backdrop-filter: blur(15px);
          border: 2px solid #30363d;
          border-radius: 6px;
          padding: 28px;
          transition: all 0.2s;
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
          font-size: 16px;
          font-weight: 700;
          color: #ff6b35;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .feature-description {
          color: #8b949e;
          font-size: 13px;
          line-height: 1.4;
          font-weight: 500;
        }
        .stats {
          margin-top: 64px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .stat-card {
          background: rgba(28, 33, 40, 0.6);
          backdrop-filter: blur(15px);
          border: 2px solid #30363d;
          border-radius: 6px;
          padding: 28px;
          text-align: center;
          transition: all 0.2s;
        }
        .stat-number {
          font-size: 28px;
          font-weight: 900;
          color: #ff6b35;
          margin-bottom: 6px;
          text-shadow: 0 0 10px rgba(255, 107, 53, 0.3);
        }
        .stat-label {
          color: #8b949e;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
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