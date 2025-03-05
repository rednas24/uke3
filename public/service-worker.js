const CACHE_NAME = 'deck-api-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/style.css',
    '/manifest.json',
    '/service-worker.js',
    '/icons/icon1.png',
    '/icons/icon-512x512.png'
];

// Install event - cache assets
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[Service Worker] Caching assets:', ASSETS_TO_CACHE);
            return cache.addAll(ASSETS_TO_CACHE)
                .catch(err => console.error('[Service Worker] Cache error:', err));
        })
    );
});

// Fetch event - serve cached assets
self.addEventListener('fetch', event => {
    console.log('[Service Worker] Fetching:', event.request.url);
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        }).catch(() => caches.match('/index.html'))
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
});