const CACHE_NAME = 'mindbodyconnect-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension://')) return;
  if (event.request.url.includes('socket.io') || event.request.url.includes('ws://')) return;

  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request).then(response => {
          if (response) return response;
          // Return cached index.html for navigation requests if offline
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
