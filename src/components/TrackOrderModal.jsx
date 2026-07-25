import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Package, Play, CheckCircle2, PackageCheck, XCircle, X, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function TrackOrderModal({ isOpen, onClose }) {
  const [customerPhone, setCustomerPhone] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // --- NOVO: LIMPA O MODAL QUANDO ELE É FECHADO ---
  useEffect(() => {
    if (!isOpen) {
      setCustomerPhone('');
      setCustomerOrders([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  // Máscara de telefone
  const maskPhone = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!customerPhone || customerPhone.length < 14) return;

    setTrackingLoading(true);
    setHasSearched(true);
    
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_phone', customerPhone)
        .gte('created_at', yesterday.toISOString())
        .order('created_at', { ascending: false })
        .limit(1); // <-- NOVO: Traz apenas o ÚLTIMO pedido para não duplicar a tela!

      if (error) throw error;
      setCustomerOrders(data || []);
    } catch (error) {
      console.error('Erro ao buscar pedido:', error.message);
    } finally {
      setTrackingLoading(false);
    }
  };

  const getStatusStep = (status) => {
    if (status === 'cancelado') return -1;
    if (status === 'novo') return 1;
    if (status === 'em_preparo') return 2;
    if (status === 'pronto') return 3;
    if (status === 'finalizado') return 4;
    return 0;
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' }} onClick={onClose}>
      <div style={{ background: 'white', padding: '24px', borderRadius: '16px', maxWidth: '450px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }} onClick={e => e.stopPropagation()}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#333' }}><MapPin color="#ef4444" /> Status do Pedido</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}><X size={20} color="#666" /></button>
        </div>

        <form onSubmit={handleTrackOrder} style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold', color: '#555' }}>Qual o telefone usado no pedido?</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Phone size={18} color="#999" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input 
                type="tel"
                required
                placeholder="(00) 00000-0000"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(maskPhone(e.target.value))}
                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
              />
            </div>
            <button 
              type="submit" 
              disabled={trackingLoading || customerPhone.length < 14}
              style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0 20px', borderRadius: '8px', fontWeight: 'bold', cursor: trackingLoading ? 'not-allowed' : 'pointer', opacity: (trackingLoading || customerPhone.length < 14) ? 0.7 : 1 }}
            >
              {trackingLoading ? <Loader2 className="spinner" size={20} /> : 'Buscar'}
            </button>
          </div>
        </form>

        {/* Resultados da Busca */}
        {hasSearched && !trackingLoading && (
          <div>
            {customerOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '8px', color: '#666' }}>
                <p style={{ margin: 0 }}>Nenhum pedido encontrado nas últimas 24h para este número.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {customerOrders.map(order => {
                  const step = getStatusStep(order.status);
                  const isCanceled = step === -1;

                  return (
                    <div key={order.id} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '15px', background: '#fff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                        <strong style={{ fontSize: '1.1rem' }}>Pedido #{order.id.toString().slice(-2)}</strong>
                        <span style={{ fontSize: '0.8rem', color: '#999' }}>{new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      
                      {isCanceled ? (
                        <div style={{ padding: '15px', background: '#fee2e2', borderRadius: '8px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                          <XCircle size={20} /> Este pedido foi cancelado.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative' }}>
                          <div style={{ position: 'absolute', left: '15px', top: '15px', bottom: '15px', width: '2px', background: '#eee', zIndex: 0 }}></div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative', zIndex: 1, opacity: step >= 1 ? 1 : 0.4 }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 1 ? '#ef4444' : '#eee', color: step >= 1 ? 'white' : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={16} /></div>
                            <div>
                              <strong style={{ display: 'block', color: step >= 1 ? '#000' : '#999' }}>Pedido Recebido</strong>
                              {step === 1 && <span style={{ fontSize: '0.8rem', color: '#b45309' }}>Aguardando restaurante aceitar...</span>}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative', zIndex: 1, opacity: step >= 2 ? 1 : 0.4 }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 2 ? '#eab308' : '#eee', color: step >= 2 ? 'white' : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play size={16} fill={step >= 2 ? "white" : "none"}/></div>
                            <div>
                              <strong style={{ display: 'block', color: step >= 2 ? '#000' : '#999' }}>Em Preparo</strong>
                              {step === 2 && <span style={{ fontSize: '0.8rem', color: '#b45309' }}>Seu lanche está sendo feito!</span>}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative', zIndex: 1, opacity: step >= 3 ? 1 : 0.4 }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 3 ? '#22c55e' : '#eee', color: step >= 3 ? 'white' : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={16} /></div>
                            <div>
                              <strong style={{ display: 'block', color: step >= 3 ? '#000' : '#999' }}>Pronto</strong>
                              {step === 3 && <span style={{ fontSize: '0.8rem', color: '#166534' }}>Aguardando retirada/entrega.</span>}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative', zIndex: 1, opacity: step >= 4 ? 1 : 0.4 }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 4 ? '#06b6d4' : '#eee', color: step >= 4 ? 'white' : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PackageCheck size={16} /></div>
                            <div>
                              <strong style={{ display: 'block', color: step >= 4 ? '#000' : '#999' }}>Entregue</strong>
                              {step === 4 && <span style={{ fontSize: '0.8rem', color: '#155e75' }}>Pedido finalizado. Bom apetite!</span>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}