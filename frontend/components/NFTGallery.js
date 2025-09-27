import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import axios from 'axios'

export default function NFTGallery() {
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(false)
  const { connected, publicKey } = useWallet()

  const fetchNFTs = async () => {
    if (!connected || !publicKey) return
    
    setLoading(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sexytime-production.up.railway.app'
      const response = await axios.get(`${backendUrl}/api/nfts/${publicKey.toString()}`)
      setNfts(response.data || [])
    } catch (error) {
      console.error('Failed to fetch NFTs:', error)
      setNfts([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchNFTs()
  }, [connected, publicKey])

  return (
    <>
      <style jsx>{`
        .nft-gallery {
          color: white;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .title {
          font-size: 18px;
          font-weight: bold;
          color: white;
          margin: 0;
        }
        .refresh-button {
          background: rgba(139, 92, 246, 0.2);
          border: 1px solid rgba(139, 92, 246, 0.4);
          color: #a78bfa;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .refresh-button:hover {
          background: rgba(139, 92, 246, 0.3);
          border-color: rgba(139, 92, 246, 0.6);
        }
        .refresh-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .content {
          text-align: center;
        }
        .empty-state {
          padding: 40px 20px;
        }
        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.6;
        }
        .empty-title {
          font-size: 16px;
          font-weight: 600;
          color: #cbd5e1;
          margin-bottom: 8px;
        }
        .empty-description {
          font-size: 14px;
          color: #94a3b8;
          line-height: 1.5;
        }
        .nft-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 16px;
        }
        .nft-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .nft-card:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(139, 92, 246, 0.4);
          transform: translateY(-2px);
        }
        .nft-image {
          width: 100%;
          height: 96px;
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin-bottom: 8px;
        }
        .nft-name {
          font-size: 12px;
          font-weight: 600;
          color: white;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .nft-description {
          font-size: 10px;
          color: #94a3b8;
          line-height: 1.3;
        }
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: #94a3b8;
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(139, 92, 246, 0.3);
          border-top: 2px solid #8b5cf6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 12px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .connect-wallet {
          padding: 40px 20px;
          text-align: center;
        }
        .connect-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.6;
        }
        .connect-title {
          font-size: 16px;
          font-weight: 600;
          color: #cbd5e1;
          margin-bottom: 8px;
        }
        .connect-description {
          font-size: 14px;
          color: #94a3b8;
        }
      `}</style>
      
      <div className="nft-gallery">
        <div className="header">
          <h3 className="title">Your NFT Collection</h3>
          <button 
            onClick={fetchNFTs}
            disabled={loading || !connected}
            className="refresh-button"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div className="content">
          {!connected ? (
            <div className="connect-wallet">
              <div className="connect-icon">🔗</div>
              <div className="connect-title">Connect Your Wallet</div>
              <div className="connect-description">
                Connect your wallet to view your NFT collection
              </div>
            </div>
          ) : loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <span>Loading your NFTs...</span>
            </div>
          ) : nfts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎨</div>
              <div className="empty-title">No NFTs found</div>
              <div className="empty-description">
                Complete tasks to earn NFT certificates!<br />
                Your achievement badges will appear here.
              </div>
            </div>
          ) : (
            <div className="nft-grid">
              {nfts.map((nft, index) => (
                <div key={index} className="nft-card">
                  <div className="nft-image">
                    {nft.image ? (
                      <img src={nft.image} alt={nft.name} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px'}} />
                    ) : (
                      '🏆'
                    )}
                  </div>
                  <div className="nft-name">{nft.name || 'Achievement NFT'}</div>
                  <div className="nft-description">{nft.description || 'Task completion certificate'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}