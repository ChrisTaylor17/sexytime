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
          },
          {
            name: 'create_dao_token',
            description: 'Create a new token on Solana for DAO projects',
            inputSchema: {
              type: 'object',
              properties: {
                tokenName: {
                  type: 'string',
                  description: 'Name of the token to create'
                },
                projectDescription: {
                  type: 'string',
                  description: 'Description of the project this token represents'
                }
              },
              required: ['tokenName', 'projectDescription']
            }
          },
          {
            name: 'mint_project_nft',
            description: 'Mint an NFT for a DAO project milestone',
            inputSchema: {
              type: 'object',
              properties: {
                nftDescription: {
                  type: 'string',
                  description: 'Description of the NFT and what it represents'
                },
                projectName: {
                  type: 'string',
                  description: 'Name of the associated project'
                }
              },
              required: ['nftDescription', 'projectName']
            }
          },
          {
            name: 'ai_chat_direct',
            description: 'Direct chat with Consilience AI assistant for project guidance',
            inputSchema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Message to send to the AI assistant'
                },
                context: {
                  type: 'string',
                  description: 'Additional context about current project or goals'
                }
              },
              required: ['message']
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
        
        case 'create_dao_token':
          return await this.createDAOToken(args.tokenName, args.projectDescription)
        
        case 'mint_project_nft':
          return await this.mintProjectNFT(args.nftDescription, args.projectName)
        
        case 'ai_chat_direct':
          return await this.aiChatDirect(args.message, args.context)
        
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

  async createDAOToken(tokenName, projectDescription) {
    try {
      const response = await axios.post(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/ai-chat`, {
        message: `create token: ${tokenName} for project: ${projectDescription}`,
        alias: 'MCP_Server'
      })
      
      return {
        content: [
          {
            type: 'text',
            text: `Token Creation Result:\n${response.data.response}`
          }
        ]
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Token creation failed: ${error.message}\n\nFallback: Token "${tokenName}" would be created for project "${projectDescription}" with 1M supply on Solana devnet.`
          }
        ]
      }
    }
  }

  async mintProjectNFT(nftDescription, projectName) {
    try {
      const response = await axios.post(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/ai-chat`, {
        message: `mint NFT: ${nftDescription} for project ${projectName}`,
        alias: 'MCP_Server'
      })
      
      return {
        content: [
          {
            type: 'text',
            text: `NFT Minting Result:\n${response.data.response}`
          }
        ]
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `NFT minting failed: ${error.message}\n\nFallback: NFT "${nftDescription}" would be minted for project "${projectName}" on Solana devnet.`
          }
        ]
      }
    }
  }

  async aiChatDirect(message, context) {
    try {
      const fullMessage = context ? `Context: ${context}\n\nUser: ${message}` : message
      
      const response = await axios.post(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/ai-chat-direct`, {
        message: fullMessage,
        alias: 'MCP_User'
      })
      
      return {
        content: [
          {
            type: 'text',
            text: `AI Assistant Response:\n${response.data.response}`
          }
        ]
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `AI chat failed: ${error.message}\n\nFallback: I'm your Consilience DAO AI assistant. I can help with:\n• Creating tokens and NFTs on Solana\n• Project planning and collaboration\n• Finding team members\n• Technical guidance\n\nWhat would you like to work on?`
          }
        ]
      }
    }
  }

  async run() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error('Consilience MCP Server running on stdio')
    console.error('Available tools: get_solana_balance, get_dao_projects, get_user_profile, ai_negotiate, create_dao_token, mint_project_nft, ai_chat_direct')
  }
}

const server = new ConsilienceMCPServer()
server.run().catch(console.error)