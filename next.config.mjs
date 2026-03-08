/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
    ],
  },
  // swcMinify was removed in Next.js 13+ - delete it entirely
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // experimental.workerThreads and experimental.cpus are deprecated
  // Only keep what Next.js 15 actually supports
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroui/react'],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;