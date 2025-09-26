// Main application controller
class ConsilenceApp {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('consilience_user')) || null;
        this.socket = null;
        this.currentPage = 'dashboard';
        this.matches = [];
        this.conversations = [];
        this.init();
    }

    init() {
        this.initSocket();
        this.loadUserData();
        this.showPage('dashboard');
        this.startMatchmaking();
    }

    initSocket() {
        this.socket = io();
        
        this.socket.on('match_found', (match) => {
            this.handleNewMatch(match);
        });
        
        this.socket.on('message', (message) => {
            this.handleNewMessage(message);
        });
        
        this.socket.on('user_online', (user) => {
            this.updateUserStatus(user, 'online');
        });
    }

    async loadUserData() {
        if (this.currentUser) {
            walletManager.userData = this.currentUser;
            walletManager.updateWalletUI();
        }
    }

    showPage(pageId) {
        this.currentPage = pageId;
        const content = document.querySelector('.main-content');
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        document.querySelector(`[data-page="${pageId}"]`)?.classList.add('active');
        
        // Render page content
        switch(pageId) {
            case 'dashboard':
                content.innerHTML = this.renderDashboard();
                this.initDashboard();
                break;
            case 'matches':
                content.innerHTML = this.renderMatches();
                this.loadMatches();
                break;
            case 'chat':
                content.innerHTML = this.renderChat();
                this.initChat();
                break;
            case 'projects':
                content.innerHTML = this.renderProjects();
                this.loadProjects();
                break;
            case 'marketplace':
                content.innerHTML = this.renderMarketplace();
                this.loadMarketplace();
                break;
            case 'profile':
                content.innerHTML = this.renderProfile();
                this.initProfile();
                break;
        }
    }

    renderDashboard() {
        return `
            <div class="dashboard">
                <div class="dashboard-header">
                    <h1>Welcome back, ${this.currentUser?.alias || 'Builder'}!</h1>
                    <div class="quick-stats">
                        <div class="stat-card">
                            <div class="stat-number">${this.currentUser?.cs_balance || 0}</div>
                            <div class="stat-label">CS Tokens</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${this.matches.length}</div>
                            <div class="stat-label">Active Matches</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${this.currentUser?.projects?.length || 0}</div>
                            <div class="stat-label">Projects</div>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-grid">
                    <div class="dashboard-card">
                        <h3>🎯 AI Matchmaking</h3>
                        <p>Find collaborators based on skills, interests, and project goals</p>
                        <button class="btn-primary" onclick="app.findMatches()">Find Matches</button>
                    </div>
                    
                    <div class="dashboard-card">
                        <h3>💬 Active Conversations</h3>
                        <div id="recentChats">
                            ${this.renderRecentChats()}
                        </div>
                    </div>
                    
                    <div class="dashboard-card">
                        <h3>🚀 Quick Actions</h3>
                        <div class="quick-actions">
                            <button class="action-btn" onclick="app.createProject()">
                                <span>📋</span> New Project
                            </button>
                            <button class="action-btn" onclick="app.mintNFT()">
                                <span>🎨</span> Mint NFT
                            </button>
                            <button class="action-btn" onclick="app.createToken()">
                                <span>🪙</span> Create Token
                            </button>
                        </div>
                    </div>
                    
                    <div class="dashboard-card">
                        <h3>📈 Your Progress</h3>
                        <div class="progress-items">
                            <div class="progress-item">
                                <span>Profile Completion</span>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${this.getProfileCompletion()}%"></div>
                                </div>
                            </div>
                            <div class="progress-item">
                                <span>Reputation Score</span>
                                <div class="reputation-score">${this.currentUser?.reputation || 0}/100</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderMatches() {
        return `
            <div class="matches-page">
                <div class="matches-header">
                    <h2>AI-Powered Matches</h2>
                    <button class="btn-primary" onclick="app.findMatches()">Find New Matches</button>
                </div>
                
                <div class="match-filters">
                    <select id="skillFilter">
                        <option value="">All Skills</option>
                        <option value="javascript">JavaScript</option>
                        <option value="solana">Solana</option>
                        <option value="design">Design</option>
                        <option value="marketing">Marketing</option>
                    </select>
                    <select id="projectTypeFilter">
                        <option value="">All Project Types</option>
                        <option value="defi">DeFi</option>
                        <option value="nft">NFT</option>
                        <option value="dao">DAO</option>
                        <option value="gaming">Gaming</option>
                    </select>
                </div>
                
                <div class="matches-grid" id="matchesGrid">
                    <!-- Matches will be loaded here -->
                </div>
            </div>
        `;
    }

    renderChat() {
        return `
            <div class="chat-page">
                <div class="chat-sidebar">
                    <div class="chat-search">
                        <input type="text" placeholder="Search conversations..." id="chatSearch">
                    </div>
                    <div class="conversation-list" id="conversationList">
                        <!-- Conversations will be loaded here -->
                    </div>
                </div>
                
                <div class="chat-main">
                    <div class="chat-header" id="chatHeader">
                        <div class="chat-user-info">
                            <div class="user-avatar">👤</div>
                            <div class="user-details">
                                <div class="user-name">Select a conversation</div>
                                <div class="user-status">Start chatting with your matches</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="chat-messages" id="chatMessages">
                        <div class="empty-chat">
                            <h3>💬 Start a Conversation</h3>
                            <p>Select a match from the sidebar to begin chatting</p>
                        </div>
                    </div>
                    
                    <div class="chat-input" id="chatInput" style="display: none;">
                        <div class="input-container">
                            <input type="text" placeholder="Type your message..." id="messageInput">
                            <button class="send-btn" onclick="app.sendMessage()">Send</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderProjects() {
        return `
            <div class="projects-page">
                <div class="projects-header">
                    <h2>DAO Projects</h2>
                    <button class="btn-primary" onclick="app.createProject()">+ New Project</button>
                </div>
                
                <div class="project-tabs">
                    <button class="tab-btn active" data-tab="all">All Projects</button>
                    <button class="tab-btn" data-tab="my">My Projects</button>
                    <button class="tab-btn" data-tab="joined">Joined</button>
                    <button class="tab-btn" data-tab="featured">Featured</button>
                </div>
                
                <div class="projects-grid" id="projectsGrid">
                    <!-- Projects will be loaded here -->
                </div>
            </div>
        `;
    }

    renderMarketplace() {
        return `
            <div class="marketplace-page">
                <div class="marketplace-header">
                    <h2>DAO Marketplace</h2>
                    <div class="marketplace-stats">
                        <span>💰 Total Volume: 50,000 CS</span>
                        <span>🎨 NFTs Listed: 234</span>
                        <span>🪙 Tokens: 45</span>
                    </div>
                </div>
                
                <div class="marketplace-filters">
                    <select id="categoryFilter">
                        <option value="">All Categories</option>
                        <option value="nft">NFTs</option>
                        <option value="tokens">Tokens</option>
                        <option value="projects">Projects</option>
                    </select>
                    <select id="priceFilter">
                        <option value="">All Prices</option>
                        <option value="0-100">0-100 CS</option>
                        <option value="100-500">100-500 CS</option>
                        <option value="500+">500+ CS</option>
                    </select>
                </div>
                
                <div class="marketplace-grid" id="marketplaceGrid">
                    <!-- Marketplace items will be loaded here -->
                </div>
            </div>
        `;
    }

    renderProfile() {
        return `
            <div class="profile-page">
                <div class="profile-header">
                    <div class="profile-avatar">
                        <div class="avatar-circle">${this.currentUser?.alias?.charAt(0) || 'U'}</div>
                        <button class="change-avatar-btn">📷</button>
                    </div>
                    <div class="profile-info">
                        <h2>${this.currentUser?.alias || 'Anonymous'}</h2>
                        <p class="profile-bio">${this.currentUser?.bio || 'No bio yet'}</p>
                        <div class="profile-stats">
                            <span>🏆 Reputation: ${this.currentUser?.reputation || 0}</span>
                            <span>💰 CS Balance: ${this.currentUser?.cs_balance || 0}</span>
                            <span>🤝 Connections: ${this.currentUser?.connections || 0}</span>
                        </div>
                    </div>
                </div>
                
                <div class="profile-tabs">
                    <button class="tab-btn active" data-tab="edit">Edit Profile</button>
                    <button class="tab-btn" data-tab="skills">Skills</button>
                    <button class="tab-btn" data-tab="achievements">Achievements</button>
                    <button class="tab-btn" data-tab="portfolio">Portfolio</button>
                </div>
                
                <div class="profile-content" id="profileContent">
                    ${this.renderProfileEdit()}
                </div>
            </div>
        `;
    }

    renderProfileEdit() {
        return `
            <div class="profile-edit">
                <div class="form-section">
                    <h3>Basic Information</h3>
                    <div class="form-group">
                        <label>Alias</label>
                        <input type="text" id="profileAlias" value="${this.currentUser?.alias || ''}" placeholder="your.alias">
                    </div>
                    <div class="form-group">
                        <label>Bio</label>
                        <textarea id="profileBio" placeholder="Tell us about yourself...">${this.currentUser?.bio || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Location</label>
                        <input type="text" id="profileLocation" value="${this.currentUser?.location || ''}" placeholder="City, Country">
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>Skills & Interests</h3>
                    <div class="form-group">
                        <label>Primary Skills</label>
                        <div class="skill-tags" id="skillTags">
                            ${this.renderSkillTags()}
                        </div>
                        <input type="text" id="newSkill" placeholder="Add a skill...">
                        <button onclick="app.addSkill()">Add</button>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>Project Preferences</h3>
                    <div class="form-group">
                        <label>Preferred Project Types</label>
                        <div class="checkbox-group">
                            <label><input type="checkbox" value="defi"> DeFi</label>
                            <label><input type="checkbox" value="nft"> NFT</label>
                            <label><input type="checkbox" value="dao"> DAO</label>
                            <label><input type="checkbox" value="gaming"> Gaming</label>
                            <label><input type="checkbox" value="social"> Social</label>
                        </div>
                    </div>
                </div>
                
                <button class="btn-primary" onclick="app.saveProfile()">Save Profile</button>
            </div>
        `;
    }

    // Core functionality methods
    async findMatches() {
        if (!this.currentUser) {
            alert('Please complete your profile first');
            return;
        }

        try {
            const response = await fetch('/api/find-matches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.currentUser.alias,
                    skills: this.currentUser.skills || [],
                    interests: this.currentUser.interests || '',
                    projectTypes: this.currentUser.projectTypes || []
                })
            });

            const matches = await response.json();
            this.matches = matches;
            this.displayMatches(matches);
        } catch (error) {
            console.error('Matchmaking failed:', error);
        }
    }

    displayMatches(matches) {
        const grid = document.getElementById('matchesGrid');
        if (!grid) return;

        grid.innerHTML = matches.map(match => `
            <div class="match-card">
                <div class="match-header">
                    <div class="match-avatar">${match.alias.charAt(0)}</div>
                    <div class="match-info">
                        <h3>${match.alias}</h3>
                        <div class="match-score">🎯 ${match.compatibility}% match</div>
                    </div>
                </div>
                <div class="match-skills">
                    ${match.skills.slice(0, 3).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
                <div class="match-project">
                    <strong>Project:</strong> ${match.currentProject || 'Open to collaborate'}
                </div>
                <div class="match-actions">
                    <button class="btn-secondary" onclick="app.viewProfile('${match.alias}')">View Profile</button>
                    <button class="btn-primary" onclick="app.startChat('${match.alias}')">Start Chat</button>
                </div>
            </div>
        `).join('');
    }

    async startChat(matchAlias) {
        this.showPage('chat');
        // Initialize chat with specific user
        setTimeout(() => {
            this.openConversation(matchAlias);
        }, 100);
    }

    openConversation(userAlias) {
        const chatHeader = document.getElementById('chatHeader');
        const chatMessages = document.getElementById('chatMessages');
        const chatInput = document.getElementById('chatInput');

        chatHeader.innerHTML = `
            <div class="chat-user-info">
                <div class="user-avatar">${userAlias.charAt(0)}</div>
                <div class="user-details">
                    <div class="user-name">${userAlias}</div>
                    <div class="user-status">🟢 Online</div>
                </div>
            </div>
            <div class="chat-actions">
                <button onclick="app.videoCall('${userAlias}')">📹</button>
                <button onclick="app.shareScreen('${userAlias}')">🖥️</button>
            </div>
        `;

        chatMessages.innerHTML = `
            <div class="message-day">Today</div>
            <div class="message">
                <div class="message-avatar">${userAlias.charAt(0)}</div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-author">${userAlias}</span>
                        <span class="message-time">2:30 PM</span>
                    </div>
                    <div class="message-text">Hey! I saw we're a great match for collaboration. What kind of projects are you working on?</div>
                </div>
            </div>
        `;

        chatInput.style.display = 'block';
        this.currentChatUser = userAlias;
    }

    sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        if (!message || !this.currentChatUser) return;

        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message message-own';
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author">You</span>
                    <span class="message-time">${new Date().toLocaleTimeString()}</span>
                </div>
                <div class="message-text">${message}</div>
            </div>
            <div class="message-avatar">${this.currentUser?.alias?.charAt(0) || 'U'}</div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        input.value = '';

        // Emit to socket
        this.socket.emit('send-message', {
            to: this.currentChatUser,
            from: this.currentUser?.alias,
            message: message,
            timestamp: new Date()
        });
    }

    // Utility methods
    getProfileCompletion() {
        if (!this.currentUser) return 0;
        let completion = 0;
        if (this.currentUser.alias) completion += 20;
        if (this.currentUser.bio) completion += 20;
        if (this.currentUser.skills?.length > 0) completion += 20;
        if (this.currentUser.location) completion += 20;
        if (this.currentUser.wallet_address) completion += 20;
        return completion;
    }

    renderRecentChats() {
        return `
            <div class="recent-chat">
                <div class="chat-avatar">A</div>
                <div class="chat-info">
                    <div class="chat-name">alice.builder</div>
                    <div class="chat-preview">Let's discuss the Mars project...</div>
                </div>
                <div class="chat-time">2m</div>
            </div>
            <div class="recent-chat">
                <div class="chat-avatar">B</div>
                <div class="chat-info">
                    <div class="chat-name">bob.creator</div>
                    <div class="chat-preview">Great idea for the NFT collection!</div>
                </div>
                <div class="chat-time">1h</div>
            </div>
        `;
    }

    renderSkillTags() {
        const skills = this.currentUser?.skills || [];
        return skills.map(skill => `
            <span class="skill-tag">
                ${skill}
                <button onclick="app.removeSkill('${skill}')">×</button>
            </span>
        `).join('');
    }

    initDashboard() {
        // Initialize dashboard-specific functionality
    }

    initChat() {
        // Initialize chat-specific functionality
    }

    initProfile() {
        // Initialize profile-specific functionality
    }
}

// Initialize the app
window.app = new ConsilenceApp();