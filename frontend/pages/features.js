import { Layout } from '../components/ui/layout'
import { Button } from '../components/ui/button'
import { AnimatedGroup } from '../components/ui/animated-group'
import Link from 'next/link'

export default function Features() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <AnimatedGroup className="text-center mb-16">
              <h1 className="text-5xl font-bold mb-6">Platform Features</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Discover the powerful tools that make Consilience DAO the ultimate platform for decentralized collaboration
              </p>
            </AnimatedGroup>

            <AnimatedGroup className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-card p-8 rounded-lg border">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">AI Matchmaking</h3>
                <p className="text-muted-foreground mb-4">
                  Advanced GPT-powered algorithms match you with perfect collaborators and projects based on your skills and interests.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/chatbot">Try AI Matchmaker</Link>
                </Button>
              </div>

              <div className="bg-card p-8 rounded-lg border">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Token Rewards</h3>
                <p className="text-muted-foreground mb-4">
                  Earn CS tokens for contributions with our 80/20 reward split. Real blockchain rewards on Solana devnet.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/tokens">View Tokens</Link>
                </Button>
              </div>

              <div className="bg-card p-8 rounded-lg border">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">NFT Creation</h3>
                <p className="text-muted-foreground mb-4">
                  Create and mint real NFTs on Solana. Achievement badges and custom collections for your projects.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/nfts">Explore NFTs</Link>
                </Button>
              </div>

              <div className="bg-card p-8 rounded-lg border">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Real-time Chat</h3>
                <p className="text-muted-foreground mb-4">
                  WebSocket-powered collaboration rooms for seamless team communication and project coordination.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/projects">Join Projects</Link>
                </Button>
              </div>

              <div className="bg-card p-8 rounded-lg border">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🏛️</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">DAO Governance</h3>
                <p className="text-muted-foreground mb-4">
                  Participate in decentralized decision-making with transparent voting and proposal systems.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard">Join DAO</Link>
                </Button>
              </div>

              <div className="bg-card p-8 rounded-lg border">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🔗</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Web3 Integration</h3>
                <p className="text-muted-foreground mb-4">
                  Native Solana wallet integration with real blockchain transactions and decentralized asset management.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard">Connect Wallet</Link>
                </Button>
              </div>
            </AnimatedGroup>

            <AnimatedGroup className="text-center mt-16">
              <Button asChild size="lg">
                <Link href="/dashboard">Get Started Today</Link>
              </Button>
            </AnimatedGroup>
          </div>
        </section>
      </div>
    </Layout>
  )
}