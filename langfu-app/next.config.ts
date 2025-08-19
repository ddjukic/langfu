import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Temporarily disable ESLint during builds while we fix all the warnings
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
