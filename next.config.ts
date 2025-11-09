import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Add domains alongside remotePatterns for broader compatibility
    domains: [
      'localhost',
      '127.0.0.1',
      'images.unsplash.com',
      'plus.unsplash.com',
      'images.pexels.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5000',
      },
    ],
  },
};

export default nextConfig;
