/* Brújula — service worker: funciona sin conexión. Precarga el núcleo y todas las asignaturas de modules/modules.json */
const CACHE = 'brujula-v3.1.1';
const V = '?v=3.1.1';
const CORE = ['./', 'index.html', 'css/styles.css' + V, 'js/core/kit.js' + V, 'js/core/registry.js' + V, 'js/core/sound.js' + V, 'js/core/loader.js' + V, 'js/app.js' + V, 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png', 'icons/maskable-512.png'];
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(CORE);
    try {
      const r = await fetch('modules/modules.json' + V, { cache: 'no-cache' }); const list = (await r.clone().json()).modules || [];
      await c.put('modules/modules.json' + V, r);
      await c.addAll(list.flatMap((m) => m.files.map((f) => 'modules/' + m.folder + '/' + f + V)));
    } catch (err) { /* sin conexión al instalar: se guardarán al usarse */ }
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request).then((r) => r || caches.match(e.request, { ignoreSearch: true })).then((r) => r || caches.match('index.html'))));
});
