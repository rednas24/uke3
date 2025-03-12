const CACHE_NAME = 'Machine lending'; // Updated cache version
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/style.css',
    '/manifest.webmanifest',
    '/service-worker.js',
    '/home.mjs', // ✅ Added to cache
    '/icons/android-launchericon-192-192.png',
    '/icons/android-launchericon-512-512.png'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            console.log('[Service Worker] Caching assets:', ASSETS_TO_CACHE);
            try {
                await cache.addAll(ASSETS_TO_CACHE);
            } catch (err) {
                console.error('[Service Worker] Cache error:', err);
            }
        })
    );
    self.skipWaiting(); // ✅ Forces the SW to take control immediately
});

// Fetch event - serve cached assets but always fetch JS/MJS files from network
self.addEventListener('fetch', (event) => {
    if (!event.request.url.startsWith('http')) return; // Ignore non-HTTP(S) requests

    if (event.request.url.endsWith('.js') || event.request.url.endsWith('.mjs')) {
        console.log(`[Service Worker] Network-first for JS/MJS: ${event.request.url}`);
        event.respondWith(
            fetch(event.request)
                .then(response => response)
                .catch(() => caches.match(event.request)) // Serve from cache if offline
        );
        return;
    }

    event.respondWith((async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
            console.log(`[Service Worker] Serving from cache: ${event.request.url}`);
            return cachedResponse;
        }

        try {
            const response = await fetch(event.request);
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, response.clone());
            console.log(`[Service Worker] Caching new resource: ${event.request.url}`);
            return response;
        } catch (error) {
            console.error(`[Service Worker] Fetch failed: ${event.request.url}`, error);
            return new Response('Offline', { status: 503 });
        }
    })());
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim(); // ✅ Forces the SW to take control immediately
});
