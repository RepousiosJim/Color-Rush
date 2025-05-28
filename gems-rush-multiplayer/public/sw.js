// Gems Rush Service Worker
// Basic PWA implementation for offline functionality

const CACHE_NAME = 'gems-rush-v1'
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/api/error-report'
]

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('💎 Service Worker: Caching app shell')
        return cache.addAll(urlsToCache)
      })
      .catch(error => {
        console.error('💎 Service Worker: Cache failed:', error)
      })
  )
})

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          console.log('💎 Service Worker: Serving from cache:', event.request.url)
          return response
        }
        
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone the response for caching
            const responseToCache = response.clone()
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache)
              })

            return response
          })
          .catch(error => {
            console.error('💎 Service Worker: Fetch failed:', error)
            
            // Return offline page for navigation requests
            if (event.request.destination === 'document') {
              return caches.match('/')
            }
            
            throw error
          })
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('💎 Service Worker: Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Handle messages from the main app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

console.log('💎 Gems Rush Service Worker loaded') 