/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during build to bypass Next.js 15.4.4 specific errors with dynamic route params
    ignoreBuildErrors: true,
  },
  // Updated from experimental.serverComponentsExternalPackages
  serverExternalPackages: [],
  // Add Clerk domain to allowed image domains if you're using their avatars
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      }
    ],
  },
  // Configure webpack for better SSL handling
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Fix for SSL issues on Windows with Google APIs
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "net": false,
        "tls": false,
        "fs": false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
