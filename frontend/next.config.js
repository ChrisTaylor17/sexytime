/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Force rebuild
  generateBuildId: async () => {
    return 'profile-v3-' + Date.now()
  }
}

module.exports = nextConfig