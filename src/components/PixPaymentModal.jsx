import React, { useState } from 'react';
import { X, Copy, CheckCircle, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function PixPaymentModal({
  isOpen,
  onClose,
  orderId,
  totalValue,
  pixCode,
  onPaymentDone
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const formattedValue = Number(totalValue || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Erro ao copiar código Pix:', error);
      alert('Não foi possível copiar o código Pix.');
    }
  };

  return (
    <div
      onClick={onClose}
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
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '430px',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#ffffff',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
          position: 'relative'
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar pagamento Pix"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            border: 'none',
            background: '#f1f1f1',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={20} />
        </button>

        <div
          style={{
            textAlign: 'center',
            paddingRight: '30px',
            marginBottom: '20px'
          }}
        >
          <h2
            style={{
              margin: '0 0 8px',
              fontSize: '1.5rem',
              color: '#222'
            }}
          >
            Pagamento via Pix
          </h2>

          <p
            style={{
              margin: 0,
              color: '#666',
              lineHeight: 1.5
            }}
          >
            Escaneie o QR Code ou copie o código abaixo.
          </p>
        </div>

        <div
          style={{
            background: '#f8f9fa',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '20px',
            textAlign: 'center'
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '0.9rem',
              color: '#666',
              marginBottom: '4px'
            }}
          >
            Pedido #{orderId}
          </span>

          <strong
            style={{
              display: 'block',
              fontSize: '2rem',
              color: '#222'
            }}
          >
            {formattedValue}
          </strong>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px'
          }}
        >
          <div
            style={{
              padding: '14px',
              background: '#fff',
              border: '1px solid #e5e5e5',
              borderRadius: '14px'
            }}
          >
            <QRCodeSVG
              value={pixCode}
              size={220}
              level="M"
              includeMargin
            />
          </div>
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label
            style={{
              display: 'block',
              fontWeight: '700',
              marginBottom: '8px',
              color: '#333'
            }}
          >
            Pix Copia e Cola
          </label>

          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: '12px',
              padding: '12px',
              background: '#fafafa',
              fontSize: '0.8rem',
              color: '#555',
              wordBreak: 'break-all',
              maxHeight: '90px',
              overflowY: 'auto'
            }}
          >
            {pixCode}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          style={{
            width: '100%',
            padding: '14px',
            border: '2px solid #28a745',
            borderRadius: '12px',
            background: copied ? '#e8f7ec' : '#ffffff',
            color: '#167c32',
            fontWeight: '800',
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '14px'
          }}
        >
          {copied ? (
            <>
              <CheckCircle size={20} />
              Código copiado
            </>
          ) : (
            <>
              <Copy size={20} />
              Copiar código Pix
            </>
          )}
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            background: '#fff8e1',
            border: '1px solid #ffe08a',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '18px',
            color: '#735c00'
          }}
        >
          <Clock size={21} style={{ flexShrink: 0, marginTop: '1px' }} />

          <span
            style={{
              fontSize: '0.9rem',
              lineHeight: 1.45
            }}
          >
            Após realizar o pagamento, clique no botão abaixo. O estabelecimento
            confirmará o recebimento manualmente.
          </span>
        </div>

        <button
          type="button"
          onClick={onPaymentDone}
          style={{
            width: '100%',
            padding: '16px',
            border: 'none',
            borderRadius: '12px',
            background: '#28a745',
            color: '#ffffff',
            fontWeight: '800',
            fontSize: '1.05rem',
            cursor: 'pointer'
          }}
        >
          Já realizei o pagamento
        </button>
      </div>
    </div>
  );
}