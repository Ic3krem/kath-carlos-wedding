/*
 * Carlos & Kath — service worker.
 * Makes repeat visits fast (and usable on poor connections):
 *   - build assets, fonts and site images: cache-first (they're versioned)
 *   - optimised photos (/_next/image): stale-while-revalidate
 *   - pages: network-first, falling back to the last copy if offline/slow
 * Admin pages and API calls are never touched.
 */
const VERSION = 'ck-v1';
const STATIC = `${VERSION}-static`;
const IMAGES = `${VERSION}-images`;
const PAGES = `${VERSION}-pages`;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const STATIC_PATHS = /^\/(_next\/static|florals|story|gallery|hero|attire)\//;

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => hit);
  return hit || network;
}

async function networkFirst(request) {
  const cache = await caches.open(PAGES);
  try {
    // Give the network a fair chance, then fall back to the saved page.
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 6000)),
    ]);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (err) {
    const hit = await cache.match(request);
    if (hit) return hit;
    throw err;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api')) return;

  if (STATIC_PATHS.test(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC));
  } else if (url.pathname.startsWith('/_next/image')) {
    event.respondWith(staleWhileRevalidate(request, IMAGES));
  } else if (request.mode === 'navigate' && url.pathname === '/') {
    event.respondWith(networkFirst(request));
  }
});
