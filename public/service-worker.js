// Service Worker for Lines Game

// Cache name with version
const CACHE_NAME = 'lines-game-v1';

// Resources to cache initially
const INITIAL_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  // This assumes that webpack or your bundler outputs to these static files
  '/static/js/main.js',
  '/static/css/main.css'
];

// Install event - cache initial resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(INITIAL_CACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME];
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
      })
      .then((cachesToDelete) => {
        return Promise.all(cachesToDelete.map((cacheToDelete) => {
          return caches.delete(cacheToDelete);
        }));
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache if available, fetch from network otherwise
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests like Google Analytics
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            // Don't cache responses from analytics, non-CORS, etc.
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response as it's a stream and can only be consumed once
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            // For navigation fallback to index.html
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            console.error('Fetch failed:', error);
            throw error;
          });
      })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  // Check if client asks to skip waiting
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 