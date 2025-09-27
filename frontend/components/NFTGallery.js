import { useState, useEffect } from 'react'
import axios from 'axios'

export default function NFTGallery({ alias }) {
  const [nfts, setNfts] = useState({ onChain: [], metadata: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (alias) {
      fetchNFTs()
    }
  }, [alias])

  const fetchNFTs = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/nfts/${alias}`)
      setNfts(response.data)
    } catch (error) {
      console.error('Failed to fetch NFTs:', error)
    }
    setLoading(false)
  }

  if (loading) return <div className="text-center">Loading NFTs...</div>

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Your NFT Collection</h2>
      
      {nfts.onChain.length === 0 && nfts.metadata.length === 0 ? (
        <p className="text-gray-500">No NFTs found in your wallet</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nfts.metadata.map(nft => (
            <div key={nft.mint_address} className="border rounded-lg p-3">
              {nft.image_url && (
                <img 
                  src={nft.image_url} 
                  alt={nft.name} 
                  className="w-full h-32 object-cover rounded mb-2"
                />
              )}
              <h3 className="font-medium text-sm">{nft.name || 'Unnamed NFT'}</h3>
              <p className="text-xs text-gray-500 truncate">{nft.mint_address}</p>
            </div>
          ))}
          
          {nfts.onChain.map(nft => (
            <div key={nft.mint} className="border rounded-lg p-3">
              <div className="w-full h-32 bg-gray-200 rounded mb-2 flex items-center justify-center">
                <span className="text-gray-500 text-xs">NFT</span>
              </div>
              <h3 className="font-medium text-sm">Token</h3>
              <p className="text-xs text-gray-500 truncate">{nft.mint}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}