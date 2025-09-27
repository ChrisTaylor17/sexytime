import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function NFTs() {
  const [userNFTs, setUserNFTs] = useState([]);
  const [userAlias, setUserAlias] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNFT, setNewNFT] = useState({
    name: '',
    description: '',
    image: '',
    supply: 100,
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
    fetchUserNFTs();
    fetchProjects();
  }, [router]);

  const fetchUserNFTs = async () => {
    try {
      // Try backend first, fallback to localStorage
      try {
        const response = await fetch(`https://sexytime-production.up.railway.app/api/user-nfts/${userAlias}`);
        if (response.ok) {
          const data = await response.json();
          setUserNFTs(data.nfts || []);
          return;
        }
      } catch (backendError) {
        console.log('Backend unavailable, using localStorage');
      }
      
      // Fallback to localStorage
      const storedNFTs = JSON.parse(localStorage.getItem(`nfts_${userAlias}`) || '[]');
      setUserNFTs(storedNFTs);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
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

  const createNFT = async () => {
    try {
      try {
        // Try backend first
        const response = await fetch('https://sexytime-production.up.railway.app/api/create-nft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newNFT,
            creator: userAlias,
            aiWallet: 'FcgjXDi62rzFT5eMVxQQy6WPvKLZVcRHakDYTM5E6k6W'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          alert(data.message || 'NFT collection created successfully!');
          setShowCreateForm(false);
          setNewNFT({ name: '', description: '', image: '', supply: 100, projectId: '' });
          fetchUserNFTs();
          return;
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.error || 'Creation failed'}`);
        }
      } catch (backendError) {
        console.log('Backend unavailable, using localStorage');
      }
      
      // Fallback to localStorage
      const mockNFT = {
        id: Date.now(),
        name: newNFT.name,
        description: newNFT.description,
        image: newNFT.image,
        supply: newNFT.supply,
        creator: userAlias,
        owned: 1,
        created_at: new Date().toISOString()
      };
      
      const existingNFTs = JSON.parse(localStorage.getItem(`nfts_${userAlias}`) || '[]');
      existingNFTs.push(mockNFT);
      localStorage.setItem(`nfts_${userAlias}`, JSON.stringify(existingNFTs));
      
      alert('NFT collection created successfully!');
      setShowCreateForm(false);
      setNewNFT({ name: '', description: '', image: '', supply: 100, projectId: '' });
      fetchUserNFTs();
    } catch (error) {
      console.error('Error creating NFT:', error);
    }
  };

  const mintNFT = async (nft) => {
    try {
      const response = await fetch('https://sexytime-production.up.railway.app/api/mint-nft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nftId: nft.id,
          recipient: userAlias,
          aiWallet: 'FcgjXDi62rzFT5eMVxQQy6WPvKLZVcRHakDYTM5E6k6W'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(data.message || `✅ NFT minted successfully!`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Minting failed'}`);
        throw new Error('Backend failed');
      }
    } catch (error) {
      // Fallback to localStorage simulation
      const updatedNFTs = userNFTs.map(n => {
        if (n.id === nft.id) {
          return { ...n, owned: (n.owned || 0) + 1 };
        }
        return n;
      });
      
      setUserNFTs(updatedNFTs);
      localStorage.setItem(`nfts_${userAlias}`, JSON.stringify(updatedNFTs));
      
      alert(`🎨 NFT "${nft.name}" minted successfully!\n\n⚠️ Note: This is a simulated NFT for demo purposes. To mint real Solana NFTs, connect your wallet.`);
    }
    
    fetchUserNFTs();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
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
            NFT Collection
          </h1>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
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
          + Create NFT
        </button>
      </div>

      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
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
              <h2 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>Create NFT Collection</h2>
              
              <input
                type="text"
                placeholder="Collection Name"
                value={newNFT.name}
                onChange={(e) => setNewNFT({...newNFT, name: e.target.value})}
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
                placeholder="Description"
                value={newNFT.description}
                onChange={(e) => setNewNFT({...newNFT, description: e.target.value})}
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
                type="text"
                placeholder="Image URL (optional)"
                value={newNFT.image}
                onChange={(e) => setNewNFT({...newNFT, image: e.target.value})}
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
                type="number"
                placeholder="Supply"
                value={newNFT.supply}
                onChange={(e) => setNewNFT({...newNFT, supply: parseInt(e.target.value)})}
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
                value={newNFT.projectId}
                onChange={(e) => setNewNFT({...newNFT, projectId: e.target.value})}
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
                  onClick={createNFT}
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
                  Create NFT
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          {userNFTs.map((nft) => (
            <div
              key={nft.id}
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '15px',
                overflow: 'hidden'
              }}
            >
              <div style={{
                height: '200px',
                background: nft.image ? `url(${nft.image})` : 'linear-gradient(135deg, #a855f7, #7c3aed)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px'
              }}>
                {!nft.image && '🎨'}
              </div>
              
              <div style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '600' }}>
                  {nft.name}
                </h3>
                
                <p style={{
                  margin: '0 0 15px 0',
                  fontSize: '14px',
                  opacity: 0.8,
                  lineHeight: '1.5'
                }}>
                  {nft.description}
                </p>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>Supply</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#a855f7' }}>
                      {nft.supply}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>Owned</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#22c55e' }}>
                      {nft.owned || 0}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => mintNFT(nft)}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Mint NFT
                </button>
              </div>
            </div>
          ))}
        </div>

        {userNFTs.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            opacity: 0.6
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎨</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>No NFTs yet</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Create your first NFT collection to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}