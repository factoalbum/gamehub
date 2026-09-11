import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/gamehub',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
