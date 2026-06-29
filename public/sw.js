// Service worker mínimo para que PasaLaVoz sea "instalable" (PWA).
// Es un prototipo: solo cachea el caparazón básico de la app.
const CACHE = 'pasalavoz-v1'
const ASSETS = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  // Solo GET; deja pasar el resto (mapas, fuentes) a la red.
  if (request.method !== 'GET') return
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).catch(() => cached)),
  )
})
