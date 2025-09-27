import { useRouter } from 'next/router';

export default function Features() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              color: 'white',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            ← Back to Home
          </button>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '800',
            margin: '0 0 20px 0',
            background: 'linear-gradient(135deg, #a855f7, #3b82f6, #22c55e)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Platform Features
          </h1>
          <p style={{ fontSize: '20px', opacity: 0.8, maxWidth: '600px', margin: '0 auto' }}>
            Discover how Consilience is revolutionizing collaboration and transforming the global economy
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '30px',
          marginBottom: '80px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '30px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              fontSize: '24px'
            }}>
              🤖
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 15px 0' }}>
              AI-Powered Matchmaking
            </h3>
            <p style={{ fontSize: '16px', opacity: 0.8, lineHeight: '1.6' }}>
              Advanced AI connects you with perfect collaborators and projects based on your skills and interests
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '30px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              fontSize: '24px'
            }}>
              💰
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 15px 0' }}>
              Automatic Rewards
            </h3>
            <p style={{ fontSize: '16px', opacity: 0.8, lineHeight: '1.6' }}>
              Fair token and NFT distribution based on contributions. 80% to contributors, 20% to platform
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '30px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              fontSize: '24px'
            }}>
              💬
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 15px 0' }}>
              Real-time Workrooms
            </h3>
            <p style={{ fontSize: '16px', opacity: 0.8, lineHeight: '1.6' }}>
              Collaborate seamlessly with WebSocket-powered chat and project management tools
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '30px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              fontSize: '24px'
            }}>
              🎨
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 15px 0' }}>
              NFT Achievements
            </h3>
            <p style={{ fontSize: '16px', opacity: 0.8, lineHeight: '1.6' }}>
              Earn unique NFT badges for milestones and build a verifiable portfolio of achievements
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '30px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #ec4899, #be185d)',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              fontSize: '24px'
            }}>
              🚀
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 15px 0' }}>
              Project Marketplace
            </h3>
            <p style={{ fontSize: '16px', opacity: 0.8, lineHeight: '1.6' }}>
              Discover, join, or trade projects. Buy into successful initiatives with CS tokens
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '30px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              fontSize: '24px'
            }}>
              📱
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 15px 0' }}>
              Event Integration
            </h3>
            <p style={{ fontSize: '16px', opacity: 0.8, lineHeight: '1.6' }}>
              QR check-ins at events automatically reward attendance and connect participants
            </p>
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.02)',
          padding: '60px 40px',
          borderRadius: '20px',
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            margin: '0 0 20px 0',
            background: 'linear-gradient(135deg, #22c55e, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Transforming the Global Economy
          </h2>
          <p style={{
            fontSize: '18px',
            opacity: 0.8,
            maxWidth: '600px',
            margin: '0 auto 40px auto',
            lineHeight: '1.6'
          }}>
            By removing barriers and creating transparent value distribution, we're building 
            the foundation for a more equitable and efficient global economy.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '30px',
            marginTop: '40px'
          }}>
            <div>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#22c55e', marginBottom: '10px' }}>
                Zero
              </div>
              <div style={{ fontSize: '16px', opacity: 0.8 }}>
                Barriers to Entry
              </div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#3b82f6', marginBottom: '10px' }}>
                100%
              </div>
              <div style={{ fontSize: '16px', opacity: 0.8 }}>
                Transparent Distribution
              </div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#a855f7', marginBottom: '10px' }}>
                Infinite
              </div>
              <div style={{ fontSize: '16px', opacity: 0.8 }}>
                Collaboration Possibilities
              </div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#f59e0b', marginBottom: '10px' }}>
                24/7
              </div>
              <div style={{ fontSize: '16px', opacity: 0.8 }}>
                Global Accessibility
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 20px 0' }}>
            Ready to Shape the Future?
          </h2>
          <p style={{
            fontSize: '16px',
            opacity: 0.8,
            margin: '0 0 30px 0',
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Join innovators who are transforming how we collaborate and create value together.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Start Collaborating Now →
          </button>
        </div>
      </div>
    </div>
  );
}