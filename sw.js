// =========================
// SERVICE WORKER — sw.js
// =========================
// يوفر هذا الملف:
// 1. تخزين مؤقت للملفات الأساسية (Offline Support).
// 2. استراتيجية Cache First للملفات الثابتة.
// 3. Network First للصفحات (HTML).
// 4. Stale While Revalidate للصور.
//
// ⚠️ عند تحديث الموقع، قم بتغيير CACHE_VERSION
// لكي يرى المتصفح الملفات الجديدة.

const CACHE_VERSION = 'v1.0.3';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

// =========================
// الملفات التي تُخزَّن مسبقاً
// =========================
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/ar.html',
    '/404.html',
    '/style.css',
    '/script.js',
    '/renderer.js',
    '/manifest.json',
    '/data-en.json',
    '/data-ar.json',
    '/robots.txt',
    '/sitemap.xml',
    '/images/favicon.png',
    '/images/icon-192.png',
    '/images/icon-512.png',
    '/images/ahmed-saied-hawash_profile.jpg',
    '/images/Ahmed-Saied-Hawash_about.jpg'
];

// =========================
// INSTALL EVENT
// =========================
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                // نستخدم addAll لكن مع تجاوز الأخطاء الفردية
                return Promise.allSettled(
                    PRECACHE_URLS.map(url =>
                        cache.add(url).catch(err => {
                            console.warn('[SW] Failed to precache:', url, err);
                        })
                    )
                );
            })
            .then(() => self.skipWaiting())
    );
});

// =========================
// ACTIVATE EVENT
// =========================
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter(name =>
                            name !== STATIC_CACHE &&
                            name !== IMAGE_CACHE &&
                            name !== RUNTIME_CACHE
                        )
                        .map(name => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// =========================
// FETCH EVENT
// =========================
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // تجاهل الطلبات غير GET
    if (request.method !== 'GET') return;

    // تجاهل الطلبات الخارجية (مثل Google Analytics, Fonts)
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    // تجاهل طلبات API Web3Forms
    if (url.pathname.includes('/api/') || url.hostname.includes('web3forms')) return;

    // استراتيجية خاصة للصور
    if (request.destination === 'image') {
        event.respondWith(handleImageRequest(request));
        return;
    }

    // استراتيجية خاصة لملفات CSS/JS
    if (request.destination === 'style' ||
        request.destination === 'script' ||
        url.pathname.endsWith('.json')) {
        event.respondWith(handleStaticRequest(request));
        return;
    }

    // استراتيجية لصفحات HTML
    if (request.destination === 'document' || request.mode === 'navigate') {
        event.respondWith(handleNavigationRequest(request));
        return;
    }

    // الباقي: stale-while-revalidate
    event.respondWith(handleGeneralRequest(request));
});

// =========================
// استراتيجية الصور: Cache First + Stale
// =========================
async function handleImageRequest(request) {
    const cache = await caches.open(IMAGE_CACHE);
    const cached = await cache.match(request);

    if (cached) {
        // تحديث في الخلفية (بدون انتظار)
        fetch(request).then(response => {
            if (response && response.status === 200) {
                cache.put(request, response.clone());
            }
        }).catch(() => { });
        return cached;
    }

    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        // صورة بديلة في حالة الفشل
        return new Response('', {
            status: 404,
            statusText: 'Image not available offline'
        });
    }
}

// =========================
// استراتيجية الملفات الثابتة: Cache First
// =========================
async function handleStaticRequest(request) {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        return caches.match('/404.html');
    }
}

// =========================
// استراتيجية التنقل (HTML): Network First
// =========================
async function handleNavigationRequest(request) {
    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        // في حالة عدم الاتصال: حاول من الكاش
        const cached = await caches.match(request);
        if (cached) return cached;

        // فشل كل شيء: صفحة 404
        const offlinePage = await caches.match('/404.html');
        if (offlinePage) return offlinePage;

        return new Response(
            '<h1>You are offline</h1><p>Please check your internet connection.</p>',
            {
                status: 503,
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            }
        );
    }
}

// =========================
// الاستراتيجية العامة: Stale While Revalidate
// =========================
async function handleGeneralRequest(request) {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request).then(response => {
        if (response && response.status === 200) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => cached);

    return cached || fetchPromise;
}

// =========================
// MESSAGE EVENT — للتحكم من الصفحة
// =========================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then(names => {
            Promise.all(names.map(name => caches.delete(name)))
                .then(() => {
                    event.ports[0]?.postMessage({ success: true });
                });
        });
    }
});

console.log(`[SW] Service Worker loaded. Version: ${CACHE_VERSION}`);