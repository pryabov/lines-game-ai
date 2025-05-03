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

// URLs that should never be cached
const NEVER_CACHE_URLS = [
  '/gtag',
  '/analytics',
  '/collect',
  '/beacon'
];

// Check if a request should be cached
const shouldCache = (request) => {
  // Only cache GET requests
  if (request.method !== 'GET') {
    return false;
  }

  // Don't cache analytics, beacons, etc.
  if (NEVER_CACHE_URLS.some(url => request.url.includes(url))) {
    return false;
  }

  // Don't cache non-same-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return false;
  }

  return true;
};

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
  // Handle only GET requests that should be cached
  if (!shouldCache(event.request)) {
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
            // Don't cache if response is not ok or not basic type
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response as it's a stream and can only be consumed once
            const responseToCache = response.clone();

            // Cache the response
            caches.open(CACHE_NAME)
              .then((cache) => {
                try {
                  cache.put(event.request, responseToCache);
                } catch (error) {
                  console.error('Failed to cache response:', error);
                }
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