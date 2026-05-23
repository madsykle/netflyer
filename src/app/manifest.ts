import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Netflyer',
    short_name: 'Netflyer',
    description: 'Stream your favorite movies and TV shows in a clean cinematic player.',
    start_url: '/',
    display: 'standalone',
    background_color: '#080809',
    theme_color: '#e5091a',
    icons: [
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable' as any,
      },
    ],
  };
}
