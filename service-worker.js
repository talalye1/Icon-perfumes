const CACHE_NAME = 'icon-perfumes-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/sw.js',
  '/moant4.jpg',
  '/men.png',
  '/men1.png',
  '/men2.png',
  '/men3.png',
  '/men4.png',
  '/men5.png',
  '/female.png',
  '/female1.png',
  '/female2.png',
  '/female3.png',
  '/female4.png',
  '/female5.png',
  '/moan.png',
  '/moan1.png',
  '/moan2.png',
  '/moan3.png',
  '/moan4.png',
  '/moan5.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/screenshot1.png',
  '/screenshot2.png',
  '/screenshot3.png',
  '/screenshot4.png',
  '/screenshot5.png'
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
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});