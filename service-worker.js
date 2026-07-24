const CACHE_NAME = 'routine-tracker-v5';
const ASSETS = ['./', './index.html', './manifest.json', './service-worker.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});

// SECTION 4: Handle Notification Actions (GOT IT / CHECK)
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const action = event.action;
  const taskId = event.notification.tag;
  
  if (action === 'gotit') {
    // Silently acknowledge
    console.log('Task acknowledged:', taskId);
  } else if (action === 'check') {
    // Open app and focus
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
