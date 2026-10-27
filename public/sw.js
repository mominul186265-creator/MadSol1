// MadSol PWA Service Worker (PWABuilder & Android Compliant)
// STRICT PRIVACY: Personal data, authentication credentials, and sensitive API responses are NEVER cached.

const CACHE_NAME = 'madsol-static-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/MadSol_App_Icon_.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/favicon.png',
  '/favicon.ico',
  '/apple-touch-icon.png'
];

// Install: Pre-cache core static app shell only
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old cache versions immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strictly bypass cache for API routes, auth, and non-GET requests
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Vite development & internal bundles: NEVER intercept or cache in SW
  if (
    url.pathname.startsWith('/node_modules') ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/src') ||
    url.searchParams.has('v') ||
    url.searchParams.has('t') ||
    url.searchParams.has('import')
  ) {
    return;
  }

  // 2. Strict Security: NEVER cache API routes, auth endpoints, or dynamic data
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.includes('/auth') ||
    url.pathname.includes('/login') ||
    url.pathname.includes('/data') ||
    url.origin !== self.location.origin
  ) {
    // For external fonts (Google Fonts), cache safely for fast typography
    if (url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com')) {
      event.respondWith(
        caches.match(request).then((cached) => {
          return cached || fetch(request).then((response) => {
            if (response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          });
        })
      );
      return;
    }
    // Network only for all other dynamic / external requests
    return;
  }

  // 3. For navigation requests (HTML pages): Network first, falling back to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // 4. For static assets (CSS, JS, Images, Icons): Cache with background revalidation
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        }).catch(() => null);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // Default fallback: cache if available, else network
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
