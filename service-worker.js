const CACHE_NAME = 'sundari-app-v1';
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/default.jpeg',
  './assets/Sundari.png',
  './assets/icon-180.png',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(name => name.startsWith('sundari-app-') && name !== CACHE_NAME).map(name => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const requestUrl = new URL(request.url);
  if (requestUrl.origin === self.location.origin) {
    if (request.mode === 'navigate') {
      event.respondWith(
        fetch(request)
          .then(response => {
            if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
            return response;
          })
          .catch(async () => (await caches.match(request)) || (await caches.match('./index.html')))
      );
      return;
    }
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(response => {
        if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
        return response;
      }))
    );
    return;
  }

  if (['script', 'style', 'font'].includes(request.destination)) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok || response.type === 'opaque') caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
          return response;
        })
        .catch(async () => (await caches.match(request)) || Response.error())
    );
  }
});
