/* Tulip Maps offline worker.
   Job: let the installed app open and run without a connection.
   What it CANNOT do: bring the map background, road-following, place-name
   lookup or search offline — those all live on other people's servers.

   Freshness rule (important): our own pages and code are fetched from the
   network FIRST, so a push goes live immediately, with the cache only used
   when the network isn't there. The third-party libraries in /vendor/ never
   change without a filename change, so those are served from cache first.
   Bump VERSION to force everything to be re-fetched. */

const VERSION = 'tulipmaps-v1';

/* The bare minimum needed to open the tool with no connection. */
const SHELL = [
  '/',
  '/index.html',
  '/app/',
  '/app/index.html',
  '/app/tulip_core.js',
  '/app/vendor/leaflet.css',
  '/app/vendor/leaflet.js',
  '/app/vendor/maplibre-gl.css',
  '/app/vendor/maplibre-gl.js',
  '/app/vendor/leaflet-maplibre-gl.js',
  '/app/vendor/pmtiles.js',
  '/app/vendor/leaflet-rotate-src.js',
  '/app/vendor/jspdf.umd.min.js',
  '/app/vendor/images/layers.png',
  '/app/vendor/images/layers-2x.png',
  '/app/vendor/images/marker-icon.png',
  '/app/vendor/images/marker-icon-2x.png',
  '/app/vendor/images/marker-shadow.png',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

/* Served from cache first — static third-party files and artwork. */
function isStatic(path) {
  return path.startsWith('/app/vendor/') ||
         path.startsWith('/icons/') ||
         path.startsWith('/app/signs/');
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    /* One missing file must not sink the whole install, so cache them
       one at a time and shrug off any that fail. */
    await Promise.all(SHELL.map(url => cache.add(url).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  /* Map tiles, routing and place lookups live elsewhere — leave them alone
     so we never serve a stale or broken copy of somebody else's service. */
  if (url.origin !== self.location.origin) return;

  if (isStatic(url.pathname)) {
    /* Cache first: fast, and these files don't change under us. */
    event.respondWith((async () => {
      const hit = await caches.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res && res.ok) (await caches.open(VERSION)).put(req, res.clone());
      return res;
    })());
    return;
  }

  /* Everything else (our pages and our code): network first so updates are
     instant, cache only as the safety net when there's no connection. */
  event.respondWith((async () => {
    try {
      const res = await fetch(req);
      if (res && res.ok) (await caches.open(VERSION)).put(req, res.clone());
      return res;
    } catch (e) {
      const hit = await caches.match(req);
      if (hit) return hit;
      /* A page we've never seen, with no connection — hand back the tool. */
      if (req.mode === 'navigate') {
        const app = await caches.match('/app/index.html');
        if (app) return app;
      }
      throw e;
    }
  })());
});
