
const CACHE_NAME = 'docva-v1'
const urlsToCache = ['/', '/index.html']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ).then(() => self.clients.claim()),
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'CLEAR_CACHE') {
    event.waitUntil(caches.delete(CACHE_NAME))
  }
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') { return }

  // Never cache API responses — they may contain PHI.
  if (url.pathname.includes('/api/')) {
    return
  }

  // Cross-origin requests (e.g. Google Fonts) are subject to the page's
  // connect-src CSP when re-issued via fetch() from here, even though the
  // browser's native font/stylesheet load is allowed under font-src/style-src.
  // Let the browser handle those directly instead of proxying through the SW.
  if (url.origin !== self.location.origin) {
    return
  }

  if (url.pathname.includes('/assets/') || /\.(js|css|png|jpg|jpeg|svg|webp|woff2?)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })),
    )
  }
})

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-audio-queue') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SYNC_QUEUE',
            action: 'uploadQueuedAudio',
          })
        })
      }),
    )
  }
})

