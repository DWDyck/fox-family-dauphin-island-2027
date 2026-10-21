/* Keeps the site available with spotty signal: network first, cached copy as backup.
   Bump VERSION if you ever need to force everyone to refresh. */
const VERSION = 'fox-2027-v4';
const CORE = ['./', 'index.html', 'styles.css', 'js/util.js', 'js/components.js', 'js/check.js', 'js/pages.js', 'js/app.js',
  'data/config.js', 'data/updates.js', 'data/houses.js', 'data/locations.js', 'data/families.js', 'data/schedule.js', 'data/photos.js', 'data/memories.js'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then((r) => {
    const copy = r.clone();
    caches.open(VERSION).then((c) => c.put(e.request, copy));
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
