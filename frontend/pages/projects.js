import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [userAlias, setUserAlias] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    skills_needed: '',
    type: 'collaboration'
  });
  const router = useRouter();

  useEffect(() => {
    const alias = localStorage.getItem('userAlias');
    if (!alias) {
      router.push('/');
      return;
    }
    setUserAlias(alias);
    fetchProjects();
  }, [router]);

  const fetchProjects = async () => {
    try {
      // Try backend first, fallback to localStorage
      try {
        const response = await fetch('https://sexytime-production.up.railway.app/api/projects');
        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects || []);
          return;
        }
      } catch (backendError) {
        console.log('Backend unavailable, using localStorage');
      }
      
      // Fallback to localStorage
      const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
      setProjects(storedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const createProject = async () => {
    if (!newProject.name || !newProject.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      let projectId;
      
      try {
        // Try backend first
        const response = await fetch('https://sexytime-production.up.railway.app/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newProject,
            owner_alias: userAlias,
            aiWallet: 'FcgjXDi62rzFT5eMVxQQy6WPvKLZVcRHakDYTM5E6k6W'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          projectId = data.projectId;
        } else {
          throw new Error('Backend failed');
        }
      } catch (backendError) {
        // Fallback to localStorage
        projectId = Date.now();
        const mockProject = {
          id: projectId,
          name: newProject.name,
          description: newProject.description,
          skills_needed: newProject.skills_needed,
          type: newProject.type,
          owner_alias: userAlias,
          created_at: new Date().toISOString()
        };
        
        const existingProjects = JSON.parse(localStorage.getItem('projects') || '[]');
        existingProjects.push(mockProject);
        localStorage.setItem('projects', JSON.stringify(existingProjects));
      }
      
      alert(`Project "${newProject.name}" created successfully!`);
      setShowCreateForm(false);
      setNewProject({ name: '', description: '', skills_needed: '', type: 'collaboration' });
      fetchProjects();
      
      // Auto-join the created project
      setTimeout(() => {
        router.push(`/workroom/${projectId}`);
      }, 1000);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const joinProject = async (projectId) => {
    router.push(`/workroom/${projectId}`);
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
            Projects
          </h1>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
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
          + Create Project
        </button>
      </div>

      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Create Project Modal */}
        {showCreateForm && (
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
              maxWidth: '500px'
            }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>Create New Project</h2>
              
              <input
                type="text"
                placeholder="Project Name"
                value={newProject.name}
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '15px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
              
              <textarea
                placeholder="Project Description"
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '15px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
              
              <input
                type="text"
                placeholder="Skills Needed (comma separated)"
                value={newProject.skills_needed}
                onChange={(e) => setNewProject({...newProject, skills_needed: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '15px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
              
              <select
                value={newProject.type}
                onChange={(e) => setNewProject({...newProject, type: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '20px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="collaboration">Collaboration</option>
                <option value="token">Token Launch</option>
                <option value="nft">NFT Collection</option>
              </select>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowCreateForm(false)}
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
                  onClick={createProject}
                  disabled={!newProject.name || !newProject.description}
                  style={{
                    background: (!newProject.name || !newProject.description) 
                      ? 'rgba(255,255,255,0.1)' 
                      : 'linear-gradient(135deg, #22c55e, #16a34a)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    color: 'white',
                    cursor: (!newProject.name || !newProject.description) ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    opacity: (!newProject.name || !newProject.description) ? 0.5 : 1
                  }}
                >
                  Create Project
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          {projects.map((project) => (
            <div
              key={project.id}
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '15px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '15px'
              }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                  {project.name}
                </h3>
                <span style={{
                  background: project.type === 'token' ? 'rgba(34, 197, 94, 0.2)' :
                            project.type === 'nft' ? 'rgba(168, 85, 247, 0.2)' :
                            'rgba(59, 130, 246, 0.2)',
                  color: project.type === 'token' ? '#22c55e' :
                         project.type === 'nft' ? '#a855f7' : '#3b82f6',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {project.type}
                </span>
              </div>
              
              <p style={{
                margin: '0 0 15px 0',
                fontSize: '14px',
                opacity: 0.8,
                lineHeight: '1.5'
              }}>
                {project.description}
              </p>
              
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '5px' }}>
                  Skills needed:
                </div>
                <div style={{ fontSize: '13px', color: '#3b82f6' }}>
                  {project.skills_needed}
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ fontSize: '12px', opacity: 0.6 }}>
                  by {project.owner_alias}
                </div>
                <button
                  onClick={() => joinProject(project.id)}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Join Project
                </button>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            opacity: 0.6
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚀</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>No projects yet</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Create the first project to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}