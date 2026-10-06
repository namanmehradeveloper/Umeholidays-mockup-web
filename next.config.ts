import type { NextConfig } from 'next';

import { getConfiguredBackendUrl, LOCAL_BACKEND_URL } from './lib/backend-url';

// Rewrites are serialized into .next/routes-manifest.json at build time. By
// default /api/* goes to the backend that `npm run start` runs in the same
// service; set API_URL at build time only to point at an external backend.
const apiUrl = getConfiguredBackendUrl() || LOCAL_BACKEND_URL;

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
