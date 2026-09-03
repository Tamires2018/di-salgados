// ======================================================
// SERVICE WORKER - DI SALGADOS
// ======================================================

// Instalação
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');

  // Faz o novo Service Worker assumir o controle
  // assim que possível.
  self.skipWaiting();
});


// Ativação
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker ativado.');

  event.waitUntil(
    self.clients.claim()
  );
});


// ======================================================
// RECEBIMENTO DE NOTIFICAÇÃO PUSH
// ======================================================

self.addEventListener('push', (event) => {
  console.log('[SW] Push recebido.');

  let data = {};

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (error) {
    console.error(
      '[SW] Erro ao interpretar os dados do Push:',
      error
    );

    data = {
      title: 'Novo pedido',
      body: 'Você recebeu um novo pedido.'
    };
  }

  const title =
    data.title || '🔔 Novo Pedido';

  const options = {
    body:
      data.body ||
      'Você recebeu um novo pedido.',

    icon:
      data.icon ||
      '/Logo.png',

    badge:
      data.icon ||
      '/Logo.png',

    requireInteraction: true,

    vibrate: [
      200,
      100,
      200
    ],

    data: {
      url: '/#/admin'
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      title,
      options
    )
  );
});


// ======================================================
// CLIQUE NA NOTIFICAÇÃO
// ======================================================

self.addEventListener(
  'notificationclick',
  (event) => {
    console.log(
      '[SW] Notificação clicada.'
    );

    event.notification.close();

    const targetUrl =
      event.notification?.data?.url ||
      '/#/admin';

    event.waitUntil(
      self.clients
        .matchAll({
          type: 'window',
          includeUncontrolled: true
        })
        .then((clientList) => {

          // Se o site já estiver aberto,
          // tenta reutilizar a janela.
          for (const client of clientList) {

            if (
              'focus' in client
            ) {
              return client.focus();
            }
          }

          // Caso não esteja aberto,
          // abre o painel.
          if (
            self.clients.openWindow
          ) {
            return self.clients.openWindow(
              targetUrl
            );
          }

          return undefined;
        })
    );
  }
);