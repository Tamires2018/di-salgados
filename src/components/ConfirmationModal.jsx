import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  title = 'Confirmar ação',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false
}) {
  if (!isOpen) return null;

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget && !loading) {
      onCancel();
    }
  };

  return (
    <div
      style={styles.overlay}
      onClick={handleOverlayClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
        style={styles.modal}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          aria-label="Fechar modal"
          style={{
            ...styles.closeButton,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1
          }}
        >
          <X size={21} />
        </button>

        <div style={styles.iconWrapper}>
          <AlertTriangle size={30} />
        </div>

        <h2
          id="confirmation-modal-title"
          style={styles.title}
        >
          {title}
        </h2>

        <div style={styles.message}>
          {message}
        </div>

        <div style={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              ...styles.cancelButton,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.65 : 1
            }}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              ...styles.confirmButton,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.75 : 1
            }}
          >
            {loading ? 'Processando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 10000,

    padding: '20px',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    background: 'rgba(15, 23, 42, 0.68)',
    backdropFilter: 'blur(4px)'
  },

  modal: {
    position: 'relative',

    width: '100%',
    maxWidth: '430px',

    padding: '28px 24px 24px',

    background: '#ffffff',

    borderRadius: '20px',

    boxShadow: '0 24px 70px rgba(0, 0, 0, 0.28)',

    animation: 'confirmationModalIn 0.2s ease'
  },

  closeButton: {
    position: 'absolute',
    top: '14px',
    right: '14px',

    width: '36px',
    height: '36px',

    display: 'grid',
    placeItems: 'center',

    padding: 0,

    background: '#f3f4f6',
    color: '#6b7280',

    border: 'none',
    borderRadius: '50%'
  },

  iconWrapper: {
    width: '58px',
    height: '58px',

    margin: '0 auto 16px',

    display: 'grid',
    placeItems: 'center',

    background: '#fff7ed',
    color: '#ea580c',

    borderRadius: '50%',

    boxShadow: '0 0 0 7px #ffedd5'
  },

  title: {
    margin: '0 0 10px',

    color: '#1f2937',

    fontSize: '1.35rem',
    fontWeight: 800,

    textAlign: 'center'
  },

  message: {
    marginBottom: '24px',

    color: '#6b7280',

    fontSize: '0.95rem',
    lineHeight: 1.55,

    textAlign: 'center'
  },

  actions: {
    display: 'flex',
    justifyContent: 'flex-end',

    gap: '10px'
  },

  cancelButton: {
    minHeight: '44px',

    padding: '0 18px',

    background: '#f3f4f6',
    color: '#4b5563',

    border: '1px solid #e5e7eb',
    borderRadius: '10px',

    fontWeight: 800
  },

  confirmButton: {
    minHeight: '44px',

    padding: '0 18px',

    background: '#ef4444',
    color: '#ffffff',

    border: 'none',
    borderRadius: '10px',

    fontWeight: 800,

    boxShadow: '0 8px 20px rgba(239, 68, 68, 0.24)'
  }
};