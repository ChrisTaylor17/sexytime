-- Enhanced Consilience DAO Database Schema (SQLite)

-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alias VARCHAR(50) UNIQUE NOT NULL,
    interests TEXT NOT NULL,
    wallet_address VARCHAR(100) NOT NULL,
    cs_balance INTEGER DEFAULT 0,
    profile_image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    skills_needed TEXT NOT NULL,
    owner_alias VARCHAR(50),
    type VARCHAR(50) DEFAULT 'collaboration',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Matches table
CREATE TABLE matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user1_alias VARCHAR(50) NOT NULL,
    user2_alias VARCHAR(50) NOT NULL,
    project_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_alias VARCHAR(50),
    to_alias VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Check-ins table
CREATE TABLE checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alias VARCHAR(50) NOT NULL,
    project_id INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Messages table for persistent chat
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    sender VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- NFTs table
CREATE TABLE nfts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mint_address VARCHAR(100) UNIQUE NOT NULL,
    owner_alias VARCHAR(50) NOT NULL,
    name VARCHAR(200),
    image_url TEXT,
    metadata_uri TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_alias) REFERENCES users(alias)
);

-- Tokens table
CREATE TABLE tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    supply INTEGER NOT NULL,
    description TEXT,
    creator VARCHAR(50) NOT NULL,
    project_id INTEGER,
    mint_address VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator) REFERENCES users(alias),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- NFT Collections table
CREATE TABLE nft_collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image TEXT,
    supply INTEGER NOT NULL,
    creator VARCHAR(50) NOT NULL,
    project_id INTEGER,
    mint_address VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator) REFERENCES users(alias),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- User sessions for wallet connections
CREATE TABLE user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alias VARCHAR(50) NOT NULL,
    wallet_address VARCHAR(100) NOT NULL,
    session_token VARCHAR(100) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alias) REFERENCES users(alias)
);

-- Tasks table for AI verification system
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    reward INTEGER DEFAULT 100,
    required_verifications INTEGER DEFAULT 2,
    creator VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'open',
    submissions TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator) REFERENCES users(alias)
);

-- Indexes for performance
CREATE INDEX idx_users_alias ON users(alias);
CREATE INDEX idx_projects_owner ON projects(owner_alias);
CREATE INDEX idx_messages_project ON messages(project_id);
CREATE INDEX idx_nfts_owner ON nfts(owner_alias);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_tokens_creator ON tokens(creator);
CREATE INDEX idx_nft_collections_creator ON nft_collections(creator);
CREATE INDEX idx_tasks_creator ON tasks(creator);
CREATE INDEX idx_tasks_status ON tasks(status);

-- Insert sample projects
INSERT INTO projects (name, description, skills_needed, owner_alias, type) VALUES
('Mars Colony Planning', 'Design sustainable habitats for Mars colonization', 'engineering, architecture, sustainability', 'system', 'collaboration'),
('Ocean Cleanup Initiative', 'Develop technology to remove plastic from oceans', 'marine biology, engineering, environmental science', 'system', 'collaboration'),
('AI Ethics Framework', 'Create guidelines for ethical AI development', 'philosophy, computer science, law', 'system', 'collaboration'),
('Renewable Energy Grid', 'Build decentralized renewable energy network', 'electrical engineering, blockchain, project management', 'system', 'collaboration'),
('Space Debris Removal', 'Design systems to clean up space junk', 'aerospace engineering, robotics, space science', 'system', 'collaboration');

-- Insert sample tasks
INSERT INTO tasks (title, description, reward, required_verifications, creator, status) VALUES
('Design Landing Page', 'Create a modern landing page design for our DAO platform with responsive layout', 150, 2, 'system', 'open'),
('Smart Contract Audit', 'Review and audit the token distribution smart contract for security vulnerabilities', 300, 3, 'system', 'open'),
('Logo Design', 'Design a professional logo for the Consilience DAO brand identity', 100, 2, 'system', 'open'),
('Write Documentation', 'Create comprehensive API documentation for the platform', 200, 2, 'system', 'open'),
('Mobile App Prototype', 'Design and prototype mobile app interface for DAO participation', 250, 2, 'system', 'open');