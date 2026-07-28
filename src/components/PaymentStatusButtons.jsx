import React from 'react';

const PAYMENT_OPTIONS = [
  {
    value: 'pendente',
    label: 'Pendente',
    background: '#fff7ed',
    color: '#9a3412'
  },
  {
    value: 'pago',
    label: 'Pago',
    background: '#f0fdf4',
    color: '#166534'
  },
  {
    value: 'cancelado',
    label: 'Cancelado',
    background: '#fef2f2',
    color: '#b91c1c'
  }
];

export default function PaymentStatusButtons({
  orderId,
  paymentStatus = 'pendente',
  onChange
}) {
  const currentStatus = String(paymentStatus || 'pendente')
    .trim()
    .toLowerCase();

  return (
    <div style={styles.container}>
      <strong style={styles.title}>Status do pagamento Pix</strong>

      <div style={styles.buttonsWrapper}>
        {PAYMENT_OPTIONS.map((option) => {
          const isActive = currentStatus === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(orderId, option.value)}
              aria-pressed={isActive}
              style={{
                ...styles.button,
                border: isActive
                  ? `2px solid ${option.color}`
                  : '1px solid #d1d5db',
                background: option.background,
                color: option.color,
                opacity: isActive ? 1 : 0.72
              }}
            >
              {isActive ? '✓ ' : ''}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    marginTop: '12px',
    padding: '12px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px'
  },

  title: {
    display: 'block',
    marginBottom: '9px',
    color: '#475569',
    fontSize: '0.82rem'
  },

  buttonsWrapper: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },

  button: {
    padding: '8px 12px',
    borderRadius: '8px',
    fontWeight: 800,
    cursor: 'pointer',
    transition: 'opacity 0.2s ease, transform 0.2s ease'
  }
};