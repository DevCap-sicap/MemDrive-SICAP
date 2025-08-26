const CACHE_NAME = "sicap-cache-v1";
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
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_FILES))
  );
  self.skipWaiting();
});

// Activate event: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Fetch event: serve cached first, then network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request).catch(() => caches.match("/index.html"))
    )
  );
});
