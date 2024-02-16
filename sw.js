self.addEventListener('push', event => {
  const payload = event.data.json();

  event.waitUntil(self.registration.showNotification(payload.title, {
    body: payload.body,
    data: { url: payload.url },
  }));
});

self.addEventListener('notificationclick', event => {
  const clickedNotification = event.notification;
  const url = clickedNotification.data.url;
  event.waitUntil(clients.openWindow(url));
  event.notification.close();
});
