import { useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

export default function NewProject() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [skillsNeeded, setSkillsNeeded] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await axios.post(`${process.env.BACKEND_URL}/api/projects`, {
        name,
        description,
        skills_needed: skillsNeeded
      })
      
      alert('Project created successfully!')
      router.push('/dashboard')
    } catch (error) {
      alert('Failed to create project: ' + error.response?.data?.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-black">Create New Project</h1>
          <p className="text-gray-600">Start a new DAO collaboration</p>
        </header>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                required
                className="input-field w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Mars Colony Planning"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                required
                rows={4}
                className="input-field w-full"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project goals and vision..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills Needed
              </label>
              <input
                type="text"
                required
                className="input-field w-full"
                value={skillsNeeded}
                onChange={(e) => setSkillsNeeded(e.target.value)}
                placeholder="e.g., engineering, design, project management"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}