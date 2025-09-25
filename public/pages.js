// Page management system
class PageManager {
    constructor() {
        this.currentPage = 'chat';
        this.pages = {
            chat: this.renderChatPage,
            tasks: this.renderTasksPage,
            projects: this.renderProjectsPage,
            achievements: this.renderAchievementsPage,
            leaderboard: this.renderLeaderboardPage
        };
    }

    showPage(pageId) {
        this.currentPage = pageId;
        const content = document.querySelector('.content');
        content.innerHTML = this.pages[pageId]();
        
        // Update active nav
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        document.querySelector(`[data-page="${pageId}"]`)?.classList.add('active');
        
        // Update header
        document.querySelector('.header-title').textContent = `# ${pageId}`;
        
        // Initialize page-specific functionality
        this.initializePage(pageId);
    }

    initializePage(pageId) {
        switch(pageId) {
            case 'tasks':
                this.loadTasks();
                break;
            case 'projects':
                this.loadProjects();
                break;
            case 'achievements':
                this.loadAchievements();
                break;
            case 'leaderboard':
                this.loadLeaderboard();
                break;
        }
    }

    renderChatPage() {
        return `
            <div class="chat-area">
                <div class="messages" id="messages">
                    <div class="message">
                        <div class="message-avatar">AI</div>
                        <div class="message-content">
                            <div class="message-header">
                                <div class="message-author">AI Assistant</div>
                                <div class="message-time">now</div>
                            </div>
                            <div class="message-text">Welcome to Consilience DAO! I can help you create tokens, mint NFTs, and manage projects. Try typing "mint an NFT" or "create tokens".</div>
                        </div>
                    </div>
                </div>
                
                <div class="input-area">
                    <div class="input-container">
                        <input type="text" class="message-input" id="messageInput" placeholder="Message #ai-assistant">
                        <button class="send-button" onclick="sendMessage()">Send</button>
                    </div>
                </div>
            </div>
            
            <div class="right-panel">
                <div class="panel-section">
                    <div class="panel-title">Join DAO</div>
                    <div class="signup-form">
                        <input type="text" class="form-input" id="alias" placeholder="alias (e.g. alice.builder)">
                        <input type="text" class="form-input" id="interests" placeholder="interests">
                        <button class="form-button" onclick="signup()">Join</button>
                    </div>
                    <div id="userStatus"></div>
                </div>
                
                <div class="panel-section">
                    <div class="panel-title">Quick Actions</div>
                    <button class="form-button" onclick="createTask()" style="margin-bottom: 8px;">+ New Task</button>
                    <button class="form-button" onclick="pageManager.showPage('projects')">View Projects</button>
                </div>
            </div>
        `;
    }

    renderTasksPage() {
        return `
            <div class="tasks-container">
                <div class="tasks-header">
                    <h2>Task Management</h2>
                    <button class="btn" onclick="createTask()">+ New Task</button>
                </div>
                
                <div class="task-categories">
                    <div class="task-column">
                        <h3>📋 To Do</h3>
                        <div id="todoTasks" class="task-list"></div>
                    </div>
                    <div class="task-column">
                        <h3>⚡ In Progress</h3>
                        <div id="progressTasks" class="task-list"></div>
                    </div>
                    <div class="task-column">
                        <h3>✅ Completed</h3>
                        <div id="completedTasks" class="task-list"></div>
                    </div>
                </div>
            </div>
        `;
    }

