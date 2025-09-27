import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import axios from 'axios'

export default function NFTGallery() {
  const [walletNfts, setWalletNfts] = useState([])
  const [earnedNfts, setEarnedNfts] = useState([])
  const [loading, setLoading] = useState(true)
  const { publicKey, connected } = useWallet()

  useEffect(() => {
    fetchAllNFTs()
  }, [connected, publicKey])

  const fetchAllNFTs = async () => {
    setLoading(true)
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    
    try {
      // Fetch earned NFTs from database
      const alias = localStorage.getItem('userAlias')
      if (alias) {
        const earnedResponse = await axios.get(`${backendUrl}/api/nfts/${alias}`)
        setEarnedNfts(earnedResponse.data.nfts || [])
      }
      
      // Fetch wallet NFTs if connected
      if (connected && publicKey) {
        console.log('Fetching wallet NFTs for:', publicKey.toString())
        const walletResponse = await axios.get(`${backendUrl}/api/nfts/${publicKey.toString()}`)
        setWalletNfts(walletResponse.data.nfts || [])
      } else {
        setWalletNfts([])
      }
    } catch (error) {
      console.error('Failed to fetch NFTs:', error)
      setWalletNfts([])
      setEarnedNfts([])
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
          onClick={fetchAllNFTs} 
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      
      {earnedNfts.length === 0 && walletNfts.length === 0 ? (
        <p className="text-gray-500">
          {connected ? 'No NFTs found. Complete tasks to earn NFT certificates!' : 'Connect wallet to view NFTs'}
        </p>
      ) : (
        <div className="space-y-6">
          {earnedNfts.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3 text-green-600">🏆 Earned Certificates</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {earnedNfts.map(nft => (
                  <div key={nft.mint} className="border-2 border-green-200 rounded-lg p-3 bg-green-50">
                    <img 
                      src={nft.image} 
                      alt={nft.name} 
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                    <h4 className="font-medium text-sm">{nft.name}</h4>
                    <p className="text-xs text-green-600 font-medium">✓ Task Completed</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {walletNfts.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">💎 Wallet Collection</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {walletNfts.map(nft => (
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
                    <h4 className="font-medium text-sm">{nft.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{nft.mint}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}