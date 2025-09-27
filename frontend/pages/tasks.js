import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [userAlias, setUserAlias] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    reward: 100,
    requiredVerifications: 2,
    deadline: ''
  });
  const [submission, setSubmission] = useState({
    proof: '',
    description: ''
  });
  const router = useRouter();

  useEffect(() => {
    const alias = localStorage.getItem('userAlias');
    if (!alias) {
      router.push('/');
      return;
    }
    setUserAlias(alias);
    fetchTasks();
  }, [router]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('https://sexytime-production.up.railway.app/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      } else {
        // Fallback to localStorage
        const storedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        setTasks(storedTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      const storedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      setTasks(storedTasks);
    }
  };

  const createTask = async () => {
    if (!newTask.title || !newTask.description) {
      alert('Please fill in all required fields');
      return;
    }

    const taskData = {
      id: Date.now(),
      ...newTask,
      creator: userAlias,
      status: 'open',
      submissions: [],
      verifications: [],
      created_at: new Date().toISOString()
    };

    try {
      const response = await fetch('https://sexytime-production.up.railway.app/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        alert(`Task "${newTask.title}" created successfully!`);
      } else {
        throw new Error('Backend failed');
      }
    } catch (error) {
      // Fallback to localStorage
      const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      existingTasks.push(taskData);
      localStorage.setItem('tasks', JSON.stringify(existingTasks));
      alert(`✅ Task "${newTask.title}" created successfully!`);
    }

    setShowCreateForm(false);
    setNewTask({ title: '', description: '', reward: 100, requiredVerifications: 2, deadline: '' });
    fetchTasks();
  };

  const submitTask = async () => {
    if (!submission.proof || !submission.description) {
      alert('Please provide proof and description');
      return;
    }

    const submissionData = {
      taskId: selectedTask.id,
      submitter: userAlias,
      proof: submission.proof,
      description: submission.description,
      timestamp: new Date().toISOString(),
      verifications: [],
      status: 'pending'
    };

    try {
      const response = await fetch('https://sexytime-production.up.railway.app/api/task-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        alert('Task submitted for verification!');
      } else {
        throw new Error('Backend failed');
      }
    } catch (error) {
      // Fallback to localStorage
      const updatedTasks = tasks.map(task => {
        if (task.id === selectedTask.id) {
          return {
            ...task,
            submissions: [...(task.submissions || []), submissionData]
          };
        }
        return task;
      });
      
      setTasks(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      alert('✅ Task submitted for verification!');
    }

    setShowSubmitForm(false);
    setSubmission({ proof: '', description: '' });
    setSelectedTask(null);
    fetchTasks();
  };

  const verifySubmission = async (task, submissionIndex, approved) => {
    const verification = {
      verifier: userAlias,
      approved,
      timestamp: new Date().toISOString(),
      comment: approved ? 'Work verified and approved' : 'Work needs improvement'
    };

    try {
      const response = await fetch('https://sexytime-production.up.railway.app/api/verify-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          submissionIndex,
          verification
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.tokensAwarded) {
          alert(`✅ Verification recorded! ${data.tokensAwarded} tokens awarded to ${data.recipient}`);
        } else {
          alert('✅ Verification recorded!');
        }
      } else {
        throw new Error('Backend failed');
      }
    } catch (error) {
      // Fallback to localStorage
      const updatedTasks = tasks.map(t => {
        if (t.id === task.id) {
          const updatedSubmissions = [...(t.submissions || [])];
          if (updatedSubmissions[submissionIndex]) {
            updatedSubmissions[submissionIndex].verifications = [
              ...(updatedSubmissions[submissionIndex].verifications || []),
              verification
            ];

            // Check if enough verifications
            const approvals = updatedSubmissions[submissionIndex].verifications.filter(v => v.approved).length;
            if (approvals >= task.requiredVerifications) {
              updatedSubmissions[submissionIndex].status = 'approved';
              alert(`🎉 Task approved! ${task.reward} tokens awarded to ${updatedSubmissions[submissionIndex].submitter}`);
            }
          }
          return { ...t, submissions: updatedSubmissions };
        }
        return t;
      });
      
      setTasks(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      alert('✅ Verification recorded!');
    }

    fetchTasks();
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
            AI Task Verification
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
          + Create Task
        </button>
      </div>

      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* AI Verification Notice */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          padding: '15px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '20px' }}>🤖</span>
          <div>
            <div style={{ fontWeight: '600', color: '#3b82f6', marginBottom: '5px' }}>
              AI-Powered Verification System
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>
              Tasks require peer verification before AI awards real tokens. Create tasks, submit work, and verify others' contributions.
            </div>
          </div>
        </div>

        {/* Create Task Modal */}
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
              <h2 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>Create New Task</h2>
              
              <input
                type="text"
                placeholder="Task Title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
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
                placeholder="Task Description"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
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
                type="number"
                placeholder="Token Reward"
                value={newTask.reward}
                onChange={(e) => setNewTask({...newTask, reward: parseInt(e.target.value)})}
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
              
              <input
                type="number"
                placeholder="Required Verifications"
                value={newTask.requiredVerifications}
                onChange={(e) => setNewTask({...newTask, requiredVerifications: parseInt(e.target.value)})}
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
              />
              
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
                  onClick={createTask}
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
                  Create Task
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submit Task Modal */}
        {showSubmitForm && selectedTask && (
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
              <h2 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>Submit Task: {selectedTask.title}</h2>
              
              <input
                type="text"
                placeholder="Proof URL (GitHub, Drive, etc.)"
                value={submission.proof}
                onChange={(e) => setSubmission({...submission, proof: e.target.value})}
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
                placeholder="Describe your work"
                value={submission.description}
                onChange={(e) => setSubmission({...submission, description: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '20px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowSubmitForm(false);
                    setSelectedTask(null);
                    setSubmission({ proof: '', description: '' });
                  }}
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
                  onClick={submitTask}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Submit Work
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          {tasks.map((task) => (
            <div
              key={task.id}
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '15px',
                padding: '20px'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '15px'
              }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                  {task.title}
                </h3>
                <span style={{
                  background: task.status === 'open' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                  color: task.status === 'open' ? '#22c55e' : '#a855f7',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {task.status}
                </span>
              </div>
              
              <p style={{
                margin: '0 0 15px 0',
                fontSize: '14px',
                opacity: 0.8,
                lineHeight: '1.5'
              }}>
                {task.description}
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '15px'
              }}>
                <div style={{
                  background: 'rgba(251, 191, 36, 0.1)',
                  padding: '10px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '5px' }}>
                    Reward
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#fbbf24' }}>
                    {task.reward} tokens
                  </div>
                </div>
                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  padding: '10px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '5px' }}>
                    Verifications
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#3b82f6' }}>
                    {task.requiredVerifications} required
                  </div>
                </div>
              </div>

              {/* Submissions */}
              {task.submissions && task.submissions.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>
                    Submissions ({task.submissions.length})
                  </div>
                  {task.submissions.map((sub, index) => (
                    <div key={index} style={{
                      background: 'rgba(255,255,255,0.05)',
                      padding: '10px',
                      borderRadius: '8px',
                      marginBottom: '10px'
                    }}>
                      <div style={{ fontSize: '13px', marginBottom: '5px' }}>
                        <strong>{sub.submitter}</strong> - {sub.status}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '8px' }}>
                        {sub.description}
                      </div>
                      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <a href={sub.proof} target="_blank" rel="noopener noreferrer" style={{
                          color: '#3b82f6',
                          fontSize: '12px',
                          textDecoration: 'none'
                        }}>
                          View Proof
                        </a>
                        {sub.submitter !== userAlias && sub.status === 'pending' && (
                          <>
                            <button
                              onClick={() => verifySubmission(task, index, true)}
                              style={{
                                background: 'rgba(34, 197, 94, 0.2)',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                color: '#22c55e',
                                cursor: 'pointer',
                                fontSize: '11px',
                                marginLeft: '10px'
                              }}
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => verifySubmission(task, index, false)}
                              style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '11px'
                              }}
                            >
                              ✗ Reject
                            </button>
                          </>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '5px' }}>
                        Verifications: {sub.verifications?.filter(v => v.approved).length || 0}/{task.requiredVerifications}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '15px' }}>
                Created by {task.creator} • {new Date(task.created_at).toLocaleDateString()}
              </div>
              
              {task.creator !== userAlias && task.status === 'open' && (
                <button
                  onClick={() => {
                    setSelectedTask(task);
                    setShowSubmitForm(true);
                  }}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Submit Work
                </button>
              )}
            </div>
          ))}
        </div>

        {tasks.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            opacity: 0.6
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎯</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>No tasks yet</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Create the first task to start earning tokens!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}