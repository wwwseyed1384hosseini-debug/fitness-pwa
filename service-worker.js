const CACHE_NAME = 'fitness-app-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.svg',
  './icons/icon-512.svg'
];

// نصب Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('✅ کش کردن دارایی‌ها');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// فعال‌سازی
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// استراتژی Network First با Fallback به Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // کش کردن پاسخ جدید
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // آفلاین - بازگشت به کش
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || new Response('آفلاین هستید', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});