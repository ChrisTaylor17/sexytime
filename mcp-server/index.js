#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js')
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js')
const { Connection, PublicKey } = require('@solana/web3.js')
const axios = require('axios')
require('dotenv').config()

class ConsilienceMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'consilience-dao',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    )

    this.solanaConnection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com'
    )
    
    this.setupToolHandlers()
  }

  setupToolHandlers() {
    // Solana wallet balance tool
    this.server.setRequestHandler('tools/list', async () => {
      return {
        tools: [
          {
            name: 'get_solana_balance',
            description: 'Get Solana wallet balance for a given address',
            inputSchema: {
              type: 'object',
              properties: {
                address: {
                  type: 'string',
                  description: 'Solana wallet address'
                }
              },
              required: ['address']
            }
          },
          {
            name: 'get_dao_projects',
            description: 'Fetch all DAO projects from Consilience platform',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'get_user_profile',
            description: 'Get user profile and CS token balance',
            inputSchema: {
              type: 'object',
              properties: {
                alias: {
                  type: 'string',
                  description: 'User alias'
                }
              },
              required: ['alias']
            }
          },
          {
            name: 'ai_negotiate',
            description: 'Use AI to negotiate DAO collaboration terms',
            inputSchema: {
              type: 'object',
              properties: {
                proposal: {
                  type: 'string',
                  description: 'Collaboration proposal to negotiate'
                },
                userInterests: {
                  type: 'string',
                  description: 'User interests and skills'
                }
              },
              required: ['proposal', 'userInterests']
            }
          }
        ]
      }
    })

    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params

      switch (name) {
        case 'get_solana_balance':
          return await this.getSolanaBalance(args.address)
        
        case 'get_dao_projects':
          return await this.getDAOProjects()
        
        case 'get_user_profile':
          return await this.getUserProfile(args.alias)
        
        case 'ai_negotiate':
          return await this.aiNegotiate(args.proposal, args.userInterests)
        
        default:
          throw new Error(`Unknown tool: ${name}`)
      }
    })
  }

  async getSolanaBalance(address) {
    try {
      const publicKey = new PublicKey(address)
      const balance = await this.solanaConnection.getBalance(publicKey)
      
      return {
        content: [
          {
            type: 'text',
            text: `Solana wallet ${address} has ${balance / 1000000000} SOL on devnet`
          }
        ]
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching balance: ${error.message}`
          }
        ]
      }
    }
  }

  async getDAOProjects() {
    try {
      const response = await axios.get(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/projects`)
      const projects = response.data
      
      const projectList = projects.map(p => 
        `• ${p.name}: ${p.description} (Skills: ${p.skills_needed})`
      ).join('\n')
      
      return {
        content: [
          {
            type: 'text',
            text: `Current DAO Projects:\n${projectList}`
          }
        ]
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching projects: ${error.message}`
          }
        ]
      }
    }
  }

  async getUserProfile(alias) {
    try {
      const response = await axios.get(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/user/${alias}`)
      const user = response.data
      
      return {
        content: [
          {
            type: 'text',
            text: `User Profile for ${user.alias}:
• Interests: ${user.interests}
• CS Token Balance: ${user.cs_balance}
• Wallet: ${user.wallet_address}
• Member since: ${new Date(user.created_at).toLocaleDateString()}`
          }
        ]
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching user profile: ${error.message}`
          }
        ]
      }
    }
  }

  async aiNegotiate(proposal, userInterests) {
    try {
      // Simulate AI negotiation logic
      const negotiationPoints = [
        `Based on your interests in "${userInterests}", here's my analysis of the proposal:`,
        `• Alignment Score: ${Math.floor(Math.random() * 40) + 60}%`,
        `• Suggested CS Token Reward: ${Math.floor(Math.random() * 200) + 100}`,
        `• Recommended Role: ${this.getRecommendedRole(userInterests)}`,
        `• Risk Assessment: ${this.getRiskLevel()}`,
        `• Collaboration Timeline: ${Math.floor(Math.random() * 8) + 2} weeks`
      ]
      
      return {
        content: [
          {
            type: 'text',
            text: `AI Negotiation Analysis:\n${negotiationPoints.join('\n')}\n\nRecommendation: ${this.getRecommendation()}`
          }
        ]
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error in AI negotiation: ${error.message}`
          }
        ]
      }
    }
  }

  getRecommendedRole(interests) {
    const roles = ['Technical Lead', 'Project Manager', 'Researcher', 'Designer', 'Advisor']
    return roles[Math.floor(Math.random() * roles.length)]
  }

  getRiskLevel() {
    const levels = ['Low', 'Medium', 'High']
    return levels[Math.floor(Math.random() * levels.length)]
  }

  getRecommendation() {
    const recommendations = [
      'Proceed with collaboration - strong alignment detected',
      'Request additional details before committing',
      'Negotiate higher token allocation',
      'Suggest alternative timeline'
    ]
    return recommendations[Math.floor(Math.random() * recommendations.length)]
  }

  async run() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error('Consilience MCP Server running on stdio')
  }
}

const server = new ConsilienceMCPServer()
server.run().catch(console.error)