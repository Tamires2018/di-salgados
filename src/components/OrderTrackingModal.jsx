import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  CookingPot,
  PackageCheck,
  XCircle,
  X
} from 'lucide-react';
import { supabase } from '../services/supabase';

const STATUS_CONFIG = {
  aguardando_pagamento: {
    title: 'Aguardando pagamento',
    message: 'Estamos aguardando a confirmação do seu Pix.',
    icon: Clock
  },

  novo: {
    title: 'Pedido confirmado',
    message: 'Seu pagamento foi confirmado e o pedido entrou na fila.',
    icon: CheckCircle2
  },

  em_preparo: {
    title: 'Pedido em preparo',
    message: 'Estamos preparando o seu pedido.',
    icon: CookingPot
  },

  pronto: {
    title: 'Pedido pronto',
    message: 'Seu pedido está pronto para retirada!',
    icon: PackageCheck
  },

  finalizado: {
    title: 'Pedido entregue',
    message: 'Seu pedido foi finalizado. Obrigado pela preferência!',
    icon: CheckCircle2
  },

  cancelado: {
    title: 'Pedido cancelado',
    message: 'Este pedido foi cancelado.',
    icon: XCircle
  }
};

export default function OrderTrackingModal({
  orderId,
  onClose
}) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const previousStatusRef = useRef(null);
  const notificationTimeoutRef = useRef(null);

  useEffect(() => {
    if (!orderId) return undefined;

    let isMounted = true;

    const requestNotificationPermission = async () => {
      try {
        if (
          'Notification' in window &&
          Notification.permission === 'default'
        ) {
          await Notification.requestPermission();
        }
      } catch (error) {
        console.warn(
          'Não foi possível solicitar permissão para notificações:',
          error
        );
      }
    };

    const notifyCustomer = (updatedOrder) => {
      const statusData = STATUS_CONFIG[updatedOrder?.status];

      if (!statusData) return;

      setNotification({
        title: statusData.title,
        message: statusData.message
      });

      if (notificationTimeoutRef.current) {
        window.clearTimeout(notificationTimeoutRef.current);
      }

      notificationTimeoutRef.current = window.setTimeout(() => {
        if (isMounted) {
          setNotification(null);
        }
      }, 6000);

      if (
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        try {
          new Notification(statusData.title, {
            body: statusData.message,
            tag: `pedido-${updatedOrder.id}`,
            renotify: true
          });
        } catch (error) {
          console.warn(
            'Não foi possível exibir a notificação do navegador:',
            error
          );
        }
      }
    };

    const updateOrder = (updatedOrder, shouldNotify = true) => {
      if (!isMounted || !updatedOrder) return;

      const previousStatus = previousStatusRef.current;
      const newStatus = updatedOrder.status;

      setOrder(updatedOrder);

      if (
        shouldNotify &&
        previousStatus &&
        previousStatus !== newStatus
      ) {
        notifyCustomer(updatedOrder);
      }

      previousStatusRef.current = newStatus;
    };

    const loadOrder = async (showLoading = false) => {
      try {
        if (showLoading && isMounted) {
          setLoading(true);
        }

        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .maybeSingle();

        if (error) throw error;

        // Se o pedido não existe mais, limpa o ID antigo salvo
        // e fecha automaticamente a tela de acompanhamento.
        if (!data) {
          localStorage.removeItem('currentOrderId');
          previousStatusRef.current = null;

          if (isMounted) {
            setOrder(null);
            setLoading(false);
            onClose();
          }

          return;
        }

        const isFirstLoad = !previousStatusRef.current;

        updateOrder(data, !isFirstLoad);
      } catch (error) {
        console.error('Erro ao carregar pedido:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    requestNotificationPermission();

    // Carrega o pedido assim que o modal abre.
    loadOrder(true);

    // Escuta alterações do pedido pelo Supabase Realtime.
    const channel = supabase
      .channel(`order-tracking-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          console.log(
            'Atualização recebida em tempo real:',
            payload.new
          );

          updateOrder(payload.new, true);
        }
      )
      .subscribe((status, error) => {
        console.log('Status do Realtime:', status);

        if (status === 'SUBSCRIBED') {
          console.log(`Acompanhando o pedido #${orderId}`);
        }

        if (
          status === 'CHANNEL_ERROR' ||
          status === 'TIMED_OUT'
        ) {
          console.warn(
            'Realtime desconectado. O acompanhamento continuará pelo modo de segurança.',
            error || ''
          );
        }
      });

    // Segurança: consulta o pedido a cada 5 segundos.
    const intervalId = window.setInterval(() => {
      loadOrder(false);
    }, 5000);

    // Atualiza imediatamente quando o cliente volta para a página.
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadOrder(false);
      }
    };

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    return () => {
      isMounted = false;

      window.clearInterval(intervalId);

      if (notificationTimeoutRef.current) {
        window.clearTimeout(notificationTimeoutRef.current);
      }

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );

      supabase.removeChannel(channel);
    };
  }, [orderId]);

  if (!orderId) return null;

  const statusData =
    STATUS_CONFIG[order?.status] ||
    STATUS_CONFIG.aguardando_pagamento;

  const StatusIcon = statusData.icon;

  const handleClose = () => {
    const finishedStatuses = ['finalizado', 'cancelado'];

    if (finishedStatuses.includes(order?.status)) {
      localStorage.removeItem('currentOrderId');
    }

    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 9999
      }}
      onClick={handleClose}
    >
      {notification && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 40px)',
            maxWidth: '400px',
            background: '#ffffff',
            borderLeft: '5px solid #ef4444',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 10px 35px rgba(0, 0, 0, 0.25)',
            zIndex: 10001,
            textAlign: 'left'
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Fechar notificação"
            onClick={() => setNotification(null)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '30px',
              height: '30px',
              border: 'none',
              borderRadius: '50%',
              background: '#f1f1f1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>

          <strong
            style={{
              display: 'block',
              color: '#222',
              marginBottom: '5px',
              paddingRight: '30px'
            }}
          >
            {notification.title}
          </strong>

          <span
            style={{
              color: '#666',
              fontSize: '0.9rem',
              lineHeight: 1.4
            }}
          >
            {notification.message}
          </span>
        </div>
      )}

      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '430px',
          background: '#ffffff',
          borderRadius: '20px',
          padding: '25px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          textAlign: 'center'
        }}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Fechar acompanhamento"
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            border: 'none',
            background: '#f1f1f1',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <X size={20} />
        </button>

        {loading ? (
          <div style={{ padding: '35px 10px' }}>
            <Clock size={45} color="#ef4444" />
            <h2>Carregando pedido...</h2>
          </div>
        ) : (
          <>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#fef2f2',
                color: '#ef4444',
                margin: '10px auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <StatusIcon size={42} />
            </div>

            <span
              style={{
                display: 'block',
                color: '#777',
                fontSize: '0.9rem',
                marginBottom: '6px'
              }}
            >
              Pedido #{order?.id}
            </span>

            <h2
              style={{
                margin: '0 0 10px',
                color: '#222'
              }}
            >
              {statusData.title}
            </h2>

            <p
              style={{
                margin: '0 0 22px',
                color: '#666',
                lineHeight: 1.5
              }}
            >
              {statusData.message}
            </p>

            <div
              style={{
                background: '#f8f9fa',
                padding: '14px',
                borderRadius: '12px',
                fontSize: '0.9rem',
                color: '#555'
              }}
            >
              Esta tela será atualizada automaticamente quando o
              estabelecimento alterar o pedido.
            </div>
          </>
        )}
      </div>
    </div>
  );
}