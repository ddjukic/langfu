// Custom service worker additions for LangFu PWA
// This file will be merged with the auto-generated service worker

// Cache names
const OFFLINE_CACHE_NAME = 'offline-v1';
const DATA_CACHE_NAME = 'data-v1';
const OFFLINE_URL = '/offline.html';

// Install event - cache offline page
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(OFFLINE_CACHE_NAME);
      await cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
    })()
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Enable navigation preload if available
      if ('navigationPreload' in self.registration) {
        await self.registration.navigationPreload.enable();
      }
    })()
  );
  self.clients.claim();
});

// Fetch event - serve offline page when needed
self.addEventListener('fetch', (event) => {
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try to use preloaded response
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          // Fallback to network
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // Network failed, serve offline page
          console.log('Fetch failed; returning offline page instead.', error);
          const cache = await caches.open(OFFLINE_CACHE_NAME);
          const cachedResponse = await cache.match(OFFLINE_URL);
          return cachedResponse;
        }
      })()
    );
  }

  // Handle API requests with background sync
  if (event.request.url.includes('/api/')) {
    // For POST/PUT/DELETE requests, queue them for background sync
    if (['POST', 'PUT', 'DELETE'].includes(event.request.method)) {
      event.respondWith(
        fetch(event.request.clone()).catch(() => {
          // Queue the request for later
          return queueRequest(event.request);
        })
      );
    } else {
      // For GET requests, try network first, then cache
      event.respondWith(
        caches.match(event.request).then((response) => {
          return fetch(event.request)
            .then((networkResponse) => {
              // Update cache with fresh data
              if (networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                caches.open(DATA_CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              }
              return networkResponse;
            })
            .catch(() => {
              // Network failed, return cached version if available
              return (
                response ||
                new Response(JSON.stringify({ error: 'Offline' }), {
                  headers: { 'Content-Type': 'application/json' },
                })
              );
            });
        })
      );
    }
  }
});

// Queue failed requests for background sync
async function queueRequest(request) {
  // Store request data in IndexedDB for later sync
  const db = await openDB();
  const tx = db.transaction('sync-queue', 'readwrite');
  const store = tx.objectStore('sync-queue');

  const requestData = {
    url: request.url,
    method: request.method,
    headers: [...request.headers.entries()],
    body: await request.text(),
    timestamp: Date.now(),
  };

  await store.add(requestData);

  // Return a response indicating the request was queued
  return new Response(
    JSON.stringify({
      queued: true,
      message: 'Request queued for background sync',
    }),
    {
      status: 202,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

// Open IndexedDB for request queue
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('langfu-sync', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('sync-queue')) {
        db.createObjectStore('sync-queue', {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    };
  });
}

// Background sync event
self.addEventListener('sync', async (event) => {
  if (event.tag === 'sync-requests') {
    event.waitUntil(syncQueuedRequests());
  }
});

// Sync queued requests when back online
async function syncQueuedRequests() {
  const db = await openDB();
  const tx = db.transaction('sync-queue', 'readwrite');
  const store = tx.objectStore('sync-queue');
  const requests = await store.getAll();

  for (const requestData of requests) {
    try {
      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: requestData.headers,
        body: requestData.body,
      });

      if (response.ok) {
        // Remove successfully synced request from queue
        await store.delete(requestData.id);
      }
    } catch (error) {
      console.error('Failed to sync request:', error);
      // Keep request in queue for next sync attempt
    }
  }
}

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
