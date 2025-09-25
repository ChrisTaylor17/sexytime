import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

export default function Chatbot() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [match, setMatch] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const alias = localStorage.getItem('userAlias')
    if (!alias) {
      router.push('/')
      return
    }
    
    // Initial AI greeting
    setMessages([{
      type: 'ai',
      content: `Hey ${alias}, ready to join a DAO?`
    }])
    
    findMatch(alias)
  }, [])

  const findMatch = async (alias) => {
    setLoading(true)
    try {
      const response = await axios.post(`${process.env.BACKEND_URL}/api/find-match`, { alias })
      const aiResponse = response.data
      
      setMessages(prev => [...prev, {
        type: 'ai',
        content: aiResponse.message
      }])
      
      if (aiResponse.match) {
        setMatch(aiResponse.match)
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'ai',
        content: 'Sorry, I encountered an error finding matches. Please try again.'
      }])
    }
    setLoading(false)
  }

  const acceptMatch = () => {
    if (match) {
      router.push(`/chat/${match.project_id}`)
    }
  }

  const createNewProject = () => {
    router.push('/new-project')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-black">AI Matchmaker</h1>
          <p className="text-gray-600">Let me find the perfect DAO match for you</p>
        </header>

        <div className="card mb-6">
          <div className="space-y-4 mb-6">
            {messages.map((message, index) => (
              <div key={index} className={`p-3 rounded ${
                message.type === 'ai' 
                  ? 'bg-gray-100 text-black' 
                  : 'bg-black text-white ml-8'
              }`}>
                {message.content}
              </div>
            ))}
            
            {loading && (
              <div className="p-3 rounded bg-gray-100 text-black">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  <span>Finding matches...</span>
                </div>
              </div>
            )}
          </div>

          {match && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Match Found!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Project: {match.project_name} | Reward: 100 CS
              </p>
              <div className="flex space-x-3">
                <button onClick={acceptMatch} className="btn-primary">
                  Accept Match
                </button>
                <button onClick={createNewProject} className="btn-secondary">
                  New Project
                </button>
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={() => router.push('/dashboard')} 
          className="btn-secondary"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}