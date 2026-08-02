import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const NEW_ORDERS_CHANNEL = 'new-orders';
const ORDER_STATUS_CHANNEL = 'order-status';

const createNotificationId = () => {
  const timestamp = Date.now();

  // O Android exige um ID inteiro dentro de um limite seguro.
  return Math.floor(timestamp % 2147483647);
};

export async function initializeNotifications() {
  // No navegador, não tenta usar o plugin nativo.
  if (!Capacitor.isNativePlatform()) {
    console.log('Notificações nativas disponíveis somente no APK.');
    return false;
  }

  try {
    let permission = await LocalNotifications.checkPermissions();

    if (permission.display !== 'granted') {
      permission = await LocalNotifications.requestPermissions();
    }

    if (permission.display !== 'granted') {
      console.warn('Permissão para notificações não concedida.');
      return false;
    }

    // Canais usados pelo Android para controlar som e importância.
    await LocalNotifications.createChannel({
      id: NEW_ORDERS_CHANNEL,
      name: 'Novos pedidos',
      description: 'Avisos quando um novo pedido for recebido.',
      importance: 5,
      visibility: 1,
      vibration: true
    });

    await LocalNotifications.createChannel({
      id: ORDER_STATUS_CHANNEL,
      name: 'Atualizações do pedido',
      description: 'Avisos sobre o andamento do pedido.',
      importance: 4,
      visibility: 1,
      vibration: true
    });

    console.log('Notificações inicializadas com sucesso.');
    return true;
  } catch (error) {
    console.error('Erro ao inicializar notificações:', error);
    return false;
  }
}

export async function notifyNewOrder(order) {
  if (!Capacitor.isNativePlatform()) {
    console.log(`Novo pedido #${order?.id}`, order);
    return;
  }

  try {
    const allowed = await initializeNotifications();

    if (!allowed) return;

    const customerName = order?.customer_name || 'Cliente';
    const total = Number(order?.total || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

    await LocalNotifications.schedule({
      notifications: [
        {
          id: createNotificationId(),
          title: '🔔 Novo pedido recebido!',
          body: `Pedido #${order.id} de ${customerName} — ${total}`,
          channelId: NEW_ORDERS_CHANNEL,
          sound: 'default',
          extra: {
            orderId: order.id,
            type: 'new_order'
          }
        }
      ]
    });
  } catch (error) {
    console.error('Erro ao notificar novo pedido:', error);
  }
}

const STATUS_MESSAGES = {
  aguardando_pagamento: {
    title: 'Aguardando pagamento',
    body: 'Estamos aguardando a confirmação do seu Pix.'
  },

  novo: {
    title: '✅ Pedido confirmado!',
    body: 'Seu pedido foi recebido e entrou na fila.'
  },

  em_preparo: {
    title: '👨‍🍳 Pedido em preparo',
    body: 'Estamos preparando o seu pedido.'
  },

  pronto: {
    title: '🥡 Pedido pronto!',
    body: 'Seu pedido já está pronto para retirada.'
  },

  finalizado: {
    title: '✅ Pedido finalizado',
    body: 'Obrigado pela preferência!'
  },

  cancelado: {
    title: '❌ Pedido cancelado',
    body: 'O seu pedido foi cancelado.'
  }
};

export async function notifyOrderStatus(order) {
  if (!order?.status) return;

  const notificationData = STATUS_MESSAGES[order.status];

  if (!notificationData) return;

  if (!Capacitor.isNativePlatform()) {
    console.log(
      `${notificationData.title}: ${notificationData.body}`
    );
    return;
  }

  try {
    const allowed = await initializeNotifications();

    if (!allowed) return;

    await LocalNotifications.schedule({
      notifications: [
        {
          id: createNotificationId(),
          title: notificationData.title,
          body: `Pedido #${order.id}: ${notificationData.body}`,
          channelId: ORDER_STATUS_CHANNEL,
          sound: 'default',
          extra: {
            orderId: order.id,
            status: order.status,
            type: 'order_status'
          }
        }
      ]
    });
  } catch (error) {
    console.error(
      'Erro ao enviar notificação de atualização:',
      error
    );
  }
}