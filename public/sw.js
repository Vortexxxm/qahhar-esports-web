
self.addEventListener('push', function(event) {
  console.log('Push event received:', event);
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'إشعار جديد',
        body: event.data.text() || 'لديك رسالة جديدة من فريق قهار'
      };
    }
  }
  
  const options = {
    body: data.body || 'لديك رسالة جديدة من فريق قهار',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1',
      url: data.url || '/'
    },
    actions: [
      {
        action: 'explore',
        title: 'فتح الموقع',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'إغلاق'
      }
    ],
    requireInteraction: false,
    silent: false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'فريق قهار', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification click received.');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    const urlToOpen = event.notification.data?.url || '/';
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(function(clientList) {
          // Check if there's already a window/tab open with the target URL
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          // If no window/tab is already open, open a new one
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

self.addEventListener('notificationclose', function(event) {
  console.log('Notification was closed', event);
});

self.addEventListener('install', function(event) {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});
