/* My Salah service worker.
   Bump VERSION whenever any cached file changes: the old cache is deleted on activate,
   so outdated content never lingers. User preferences live in localStorage and are never touched. */
const VERSION = 'v1.1.1';
const CACHE = 'my-salah-' + VERSION;

// Everything the app needs offline (all paths relative to this file, so it works under /my-salah/).
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'css/style.css',
  'js/app.js', 'js/content-loader.js', 'js/navigation.js', 'js/reader.js', 'js/search.js', 'js/theme.js',
  'data/namaz.json', 'data/four-quls.json', 'data/short-surahs.json', 'data/duas.json',
  'assets/fonts/ScheherazadeNew-Regular.ttf',
  'assets/fonts/NotoNastaliqUrdu.ttf',
  'assets/fonts/Inter.ttf',
  'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/icon-maskable-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  // A new worker waits until the page asks it to take over (see "Refresh" toast), so a reading session is never interrupted.
});

self.addEventListener('message', event => { if (event.data === 'SKIP_WAITING') self.skipWaiting(); });

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith('my-salah-') && key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    } catch {
      // Graceful offline fallback: any page navigation gets the app shell.
      if (req.mode === 'navigate') return (await cache.match('index.html')) || Response.error();
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    }
  })());
});
