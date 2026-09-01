import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../services/supabase';
import Toast from '../components/Toast'; 
import FeedbackModal from './FeedbackModal';
import { estabelecimentoAberto } from '../utils/businessHours';
import PixPaymentModal from './PixPaymentModal';
import { generatePix } from '../utils/pix';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  totalValue,
  onOrderSuccess,
  onOrderCreated,
  notesFromCart
}) {
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [pixCode, setPixCode] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    payment: 'pix',
    needsChange: false,
    changeValue: ''
  });

  // Funções de Máscara
  const maskPhone = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const maskCurrency = (value) => {
    let v = value.replace(/\D/g, "");
    v = (v / 100).toFixed(2) + "";
    v = v.replace(".", ",");
    v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
    return "R$ " + v;
  };

  // Função para limpar os dados do formulário
  const resetForm = () => {
    setFormData({ 
      name: '', 
      phone: '', 
      payment: 'pix', 
      needsChange: false, 
      changeValue: ''
    });
    setOrderId(null);
    setShowFeedback(false);
    setShowPixModal(false);
    setPixCode('');
  };

  const handleFeedbackSubmit = async (data) => {
    try {
      const { error } = await supabase
        .from('feedbacks')
        .insert([{
          order_id: orderId,
          stars: data.stars,
          comment: data.comment,
          customer_name: formData.name
        }]);

      if (error) throw error;

      resetForm(); 
      onOrderSuccess(); 
    } catch (err) {
      console.error("Erro ao salvar feedback:", err);
      resetForm(); 
      onOrderSuccess();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!estabelecimentoAberto()) {
      setNotification({
        message: "Estamos fechados. Nosso horário de atendimento é de segunda a sexta, das 07:00 às 16:10.",
        type: "error"
      });
      return;
    }    
    setLoading(true);

    const parts = [];
    parts.push(`PAYMENT:${formData.payment.toUpperCase()}`); 

    if (formData.payment === 'dinheiro' && formData.needsChange) {
      parts.push(`TROCO PARA:${formData.changeValue}`);
    }

    if (notesFromCart?.trim()) {
      parts.push(`OBS_GERAL:${notesFromCart.trim()}`);
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          customer_name: formData.name,
          customer_phone: formData.phone,
          items: cart,
          total: Number(totalValue),
          payment_method: formData.payment,
          notes: parts.join('|'),
          status:
            formData.payment === 'pix'
              ? 'aguardando_pagamento'
              : 'novo',
          payment_status:
            formData.payment === 'pix'
              ? 'pendente'
              : null
        }])
        .select()
        .single();

      if (error) throw error;

      const createdOrderId = data.id;

      setOrderId(createdOrderId);
      onOrderCreated?.(createdOrderId);

      if (formData.payment === 'pix') {
        const generatedPixCode = generatePix({
          key: 'tamiresledoa@gmail.com',
          name: 'Tamires Ledo da Silva Alves',
          city: 'GARCA',
          amount: Number(totalValue),
          orderId: createdOrderId
        });

        setPixCode(generatedPixCode);
        setShowPixModal(true);
      } else {
        setShowFeedback(true);
      }
    } catch (error) {
      console.error('Erro completo ao enviar pedido:', error);

      setNotification({
        message: error?.message || 'Erro ao enviar pedido.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handlePixPaymentDone = () => {
    setShowPixModal(false);
    setShowFeedback(true);
  };

  const handlePixClose = () => {
    resetForm();
    onOrderSuccess();
  };

  if (!isOpen && !showFeedback && !showPixModal) return null;

  const aberto = estabelecimentoAberto();

  return (
    <>
      {isOpen && !showFeedback && !showPixModal && (
        <div 
          className="modal-overlay" 
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            zIndex: 1000, 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.6)',
            padding: '20px'
          }}
          onClick={handleClose}
        >
          <div 
            className="checkout-card" 
            onClick={e => e.stopPropagation()}
            style={{ 
              background: 'white', 
              padding: '24px', 
              borderRadius: '20px', 
              maxWidth: '450px', 
              width: '100%',
              height: 'auto',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              position: 'relative'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px',
              borderBottom: '1px solid #eee',
              paddingBottom: '15px'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>Finalizar Pedido</h2>
              <button 
                onClick={handleClose} 
                style={{ background: '#f5f5f5', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Nome</label>
                <input 
                  required 
                  placeholder="Seu nome completo" 
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem' }} 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Telefone</label>
                <input 
                  required 
                  type="tel" 
                  placeholder="(00) 00000-0000" 
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem' }} 
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: maskPhone(e.target.value) })} 
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Forma de Pagamento</label>
                <select 
                  value={formData.payment} 
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem', background: 'white' }} 
                  onChange={e => setFormData({ ...formData, payment: e.target.value })}
                >
                  <option value="pix">Pix</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="debito">Cartão de Débito</option>
                  <option value="credito">Cartão de Crédito</option>
                </select>
              </div>

              {formData.payment === 'dinheiro' && (
                <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #e9ecef' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '600' }}>
                    <input 
                      type="checkbox" 
                      style={{ width: '18px', height: '18px' }}
                      checked={formData.needsChange} 
                      onChange={e => setFormData({ ...formData, needsChange: e.target.checked })} 
                    />
                    Precisa de troco?
                  </label>
                  {formData.needsChange && (
                    <input 
                      required 
                      placeholder="Troco para quanto?" 
                      style={{ width: '100%', marginTop: '12px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} 
                      value={formData.changeValue} 
                      onChange={e => setFormData({ ...formData, changeValue: maskCurrency(e.target.value) })} 
                    />
                  )}
                </div>
              )}

              {!aberto && (
                <div
                  style={{
                    marginBottom: '15px',
                    padding: '12px',
                    background: '#fff3cd',
                    color: '#856404',
                    border: '1px solid #ffeeba',
                    borderRadius: '8px',
                    fontWeight: '600',
                    textAlign: 'center'
                  }}
                >
                  No momento estamos fechados.
                  <br />
                  Funcionamos de segunda a sexta, das 07:00 às 16:10.
                </div>
              )}

            <button
            type="submit"
            disabled={loading || !aberto}
            style={{
              width: '100%',
              padding: '16px',
              background: aberto ? '#28a745' : '#999',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '1.1rem',
              cursor: (loading || !aberto) ? 'not-allowed' : 'pointer',
              opacity: (loading || !aberto) ? 0.7 : 1
            }}
          >
            {loading
              ? "Processando..."
              : aberto
                ? "Confirmar Pedido"
                : "Estabelecimento Fechado"}
          </button>   
            </form>
          </div>
        </div>
      )}

      <PixPaymentModal
        isOpen={showPixModal}
        onClose={handlePixClose}
        orderId={orderId}
        totalValue={totalValue}
        pixCode={pixCode}
        onPaymentDone={handlePixPaymentDone}
      />

      <FeedbackModal 
        isOpen={showFeedback} 
        onClose={() => { resetForm(); onOrderSuccess(); }} 
        onSubmit={handleFeedbackSubmit} 
      />
      
      {notification && (
        <Toast 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}
    </>
  );
}