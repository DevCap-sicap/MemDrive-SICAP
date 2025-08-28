const CACHE_NAME = "sicap-cache-v2"; // Updated version
const OFFLINE_FILES = [
  "/",
  "index.html",
  "index.html", // Both relative and absolute paths
  "html/forms.html",
  "html/forms.html",
  "javascript/forms.js",
  "javascript/forms.js", 
  "css/forms.css",
  "css/forms.css",
  "css/index.css", 
  "css/index.css",
  "manifest.json",
  "manifest.json"
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
      event.request.url.includes('firebase') ||
      event.request.url.includes('gstatic.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        console.log('Serving from cache:', event.request.url);
        return cached;
      }

      // Try network first for non-navigation requests when online
      return fetch(event.request)
        .then((response) => {
          // Only cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          console.log('Network failed for:', event.request.url);
          
          // Handle different request types when offline
          const url = new URL(event.request.url);
          
          // For navigation requests (page loads)
          if (event.request.mode === 'navigate') {
            console.log('Navigation request detected, checking for cached pages');
            
            // Try to match the exact path first
            return caches.match(event.request.url)
              .then((cachedPage) => {
                if (cachedPage) {
                  console.log('Found cached page for navigation');
                  return cachedPage;
                }
                
                // If requesting root or index, serve index.html
                if (url.pathname === '/' || url.pathname === '/index.html') {
                  return caches.match('/index.html');
                }
                
                // If requesting forms page, serve forms.html
                if (url.pathname.includes('forms.html')) {
                  return caches.match('/html/forms.html');
                }
                
                // Default fallback to index.html for any navigation
                return caches.match('/index.html');
              });
          }
          
          // For other resources, try to find them in cache with different variations
          const possibleUrls = [
            event.request.url,
            url.pathname,
            url.pathname.replace(/^\/+/, '/') // normalize leading slashes
          ];
          
          return caches.keys().then((cacheNames) => {
            return caches.open(CACHE_NAME);
          }).then((cache) => {
            return cache.keys();
          }).then((requests) => {
            // Try to find a matching cached request
            for (const possibleUrl of possibleUrls) {
              const matchingRequest = requests.find(req => 
                req.url.includes(possibleUrl) || 
                possibleUrl.includes(new URL(req.url).pathname)
              );
              if (matchingRequest) {
                return caches.match(matchingRequest);
              }
            }
            
            // If nothing found, return a basic error response for non-navigation requests
            if (event.request.mode !== 'navigate') {
              return new Response('Offline - Resource not cached', { 
                status: 503, 
                statusText: 'Service Unavailable' 
              });
            }
            
            // Final fallback for navigation - serve index.html
            return caches.match('/index.html');
          });
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