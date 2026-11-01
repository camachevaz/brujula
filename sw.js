/* Brújula — service worker: funciona sin conexión */
const CACHE = 'brujula-v2.0.0';
const SHELL = ['./', 'index.html', 'css/styles.css?v=2.0.0', 'js/gen.js?v=2.0.0', 'js/content.js?v=2.0.0', 'js/content-f2.js?v=2.0.0', 'js/detective.js?v=2.0.0', 'js/lab.js?v=2.0.0', 'js/app.js?v=2.0.0', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png', 'icons/maskable-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // red primero para tener la versión más nueva; caché si no hay conexión
  e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))));
});
