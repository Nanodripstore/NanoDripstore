/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true 
  },
  // Optimize for Netlify deployment
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  }
};

module.exports = nextConfig;
