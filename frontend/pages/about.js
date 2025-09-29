import { Layout } from '../components/ui/layout'
import { Button } from '../components/ui/button'
import { AnimatedGroup } from '../components/ui/animated-group'
import Link from 'next/link'

export default function About() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <section className="py-24">
          <div className="mx-auto max-w-4xl px-6">
            <AnimatedGroup className="text-center mb-16">
              <h1 className="text-5xl font-bold mb-6">About Consilience DAO</h1>
              <p className="text-xl text-muted-foreground">
                Building the future of decentralized collaboration through AI-powered innovation
              </p>
            </AnimatedGroup>

            <AnimatedGroup className="prose prose-lg max-w-none">
              <div className="bg-card p-8 rounded-lg border mb-8">
                <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                <p className="text-muted-foreground mb-4">
                  Consilience DAO is revolutionizing how people collaborate in the Web3 space. We combine artificial intelligence, 
                  blockchain technology, and human creativity to create a platform where innovation thrives through meaningful connections.
                </p>
                <p className="text-muted-foreground">
                  Our AI-powered matchmaking system connects builders, creators, and visionaries based on complementary skills and 
                  shared interests, fostering collaborations that drive the decentralized economy forward.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="text-xl font-semibold mb-3">🎯 Vision</h3>
                  <p className="text-muted-foreground">
                    A world where every innovator finds their perfect collaborators, and every great idea gets the team it deserves.
                  </p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="text-xl font-semibold mb-3">⚡ Values</h3>
                  <p className="text-muted-foreground">
                    Transparency, innovation, collaboration, and fair reward distribution through decentralized governance.
                  </p>
                </div>
              </div>

              <div className="bg-card p-8 rounded-lg border mb-8">
                <h2 className="text-2xl font-semibold mb-4">Technology Stack</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Frontend</h4>
                    <ul className="text-muted-foreground text-sm space-y-1">
                      <li>Next.js 14</li>
                      <li>React 18</li>
                      <li>Tailwind CSS</li>
                      <li>Framer Motion</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Backend</h4>
                    <ul className="text-muted-foreground text-sm space-y-1">
                      <li>Node.js</li>
                      <li>Express</li>
                      <li>PostgreSQL</li>
                      <li>Socket.io</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Web3</h4>
                    <ul className="text-muted-foreground text-sm space-y-1">
                      <li>Solana Blockchain</li>
                      <li>SPL Tokens</li>
                      <li>Metaplex NFTs</li>
                      <li>OpenAI GPT-3.5</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-card p-8 rounded-lg border">
                <h2 className="text-2xl font-semibold mb-4">Token Economics</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Task Completion Rewards</span>
                    <span className="font-semibold">100 CS (80% user, 20% platform)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>QR Check-in Rewards</span>
                    <span className="font-semibold">5 CS (80% user, 20% platform)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Project Marketplace</span>
                    <span className="font-semibold">Variable CS cost</span>
                  </div>
                </div>
              </div>
            </AnimatedGroup>

            <AnimatedGroup className="text-center mt-16">
              <div className="space-y-4">
                <Button asChild size="lg">
                  <Link href="/dashboard">Join Our Community</Link>
                </Button>
                <div>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/features">Explore Features</Link>
                  </Button>
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>
      </div>
    </Layout>
  )
}