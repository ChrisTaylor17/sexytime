-- Enhanced Consilience DAO Database Schema (SQLite)

-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alias VARCHAR(50) UNIQUE NOT NULL,
    interests TEXT NOT NULL,
    wallet_address VARCHAR(100) NOT NULL,
    cs_balance INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    skills_needed TEXT NOT NULL,
    owner_alias VARCHAR(50),
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
    alias VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
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

-- Indexes for performance
CREATE INDEX idx_users_alias ON users(alias);
CREATE INDEX idx_projects_owner ON projects(owner_alias);
CREATE INDEX idx_messages_project ON messages(project_id);
CREATE INDEX idx_nfts_owner ON nfts(owner_alias);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);

-- Insert sample projects
INSERT INTO projects (name, description, skills_needed) VALUES
('Mars Colony Planning', 'Design sustainable habitats for Mars colonization', 'engineering, architecture, sustainability'),
('Ocean Cleanup Initiative', 'Develop technology to remove plastic from oceans', 'marine biology, engineering, environmental science'),
('AI Ethics Framework', 'Create guidelines for ethical AI development', 'philosophy, computer science, law'),
('Renewable Energy Grid', 'Build decentralized renewable energy network', 'electrical engineering, blockchain, project management'),
('Space Debris Removal', 'Design systems to clean up space junk', 'aerospace engineering, robotics, space science');