# Consilience DAO Platform

A full-stack, mobile-responsive web application for general-purpose DAO collaboration. Built with Next.js, Node.js, PostgreSQL, and integrated with Solana blockchain and OpenAI GPT-3.5.

## Features

- **User Signup**: Create account with alias and interests
- **AI Matchmaking**: GPT-3.5 powered project matching
- **Real-time Chat**: WebSocket-based collaboration rooms
- **CS Token System**: Solana-based rewards (80% user, 20% founder)
- **QR Check-ins**: Event participation tracking
- **Project Marketplace**: Buy/fork DAO projects
- **MCP Integration**: Extend Amazon Q with custom Solana tools

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Node.js, Express, Socket.io
- **Database**: PostgreSQL
- **Blockchain**: Solana (devnet)
- **AI**: OpenAI GPT-3.5 Turbo
- **MCP**: Model Context Protocol server

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL
- OpenAI API key
- Solana devnet access

### Installation

1. Clone and install dependencies:
```bash
git clone https://github.com/yourusername/consilience-ai.git
cd consilience-ai
npm run install:all
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. Set up PostgreSQL database:
```bash
# Create database
createdb consilience

# Run schema
psql consilience < backend/database.sql
```

4. Start development servers:
```bash
npm run dev
```

Access the app at `http://localhost:3000`

## Environment Variables

Create `.env` file in root directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/consilience

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
FOUNDER_PRIVATE_KEY=your_solana_private_key_here

# Server
PORT=5000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

## Railway Deployment

### Database Setup

1. Create PostgreSQL database on Railway
2. Copy connection string to `DATABASE_URL`
3. Run schema: `psql $DATABASE_URL < backend/database.sql`

### Backend Deployment

1. Create new Railway service
2. Connect GitHub repository
3. Set environment variables
4. Deploy from `backend/` directory

### Frontend Deployment

1. Create new Railway service
2. Set `BACKEND_URL` to your backend service URL
3. Deploy from `frontend/` directory

## MCP Server Setup

The MCP server extends Amazon Q with Consilience-specific tools:

1. Install MCP server:
```bash
cd mcp-server
npm install
```

2. Configure Amazon Q to use the MCP server:
```json
{
  "mcpServers": {
    "consilience": {
      "command": "node",
      "args": ["/path/to/consilience-ai/mcp-server/index.js"]
    }
  }
}
```

3. Available MCP tools:
   - `get_solana_balance`: Check wallet balances
   - `get_dao_projects`: Fetch all projects
   - `get_user_profile`: Get user data
   - `ai_negotiate`: AI-powered negotiation

## API Endpoints

### Authentication
- `POST /api/signup` - Create user account
- `GET /api/user/:alias` - Get user profile
- `GET /api/leaderboard` - Top CS token holders

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create new project
- `POST /api/buy-project` - Purchase project

### AI & Blockchain
- `POST /api/find-match` - AI matchmaking
- `POST /api/verify-task` - AI task verification
- `POST /api/checkin` - QR check-in
- `GET /api/wallet/:address` - Solana wallet info
- `POST /api/mint-tokens` - Mint CS tokens

## Database Schema

### Users
- `alias` (unique identifier)
- `interests` (user skills/interests)
- `wallet_address` (Solana wallet)
- `cs_balance` (CS token balance)

### Projects
- `name`, `description`, `skills_needed`
- `owner_alias` (project owner)

### Matches
- `user1_alias`, `user2_alias`, `project_id`
- AI-generated collaborations

### Transactions
- CS token transfers and rewards
- Types: task_reward, checkin_reward, project_purchase

### Check-ins
- QR code event participation
- Links users to projects

## Workflow

1. **Signup**: User creates account with alias (e.g., 'Zoe.starBuilder') and interests
2. **Dashboard**: View projects, CS balance, leaderboard
3. **AI Matching**: GPT-3.5 suggests projects and tasks worth 100 CS
4. **Chat Room**: Real-time collaboration with WebSockets
5. **Task Submission**: Upload proof, AI verification, token minting
6. **QR Check-in**: Event participation rewards (5 CS tokens)
7. **Marketplace**: Buy/fork projects with CS tokens

## Token Economics

- **Task Completion**: 100 CS (80% user, 20% founder)
- **QR Check-in**: 5 CS (80% user, 20% founder)
- **Project Purchase**: Variable CS cost
- **Founder Fee**: 20% of all minted tokens

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## License

MIT License - see LICENSE file for details