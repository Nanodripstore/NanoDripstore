/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true 
  },
  // Ensure compatibility with Netlify
  trailingSlash: false,
};

module.exports = nextConfig;
