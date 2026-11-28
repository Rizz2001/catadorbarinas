// Service Worker PWA + Web Push para administradores de EL CATADOR.
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = {
    title: 'EL CATADOR. — Nuevo Pedido',
    body: 'Tienes un nuevo pedido por verificar en la consola.',
    url: '/admin/pedidos',
    tag: 'catador-admin-order',
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    } catch {
      const rawText = event.data.text();
      if (rawText) payload.body = rawText;
    }
  }

  const options = {
    body: payload.body,
    icon: '/icon-catador.png',
    badge: '/icon-catador.png',
    tag: payload.tag,
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 250],
    data: {
      url: payload.url || '/admin/pedidos',
    },
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/admin/pedidos';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client && client.url.includes('/admin')) {
          if ('navigate' in client && !client.url.endsWith(targetUrl)) {
            return client.navigate(targetUrl).then((c) => (c ? c.focus() : undefined));
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return undefined;
    })
  );
});
