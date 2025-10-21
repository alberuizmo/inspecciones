// Service Worker para PWA
const CACHE_NAME = 'inspecciones-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response
        }
        return fetch(event.request)
      })
  )
})

// Background Sync para sincronización offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-inspecciones') {
    event.waitUntil(syncInspecciones())
  }
})

async function syncInspecciones() {
  // TODO: Implementar sincronización de inspecciones pendientes
  console.log('Syncing inspecciones...')
}
