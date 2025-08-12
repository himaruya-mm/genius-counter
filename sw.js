// 超シンプルなキャッシュ（初回アクセス後はオフライン動作）
const CACHE = 'kiremono-counter-v1';
const ASSETS = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // まずキャッシュ、なければネットワーク
  e.respondWith(
    caches.match(req).then((res) => res || fetch(req).then((net) => {
      // 同一オリジンのGETをついでにキャッシュ
      const url = new URL(req.url);
      if (req.method === 'GET' && url.origin === location.origin) {
        const copy = net.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return net;
    }).catch(() => caches.match('./index.html')))
  );
});
