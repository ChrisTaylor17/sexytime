-- Consilience DAO Database Schema

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    alias VARCHAR(50) UNIQUE NOT NULL,
    interests TEXT NOT NULL,
    wallet_address VARCHAR(100) NOT NULL,
    cs_balance INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    skills_needed TEXT NOT NULL,
    owner_alias VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_alias) REFERENCES users(alias)
);

-- Matches table
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    user1_alias VARCHAR(50) NOT NULL,
    user2_alias VARCHAR(50) NOT NULL,
    project_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_alias) REFERENCES users(alias),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    from_alias VARCHAR(50),
    to_alias VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'task_reward', 'checkin_reward', 'project_purchase', 'founder_fee'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Check-ins table
CREATE TABLE checkins (
    id SERIAL PRIMARY KEY,
    alias VARCHAR(50) NOT NULL,
    project_id INTEGER NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alias) REFERENCES users(alias),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Insert sample projects
INSERT INTO projects (name, description, skills_needed) VALUES
('Mars Colony Planning', 'Design sustainable habitats for Mars colonization', 'engineering, architecture, sustainability'),
('Ocean Cleanup Initiative', 'Develop technology to remove plastic from oceans', 'marine biology, engineering, environmental science'),
('AI Ethics Framework', 'Create guidelines for ethical AI development', 'philosophy, computer science, law'),
('Renewable Energy Grid', 'Build decentralized renewable energy network', 'electrical engineering, blockchain, project management'),
('Space Debris Removal', 'Design systems to clean up space junk', 'aerospace engineering, robotics, space science');