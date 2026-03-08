/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.googletagmanager.com https://www.google-analytics.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://image.tmdb.org https://images.unsplash.com https://lh3.googleusercontent.com https://www.google-analytics.com https://www.googletagmanager.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.themoviedb.org https://firestore.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://firebase.googleapis.com https://firebaseinstallations.googleapis.com https://*.googleapis.com https://*.firebaseio.com https://www.google-analytics.com https://stats.g.doubleclick.net; frame-src 'self' https://www.youtube.com https://netflyer-5aac5.firebaseapp.com https://apis.google.com https://vidplus.tv https://vidsrc.pk https://vidsrc.icu https://vidlink.pro https://embed.su https://vidsrc-embed.ru https://vidsrc-embed.su https://vidsrcme.su https://vsrc.su;",
          },
        ],
      },
    ];
  },
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