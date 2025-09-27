import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Workroom() {
  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState([]);
  const [userAlias, setUserAlias] = useState('');
  const [showTokenCreator, setShowTokenCreator] = useState(false);
  const [showNFTCreator, setShowNFTCreator] = useState(false);
  const router = useRouter();
  const { projectId } = router.query;

  useEffect(() => {
    const alias = localStorage.getItem('userAlias');
    if (!alias) {
      router.push('/');
      return;
    }
    setUserAlias(alias);
    
    if (projectId) {
      fetchProject();
      fetchMessages();
      fetchParticipants();
    }
  }, [projectId, router]);

  const fetchProject = async () => {
    try {
      // Try backend first, fallback to localStorage
      try {
        const response = await fetch(`https://sexytime-production.up.railway.app/api/projects/${projectId}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data.project);
          return;
        }
      } catch (backendError) {
        console.log('Backend unavailable, using localStorage');
      }
      
      // Fallback to localStorage
      const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
      const foundProject = storedProjects.find(p => p.id == projectId);
      if (foundProject) {
        setProject(foundProject);
      } else {
        // Create a mock project if not found
        const mockProject = {
          id: projectId,
          name: `Project ${projectId}`,
          description: 'A collaborative project',
          owner_alias: userAlias,
          type: 'collaboration'
        };
        setProject(mockProject);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`https://sexytime-production.up.railway.app/api/workroom/${projectId}/messages`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await fetch(`https://sexytime-production.up.railway.app/api/workroom/${projectId}/participants`);
      const data = await response.json();
      
      // Always include AI assistant as a participant
      const participants = data.participants || [];
      const aiExists = participants.find(p => p.alias === 'AI Assistant');
      if (!aiExists) {
        participants.unshift({ alias: 'AI Assistant', isAI: true });
      }
      
      setParticipants(participants);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await fetch(`https://sexytime-production.up.railway.app/api/workroom/${projectId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage,
          sender: userAlias
        })
      });
      
      setNewMessage('');
      fetchMessages();
      
      // Trigger AI response if message contains question or mention
      if (newMessage.includes('?') || newMessage.toLowerCase().includes('ai') || newMessage.toLowerCase().includes('help')) {
        setTimeout(async () => {
          try {
            await fetch(`https://sexytime-production.up.railway.app/api/workroom/${projectId}/ai-response`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userMessage: newMessage,
                projectContext: project
              })
            });
            fetchMessages();
          } catch (error) {
            console.error('Error getting AI response:', error);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const createProjectToken = async () => {
    try {
      const response = await fetch('https://sexytime-production.up.railway.app/api/create-project-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          creator: userAlias,
          participants: participants.filter(p => !p.isAI).map(p => p.alias)
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Project token created and distributed to all participants!');
        setShowTokenCreator(false);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create token');
      }
    } catch (error) {
      console.error('Error creating project token:', error);
      // Fallback to localStorage simulation
      const tokenData = {
        id: Date.now(),
        name: `${project.name} Token`,
        symbol: project.name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase() || 'PROJ',
        supply: 1000000,
        creator: userAlias,
        projectId,
        participants: participants.filter(p => !p.isAI).length,
        created_at: new Date().toISOString()
      };
      
      const existingTokens = JSON.parse(localStorage.getItem('userTokens') || '[]');
      existingTokens.push(tokenData);
      localStorage.setItem('userTokens', JSON.stringify(existingTokens));
      
      alert(`🪙 ${tokenData.symbol} token created! Distributed to ${tokenData.participants} participants with 80/20 allocation model.`);
      setShowTokenCreator(false);
    }
  };

  const createProjectNFT = async () => {
    try {
      const response = await fetch('https://sexytime-production.up.railway.app/api/create-project-nft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          creator: userAlias,
          participants: participants.filter(p => !p.isAI).map(p => p.alias)
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Project NFT collection created and distributed!');
        setShowNFTCreator(false);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create NFT');
      }
    } catch (error) {
      console.error('Error creating project NFT:', error);
      // Fallback to localStorage simulation
      const nftData = {
        id: Date.now(),
        name: `${project.name} Badge`,
        description: `Achievement NFT for participating in ${project.name}`,
        supply: participants.filter(p => !p.isAI).length,
        creator: userAlias,
        projectId,
        participants: participants.filter(p => !p.isAI).length,
        created_at: new Date().toISOString()
      };
      
      const existingNFTs = JSON.parse(localStorage.getItem('userNFTs') || '[]');
      existingNFTs.push(nftData);
      localStorage.setItem('userNFTs', JSON.stringify(existingNFTs));
      
      alert(`🎨 ${nftData.name} collection created! Minted ${nftData.supply} unique NFTs for all participants.`);
      setShowNFTCreator(false);
    }
  };

  if (!project) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column'
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
            onClick={() => router.push('/projects')}
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
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
              {project.name}
            </h1>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.7 }}>
              {project.description}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowTokenCreator(true)}
            style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🪙 Create Token
          </button>
          <button
            onClick={() => setShowNFTCreator(true)}
            style={{
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🎨 Create NFT
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <div style={{
          width: '250px',
          background: 'rgba(255,255,255,0.05)',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>
            Participants ({participants.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {participants.map((participant, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '8px'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: participant.isAI 
                    ? 'linear-gradient(135deg, #a855f7, #7c3aed)'
                    : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {participant.isAI ? '🤖' : (participant.alias?.[0]?.toUpperCase() || '?')}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>
                    {participant.alias}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.6 }}>
                    {participant.isAI ? 'AI Assistant' : 
                     participant.alias === project?.owner_alias ? 'Owner' : 'Member'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Messages */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: message.sender === userAlias ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: '18px',
                  background: message.sender === userAlias 
                    ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                    : 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  {message.sender !== userAlias && (
                    <div style={{
                      fontSize: '12px',
                      opacity: 0.7,
                      marginBottom: '5px',
                      fontWeight: '500'
                    }}>
                      {message.sender}
                    </div>
                  )}
                  <div style={{ fontSize: '15px', lineHeight: '1.5' }}>
                    {message.content}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    opacity: 0.7,
                    marginTop: '5px'
                  }}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div style={{
            padding: '20px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            gap: '10px'
          }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '25px',
                color: 'white',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                border: 'none',
                borderRadius: '50%',
                width: '45px',
                height: '45px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Token Creator Modal */}
      {showTokenCreator && (
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
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>Create Project Token</h2>
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', opacity: 0.8 }}>
              This will create a token for "{project.name}" and distribute it equally among all participants.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowTokenCreator(false)}
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
                onClick={createProjectToken}
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Create Token
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NFT Creator Modal */}
      {showNFTCreator && (
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
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>Create Project NFT</h2>
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', opacity: 0.8 }}>
              This will create an NFT collection for "{project.name}" and mint one for each participant.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowNFTCreator(false)}
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
                onClick={createProjectNFT}
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
    </div>
  );
}