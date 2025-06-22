const CACHE_NAME = 'icon-perfumes-cache-v1';
const OFFLINE_URL = 'offline.html';

// قائمة الملفات المطلوب تخزينها مؤقتاً
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './offline.html',
  './icon.png',
  './icon-192x192.png',
  './icon-512x512.png',
  './moan4.jpg',
  './men.png',
  './female.png',
  './moan.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Marhey:wght@400;700&display=swap'
];

// 1. تثبيت Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. تفعيل Service Worker
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

// 3. اعتراض طلبات الشبكة
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا وجد الطلب في الكاش، قم بإرجاعه
        if (response) {
          return response;
        }

        // إذا لم يوجد، حاول جلبه من الشبكة
        return fetch(event.request).catch(() => {
            // إذا فشل جلب الطلب (لا يوجد اتصال)، أرجع صفحة الـ offline
            return caches.match(OFFLINE_URL);
        });
      })
  );
});
