import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL;
const backendHost = backendUrl ? new URL(backendUrl) : null;

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'images.unsplash.com',
      'plus.unsplash.com',
      'images.pexels.com',
      'res.cloudinary.com', // Cloudinary-hosted property/agent images
      ...(backendHost ? [backendHost.hostname] : []),
      'onlyif-backend-updated-production-b4e3.up.railway.app', // ❗hostname only
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'onlyif-backend-updated-production-b4e3.up.railway.app' },
      ...(backendHost
        ? [{
            protocol: (backendHost.protocol.replace(':', '') as 'http' | 'https'),
            hostname: backendHost.hostname,
            port: backendHost.port || undefined,
          }]
        : []),
    ],
  },
};

export default nextConfig;
