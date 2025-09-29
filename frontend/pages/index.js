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
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'JetBrains Mono', 'Fira Code', 'Roboto Mono', monospace;
          background: linear-gradient(135deg, #1f2937 0%, #1e40af 50%, #7c3aed 100%);
          color: white;
          min-height: 100vh;
          overflow-x: hidden;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
        
        .nav {
          padding: 24px 0;
        }
        
        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .logo-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        }
        
        .logo-text {
          font-size: 20px;
          font-weight: bold;
        }
        
        .nav-links {
          display: flex;
          gap: 24px;
        }
        
        .nav-link {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
        }
        
        .nav-link:hover {
          color: #60a5fa;
        }
        
        .main {
          padding: 48px 0;
        }
        
        .hero {
          text-align: center;
          margin-bottom: 64px;
        }
        
        .hero-title {
          font-size: 56px;
          font-weight: bold;
          margin-bottom: 24px;
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1;
        }
        
        .hero-subtitle {
          font-size: 20px;
          color: rgba(255, 255, 255, 0.8);
          max-width: 600px;
          margin: 0 auto 32px;
        }
        
        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: start;
        }
        
        .signup-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 32px;
        }
        
        .signup-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 24px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
        }
        
        .input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 14px;
          font-family: inherit;
        }
        
        .input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
        
        .input:focus {
          outline: none;
          border-color: #60a5fa;
          box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
        }
        
        .textarea {
          height: 96px;
          resize: vertical;
        }
        
        .button {
          width: 100%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          font-weight: 600;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: transform 0.2s;
        }
        
        .button:hover {
          transform: translateY(-2px);
        }
        
        .button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
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
        }
        
        .features {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .feature-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
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
          font-size: 16px;
        }
        
        .feature-title {
          font-size: 18px;
          font-weight: 600;
        }
        
        .feature-description {
          color: rgba(255, 255, 255, 0.8);
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
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 24px;
          text-align: center;
        }
        
        .stat-number {
          font-size: 28px;
          font-weight: bold;
          color: #60a5fa;
          margin-bottom: 4px;
        }
        
        .stat-label {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }
        
        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          
          .hero-title {
            font-size: 36px;
          }
          
          .stats {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .nav-links {
            display: none;
          }
        }
      `}</style>
      
      <div className="container">
        <nav className="nav">
          <div className="nav-content">
            <div className="logo">
              <div className="logo-icon">C</div>
              <span className="logo-text">Consilience DAO</span>
            </div>
            <div className="nav-links">
              <button 
                onClick={() => router.push('/features')}
                className="nav-link"
              >
                Features
              </button>
              <button 
                onClick={() => router.push('/about')}
                className="nav-link"
              >
                About
              </button>
            </div>
          </div>
        </nav>

        <div className="main">
          <div className="hero">
            <h1 className="hero-title">Decentralized Innovation for Web3 Builders</h1>
            <p className="hero-subtitle">
              AI-powered matchmaking, real-time collaboration, and blockchain rewards. Build the future with Consilience DAO.
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