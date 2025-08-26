const CACHE_NAME = "sicap-cache-v2"; // Updated version
const OFFLINE_FILES = [
  "/",
  "/index.html",
  "/html/forms.html",
  "/javascript/forms.js",
  "/css/forms.css",
  "/css/index.css",
  "/manifest.json"
];

// Install event: cache core files
self.addEventListener("install", (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching offline files');
      return cache.addAll(OFFLINE_FILES);
    })
  );
  self.skipWaiting();
});

// Activate event: clean old caches
self.addEventListener("activate", (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch event: serve cached first, then network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip Firebase requests - let them handle their own offline logic
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('firebase')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        console.log('Serving from cache:', event.request.url);
        return cached;
      }

      return fetch(event.request)
        .then((response) => {
          // Cache successful responses for future offline use
          if (response.status === 200 && response.type === 'basic') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          console.log('Network failed, serving offline fallback');
          // For navigation requests, serve the offline page
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          // For other requests, throw the error
          throw new Error('Network failed and no cached version available');
        });
    })
  );
});

// Background Sync for form submissions (optional enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sicap-registration-sync') {
    console.log('Background sync triggered for registrations');
    event.waitUntil(
      // Notify the main thread to process pending registrations
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SYNC_REGISTRATIONS'
          });
        });
      })
    );
  }
});

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});