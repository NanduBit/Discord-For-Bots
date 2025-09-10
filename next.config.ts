import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow images from any domain
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // This wildcard allows any hostname
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**', // Also allow HTTP for development purposes
        port: '',
        pathname: '/**',
      },
    ],
    // Set a reasonable size limit to prevent abuse
    minimumCacheTTL: 60, // Cache for at least 60 seconds
  },
};

export default nextConfig;