    renderProjectsPage() {
        return `
            <div class="projects-container">
                <div class="projects-header">
                    <h2>DAO Projects</h2>
                    <button class="btn" onclick="createProject()">+ New Project</button>
                </div>
                
                <div class="projects-grid" id="projectsGrid">
                    <!-- Projects will be loaded here -->
                </div>
                
                <div class="project-stats">
                    <div class="stat-card">
                        <div class="stat-number" id="totalProjects">0</div>
                        <div class="stat-label">Total Projects</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="activeProjects">0</div>
                        <div class="stat-label">Active Projects</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="completedProjects">0</div>
                        <div class="stat-label">Completed</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderAchievementsPage() {
        return `
            <div class="achievements-container">
                <div class="achievements-header">
                    <h2>Your Achievements</h2>
                    <div class="total-cs">
                        <span id="totalCS">0</span> CS Tokens
                    </div>
                </div>
                
                <div class="achievement-categories">
                    <div class="achievement-section">
                        <h3>🎨 NFT Achievements</h3>
                        <div id="nftAchievements" class="achievement-list"></div>
                    </div>
                    
                    <div class="achievement-section">
                        <h3>🪙 Token Achievements</h3>
                        <div id="tokenAchievements" class="achievement-list"></div>
                    </div>
                    
                    <div class="achievement-section">
                        <h3>📋 Task Achievements</h3>
                        <div id="taskAchievements" class="achievement-list"></div>
                    </div>
                </div>
            </div>
        `;
    }

    renderLeaderboardPage() {
        return `
            <div class="leaderboard-container">
                <div class="leaderboard-header">
                    <h2>DAO Leaderboard</h2>
                    <div class="leaderboard-stats">
                        <div class="stat">Total Members: <span id="totalMembers">0</span></div>
                        <div class="stat">Total CS Distributed: <span id="totalCS">0</span></div>
                    </div>
                </div>
                
                <div class="leaderboard-list" id="leaderboardList">
                    <!-- Leaderboard will be loaded here -->
                </div>
            </div>
        `;
    }

    // Task management functions
    loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('consilience_tasks')) || [];
        
        const todoTasks = tasks.filter(t => t.status === 'todo');
        const progressTasks = tasks.filter(t => t.status === 'progress');
        const completedTasks = tasks.filter(t => t.status === 'completed');
        
        document.getElementById('todoTasks').innerHTML = todoTasks.map(this.renderTask).join('');
        document.getElementById('progressTasks').innerHTML = progressTasks.map(this.renderTask).join('');
        document.getElementById('completedTasks').innerHTML = completedTasks.map(this.renderTask).join('');
    }

    renderTask(task) {
        return `
            <div class="task-card" data-task-id="${task.id}">
                <div class="task-title">${task.title}</div>
                <div class="task-description">${task.description}</div>
                <div class="task-reward">💰 ${task.reward} CS</div>
                <div class="task-actions">
                    ${task.status === 'todo' ? '<button onclick="moveTask(\'' + task.id + '\', \'progress\')">Start</button>' : ''}
                    ${task.status === 'progress' ? '<button onclick="completeTask(\'' + task.id + '\')">Complete</button>' : ''}
                    ${task.status === 'completed' ? '<span class="completed-badge">✅ Done</span>' : ''}
                </div>
            </div>
        `;
    }

    loadProjects() {
        const projects = JSON.parse(localStorage.getItem('consilience_projects')) || [
            {
                id: 1,
                name: 'Mars Colony DAO',
                description: 'Building sustainable habitats on Mars using blockchain governance',
                status: 'active',
                members: 12,
                tokens: 'MARS',
                progress: 65
            },
            {
                id: 2,
                name: 'Ocean Cleanup Protocol',
                description: 'DeFi-powered ocean cleanup with environmental impact tracking',
                status: 'active',
                members: 8,
                tokens: 'OCEAN',
                progress: 40
            }
        ];
        
        document.getElementById('projectsGrid').innerHTML = projects.map(this.renderProject).join('');
        document.getElementById('totalProjects').textContent = projects.length;
        document.getElementById('activeProjects').textContent = projects.filter(p => p.status === 'active').length;
        document.getElementById('completedProjects').textContent = projects.filter(p => p.status === 'completed').length;
    }

    renderProject(project) {
        return `
            <div class="project-card">
                <div class="project-header">
                    <h3>${project.name}</h3>
                    <span class="project-status ${project.status}">${project.status}</span>
                </div>
                <div class="project-description">${project.description}</div>
                <div class="project-stats">
                    <div class="project-stat">
                        <span class="stat-label">Members:</span>
                        <span class="stat-value">${project.members}</span>
                    </div>
                    <div class="project-stat">
                        <span class="stat-label">Token:</span>
                        <span class="stat-value">${project.tokens}</span>
                    </div>
                    <div class="project-stat">
                        <span class="stat-label">Progress:</span>
                        <span class="stat-value">${project.progress}%</span>
                    </div>
                </div>
                <div class="project-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${project.progress}%"></div>
                    </div>
                </div>
                <button class="btn" onclick="joinProject(${project.id})">Join Project</button>
            </div>
        `;
    }

    loadAchievements() {
        const achievements = walletManager.getAchievements();
        const totalCS = walletManager.userData?.cs_balance || 0;
        
        document.getElementById('totalCS').textContent = totalCS;
        
        const nftAchievements = achievements.filter(a => a.type === 'nft_created');
        const tokenAchievements = achievements.filter(a => a.type === 'token_created');
        const taskAchievements = achievements.filter(a => a.type === 'task_completed');
        
        document.getElementById('nftAchievements').innerHTML = nftAchievements.map(this.renderAchievement).join('');
        document.getElementById('tokenAchievements').innerHTML = tokenAchievements.map(this.renderAchievement).join('');
        document.getElementById('taskAchievements').innerHTML = taskAchievements.map(this.renderAchievement).join('');
    }

    renderAchievement(achievement) {
        const date = new Date(achievement.timestamp).toLocaleDateString();
        return `
            <div class="achievement-card">
                <div class="achievement-icon">${this.getAchievementIcon(achievement.type)}</div>
                <div class="achievement-content">
                    <div class="achievement-title">${this.getAchievementTitle(achievement)}</div>
                    <div class="achievement-date">${date}</div>
                </div>
                <div class="achievement-reward">+${achievement.amount || 25} CS</div>
            </div>
        `;
    }

    getAchievementIcon(type) {
        const icons = {
            'nft_created': '🎨',
            'token_created': '🪙',
            'task_completed': '✅',
            'project_joined': '🤝'
        };
        return icons[type] || '🏆';
    }

    getAchievementTitle(achievement) {
        switch(achievement.type) {
            case 'nft_created': return `NFT Created #${achievement.tokenId}`;
            case 'token_created': return `Token Created: ${achievement.symbol}`;
            case 'task_completed': return `Task Completed: ${achievement.taskTitle}`;
            default: return 'Achievement Unlocked';
        }
    }

    loadLeaderboard() {
        // Mock leaderboard data - in real app, fetch from server
        const leaderboard = [
            { alias: 'alice.builder', cs_balance: 1250, nfts: 5, tokens: 3 },
            { alias: 'bob.creator', cs_balance: 980, nfts: 3, tokens: 2 },
            { alias: 'charlie.dev', cs_balance: 750, nfts: 2, tokens: 4 }
        ];
        
        if (walletManager.userData) {
            leaderboard.push({
                alias: walletManager.userData.alias,
                cs_balance: walletManager.userData.cs_balance || 0,
                nfts: walletManager.userData.nfts || 0,
                tokens: walletManager.userData.tokens || 0
            });
        }
        
        leaderboard.sort((a, b) => b.cs_balance - a.cs_balance);
        
        document.getElementById('leaderboardList').innerHTML = leaderboard.map((user, index) => `
            <div class="leaderboard-item ${user.alias === walletManager.userData?.alias ? 'current-user' : ''}">
                <div class="rank">#${index + 1}</div>
                <div class="user-info">
                    <div class="username">${user.alias}</div>
                    <div class="user-stats">
                        <span>💰 ${user.cs_balance} CS</span>
                        <span>🎨 ${user.nfts} NFTs</span>
                        <span>🪙 ${user.tokens} Tokens</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        document.getElementById('totalMembers').textContent = leaderboard.length;
        document.getElementById('totalCS').textContent = leaderboard.reduce((sum, user) => sum + user.cs_balance, 0);
    }
}

// Global page manager
window.pageManager = new PageManager();