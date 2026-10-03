const CACHE = 'dice-v8';

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(Promise.resolve());
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
        await self.clients.claim();
        const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        await Promise.all(windows.map((client) => {
            const url = new URL(client.url);
            url.searchParams.set('v', '8');
            return client.navigate(url.href);
        }));
    })());
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') return;
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    event.respondWith((async () => {
        try {
            const fresh = await fetch(request);
            if (fresh && fresh.ok) {
                const cache = await caches.open(CACHE);
                cache.put(request, fresh.clone());
            }
            return fresh;
        } catch (error) {
            const cached = await caches.match(request);
            if (cached) return cached;
            throw error;
        }
    })());
});
