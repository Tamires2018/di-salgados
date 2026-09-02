self.addEventListener('push', (event) => {
  console.log('[SW] Push recebido');

  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    console.error('[SW] Erro ao interpretar push:', error);

    data = {
      title: 'Novo pedido',
      body: 'Você recebeu um novo pedido.'
    };
  }

  const title = data.title || 'Novo pedido';

  const options = {
    body: data.body || 'Você recebeu um novo pedido.',
    icon: data.icon || '/favicon.ico',
    badge: data.icon || '/favicon.ico',
    requireInteraction: true,

    data: {
      url: '/admin'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow('/admin');
      }
    })
  );
});