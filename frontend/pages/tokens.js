import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Tokens() {
  const [userTokens, setUserTokens] = useState([]);
  const [userAlias, setUserAlias] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
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
    
    // Get wallet address from localStorage
    const wallet = localStorage.getItem('walletAddress') || '';
    setWalletAddress(wallet);
    
    fetchUserTokens(alias);
    fetchProjects();
  }, [router]);

  const fetchUserTokens = async (alias) => {
    if (!alias) return;
    try {
      const response = await fetch(`https://sexytime-production.up.railway.app/api/user-tokens/${alias}`);
      if (response.ok) {
        const data = await response.json();
        setUserTokens(data.tokens || []);
      } else {
        console.error('Failed to fetch tokens from backend');
        setUserTokens([]);
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
      setUserTokens([]);
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

    // Check if wallet is connected
    if (!walletAddress) {
      alert('Please connect your wallet first!');
      return;
    }

    try {
      // Create real Solana token
      const response = await fetch('https://sexytime-production.up.railway.app/api/create-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newToken.name,
          symbol: newToken.symbol,
          supply: newToken.supply,
          description: newToken.description,
          projectId: newToken.projectId,
          walletAddress: walletAddress
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`🎉 Real Solana Token Created!\n\nToken: ${newToken.name} (${newToken.symbol})\nMint Address: ${data.mintAddress}\nExplorer: ${data.explorerUrl}`);
        setShowCreateForm(false);
        setNewToken({ name: '', symbol: '', description: '', supply: 1000000, projectId: '' });
        fetchUserTokens(userAlias);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Token creation failed');
      }
    } catch (error) {
      console.error('Error creating token:', error);
      alert(`❌ Token creation failed: ${error.message}\n\nMake sure the AI wallet has enough SOL for transaction fees.`);
    }
  };

  const distributeTokens = async (token) => {
    const recipients = prompt('Enter wallet addresses (comma separated):');
    if (!recipients) return;
    
    const addresses = recipients.split(',').map(addr => addr.trim()).filter(addr => addr);
    if (addresses.length === 0) {
      alert('No valid addresses provided');
      return;
    }
    
    const amountPerRecipient = prompt(`Enter amount per recipient (max ${token.balance?.toLocaleString() || 0}):`);
    if (!amountPerRecipient || isNaN(amountPerRecipient)) {
      alert('Invalid amount');
      return;
    }
    
    const amount = parseInt(amountPerRecipient);
    const totalAmount = amount * addresses.length;
    
    if (totalAmount > (token.balance || 0)) {
      alert('Insufficient balance');
      return;
    }
    
    try {
      const response = await fetch('https://sexytime-production.up.railway.app/api/distribute-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId: token.id,
          distributor: userAlias,
          recipients: addresses,
          amount: amount
        })
      });
      
      if (response.ok) {
        alert(`✅ Distributed ${amount.toLocaleString()} ${token.symbol} to ${addresses.length} recipients`);
        fetchUserTokens(userAlias); // Refresh tokens
      } else {
        const errorData = await response.json();
        alert(`❌ Distribution failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error distributing tokens:', error);
      alert(`❌ Distribution failed: ${error.message}`);
    }
  };
  
  const viewTokenDetails = (token) => {
    const details = `Token Details:\n\nName: ${token.name}\nSymbol: ${token.symbol}\nTotal Supply: ${token.supply?.toLocaleString() || 'N/A'}\nYour Balance: ${token.balance?.toLocaleString() || '0'}\nCreated: ${new Date(token.created_at).toLocaleDateString()}\n\n${token.description || 'No description'}`;
    
    alert(details);
  };

  const connectWallet = () => {
    // Simple wallet connection simulation
    const demoWallet = 'FcgjXDi62rzFT5eMVxQQy6WPvKLZVcRHakDYTM5E6k6W';
    localStorage.setItem('walletAddress', demoWallet);
    setWalletAddress(demoWallet);
    alert('Demo wallet connected! You can now create tokens.');
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
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {walletAddress ? (
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              color: '#22c55e'
            }}>
              🟢 {walletAddress.slice(0, 8)}...{walletAddress.slice(-4)}
            </div>
          ) : (
            <button
              onClick={connectWallet}
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Connect Wallet
            </button>
          )}
          <button
            onClick={() => router.push('/nfts')}
            style={{
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🔗 Real Tokens (NFT Page)
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={!walletAddress}
            style={{
              background: !walletAddress 
                ? 'rgba(255,255,255,0.1)' 
                : 'linear-gradient(135deg, #22c55e, #16a34a)',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              color: 'white',
              cursor: !walletAddress ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              opacity: !walletAddress ? 0.5 : 1
            }}
          >
            + Create Token
          </button>
        </div>
      </div>

      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Token Status */}
        <div style={{
          background: walletAddress ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          border: walletAddress ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '12px',
          padding: '15px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '20px' }}>{walletAddress ? '🚀' : '⚠️'}</span>
          <div>
            <div style={{ fontWeight: '600', color: walletAddress ? '#22c55e' : '#f59e0b', marginBottom: '5px' }}>
              {walletAddress ? 'Ready to Create Real Solana Tokens' : 'Connect Wallet to Create Tokens'}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>
              {walletAddress 
                ? 'Creates actual SPL tokens on Solana devnet blockchain. Tokens appear in explorers and wallets.' 
                : 'Connect your wallet to create real SPL tokens on Solana blockchain.'}
            </div>
          </div>
        </div>
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
                  onClick={() => distributeTokens(token)}
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
                  onClick={() => viewTokenDetails(token)}
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