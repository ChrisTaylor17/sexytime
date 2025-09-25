import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

export default function Marketplace() {
  const [projects, setProjects] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const alias = localStorage.getItem('userAlias')
    if (!alias) {
      router.push('/')
      return
    }
    
    fetchMarketplaceData(alias)
  }, [])

  const fetchMarketplaceData = async (alias) => {
    try {
      const [userRes, projectsRes] = await Promise.all([
        axios.get(`${process.env.BACKEND_URL}/api/user/${alias}`),
        axios.get(`${process.env.BACKEND_URL}/api/projects`)
      ])
      
      setUser(userRes.data)
      setProjects(projectsRes.data)
    } catch (error) {
      console.error('Failed to fetch marketplace data:', error)
    }
    
    setLoading(false)
  }

  const buyProject = async (projectId, price) => {
    const alias = localStorage.getItem('userAlias')
    
    if (user.cs_balance < price) {
      alert('Insufficient CS balance')
      return
    }

    try {
      await axios.post(`${process.env.BACKEND_URL}/api/buy-project`, {
        alias,
        projectId,
        price
      })
      
      alert('Project purchased successfully!')
      fetchMarketplaceData(alias)
    } catch (error) {
      alert('Purchase failed: ' + error.response?.data?.error)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-black">Project Marketplace</h1>
          <p className="text-gray-600">Your CS Balance: {user?.cs_balance || 0}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => {
            const price = Math.floor(Math.random() * 500) + 100 // Random price 100-600 CS
            
            return (
              <div key={project.id} className="card">
                <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                <p className="text-xs text-gray-500 mb-4">Skills: {project.skills_needed}</p>
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">{price} CS</span>
                  <button
                    onClick={() => buyProject(project.id, price)}
                    className="btn-primary text-sm"
                    disabled={user.cs_balance < price}
                  >
                    {user.cs_balance < price ? 'Insufficient Funds' : 'Buy Project'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8">
          <button 
            onClick={() => router.push('/dashboard')} 
            className="btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}