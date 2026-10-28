// BUMPED TO v6 TO FORCE THE UPDATE
const CACHE_NAME = 'routine-tracker-v6'; 

const ASSETS = [
  './', 
  './index.html', 
  './manifest.json', 
  './service-worker.js',
  // Add the 5 Silent Mentor Images so they work offline
  'https://i.ibb.co/932dJwX4/IMG-20261027-170412.jpg',
  'https://i.ibb.co/pBHG9ppC/IMG-20261027-170341.jpg',
  'https://i.ibb.co/ZR72G145/IMG-20261027-170255.jpg',
  'https://i.ibb.co/Xfjyhwzk/IMG-20261027-170155.jpg',
  'https://i.ibb.co/DP5ysVxF/IMG-20261027-170026.jpg',
  // Add Firebase Scripts so the app doesn't break offline
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

// Network-First Strategy for external assets, Cache-First for local
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse; // Return from cache if available
      }
      return fetch(e.request).then(networkResponse => {
        // Optionally cache new successful requests here if needed
        return networkResponse;
      }).catch(() => {
        // If offline and not in cache, it will fail gracefully
      });
    })
  );
});

// Handle Notification Actions (GOT IT / CHECK)
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const action = event.action;
  const taskId = event.notification.tag;
  
  if (action === 'gotit') {
    console.log('Task acknowledged:', taskId);
  } else if (action === 'check') {
    event.waitUntil(clients.matchAll({ type: 'window' }).then(clientsList => {
      if (clientsList.length > 0) {
        clientsList[0].focus();
        clientsList[0].postMessage({ action: 'check', taskId });
      } else {
        clients.openWindow('./');
      }
    }));
  }
});
