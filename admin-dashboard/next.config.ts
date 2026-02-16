import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['admin-barcody.tamarin-ph.ts.net', 'localhost:3001'],
    },
  },
  basePath: '/admin',
};

export default nextConfig;
