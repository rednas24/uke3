const CACHE_NAME = 'Machine-lending-v3'; // Increment version to force updates
const ASSETS_TO_CACHE = [
    '/',
    '/html/index.html',
    '/html/login.html',
    '/html/register.html',
    '/css/style.css',
    '/css/register.css',
    '/css/login.css',
    '/manifest.webmanifest',
    '/service-worker.js',
    '/scripts/home.mjs',
    '/scripts/login.mjs',
    '/scripts/register.mjs',
    '/icons/android-launchericon-192-192.png',
    '/icons/android-launchericon-512-512.png'
];

// Install event - cache assets and delete old caches
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing new version...');
    event.waitUntil(
        (async () => {
            // Delete all existing caches
            const keys = await caches.keys();
            await Promise.all(keys.map((key) => caches.delete(key)));

            // Open new cache and store assets
            const cache = await caches.open(CACHE_NAME);
            try {
                await cache.addAll(ASSETS_TO_CACHE);
                console.log('[Service Worker] Cached updated assets');
            } catch (err) {
                console.error('[Service Worker] Cache error:', err);
            }
        })()
    );
    self.skipWaiting(); // Activate immediately
});

// Fetch event - manage requests
self.addEventListener('fetch', (event) => {
    if (!event.request.url.startsWith('http')) return;

    const url = event.request.url;
    
    // **Network-first strategy for HTML files** (ensures updated pages)
    if (event.request.destination === 'document') {
        console.log(`[Service Worker] Network-first for HTML: ${url}`);
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // **Network-first strategy for JS/MJS files** (ensures fresh scripts)
    if (url.endsWith('.js') || url.endsWith('.mjs')) {
        console.log(`[Service Worker] Network-first for JS/MJS: ${url}`);
        event.respondWith(
            fetch(event.request)
                .then(response => response)
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // **Network-first strategy for API calls** (ensures fresh data)
    if (url.includes('/api/machines/')) {
        console.log(`[Service Worker] Network-first for API: ${url}`);
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // **Cache-first strategy for other static resources**
    event.respondWith((async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
            console.log(`[Service Worker] Serving from cache: ${url}`);
            return cachedResponse;
        }

        try {
            const response = await fetch(event.request);
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, response.clone());
            console.log(`[Service Worker] Caching new resource: ${url}`);
            return response;
        } catch (error) {
            console.error(`[Service Worker] Fetch failed: ${url}`, error);
            return new Response('Offline', { status: 503 });
        }
    })());
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then(keys => 
            Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
        )
    );
    self.clients.claim(); // Forces control over all pages
});
