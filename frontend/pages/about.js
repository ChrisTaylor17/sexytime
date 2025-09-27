import { useRouter } from 'next/router';

export default function About() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
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
            background: 'linear-gradient(135deg, #a855f7, #3b82f6, #22c55e, #f59e0b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            About Consilience
          </h1>
          <p style={{ fontSize: '20px', opacity: 0.9, lineHeight: '1.7' }}>
            We believe the future belongs to those who can connect, create, and collaborate 
            without boundaries. Consilience is more than a platform—it's a movement toward 
            a more equitable, transparent, and innovative global economy.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center',
          marginBottom: '80px'
        }}>
          <div>
            <h3 style={{
              fontSize: '32px',
              fontWeight: '700',
              margin: '0 0 25px 0',
              color: '#a855f7'
            }}>
              Our Vision
            </h3>
            <p style={{
              fontSize: '18px',
              lineHeight: '1.7',
              opacity: 0.9,
              marginBottom: '20px'
            }}>
              Imagine a world where your next breakthrough collaboration is just one AI conversation away. 
              Where your contributions are automatically and fairly rewarded. Where geographic boundaries 
              dissolve and the best ideas rise to the top through pure merit.
            </p>
            <p style={{
              fontSize: '18px',
              lineHeight: '1.7',
              opacity: 0.9
            }}>
              We're architecting the infrastructure for humanity's next evolutionary leap in how we work, 
              create, and prosper together.
            </p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🌍</div>
            <h4 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 15px 0' }}>
              Global Impact
            </h4>
            <p style={{ fontSize: '16px', opacity: 0.8, lineHeight: '1.6' }}>
              Connecting minds across continents, cultures, and disciplines to solve 
              humanity's greatest challenges through collaborative innovation.
            </p>
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.02)',
          padding: '60px 40px',
          borderRadius: '20px',
          marginBottom: '80px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px'
          }}>
            <div>
              <h3 style={{
                fontSize: '28px',
                fontWeight: '700',
                margin: '0 0 25px 0',
                color: '#ef4444'
              }}>
                The Problem We're Solving
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  padding: '20px',
                  borderRadius: '12px',
                  borderLeft: '4px solid #ef4444'
                }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 10px 0' }}>
                    Broken Discovery
                  </h4>
                  <p style={{ fontSize: '14px', opacity: 0.8, margin: 0, lineHeight: '1.6' }}>
                    Talented people struggle to find meaningful collaborations, while great projects 
                    fail due to lack of the right team members.
                  </p>
                </div>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  padding: '20px',
                  borderRadius: '12px',
                  borderLeft: '4px solid #ef4444'
                }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 10px 0' }}>
                    Unfair Value Distribution
                  </h4>
                  <p style={{ fontSize: '14px', opacity: 0.8, margin: 0, lineHeight: '1.6' }}>
                    Traditional systems concentrate wealth at the top, leaving contributors 
                    undervalued and unmotivated.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 style={{
                fontSize: '28px',
                fontWeight: '700',
                margin: '0 0 25px 0',
                color: '#22c55e'
              }}>
                Our Revolutionary Solution
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  padding: '20px',
                  borderRadius: '12px',
                  borderLeft: '4px solid #22c55e'
                }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 10px 0' }}>
                    AI-Powered Matching
                  </h4>
                  <p style={{ fontSize: '14px', opacity: 0.8, margin: 0, lineHeight: '1.6' }}>
                    Advanced algorithms create perfect collaborations that would never happen by chance.
                  </p>
                </div>
                <div style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  padding: '20px',
                  borderRadius: '12px',
                  borderLeft: '4px solid #22c55e'
                }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 10px 0' }}>
                    Transparent Blockchain Rewards
                  </h4>
                  <p style={{ fontSize: '14px', opacity: 0.8, margin: 0, lineHeight: '1.6' }}>
                    Smart contracts automatically distribute tokens based on actual contributions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h3 style={{
            fontSize: '32px',
            fontWeight: '700',
            margin: '0 0 25px 0',
            background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            A New Economic Paradigm
          </h3>
          <p style={{
            fontSize: '18px',
            lineHeight: '1.7',
            opacity: 0.9,
            margin: '0 0 40px 0',
            maxWidth: '700px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            We're pioneering a fundamental shift from scarcity-based competition to abundance-based 
            collaboration. Success is measured by what you contribute, not what you extract.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '30px',
            marginTop: '40px'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '25px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '15px' }}>⚖️</div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 10px 0' }}>
                Equity by Design
              </h4>
              <p style={{ fontSize: '14px', opacity: 0.8, lineHeight: '1.5' }}>
                Fair compensation based on actual contributions, verified by blockchain technology.
              </p>
            </div>
            
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '25px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '15px' }}>🔄</div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 10px 0' }}>
                Circular Value Creation
              </h4>
              <p style={{ fontSize: '14px', opacity: 0.8, lineHeight: '1.5' }}>
                Value flows back to contributors, creating sustainable incentives for innovation.
              </p>
            </div>
            
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '25px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '15px' }}>🌱</div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 10px 0' }}>
                Regenerative Growth
              </h4>
              <p style={{ fontSize: '14px', opacity: 0.8, lineHeight: '1.5' }}>
                Success of one project seeds the next, creating an ever-expanding ecosystem.
              </p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 20px 0' }}>
            The Future is Collaborative
          </h2>
          <p style={{
            fontSize: '16px',
            opacity: 0.8,
            margin: '0 0 30px 0',
            lineHeight: '1.6',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Join us in building an economy where everyone wins, where the best ideas flourish, 
            and where human potential knows no bounds.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
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
              Start Building →
            </button>
            <button
              onClick={() => router.push('/features')}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                padding: '16px 32px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              Explore Features
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}