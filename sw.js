// Rwanda Smart Market Service Worker
// Placeholder for PWA functionality

self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass through all requests without caching for now
  event.respondWith(fetch(event.request));
});
