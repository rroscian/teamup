const CACHE_NAME = 'teamup-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/events',
  '/profile',
  '/login',
  '/messages',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/teamup_logo.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching App Shell');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker: Skip Waiting');
        return self.skipWaiting();
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Stratégie de cache pour les requêtes
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes des extensions Chrome et autres protocoles non-http
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  console.log('Service Worker: Fetching', event.request.url);
  
  // Cache first pour les assets statiques
  if (event.request.url.includes('.png') || 
      event.request.url.includes('.jpg') || 
      event.request.url.includes('.css') || 
      event.request.url.includes('.js') ||
      event.request.url.includes('fonts.googleapis.com')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return fetch(event.request)
            .then((fetchResponse) => {
              const responseClone = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  // Vérifier que la requête est HTTP avant de mettre en cache
                  if (event.request.url.startsWith('http')) {
                    cache.put(event.request, responseClone);
                  }
                });
              return fetchResponse;
            });
        })
        .catch(() => {
          // Fallback pour les images
          if (event.request.destination === 'image') {
            return caches.match('/teamup_logo.png');
          }
        })
    );
    return;
  }
  
  // Network first pour les API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache les réponses GET réussies
          if (event.request.method === 'GET' && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME + '-api')
              .then((cache) => {
                cache.put(event.request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Fallback vers le cache pour les requêtes GET
          if (event.request.method === 'GET') {
            return caches.match(event.request);
          }
          // Pour les autres méthodes, retourner une erreur réseau
          return new Response(JSON.stringify({
            error: 'Network unavailable',
            offline: true
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }
  
  // Cache first pour les pages
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((fetchResponse) => {
            // Ne pas mettre en cache les réponses d'erreur
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }
            const responseClone = fetchResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Vérifier que la requête est HTTP avant de mettre en cache
                if (event.request.url.startsWith('http')) {
                  cache.put(event.request, responseClone);
                }
              });
            return fetchResponse;
          });
      })
      .catch(() => {
        // Fallback vers la page d'accueil pour les routes SPA
        return caches.match('/');
      })
  );
});

// Gestion des messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Notification de mise à jour disponible
self.addEventListener('updatefound', () => {
  console.log('Service Worker: Update found');
});
