/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Force rebuild
  generateBuildId: async () => {
    return 'force-dashboard-' + Date.now()
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