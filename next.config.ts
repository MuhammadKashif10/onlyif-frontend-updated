import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
const backendHost = backendUrl ? new URL(backendUrl) : null;

const nextConfig: NextConfig = {
  experimental: {
    // Skip prerendering API routes to avoid build-time env var issues
    isrMemoryCacheSize: 0,
  },
  eslint: {
    // Don't fail the production build on ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't fail the production build on type errors
    ignoreBuildErrors: true,
  },
  images: {
    // Core image domains
    domains: [
      'images.unsplash.com',
      'plus.unsplash.com',
      'images.pexels.com',
      // Allow backend host for uploaded images when configured
      ...(backendHost ? [backendHost.hostname] : []),
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
      // Dynamically allow backend uploads domain (including Railway / custom domains)
      ...(backendHost
        ? [{
            protocol: backendHost.protocol.replace(':', '') as 'http' | 'https',
            hostname: backendHost.hostname,
            port: backendHost.port || undefined,
          }]
        : []),
    ],
  },
};

export default nextConfig;
