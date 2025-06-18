const CACHE_NAME = 'alayqona-v2';
const OFFLINE_URL = 'offline.html';
const PRECACHE_URLS = [
  '/',
  '/index.htm',
  '/offline.html',
  'https://raw.githubusercontent.com/talalye1/Icon-perfumes/icons/icon-192x192.png',
  'https://raw.githubusercontent.com/talalye1/Icon-perfumes/icons/icon-512x512.png',
  'https://talalye1.github.io/Icon-perfumes/moan4.jpg',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://unpkg.com/aos@2.3.1/dist/aos.css'
];

// مرحلة التثبيت - تخزين الملفات الأساسية في الكاش
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('تم فتح الكاش');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('تم تخزين جميع الموارد في الكاش');
        return self.skipWaiting();
      })
  );
});

// مرحلة التنشيط - تنظيف الكاش القديم
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('حذف الكاش القديم:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// استراتيجية التخزين: Network First, Fallback to Cache
self.addEventListener('fetch', event => {
  // تجاهل طلبات غير GET
  if (event.request.method !== 'GET') return;

  // معالجة طلبات الصفحات
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // تحديث الكاش مع الاستجابة الجديدة
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => {
          // عرض الصفحة المخزنة عند عدم الاتصال بالإنترنت
          return caches.match(OFFLINE_URL) || 
                 caches.match('/index.htm');
        })
    );
  } else {
    // معالجة الطلبات الأخرى (أصول الموقع)
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          // إرجاع الاستجابة المخزنة إذا وجدت مع التحقق من التحديثات
          if (cachedResponse) {
            fetch(event.request)
              .then(response => {
                // تحديث الكاش مع الاستجابة الجديدة
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, responseClone));
              });
            return cachedResponse;
          }
          // إذا لم تكن موجودة في الكاش، جلبها من الشبكة
          return fetch(event.request)
            .then(response => {
              // تخزين الاستجابة الجديدة في الكاش
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseClone));
              return response;
            })
            .catch(error => {
              console.error('فشل الجلب:', error);
            });
        })
    );
  }
});

// معالجة رسائل التحديث
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// معالجة دفع الإشعارات
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: 'https://raw.githubusercontent.com/talalye1/Icon-perfumes/icons/icon-192x192.png',
    badge: 'https://raw.githubusercontent.com/talalye1/Icon-perfumes/icons/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// معالجة النقر على الإشعارات
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

