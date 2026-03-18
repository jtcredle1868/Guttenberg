/* ─────────────────────────────────────────────────────────────────────────────
   Guttenberg Service Worker — guttenberg-v1
   Cache-first for static assets · Network-first for API calls
   Background sync stub · Push notification stub
───────────────────────────────────────────────────────────────────────────── */

const CACHE_NAME = 'guttenberg-v1';
const STATIC_CACHE = 'guttenberg-static-v1';
const API_CACHE = 'guttenberg-api-v1';

/* URLs to pre-cache on install */
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/titles',
  '/analytics',
  '/finance',
  '/marketing',
  '/settings',
  '/cover-designer',
  '/format-export',
  '/pricing',
  '/author-profile',
  '/manifest.json',
];

/* ── Install: pre-cache shell routes ─────────────────────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS.map(url => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Pre-cache failed (some URLs may not exist yet):', err))
  );
});

/* ── Activate: clean up old caches + claim clients ───────────────────────── */
self.addEventListener('activate', event => {
  const CURRENT_CACHES = [CACHE_NAME, STATIC_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys()
      .then(cacheNames =>
        Promise.all(
          cacheNames
            .filter(name => !CURRENT_CACHES.includes(name))
            .map(name => {
              console.log('[SW] Deleting obsolete cache:', name);
              return caches.delete(name);
            })
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

function isStaticAsset(url) {
  return (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|ico|woff|woff2|ttf|eot|webp|avif)$/) !== null
  );
}

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

/* Cache-first strategy */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('Offline — resource unavailable.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

/* Network-first strategy with cache fallback */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(
      JSON.stringify({ error: 'offline', message: 'No network connection and no cached data available.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/* Stale-while-revalidate for navigation */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  /* Return cached immediately; update in background */
  return cached ?? fetchPromise ?? offlineFallback();
}

function offlineFallback() {
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Guttenberg — Offline</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(160deg, #050d1a 0%, #0a1628 60%, #0f2040 100%);
      font-family: Inter, system-ui, sans-serif;
      color: #8aafc8;
      gap: 1.5rem;
      text-align: center;
      padding: 2rem;
    }
    .logo {
      width: 64px;
      height: 64px;
      border-radius: 1rem;
      background: linear-gradient(135deg, #edc74a 0%, #c9a227 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 700;
      color: #0a1628;
      font-family: 'Playfair Display', Georgia, serif;
    }
    h1 { color: #d4af37; font-family: 'Playfair Display', Georgia, serif; margin: 0; font-size: 1.5rem; }
    p  { margin: 0; font-size: 0.9rem; max-width: 320px; line-height: 1.6; }
    button {
      margin-top: 0.5rem;
      padding: 0.6rem 1.5rem;
      background: linear-gradient(to right, #c9a227, #d4af37);
      color: #0a1628;
      border: none;
      border-radius: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.875rem;
    }
    button:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="logo">G</div>
  <h1>You're Offline</h1>
  <p>Guttenberg requires an internet connection. Please check your network and try again.</p>
  <button onclick="window.location.reload()">Try Again</button>
</body>
</html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

/* ── Fetch event ─────────────────────────────────────────────────────────── */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  /* Skip non-GET and cross-origin requests */
  if (event.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  /* API calls → network-first */
  if (isApiRequest(url)) {
    event.respondWith(networkFirst(event.request, API_CACHE));
    return;
  }

  /* Static assets → cache-first */
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  /* Navigation → stale-while-revalidate with offline fallback */
  if (isNavigationRequest(event.request)) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  /* Default → cache-first */
  event.respondWith(cacheFirst(event.request, CACHE_NAME));
});

/* ── Background Sync: replay queued form submissions ─────────────────────── */
self.addEventListener('sync', event => {
  console.log('[SW] Background sync event:', event.tag);

  if (event.tag === 'sync-cover-designs') {
    event.waitUntil(syncQueuedDesigns());
  }

  if (event.tag === 'sync-export-jobs') {
    event.waitUntil(syncQueuedExports());
  }
});

async function syncQueuedDesigns() {
  try {
    /* In production: open an IndexedDB queue, replay pending requests */
    console.log('[SW] Syncing queued cover designs…');
  } catch (err) {
    console.warn('[SW] Cover design sync failed:', err);
    throw err; /* Rethrow so the browser retries */
  }
}

async function syncQueuedExports() {
  try {
    console.log('[SW] Syncing queued export jobs…');
  } catch (err) {
    console.warn('[SW] Export job sync failed:', err);
    throw err;
  }
}

/* ── Push Notifications ──────────────────────────────────────────────────── */
self.addEventListener('push', event => {
  let payload = { title: 'Guttenberg', body: 'You have a new notification.', icon: '/logo192.png', badge: '/logo192.png', tag: 'guttenberg-default', data: {} };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body:    payload.body,
      icon:    payload.icon,
      badge:   payload.badge,
      tag:     payload.tag,
      data:    payload.data,
      vibrate: [200, 100, 200],
      actions: [
        { action: 'open',    title: 'Open'    },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const urlToOpen = event.notification.data?.url ?? '/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const matching = clients.find(c => c.url.includes(self.location.origin));
      if (matching) {
        matching.focus();
        matching.navigate(urlToOpen);
      } else {
        self.clients.openWindow(urlToOpen);
      }
    })
  );
});

/* ── Message handler: skip-waiting on demand ─────────────────────────────── */
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: CACHE_NAME });
  }
});
