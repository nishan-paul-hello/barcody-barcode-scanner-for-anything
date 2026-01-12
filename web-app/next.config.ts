import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.openfoodfacts.org',
        port: '',
        pathname: '/images/products/**',
      },
    ],
  },
};

export default nextConfig;
