/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const cspHeader = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? '' : " 'unsafe-eval'"} https://apis.google.com https://www.googletagmanager.com https://www.google-analytics.com https://www.gstatic.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https://image.tmdb.org https://btttr.cc https://tcdn.fanart.tv https://images.unsplash.com https://lh3.googleusercontent.com https://www.google-analytics.com https://www.googletagmanager.com",
  "font-src 'self' https://fonts.gstatic.com",
  // https: added so hls.js can reach the rotating vidsrc CDN hosts (see wayfinder #8)
  `connect-src 'self' https: https://api.themoviedb.org https://api.github.com https://webservice.fanart.tv https://firestore.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://firebase.googleapis.com https://firebaseinstallations.googleapis.com https://*.googleapis.com https://*.firebaseio.com https://www.google-analytics.com https://stats.g.doubleclick.net https://*.vidzee.wtf https://*.4khdhub.com https://*.mp4hydra.net https://vixsrc.io https://vixsrc.to https://*.vixsrc.to https://*.sc-u8-01.vixsrc.to https://xprime.com.ng https://moviesmod.com https://showbox.apptm.sclevercomputech.com https://febbox.com https://pstream.net${isProd ? '' : ' http://localhost:*'}`,
  "media-src 'self' blob: https: https://*.vidzee.wtf https://*.4khdhub.com https://*.mp4hydra.net https://vixsrc.io https://vixsrc.to https://*.vixsrc.to https://*.sc-u8-01.vixsrc.to https://xprime.com.ng https://moviesmod.com https://showbox.apptm.sclevercomputech.com https://febbox.com https://pstream.net https://vidplay.filmogle.top https://streamwish.com https://vidguard.com https://streamtape.com https://doodstream.com https://filemoon.sx https://highload.to https://vtube.to https://voe.sx",
  "frame-src 'self' https://www.youtube.com https://netflyer-5aac5.firebaseapp.com https://apis.google.com https://www.vidking.net https://vidking.net https://vidsrc.pk https://vidlink.pro https://vidsrc-embed.ru https://vidsrc-embed.su https://vsrc.su https://vidplay.filmogle.top https://streamwish.com https://vidguard.com https://streamtape.com https://doodstream.com https://filemoon.sx https://highload.to https://vtube.to https://voe.sx https://player.vidguard.xyz https://vixsrc.to https://*.vixsrc.to https://*.sc-u8-01.vixsrc.to https://vixsrc.io https://vidzee.wtf https://core.vidzee.wtf https://4khdhub.com https://mp4hydra.net https://moviesmod.com https://xprime.com.ng;"
].join('; ');

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
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
            key: 'Permissions-Policy',
            value: 'browsing-topics=(), run-ad-auction=(), join-ad-interest-group=(), private-aggregation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'https', hostname: 'btttr.cc' },
      { protocol: 'https', hostname: 'tcdn.fanart.tv' },
    ],
  },
  compiler: {
    removeConsole: isProd,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@phosphor-icons/react'],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;