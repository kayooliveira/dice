const CACHE = 'dice-v6';
const ROOT = new URL('./', self.location);
const URLS = [
    '',
    'index.html',
    'css/app.css',
    'js/app.js',
    'js/dice.js',
    'manifest.json',
    'icons/icon-192.png',
    'icons/icon-512.png'
].map((path) => new URL(path, ROOT).href);

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(URLS)));
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
});
