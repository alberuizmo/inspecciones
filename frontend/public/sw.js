// Service Worker para PWA con estrategia offline-first
const CACHE_NAME = 'inspecciones-v1'
const RUNTIME_CACHE = 'inspecciones-runtime-v1'
const API_CACHE = 'inspecciones-api-v1'

// Recursos estáticos para cachear durante la instalación
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json'
]

// Instalar y cachear recursos estáticos
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static resources')
        return cache.addAll(STATIC_RESOURCES)
      })
      .then(() => self.skipWaiting())
  )
})

// Activar y limpiar caches antiguos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== RUNTIME_CACHE && 
              cacheName !== API_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Estrategia de fetch
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorar requests que no sean GET
  if (request.method !== 'GET') {
    return
  }

  // Estrategia para archivos estáticos (HTML, CSS, JS, imágenes)
  if (request.destination === 'document' || 
      request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image') {
    
    event.respondWith(
      // Cache First con Network Fallback
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[SW] Serving from cache:', request.url)
            return cachedResponse
          }
          
          return fetch(request).then((response) => {
            // No cachear si no es una respuesta válida
            if (!response || response.status !== 200 || response.type === 'error') {
              return response
            }

            const responseToCache = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache)
            })

            return response
          }).catch(() => {
            // Si falla y es una página HTML, devolver página offline
            if (request.destination === 'document') {
              return caches.match('/index.html')
            }
          })
        })
    )
  }
  // Estrategia para API calls
  else if (url.origin.includes('localhost:4000') || url.pathname.startsWith('/api')) {
    event.respondWith(
      // Network First con Cache Fallback
      fetch(request)
        .then((response) => {
          // Cachear respuestas exitosas de la API
          if (response && response.status === 200) {
            const responseToCache = response.clone()
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseToCache)
            })
          }
          return response
        })
        .catch(() => {
          // Si falla la red, intentar desde cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] API offline - serving from cache:', request.url)
              return cachedResponse
            }
            // Devolver respuesta de error offline
            return new Response(
              JSON.stringify({ 
                error: 'Offline', 
                message: 'No hay conexión a internet y no hay datos en cache' 
              }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              }
            )
          })
        })
    )
  }
})

// Background Sync para sincronización offline
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event:', event.tag)
  
  if (event.tag === 'sync-inspecciones') {
    event.waitUntil(syncInspecciones())
  }
})

async function syncInspecciones() {
  console.log('[SW] Starting sync inspecciones...')
  
  try {
    // Obtener inspecciones pendientes desde IndexedDB
    const db = await openIndexedDB()
    const tx = db.transaction('inspecciones', 'readonly')
    const store = tx.objectStore('inspecciones')
    const pendientes = await getAllPending(store)
    
    console.log(`[SW] Found ${pendientes.length} pending inspecciones`)
    
    // Sincronizar cada inspección pendiente
    for (const inspeccion of pendientes) {
      try {
        const response = await fetch('http://localhost:4000/inspecciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inspeccion)
        })
        
        if (response.ok) {
          // Marcar como sincronizada
          await markAsSynced(db, inspeccion.id)
          console.log('[SW] Synced:', inspeccion.id)
        }
      } catch (error) {
        console.error('[SW] Sync failed for:', inspeccion.id, error)
      }
    }
    
    console.log('[SW] Sync complete!')
  } catch (error) {
    console.error('[SW] Sync error:', error)
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('InspeccionesDB', 1)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function getAllPending(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onsuccess = () => {
      const all = request.result
      const pending = all.filter(item => item.syncStatus === 'pending')
      resolve(pending)
    }
    request.onerror = () => reject(request.error)
  })
}

async function markAsSynced(db, id) {
  const tx = db.transaction('inspecciones', 'readwrite')
  const store = tx.objectStore('inspecciones')
  const item = await store.get(id)
  if (item) {
    item.syncStatus = 'synced'
    await store.put(item)
  }
}

// Mensajes desde la aplicación
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data)
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
