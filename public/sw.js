const CACHE_NAME = 'netflyer-cache-v1';
const IMAGE_CACHE_NAME = 'netflyer-images-v1';
const API_CACHE_NAME = 'netflyer-api-v1';

const ASSETS_TO_CACHE = [
  '/',
  '/favicon.ico',
  '/logo.png',
  '/not-found.png',
  '/placeholder-avatar.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, IMAGE_CACHE_NAME, API_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!cacheWhitelist.includes(key)) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. TMDB Images Caching: Cache-First Strategy
  if (url.hostname === 'image.tmdb.org') {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((networkResponse) => {
            // Only cache successful image requests
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // 2. TMDB API Proxy Caching: Stale-While-Revalidate Strategy
  if (url.pathname === '/api/tmdb') {
    event.respondWith(
      caches.open(API_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Prevent catching other internal APIs (like auth or admin) or streaming servers
  if (url.pathname.startsWith('/api/') || url.hostname.includes('vidking') || url.hostname.includes('vidlink') || url.hostname.includes('vidsrc')) {
    return;
  }

  // 3. Static Assets: Cache-First with network fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
