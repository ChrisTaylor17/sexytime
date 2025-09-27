import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Tokens() {
  const [userTokens, setUserTokens] = useState([]);
  const [userAlias, setUserAlias] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newToken, setNewToken] = useState({
    name: '',
    symbol: '',
    description: '',
    supply: 1000000,
    projectId: ''
  });
  const [projects, setProjects] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const alias = localStorage.getItem('userAlias');
    if (!alias) {
      router.push('/');
      return;
    }
    setUserAlias(alias);
    fetchUserTokens();
    fetchProjects();
  }, [router]);

  const fetchUserTokens = async () => {
    try {
      // Try backend first, fallback to localStorage
      try {
        const response = await fetch(`https://sexytime-production.up.railway.app/api/user-tokens/${userAlias}`);
        if (response.ok) {
          const data = await response.json();
          setUserTokens(data.tokens || []);
          return;
        }
      } catch (backendError) {
        console.log('Backend unavailable, using localStorage');
      }
      
      // Fallback to localStorage
      const storedTokens = JSON.parse(localStorage.getItem(`tokens_${userAlias}`) || '[]');
      setUserTokens(storedTokens);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('https://sexytime-production.up.railway.app/api/projects');
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const createToken = async () => {
    if (!newToken.name || !newToken.symbol) {
      alert('Please fill in token name and symbol');
      return;
    }

    try {
      try {
        // Try backend first
        const response = await fetch('https://sexytime-production.up.railway.app/api/create-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newToken,
            creator: userAlias,
            aiWallet: 'FcgjXDi62rzFT5eMVxQQy6WPvKLZVcRHakDYTM5E6k6W'
          })
        });
        
        if (response.ok) {
          alert(`Token "${newToken.name}" (${newToken.symbol}) created successfully!`);
          setShowCreateForm(false);
          setNewToken({ name: '', symbol: '', description: '', supply: 1000000, projectId: '' });
          fetchUserTokens();
          return;
        }
      } catch (backendError) {
        console.log('Backend unavailable, using localStorage');
      }
      
      // Fallback to localStorage
      const mockToken = {
        id: Date.now(),
        name: newToken.name,
        symbol: newToken.symbol,
        description: newToken.description,
        supply: newToken.supply,
        creator: userAlias,
        balance: Math.floor(newToken.supply * 0.8),
        created_at: new Date().toISOString()
      };
      
      const existingTokens = JSON.parse(localStorage.getItem(`tokens_${userAlias}`) || '[]');
      existingTokens.push(mockToken);
      localStorage.setItem(`tokens_${userAlias}`, JSON.stringify(existingTokens));
      
      alert(`Token "${newToken.name}" (${newToken.symbol}) created successfully!`);
      setShowCreateForm(false);
      setNewToken({ name: '', symbol: '', description: '', supply: 1000000, projectId: '' });
      fetchUserTokens();
    } catch (error) {
      console.error('Error creating token:', error);
      alert('Failed to create token. Please try again.');
    }
  };

  const distributeTokens = async (tokenId) => {
    try {
      await fetch('https://sexytime-production.up.railway.app/api/distribute-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId,
          distributor: userAlias
        })
      });
      fetchUserTokens();
    } catch (error) {
      console.error('Error distributing tokens:', error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
            Token Manager
          </h1>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            color: 'white',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          + Create Token
        </button>
      </div>

      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Create Token Modal */}
        {showCreateForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              padding: '30px',
              borderRadius: '15px',
              border: '1px solid rgba(255,255,255,0.1)',
              width: '90%',
              maxWidth: '500px'
            }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>Create New Token</h2>
              
              <input
                type="text"
                placeholder="Token Name (e.g., MyProject Token)"
                value={newToken.name}
                onChange={(e) => setNewToken({...newToken, name: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '15px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
              
              <input
                type="text"
                placeholder="Token Symbol (e.g., MPT)"
                value={newToken.symbol}
                onChange={(e) => setNewToken({...newToken, symbol: e.target.value.toUpperCase()})}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '15px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
              
              <textarea
                placeholder="Token Description"
                value={newToken.description}
                onChange={(e) => setNewToken({...newToken, description: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '15px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  minHeight: '60px',
                  resize: 'vertical'
                }}
              />
              
              <input
                type="number"
                placeholder="Total Supply"
                value={newToken.supply}
                onChange={(e) => setNewToken({...newToken, supply: parseInt(e.target.value)})}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '15px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
              
              <select
                value={newToken.projectId}
                onChange={(e) => setNewToken({...newToken, projectId: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '20px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="">Select Project (Optional)</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowCreateForm(false)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={createToken}
                  disabled={!newToken.name || !newToken.symbol}
                  style={{
                    background: (!newToken.name || !newToken.symbol) 
                      ? 'rgba(255,255,255,0.1)' 
                      : 'linear-gradient(135deg, #22c55e, #16a34a)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    color: 'white',
                    cursor: (!newToken.name || !newToken.symbol) ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    opacity: (!newToken.name || !newToken.symbol) ? 0.5 : 1
                  }}
                >
                  Create Token
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tokens Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          {userTokens.map((token) => (
            <div
              key={token.id}
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '15px',
                padding: '20px'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '15px'
              }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                  {token.name}
                </h3>
                <span style={{
                  background: 'rgba(34, 197, 94, 0.2)',
                  color: '#22c55e',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {token.symbol}
                </span>
              </div>
              
              <p style={{
                margin: '0 0 15px 0',
                fontSize: '14px',
                opacity: 0.8,
                lineHeight: '1.5'
              }}>
                {token.description}
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '20px'
              }}>
                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '5px' }}>
                    Total Supply
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#3b82f6' }}>
                    {token.supply?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                <div style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '5px' }}>
                    Your Balance
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#22c55e' }}>
                    {token.balance?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '10px'
              }}>
                <button
                  onClick={() => distributeTokens(token.id)}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Distribute
                </button>
                <button
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {userTokens.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            opacity: 0.6
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🪙</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>No tokens yet</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Create your first token to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}