const CACHE_NAME = 'Machine-lending';
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
    self.skipWaiting(); 
});

// Fetch event - serve cached assets
self.addEventListener('fetch', (event) => {
    if (!event.request.url.startsWith('http')) return; 
    if (event.request.url.endsWith('.js') || event.request.url.endsWith('.mjs')) {
        console.log(`[Service Worker] Network-first for JS/MJS: ${event.request.url}`);
        event.respondWith(
            fetch(event.request)
                .then(response => response)
                .catch(() => caches.match(event.request)) // Serve from cache if offline
        );
        return;
    }

    // Handle API calls (dynamic content)
    if (event.request.url.includes('/api/machines/')) {
        console.log(`[Service Worker] Network-first for API call: ${event.request.url}`);

        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Updatetes cahce wwith new api calls
                    const cacheClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, cacheClone);
                    });
                    return response;
                })
                .catch(() => caches.match(event.request)) // Serve from cache if offline
        );
        return;
    }

    // Default behavior - Cache-first strategy for most resources
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
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)) // Delete old caches
            );
        })
    );
    self.clients.claim(); // Forces the SW to take control immediately, not sure what means
});
