import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import io from 'socket.io-client'
import axios from 'axios'
import QRCode from 'qrcode.react'

export default function ChatRoom() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [socket, setSocket] = useState(null)
  const [project, setProject] = useState(null)
  const [showQR, setShowQR] = useState(false)
  const [taskProof, setTaskProof] = useState(null)
  const messagesEndRef = useRef(null)
  const router = useRouter()
  const { projectId } = router.query

  useEffect(() => {
    const alias = localStorage.getItem('userAlias')
    if (!alias) {
      router.push('/')
      return
    }

    if (projectId) {
      initializeChat(alias, projectId)
      fetchProject(projectId)
      loadMessages(projectId)
    }

    return () => {
      if (socket) socket.disconnect()
    }
  }, [projectId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async (projectId) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
      const response = await axios.get(`${backendUrl}/api/messages/${projectId}`)
      setMessages(response.data || [])
    } catch (error) {
      console.error('Failed to load messages:', error)
      setMessages([])
    }
  }

  const initializeChat = (alias, projectId) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    const newSocket = io(backendUrl)
    
    newSocket.emit('join-room', { alias, projectId })
    
    newSocket.on('message', (message) => {
      // Only add if not already in messages (avoid duplicates)
      setMessages(prev => {
        const exists = prev.some(m => m.id === message.id || 
          (m.alias === message.alias && m.message === message.message && m.timestamp === message.timestamp))
        return exists ? prev : [...prev, message]
      })
    })
    
    setSocket(newSocket)
  }

  const fetchProject = async (projectId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/projects/${projectId}`)
      setProject(response.data)
    } catch (error) {
      console.error('Failed to fetch project:', error)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (newMessage.trim() && socket) {
      const alias = localStorage.getItem('userAlias')
      const messageData = {
        projectId,
        alias,
        message: newMessage
      }
      
      // Save to database first
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
        const response = await axios.post(`${backendUrl}/api/messages`, messageData)
        
        // Add to local state immediately
        const savedMessage = response.data
        setMessages(prev => [...prev, savedMessage])
        
        // Send via socket to other users
        socket.emit('send-message', savedMessage)
        
      } catch (error) {
        console.error('Failed to save message:', error)
        // Still send via socket as fallback
        socket.emit('send-message', {
          ...messageData,
          timestamp: new Date().toISOString()
        })
      }
      
      setNewMessage('')
    }
  }

  const submitTaskProof = async () => {
    if (!taskProof) return
    
    const alias = localStorage.getItem('userAlias')
    try {
      const response = await axios.post('http://localhost:5000/api/verify-task', {
        alias,
        projectId,
        proof: taskProof
      })
      
      if (response.data.verified) {
        alert('Task verified! 100 CS tokens minted to your wallet.')
      } else {
        alert('Task verification failed. Please try again.')
      }
    } catch (error) {
      alert('Error verifying task: ' + error.response?.data?.error)
    }
  }

  const simulateQRScan = async () => {
    const alias = localStorage.getItem('userAlias')
    try {
      await axios.post('http://localhost:5000/api/checkin', {
        alias,
        projectId
      })
      alert('Check-in successful! 5 CS tokens minted.')
    } catch (error) {
      alert('Check-in failed: ' + error.response?.data?.error)
    }
  }

  const qrData = `${localStorage.getItem('userAlias')}:${projectId}`

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">{project?.name || 'Chat Room'}</h1>
            <p className="text-gray-600 text-sm">{project?.description}</p>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => setShowQR(!showQR)} className="btn-secondary text-sm">
              QR Check-in
            </button>
            <button onClick={() => router.push('/dashboard')} className="btn-secondary text-sm">
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {showQR && (
        <div className="bg-white border-b p-4">
          <div className="max-w-4xl mx-auto text-center">
            <QRCode value={qrData} size={128} className="mx-auto mb-4" />
            <button onClick={simulateQRScan} className="btn-primary">
              Simulate Scan
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.alias === localStorage.getItem('userAlias') ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.alias === localStorage.getItem('userAlias')
                    ? 'bg-black text-white'
                    : 'bg-white border border-gray-200'
                }`}>
                  <p className="text-xs text-gray-500 mb-1">{msg.alias}</p>
                  <p>{msg.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t bg-white p-4">
          <div className="mb-4">
            <div className="flex space-x-2 mb-2">
              <input
                type="file"
                onChange={(e) => setTaskProof(e.target.files[0])}
                className="text-sm"
              />
              <button onClick={submitTaskProof} className="btn-primary text-sm">
                Submit Task Proof
              </button>
            </div>
          </div>
          
          <form onSubmit={sendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="input-field flex-1"
            />
            <button type="submit" className="btn-primary">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}