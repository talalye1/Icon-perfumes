const CACHE_NAME = 'icon-perfumes-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/moan4.jpg',
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
  '/offline.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(
          response => {
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          return caches.match('/offline.html');
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

