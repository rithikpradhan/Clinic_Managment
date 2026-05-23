// Service Worker custom extension for Notification handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Focus or open application window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Find a window client that is matching the application scope
      for (const client of clientList) {
        if (client.url.indexOf(self.registration.scope) === 0 && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window client is found, open a new one
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
