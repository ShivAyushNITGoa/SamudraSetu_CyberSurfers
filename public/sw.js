const CACHE_NAME = 'samudra-cache-v1'
const ASSETS = [
  '/',
  '/manifest.json',
]
const TILE_HOSTS = [
  'https://{s}.tile.openstreetmap.org',
  'https://{s}.basemaps.cartocdn.com',
  'https://server.arcgisonline.com'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => k !== CACHE_NAME ? caches.delete(k) : undefined)))
  )
  self.clients.claim()
})

// Network-first for API, cache-first for static
self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)

  if (url.pathname.startsWith('/api/')) {
    // Never cache non-GET API requests
    if (req.method !== 'GET') {
      event.respondWith(fetch(req))
      return
    }
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const resClone = res.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone))
          }
          return res
        })
        .catch(() => caches.match(req))
    )
    return
  }

  // Cache tiles aggressively (stale-while-revalidate)
  if (req.method === 'GET' && /tile|basemaps|MapServer\/tile/.test(url.href)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(req)
        const fetchPromise = fetch(req).then((res) => {
          if (res.ok) cache.put(req, res.clone())
          return res
        })
        return cached || fetchPromise
      })
    )
    return
  }

  // Only cache GET requests for non-API
  if (req.method === 'GET') {
    event.respondWith(
      caches.match(req).then((cached) => {
        return (
          cached ||
          fetch(req).then((res) => {
            if (res.ok) {
              const resClone = res.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone))
            }
            return res
          })
        )
      })
    )
  }
})


