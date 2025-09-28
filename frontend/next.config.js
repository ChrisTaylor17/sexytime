/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Force rebuild - remove demo mode
  generateBuildId: async () => {
    return 'remove-demo-' + Date.now()
  },
  trailingSlash: false,
  async rewrites() {
    return [
      {
        source: '/tasks',
        destination: '/tasks'
      }
    ]
  }
}

module.exports = nextConfig