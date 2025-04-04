/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  experimental: {
    webpackBuildWorker: false,
    parallelServerCompiles: false,
    parallelServerBuildTraces: false,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  }
};

export default nextConfig;
