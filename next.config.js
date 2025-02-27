/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizeFonts: true, // Ensure Next.js optimizes Google Fonts
  },
}

module.exports = nextConfig

