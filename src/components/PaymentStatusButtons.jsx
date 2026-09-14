import React from 'react';

const PAYMENT_OPTIONS = [
  {
    value: 'pendente',
    label: 'Pendente',
    className: 'pix-pendente'
  },
  {
    value: 'pago',
    label: 'Pago',
    className: 'pix-pago'
  },
  {
    value: 'cancelado',
    label: 'Cancelado',
    className: 'pix-cancelado'
  }
];

export default function PaymentStatusButtons({
  orderId,
  paymentStatus = 'pendente',
  onChange
}) {
  const currentStatus = String(
    paymentStatus || 'pendente'
  )
    .trim()
    .toLowerCase();

  return (
    <div className="admin-pix-status">
      <strong className="admin-pix-status-title">
        Status do pagamento Pix
      </strong>

      <div className="admin-pix-status-buttons">
        {PAYMENT_OPTIONS.map((option) => {
          const isActive =
            currentStatus === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                onChange(
                  orderId,
                  option.value
                )
              }
              aria-pressed={isActive}
              className={`admin-pix-status-button ${option.className} ${
                isActive ? 'active' : ''
              }`}
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