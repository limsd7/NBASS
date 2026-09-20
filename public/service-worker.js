const CACHE_NAME = 'nbass-webapp-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/landing.html',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.warn('[SW] Cache addAll warning:', err))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension://')) return;
  if (
    event.request.url.includes('socket.io') ||
    event.request.url.includes('ws://') ||
    event.request.url.includes('/@vite/') ||
    event.request.url.includes('/@fs/') ||
    event.request.url.includes('/@react-refresh')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request).then(response => {
          if (response) return response;
          if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html').then(idxResp => {
              return idxResp || caches.match('/landing.html') || new Response('Offline', { status: 503, statusText: 'Offline' });
            });
          }
          return new Response(null, { status: 404, statusText: 'Not found in offline cache' });
        });
      })
  );
});
