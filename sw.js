// Minimal, safe service worker for offline access to the app shell.
// Intentionally does NOT cache API calls (auth, search, payments) — those
// always need the network and must never be served stale.

const CACHE_NAME = 'uelearn-shell-v1'
const SHELL_URLS = ['/', '/index.html']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Only handle same-origin requests — never intercept the backend API,
  // third-party scripts, or Google/Paystack calls.
  if (url.origin !== self.location.origin) return

  // Navigations (page loads/refreshes): network first, fall back to the
  // cached shell so the app still opens (in its last-loaded state) offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    )
    return
  }

  // Static assets (built JS/CSS/images/fonts): stale-while-revalidate —
  // serve from cache instantly if we have it, refresh in the background.
  if (/\.(js|css|png|jpg|jpeg|webp|svg|woff2?|ico)$/.test(url.pathname)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request)
        const networkFetch = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone())
            return response
          })
          .catch(() => cached)
        return cached || networkFetch
      })
    )
  }
})