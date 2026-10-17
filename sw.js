// Offline support: every file of the app is cached on first visit, so the
// book works without internet (except speech recognition, which needs the
// browser's online speech service).
importScripts('precache-manifest.js');

const CACHE = `greenhill-${self.PRECACHE_VERSION}`;

self.addEventListener('install', (event) => {
  // 'reload' skips the browser's own cache, so a new version never mixes in old files.
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(self.PRECACHE_FILES.map((f) => new Request(f, { cache: 'reload' })))));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('greenhill-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== location.origin) return;
  // The speech model is large and kept by the recognizer itself (IndexedDB).
  if (url.pathname.includes('/models/')) return;
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((hit) => hit || fetch(request).then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      return res;
    }).catch(() => caches.match('./index.html'))),
  );
});
