import React, { useEffect, useState } from 'react';
import {
  X,
  Minus,
  Plus,
  Trash2,
  MessageSquare
} from 'lucide-react';

import { formatCurrency } from '../utils/formatCurrency';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  updateQty,
  removeItem,
  updateItemNote,
  onCheckout
}) {
  const [generalNote, setGeneralNote] = useState('');

  useEffect(() => {
    if (cart.length === 0) {
      setGeneralNote('');
    }
  }, [cart.length]);

  // Impede a página de trás de rolar enquanto o carrinho estiver aberto
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Fecha o carrinho ao apertar ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const total = cart.reduce(
    (accumulator, item) =>
      accumulator + Number(item.price) * Number(item.qty),
    0
  );

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100dvh',
        background: 'rgba(0, 0, 0, 0.48)',

        // A navbar está com z-index 1000
        zIndex: 9998,

        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'stretch'
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrinho de compras"
        onClick={(event) => event.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 9999,

          width: 'min(460px, 100%)',
          height: '100dvh',
          maxHeight: '100dvh',

          display: 'flex',
          flexDirection: 'column',

          background: '#ffffff',
          boxShadow: '-5px 0 25px rgba(0, 0, 0, 0.18)',
          overflow: 'hidden'
        }}
      >
        {/* Cabeçalho do carrinho */}
        <div
          style={{
            minHeight: '74px',
            padding: '14px 18px',

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',

            background: '#ffffff',
            borderBottom: '1px solid #eeeeee',
            flexShrink: 0
          }}
        >
          <h2
            style={{
              margin: 0,
              color: '#222222',
              fontSize: '1.2rem',
              fontWeight: 800
            }}
          >
            Meu Carrinho
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar carrinho"
            title="Fechar carrinho"
            style={{
              width: '44px',
              height: '44px',
              padding: 0,

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,

              background: '#f3f3f3',
              color: '#333333',

              border: '1px solid #e5e5e5',
              borderRadius: '50%',
              cursor: 'pointer'
            }}
          >
            <X size={25} strokeWidth={2.4} />
          </button>
        </div>

        {/* Área dos produtos */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: '0 18px'
          }}
        >
          {cart.length === 0 ? (
            <p
              style={{
                margin: '38px 0 0',
                textAlign: 'center',
                color: '#888888',
                fontSize: '1rem'
              }}
            >
              Seu carrinho está vazio
            </p>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                style={{
                  width: '100%',
                  padding: '16px 0',

                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '11px',

                  borderBottom: '1px solid #eeeeee'
                }}
              >
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0
                    }}
                  >
                    <span
                      style={{
                        display: 'block',
                        marginBottom: '3px',
                        color: '#222222',
                        fontWeight: 700
                      }}
                    >
                      {item.name}
                    </span>

                    <span
                      style={{
                        color: '#777777',
                        fontSize: '0.87rem'
                      }}
                    >
                      {formatCurrency(item.price)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      flexShrink: 0
                    }}
                  >
                    <button
                      type="button"
                      aria-label={`Diminuir quantidade de ${item.name}`}
                      onClick={() => updateQty(item.id, -1)}
                      style={quantityButtonStyle}
                    >
                      <Minus size={15} />
                    </button>

                    <span
                      style={{
                        minWidth: '22px',
                        textAlign: 'center',
                        color: '#222222',
                        fontWeight: 800
                      }}
                    >
                      {item.qty}
                    </span>

                    <button
                      type="button"
                      aria-label={`Aumentar quantidade de ${item.name}`}
                      onClick={() => updateQty(item.id, 1)}
                      style={quantityButtonStyle}
                    >
                      <Plus size={15} />
                    </button>

                    <button
                      type="button"
                      aria-label={`Remover ${item.name} do carrinho`}
                      onClick={() => removeItem(item.id)}
                      style={{
                        width: '36px',
                        height: '36px',
                        padding: 0,

                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',

                        background: '#fff1f1',
                        color: '#e52f2f',

                        border: '1px solid #ffd7d7',
                        borderRadius: '9px',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Ex: Tirar cebola, ponto da carne..."
                  value={item.note || ''}
                  onChange={(event) =>
                    updateItemNote(item.id, event.target.value)
                  }
                  style={{
                    width: '100%',
                    padding: '10px 12px',

                    background: '#ffffff',
                    color: '#333333',

                    border: '1px solid #dddddd',
                    borderRadius: '9px',
                    outline: 'none',

                    fontSize: '0.85rem'
                  }}
                />
              </div>
            ))
          )}
        </div>

        {/* Rodapé do carrinho */}
        <div
          style={{
            padding: '15px 18px 18px',
            background: '#ffffff',
            borderTop: '2px solid #eeeeee',
            flexShrink: 0
          }}
        >
          <div style={{ marginBottom: '15px' }}>
            <label
              htmlFor="general-note"
              style={{
                marginBottom: '8px',

                display: 'flex',
                alignItems: 'center',
                gap: '6px',

                color: '#222222',
                fontSize: '0.92rem',
                fontWeight: 700
              }}
            >
              <MessageSquare size={17} />
              Observação Geral
            </label>

            <textarea
              id="general-note"
              placeholder="Deseja adicionar alguma observação ao pedido?"
              value={generalNote}
              onChange={(event) => setGeneralNote(event.target.value)}
              style={{
                width: '100%',
                height: '72px',
                padding: '11px 12px',

                background: '#ffffff',
                color: '#333333',

                border: '1px solid #dddddd',
                borderRadius: '10px',
                resize: 'none',
                outline: 'none',

                fontSize: '0.87rem'
              }}
            />
          </div>

          <div
            style={{
              marginBottom: '14px',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}
          >
            <span
              style={{
                color: '#222222',
                fontSize: '1.2rem',
                fontWeight: 800
              }}
            >
              Total:
            </span>

            <span
              style={{
                color: 'var(--primary, #e52f2f)',
                fontSize: '1.25rem',
                fontWeight: 900
              }}
            >
              {formatCurrency(total)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onCheckout(generalNote)}
            disabled={cart.length === 0}
            style={{
              width: '100%',
              minHeight: '54px',
              padding: '14px',

              background:
                cart.length === 0
                  ? '#91d3a0'
                  : '#28a745',

              color: '#ffffff',
              opacity: cart.length === 0 ? 0.7 : 1,

              border: 'none',
              borderRadius: '12px',

              fontSize: '1rem',
              fontWeight: 800,

              cursor:
                cart.length === 0
                  ? 'not-allowed'
                  : 'pointer'
            }}
          >
            Finalizar Pedido
          </button>
        </div>
      </aside>
    </div>
  );
}

const quantityButtonStyle = {
  width: '34px',
  height: '34px',
  padding: 0,

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  background: '#f5f5f5',
  color: '#333333',

  border: '1px solid #dddddd',
  borderRadius: '8px',
  cursor: 'pointer'
};