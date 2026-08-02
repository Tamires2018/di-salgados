import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!orderId) return undefined;

    let isMounted = true;

    const loadOrder = async (showLoading = false) => {
      try {
        if (showLoading && isMounted) {
          setLoading(true);
        }

        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (error) throw error;

        if (isMounted) {
          setOrder(data);
        }
      } catch (error) {
        console.error('Erro ao carregar pedido:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Carrega o pedido assim que o modal abre.
    loadOrder(true);

    // Escuta as alterações do pedido pelo Realtime.
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

          if (isMounted) {
            setOrder(payload.new);
          }
        }
      )
      .subscribe((status) => {
        console.log('Status do Realtime:', status);

        if (status === 'SUBSCRIBED') {
          console.log(`Acompanhando o pedido #${orderId}`);
        }

        if (
          status === 'CHANNEL_ERROR' ||
          status === 'TIMED_OUT'
        ) {
          console.warn(
            'Realtime desconectado. O acompanhamento continuará pelo modo de segurança.'
          );
        }
      });

    // Segurança: consulta o pedido a cada 5 segundos.
    const intervalId = window.setInterval(() => {
      loadOrder(false);
    }, 5000);

    // Atualiza imediatamente ao voltar para o aplicativo.
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
              Esta tela será atualizada automaticamente quando o estabelecimento
              alterar o pedido.
            </div>
          </>
        )}
      </div>
    </div>
  );
}