import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import axios from 'axios'

export default function NFTGallery() {
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(true)
  const { publicKey, connected } = useWallet()

  useEffect(() => {
    if (connected && publicKey) {
      fetchNFTs()
    } else {
      setNfts([])
      setLoading(false)
    }
  }, [connected, publicKey])

  const fetchNFTs = async () => {
    console.log('Fetching NFTs for wallet:', publicKey.toString())
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
      const url = `${backendUrl}/api/nfts/${publicKey.toString()}`
      console.log('NFT API URL:', url)
      
      const response = await axios.get(url)
      console.log('NFT API Response:', response.data)
      
      setNfts(response.data.nfts || [])
    } catch (error) {
      console.error('Failed to fetch NFTs:', error)
      setNfts([])
    }
    setLoading(false)
  }

  if (!connected) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Your NFT Collection</h2>
        <p className="text-gray-500">Connect your wallet to view your NFTs</p>
      </div>
    )
  }

  if (loading) return <div className="text-center">Loading NFTs...</div>

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your NFT Collection</h2>
        <button 
          onClick={fetchNFTs} 
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      
      {nfts.length === 0 ? (
        <p className="text-gray-500">No NFTs found in your wallet</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nfts.map(nft => (
            <div key={nft.mint} className="border rounded-lg p-3">
              {nft.image ? (
                <img 
                  src={nft.image} 
                  alt={nft.name} 
                  className="w-full h-32 object-cover rounded mb-2"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-purple-400 to-blue-500 rounded mb-2 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">NFT</span>
                </div>
              )}
              <h3 className="font-medium text-sm">{nft.name}</h3>
              <p className="text-xs text-gray-500 truncate">{nft.mint}</p>
              {nft.description && (
                <p className="text-xs text-gray-400 mt-1 truncate">{nft.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}