const CACHE_NAME = 'airplane-war-v1';
const ASSETS = [
  './',
  './index.html',
  './qrcode.html',
  './css/style.css',
  './js/game.js',
  './manifest.json',
  './img/icon-192.png',
  './img/icon-512.png',
  'https://cdn.jsdelivr.net/npm/qrcode.js@1.0.0/qrcode.min.js'
];

// 安装Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活时清除旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 拦截网络请求
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 缓存命中，返回缓存的响应
        if (response) {
          return response;
        }
        
        // 复制请求，因为请求是一个流，只能使用一次
        return fetch(event.request).then(response => {
          // 不缓存非成功的响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // 复制响应，因为响应是一个流，只能使用一次
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              // 将获取的响应添加到缓存
              cache.put(event.request, responseToCache);
            });
            
          return response;
        });
      })
      .catch(() => {
        // 如果网络失败且没有缓存，则返回离线页面
        // 这里我们不需要特别处理，因为游戏所有资源都已缓存
      })
  );
}); 