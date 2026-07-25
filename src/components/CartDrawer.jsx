import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, Trash2, MessageSquare } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

export default function CartDrawer({ isOpen, onClose, cart, updateQty, removeItem, updateItemNote, onCheckout }) {
  const [generalNote, setGeneralNote] = useState('');

  // Limpa a observação geral quando o carrinho é esvaziado (após checkout)
  useEffect(() => {
    if (cart.length === 0) {
      setGeneralNote('');
    }
  }, [cart.length]);

  if (!isOpen) return null;
  
  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        
        {/* CABEÇALHO ADICIONADO ABAIXO */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          paddingBottom: '15px', 
          borderBottom: '1px solid #eee',
          marginBottom: '10px' 
        }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>Meu Carrinho</h2>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              color: '#666',
              padding: '5px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
          {cart.length === 0 ? (
            <p style={{ textAlign: 'center', marginTop: '40px', color: '#888' }}>Seu carrinho está vazio</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: '600', display: 'block' }}>{item.name}</span>
                    <span style={{ fontSize: '0.85rem', color: '#888' }}>{formatCurrency(item.price)}</span>
                  </div>

                  <div className="qty-controls">
                    <button className="btn-qty" onClick={() => updateQty(item.id, -1)}><Minus size={14} /></button>
                    <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                    <button className="btn-qty" onClick={() => updateQty(item.id, 1)}><Plus size={14} /></button>
                    <button className="btn-trash" onClick={() => removeItem(item.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div style={{ width: '100%' }}>
                  <input 
                    type="text"
                    placeholder="Ex: Tirar cebola, ponto da carne..."
                    value={item.note || ''}
                    onChange={(e) => updateItemNote(item.id, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.8rem',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      background: '#fff',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rodapé */}
        <div style={{ borderTop: '2px solid #eee', paddingTop: '15px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
              <MessageSquare size={16} /> Observação Geral
            </label>
            <textarea 
              placeholder="Deseja adicionar alguma observação ao pedido?"
              value={generalNote}
              onChange={(e) => setGeneralNote(e.target.value)}
              style={{
                width: '100%',
                height: '60px',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                resize: 'none',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Total:</span>
            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>
              {formatCurrency(total)}
            </span>
          </div>
          <button 
              className="btn-checkout" 
              onClick={() => onCheckout(generalNote)} 
              disabled={cart.length === 0}
              style={{ 
                opacity: cart.length === 0 ? 0.5 : 1, 
                width: '100%', 
                padding: '15px', 
                background: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                fontWeight: 'bold', 
                cursor: 'pointer' 
              }}
              >
              Finalizar Pedido
          </button>
        </div>
      </div>
    </div>
  );
}