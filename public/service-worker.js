const cacheName = 'pwa-app-17.10.2024/9:29:59-client1'
const filesToCache = ['client', 'manifest.json']
function sendMessage(e, n) {
    return new Promise(function (t, s) {
        var a = new MessageChannel()
        e.postMessage(n, [a.port2])
    })
}

function sendMessageToAll(e, n) {
    clients.matchAll().then((t) => {
        t.forEach((n) => {
            sendMessage(n, e)
        }),
            n && 'function' == typeof n && n()
    })
}

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(cacheName)
            .then(function (cache) {
                return cache.addAll(filesToCache);
            })
            .then(() => {
                self.skipWaiting(); // 跳过等待状态
            })
            .catch((error) => {
                console.error('Cache open failed:', error);
            })
    );
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        (async function () {
            try {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(async (name) => {
                        if (name !== cacheName) {
                            await sendMessageToAll('NEW_VERSION');
                            return caches.delete(name);
                        }
                    })
                );
            } catch (error) {
                console.error('Activation failed:', error);
            }
        })()
    );
    self.clients.claim();
});
    self.addEventListener('fetch', function (e) {
        e.respondWith(
            caches.match(e.request, {ignoreSearch: !0}).then(function (n) {
                return n || fetch(e.request)
            })
        )
    })
    self.addEventListener('message', (e) => {
        e && e.data && e.data.message
    })
