import React from 'react';
import {
  Trash2,
  CheckCircle2,
  Play,
  PackageCheck,
  XCircle,
  UtensilsCrossed,
  CreditCard,
  MessageSquare,
  Banknote,
  Star
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import PaymentStatusButtons from './PaymentStatusButtons';
import { formatCurrency } from '../utils/formatCurrency';

const ORDER_ACTIONS = [
  { status: 'em_preparo', label: 'Preparar', icon: Play, bg: '#fef3c7', color: '#b45309' },
  { status: 'pronto', label: 'Pronto', icon: CheckCircle2, bg: '#d1fae5', color: '#065f46' },
  { status: 'finalizado', label: 'Entregue', icon: PackageCheck, bg: '#cffafe', color: '#0891b2' },
  { status: 'cancelado', label: 'Cancelar', icon: XCircle, bg: '#fee2e2', color: '#b91c1c' }
];

export default function OrderCard({
  order,
  onChangeStatus,
  onChangePaymentStatus,
  onDelete
}) {
  const noteRaw = order.notes || '';
  const noteParts = noteRaw.split('|');

  const trocoPart = noteParts
    .find((part) => part.includes('TROCO PARA:'))
    ?.split(':')[1]
    ?.trim();

  const feedbackData = order.feedbacks?.[0];
  const ratingVal =
    feedbackData?.stars ||
    order.rating ||
    noteParts
      .find((part) => part.includes('FEEDBACK_STARS:'))
      ?.split(':')[1]
      ?.trim();

  const feedbackComment =
    feedbackData?.comment ||
    order.feedback ||
    noteParts
      .find((part) => part.includes('FEEDBACK_COMMENT:'))
      ?.split(':')[1]
      ?.trim();

  const getFinalObservation = () => {
    const obsPart = noteParts.find((part) => part.includes('OBS_GERAL:'));

    if (obsPart) {
      return obsPart.split('OBS_GERAL:')[1]?.trim() || '';
    }

    const simple = noteRaw.trim();
    const paymentMethod = String(order.payment_method || '').trim();

    const containsSystemData =
      simple.includes('PAYMENT:') ||
      simple.includes('TROCO PARA:') ||
      simple.includes('FEEDBACK_STARS:') ||
      simple.includes('FEEDBACK_COMMENT:');

    if (
      simple &&
      !containsSystemData &&
      simple.toLowerCase() !== paymentMethod.toLowerCase()
    ) {
      return simple;
    }

    return '';
  };

  const getItems = () => {
    try {
      return typeof order.items === 'string'
        ? JSON.parse(order.items)
        : order.items || [];
    } catch (error) {
      console.error('Erro ao ler os itens do pedido:', error);
      return null;
    }
  };

  const items = getItems();
  const finalObservation = getFinalObservation();
  const isPix = String(order.payment_method || '').toLowerCase() === 'pix';

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '15px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        borderLeft: `5px solid var(--status-${order.status})`
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div>
          <h3 style={{ margin: 0 }}>Pedido #{order.id.toString().slice(-2)}</h3>
          <span style={{ fontSize: '0.8rem', color: '#999' }}>
            {new Date(order.created_at).toLocaleString('pt-BR')}
          </span>
          <p style={{ margin: '5px 0', fontWeight: '700' }}>
            {order.customer_name}{' '}
            <span style={{ fontWeight: '400', color: '#666' }}>
              - {order.customer_phone}
            </span>
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <StatusBadge status={order.status} />
          <div style={{ fontSize: '1.2rem', fontWeight: '900', marginTop: '5px' }}>
            {formatCurrency(order.total)}
          </div>
          <button
            type="button"
            onClick={() => onDelete(order.id)}
            aria-label={`Excluir pedido ${order.id}`}
            style={{
              color: '#ef4444',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginTop: '5px'
            }}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>
        <p
          style={{
            margin: '0 0 10px',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <UtensilsCrossed size={16} /> Itens pedidos:
        </p>

        {items === null ? (
          <p>Erro ao ler itens.</p>
        ) : (
          items.map((item, index) => {
            const quantity = item.qty || item.quantity || 1;

            return (
              <div key={`${item.id || item.name}-${index}`} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span>
                    <strong style={{ color: '#ef4444' }}>{quantity}x</strong>{' '}
                    {item.name}
                  </span>
                  <span>{formatCurrency(Number(item.price || 0) * quantity)}</span>
                </div>

                {item.note && (
                  <div style={{ fontSize: '0.85rem', color: '#d35400', fontWeight: '600', marginTop: '4px' }}>
                    ↳ OBS: {item.note}
                  </div>
                )}
              </div>
            );
          })
        )}

        {finalObservation && finalObservation.toLowerCase() !== 'null' && (
          <div style={{ marginTop: '12px', padding: '10px', background: '#fff9db', borderRadius: '6px', border: '1px solid #ffec99' }}>
            <strong style={{ fontSize: '0.8rem', color: '#856404', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MessageSquare size={14} /> OBSERVAÇÃO DO CLIENTE:
            </strong>
            <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#444', fontWeight: '500' }}>
              {finalObservation}
            </p>
          </div>
        )}

        {trocoPart && (
          <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#666' }}>
            <Banknote size={14} style={{ verticalAlign: 'middle', marginRight: '5px', color: '#28a745' }} />
            <strong>Troco para:</strong> {trocoPart}
          </div>
        )}

        <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#666' }}>
          <CreditCard size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
          <strong>Pagamento:</strong> {order.payment_method?.toUpperCase()}
        </div>

        {isPix && (
          <PaymentStatusButtons
            orderId={order.id}
            paymentStatus={order.payment_status}
            onChange={onChangePaymentStatus}
          />
        )}

        {(ratingVal || feedbackComment) && (
          <div style={{ marginTop: '15px', padding: '12px', background: '#fefce8', borderRadius: '8px', border: '1px solid #fde047' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: feedbackComment ? '8px' : 0 }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    size={16}
                    fill={index < Number(ratingVal) ? '#f59e0b' : 'none'}
                    color="#f59e0b"
                  />
                ))}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#854d0e' }}>
                AVALIAÇÃO ({ratingVal || 0}/5)
              </span>
            </div>

            {feedbackComment && (
              <div style={{ marginTop: '5px', borderTop: '1px solid #fef08a', paddingTop: '5px' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#713f12', fontStyle: 'italic', lineHeight: 1.4 }}>
                  “{feedbackComment}”
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {ORDER_ACTIONS.map((action) => {
          const ActionIcon = action.icon;

          return (
            <button
              key={action.status}
              type="button"
              onClick={() => onChangeStatus(order.id, action.status)}
              style={{
                flex: '1 1 120px',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: action.bg,
                color: action.color,
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <ActionIcon size={16} /> {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}