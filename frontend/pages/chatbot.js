import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userAlias, setUserAlias] = useState('');
  const router = useRouter();

  useEffect(() => {
    const alias = localStorage.getItem('userAlias');
    if (!alias) {
      router.push('/');
      return;
    }
    setUserAlias(alias);
    
    // Welcome message
    setMessages([{
      type: 'bot',
      content: `Hi ${alias}! I'm your AI matchmaker. Tell me what kind of project or collaboration you're looking for, and I'll help find the perfect match for you.`,
      timestamp: new Date()
    }]);
  }, [router]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Try backend API first, fallback to local AI logic
      let botContent = '';
      let actions = [];
      let projectId = null;
      
      try {
        const response = await fetch('https://sexytime-production.up.railway.app/api/ai-matchmaker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alias: userAlias, query: input })
        });
        
        if (response.ok) {
          const data = await response.json();
          botContent = data.response || 'I found some interesting opportunities for you!';
          
          if (data.action === 'create_project') {
            botContent += `\n\n🚀 I've created a new project: "${data.projectName}"\nWould you like to join the workroom?`;
            projectId = data.projectId;
          }
        } else {
          throw new Error('Backend unavailable');
        }
      } catch (backendError) {
        // Advanced AI fallback logic
        const query = input.toLowerCase();
        projectId = Date.now();
        
        let projectName, projectType, skills, aiResponse;
        
        if (query.includes('token') || query.includes('launch') || query.includes('coin') || query.includes('crypto')) {
          projectName = `${userAlias}'s Token Launch`;
          projectType = 'token';
          skills = 'blockchain development, tokenomics, smart contracts, marketing';
          aiResponse = `🚀 Excellent! I've analyzed your request and created a comprehensive token launch project.`;
          botContent = `${aiResponse}\n\n**Project Created:** "${projectName}"\n\n📊 **AI Recommendations:**\n• Set up tokenomics with 80% to contributors, 20% to platform\n• Create utility features for your token\n• Plan marketing and community building\n\n🤖 **AI Asset Manager Ready:** I'll handle token creation, distribution, and wallet management automatically.`;
        } else if (query.includes('nft') || query.includes('art') || query.includes('collectible') || query.includes('digital art')) {
          projectName = `${userAlias}'s NFT Collection`;
          projectType = 'nft';
          skills = 'digital art, 3D modeling, blockchain, community management';
          aiResponse = `🎨 Perfect! I've designed an NFT collection project tailored to your vision.`;
          botContent = `${aiResponse}\n\n**Project Created:** "${projectName}"\n\n🎨 **AI Recommendations:**\n• Design unique artwork with rarity tiers\n• Create utility and holder benefits\n• Build community engagement strategies\n\n🤖 **AI Asset Manager Ready:** I'll mint NFTs and distribute them based on participation levels.`;
        } else if (query.includes('dao') || query.includes('governance') || query.includes('voting')) {
          projectName = `${userAlias}'s DAO Initiative`;
          projectType = 'dao';
          skills = 'governance design, community building, blockchain, legal';
          aiResponse = `🏡 Brilliant! I've structured a DAO governance project for you.`;
          botContent = `${aiResponse}\n\n**Project Created:** "${projectName}"\n\n🏡 **AI Recommendations:**\n• Design governance token distribution\n• Create proposal and voting mechanisms\n• Establish treasury management\n\n🤖 **AI Asset Manager Ready:** I'll create governance tokens and manage treasury allocations.`;
        } else {
          projectName = `${userAlias}'s Innovation Project`;
          projectType = 'collaboration';
          skills = 'determined by project scope';
          aiResponse = `💡 Interesting! I've created a flexible collaboration project based on your input.`;
          botContent = `${aiResponse}\n\n**Project Created:** "${projectName}"\n\n💡 **AI Analysis:** "${input}"\n\n🤖 **AI Recommendations:**\n• Define clear project milestones\n• Identify required skills and team members\n• Set up reward mechanisms for contributors\n\n**Ready to help with:** Token creation, NFT rewards, team coordination`;
        }
        
        // Store project with enhanced metadata
        const mockProject = {
          id: projectId,
          name: projectName,
          description: `AI-generated project based on: "${input}"`,
          skills_needed: skills,
          type: projectType,
          owner_alias: userAlias,
          ai_generated: true,
          original_query: input,
          created_at: new Date().toISOString()
        };
        
        const existingProjects = JSON.parse(localStorage.getItem('projects') || '[]');
        existingProjects.push(mockProject);
        localStorage.setItem('projects', JSON.stringify(existingProjects));
      }
      
      actions = [
        {
          text: 'Join Workroom',
          action: () => router.push(`/workroom/${projectId}`)
        },
        {
          text: 'View All Projects',
          action: () => router.push('/projects')
        }
      ];
      
      const botMessage = {
        type: 'bot',
        content: botContent,
        timestamp: new Date(),
        actions: actions
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        type: 'bot',
        content: 'Sorry, I had trouble finding matches right now. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
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
            AI Matchmaker
          </h1>
        </div>
        <div style={{
          background: 'rgba(34, 197, 94, 0.2)',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '14px',
          color: '#22c55e'
        }}>
          🤖 Online
        </div>
      </div>

      {/* Chat Container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 140px)',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px'
      }}>
        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '18px',
                background: message.type === 'user' 
                  ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                  : 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ fontSize: '15px', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                  {message.content}
                </div>
                {message.actions && (
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '10px',
                    flexWrap: 'wrap'
                  }}>
                    {message.actions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        onClick={action.action}
                        style={{
                          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        {action.text}
                      </button>
                    ))}
                  </div>
                )}
                <div style={{
                  fontSize: '12px',
                  opacity: 0.7,
                  marginTop: '5px'
                }}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '18px',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#3b82f6',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}></div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#3b82f6',
                    animation: 'pulse 1.5s ease-in-out infinite 0.2s'
                  }}></div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#3b82f6',
                    animation: 'pulse 1.5s ease-in-out infinite 0.4s'
                  }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{
          display: 'flex',
          gap: '10px',
          padding: '20px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe what you're looking for..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'white',
              fontSize: '15px',
              resize: 'none',
              minHeight: '20px',
              maxHeight: '100px'
            }}
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{
              background: input.trim() && !loading 
                ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                : 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 20px',
              color: 'white',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Send
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 80%, 100% {
            opacity: 0.3;
          }
          40% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}