const CACHE = 'mi-salud-mental-v14';
const CORE_ASSETS = ['./', './index.html', './styles.css?v=14', './app.js', './manifest.webmanifest'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const request = event.request;
  const isDocument = request.mode === 'navigate' || request.destination === 'document';
  const isCode = ['script', 'style'].includes(request.destination);
  if (isDocument || isCode) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
});
