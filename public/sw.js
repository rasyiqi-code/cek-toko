const CACHE_NAME = 'cektoko-v5';
const APP_SHELL = '/';

const INITIAL_ASSETS = [
  '/',
  '/login',
  '/dashboard',
  '/products',
  '/categories',
  '/stock',
  '/reports',
  '/users',
  '/activate-license',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing version:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[SW] Pre-caching all routes...');
      for (const asset of INITIAL_ASSETS) {
        try {
          const response = await fetch(asset, { 
            redirect: 'follow',
            cache: 'no-cache'
          });
          if (response.ok) {
            await cache.put(asset, response);
            console.log('[SW] Pre-cached:', asset);
          }
        } catch (e) {
          console.warn('[SW] Pre-cache failed for:', asset, e);
        }
      }
      console.log('[SW] Pre-caching complete.');
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating v5 and claiming clients...');
  event.waitUntil(
    caches.keys().then((keys) => 
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // 1. Navigation Requests (HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async (networkResponse) => {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
          return networkResponse;
        })
        .catch(async () => {
          console.log('[SW] Offline Navigation fallback for:', url.pathname);
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(request) || await cache.match(APP_SHELL);
          return cachedResponse || Response.error();
        })
    );
    return;
  }

  // 2. Static Assets & RSC Data (Cache-First strategy)
  const isCachable = 
    url.pathname.startsWith('/_next/') || 
    url.pathname.includes('icon') || 
    url.search.includes('_rsc=');

  if (isCachable) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) return cachedResponse;

        return fetch(request).then((networkResponse) => {
          if (networkResponse.ok && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => null);
      })
    );
    return;
  }

  // 3. Default (Cache falling back to network)
  event.respondWith(
    caches.match(request).then(response => response || fetch(request))
  );
});

// Listener for force-skip message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
