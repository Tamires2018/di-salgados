import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Phone,
  Package,
  CheckCircle2,
  PackageCheck,
  XCircle,
  X,
  Loader2,
  User,
  Clock3,
  ShoppingBag,
  CreditCard,
  MessageSquareText,
  Radio,
  WalletCards
} from 'lucide-react';
import { supabase } from '../services/supabase';

const STATUS_STEPS = [
  { key: 'novo', label: 'Recebido', icon: Package },
  { key: 'em_preparo', label: 'Em preparo', icon: ShoppingBag },
  { key: 'pronto', label: 'Pronto', icon: CheckCircle2 },
  { key: 'finalizado', label: 'Finalizado', icon: PackageCheck }
];

const STATUS_MESSAGES = {
  novo: ['Pedido recebido!', 'Seu pedido foi enviado e aguarda confirmação.', '#fff7ed', '#9a3412'],
  em_preparo: ['Pedido em preparo!', 'Estamos preparando tudo com cuidado para você.', '#fefce8', '#854d0e'],
  pronto: ['Pedido pronto!', 'Você já pode vir retirar seu pedido.', '#f0fdf4', '#166534'],
  finalizado: ['Pedido finalizado!', 'Obrigado pela preferência. Bom apetite!', '#ecfeff', '#155e75'],
  cancelado: ['Pedido cancelado', 'Este pedido foi cancelado.', '#fef2f2', '#b91c1c']
};

const PAYMENT_STATUS = {
  pending: ['Pendente', '#fff7ed', '#9a3412'],
  pendente: ['Pendente', '#fff7ed', '#9a3412'],
  paid: ['Pago', '#f0fdf4', '#166534'],
  pago: ['Pago', '#f0fdf4', '#166534'],
  approved: ['Pago', '#f0fdf4', '#166534'],
  aprovado: ['Pago', '#f0fdf4', '#166534'],
  failed: ['Falhou', '#fef2f2', '#b91c1c'],
  recusado: ['Recusado', '#fef2f2', '#b91c1c'],
  expired: ['Expirado', '#f3f4f6', '#4b5563'],
  expirado: ['Expirado', '#f3f4f6', '#4b5563'],
  canceled: ['Cancelado', '#fef2f2', '#b91c1c'],
  cancelado: ['Cancelado', '#fef2f2', '#b91c1c']
};

export default function TrackOrderModal({ isOpen, onClose }) {
  const [customerPhone, setCustomerPhone] = useState('');
  const [trackedPhone, setTrackedPhone] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setCustomerPhone('');
      setTrackedPhone('');
      setCustomerOrders([]);
      setHasSearched(false);
      setSearchError('');
      setTrackingLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !trackedPhone) return undefined;

    const channel = supabase
      .channel(`track-orders-${trackedPhone.replace(/\D/g, '')}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        const changedOrder = payload.new || payload.old;
        if (changedOrder?.customer_phone !== trackedPhone) return;

        setCustomerOrders((orders) => {
          if (payload.eventType === 'DELETE') {
            return orders.filter((order) => order.id !== changedOrder.id);
          }

          const exists = orders.some((order) => order.id === changedOrder.id);
          if (exists) {
            return orders.map((order) => (order.id === changedOrder.id ? changedOrder : order));
          }

          return [changedOrder, ...orders].slice(0, 5);
        });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [isOpen, trackedPhone]);

  const maskPhone = (value) =>
    value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');

  const formatCurrency = (value) =>
    (Number(value) || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

  const formatDateTime = (date) =>
    new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  const getPaymentLabel = (method) => {
    const labels = {
      pix: 'Pix',
      dinheiro: 'Dinheiro',
      cartao: 'Cartão',
      cartão: 'Cartão',
      credito: 'Cartão de crédito',
      crédito: 'Cartão de crédito',
      debito: 'Cartão de débito',
      débito: 'Cartão de débito'
    };
    return labels[String(method || '').toLowerCase()] || method || 'Não informado';
  };

  const getPaymentStatus = (order) => {
    const normalizeText = (value) =>
      String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const method = normalizeText(order.payment_method);
    const rawStatus = normalizeText(order.payment_status);

    const pickupMethods = [
      'dinheiro',
      'credito',
      'debito',
      'cartao'
    ];

    // Dinheiro, crédito e débito são pagos somente na retirada.
    if (pickupMethods.includes(method)) {
      return ['Pagamento na retirada', '#eff6ff', '#1d4ed8'];
    }

    // Somente o Pix utiliza os estados: pendente, pago, expirado etc.
    if (method === 'pix') {
      return PAYMENT_STATUS[rawStatus] || ['Pendente', '#fff7ed', '#9a3412'];
    }

    // Proteção para algum método antigo ou inesperado salvo no banco.
    return ['Pagamento na retirada', '#eff6ff', '#1d4ed8'];
  };

  const getStatusIndex = (status) => STATUS_STEPS.findIndex((step) => step.key === status);
  const getItems = (order) => (Array.isArray(order?.items) ? order.items : []);
  const getItemName = (item) => item?.name || item?.product_name || item?.product?.name || 'Produto';
  const getItemQuantity = (item) => Number(item?.quantity ?? item?.qty ?? item?.quantidade ?? 1);
  const getItemPrice = (item) => Number(item?.price ?? item?.unit_price ?? item?.preco ?? 0);

  const handleTrackOrder = async (event) => {
    event.preventDefault();
    if (customerPhone.length < 14) return;

    setTrackingLoading(true);
    setHasSearched(true);
    setSearchError('');
    setCustomerOrders([]);

    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_phone', customerPhone)
        .gte('created_at', yesterday.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setCustomerOrders(data || []);
      setTrackedPhone(customerPhone);
    } catch (error) {
      console.error(error);
      setSearchError('Não foi possível consultar o pedido. Tente novamente.');
      setTrackedPhone('');
    } finally {
      setTrackingLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="track-order-overlay" style={styles.overlay} onClick={onClose}>
      <div className="track-order-modal" style={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}><MapPin size={23} color="#ef4444" />Acompanhar pedido</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" style={styles.closeButton}><X size={21} /></button>
        </div>

        <p style={styles.subtitle}>Digite o telefone informado no momento do pedido.</p>

        <form onSubmit={handleTrackOrder} style={styles.form}>
          <label htmlFor="tracking-phone" style={styles.label}>Telefone do pedido</label>
          <div className="track-order-search-row" style={styles.searchRow}>
            <div style={styles.inputContainer}>
              <Phone size={18} color="#999" style={styles.inputIcon} />
              <input
                id="tracking-phone"
                type="tel"
                required
                inputMode="numeric"
                placeholder="(00) 00000-0000"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(maskPhone(event.target.value))}
                style={styles.input}
              />
            </div>
            <button
              type="submit"
              disabled={trackingLoading || customerPhone.length < 14}
              style={{
                ...styles.searchButton,
                opacity: trackingLoading || customerPhone.length < 14 ? 0.65 : 1,
                cursor: trackingLoading || customerPhone.length < 14 ? 'not-allowed' : 'pointer'
              }}
            >
              {trackingLoading ? <Loader2 className="spinner" size={20} /> : 'Buscar'}
            </button>
          </div>
        </form>

        {trackedPhone && customerOrders.length > 0 && (
          <div style={styles.realtimeBadge}><Radio size={15} />Atualização em tempo real</div>
        )}

        {searchError && <div style={styles.errorBox}><XCircle size={20} />{searchError}</div>}

        {hasSearched && !trackingLoading && !searchError && (
          customerOrders.length === 0 ? (
            <div style={styles.emptyBox}>
              <Package size={34} color="#9ca3af" />
              <strong>Pedido não encontrado</strong>
              <p style={styles.emptyText}>Confira o telefone ou tente novamente mais tarde.</p>
            </div>
          ) : (
            <div style={styles.results}>
              {customerOrders.map((order) => {
                const statusIndex = getStatusIndex(order.status);
                const isCanceled = order.status === 'cancelado';
                const [statusTitle, statusDescription, statusBg, statusColor] =
                  STATUS_MESSAGES[order.status] || ['Status não identificado', 'Entre em contato com o estabelecimento.', '#f8fafc', '#475569'];
                const [paymentLabel, paymentBg, paymentColor] = getPaymentStatus(order);
                const items = getItems(order);

                return (
                  <div key={order.id} style={styles.orderCard}>
                    <div style={styles.orderHeader}>
                      <div>
                        <span style={styles.orderLabel}>PEDIDO</span>
                        <strong style={styles.orderNumber}>#{String(order.id).slice(-4).padStart(4, '0')}</strong>
                      </div>
                      <div style={styles.orderDate}><Clock3 size={15} />{formatDateTime(order.created_at)}</div>
                    </div>

                    <div style={{ ...styles.statusBanner, background: statusBg, color: statusColor }}>
                      {isCanceled ? <XCircle size={22} /> : <Package size={22} />}
                      <div><strong>{statusTitle}</strong><span style={styles.statusDescription}>{statusDescription}</span></div>
                    </div>

                    {!isCanceled && <ProgressBar currentIndex={statusIndex} />}

                    <div style={styles.customerBox}>
                      <Info icon={<User size={17} />} label="Cliente" value={order.customer_name || 'Não informado'} />
                      <Info icon={<CreditCard size={17} />} label="Forma de pagamento" value={getPaymentLabel(order.payment_method)} />
                    </div>

                    <div style={{ ...styles.paymentStatus, background: paymentBg, color: paymentColor }}>
                      <WalletCards size={18} />
                      <div><span style={styles.infoLabel}>Status do pagamento</span><strong>{paymentLabel}</strong></div>
                    </div>

                    {items.length > 0 && (
                      <div style={styles.section}>
                        <div style={styles.sectionTitle}><ShoppingBag size={18} />Itens do pedido</div>
                        <div style={styles.itemList}>
                          {items.map((item, index) => {
                            const quantity = getItemQuantity(item);
                            const total = quantity * getItemPrice(item);
                            return (
                              <div key={`${getItemName(item)}-${index}`} style={styles.itemRow}>
                                <div style={styles.itemInfo}><span style={styles.itemQuantity}>{quantity}x</span>{getItemName(item)}</div>
                                {total > 0 && <strong>{formatCurrency(total)}</strong>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div style={styles.totalRow}><span>Total do pedido</span><strong>{formatCurrency(order.total)}</strong></div>

                    {order.notes && (
                      <div style={styles.notesBox}>
                        <div style={styles.notesTitle}><MessageSquareText size={17} />Observação</div>
                        <p style={styles.notesText}>{order.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 540px) {
          .track-order-overlay { padding: 0 !important; align-items: stretch !important; }
          .track-order-modal { max-width: none !important; max-height: 100vh !important; min-height: 100vh !important; border-radius: 0 !important; padding: 20px 16px !important; }
          .track-order-search-row { flex-direction: column !important; }
          .track-order-search-row button { width: 100%; min-height: 46px; }
        }
      ` }} />
    </div>
  );
}

function Info({ icon, label, value }) {
  return (
    <div style={styles.infoRow}>
      <div style={styles.infoIcon}>{icon}</div>
      <div style={styles.infoContent}><span style={styles.infoLabel}>{label}</span><strong style={styles.infoValue}>{value}</strong></div>
    </div>
  );
}

function ProgressBar({ currentIndex }) {
  return (
    <div style={styles.progressWrapper}>
      <div style={styles.progressLine} />
      <div
        style={{
          ...styles.progressFill,
          width: `${Math.max(0, currentIndex) / (STATUS_STEPS.length - 1) * 100}%`
        }}
      />
      {STATUS_STEPS.map((step, index) => {
        const Icon = step.icon;
        const active = index <= currentIndex;
        return (
          <div key={step.key} style={styles.progressStep}>
            <div style={{ ...styles.progressCircle, ...(active ? styles.progressCircleActive : {}) }}>
              <Icon size={15} />
            </div>
            <span style={{ ...styles.progressLabel, color: active ? '#111827' : '#9ca3af' }}>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, zIndex: 9999, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,.68)', backdropFilter: 'blur(3px)' },
  modal: { width: '100%', maxWidth: 540, maxHeight: '92vh', overflowY: 'auto', padding: 22, background: '#fff', borderRadius: 20, boxShadow: '0 24px 60px rgba(0,0,0,.25)' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 6 },
  title: { display: 'flex', alignItems: 'center', gap: 8, margin: 0, color: '#1f2937', fontSize: '1.35rem' },
  closeButton: { width: 36, height: 36, display: 'grid', placeItems: 'center', background: '#f3f4f6', border: 0, borderRadius: '50%', cursor: 'pointer' },
  subtitle: { margin: '0 0 18px', color: '#6b7280', fontSize: '.92rem' },
  form: { marginBottom: 14 },
  label: { display: 'block', marginBottom: 7, color: '#4b5563', fontSize: '.86rem', fontWeight: 700 },
  searchRow: { display: 'flex', gap: 10 },
  inputContainer: { position: 'relative', flex: 1 },
  inputIcon: { position: 'absolute', top: '50%', left: 13, transform: 'translateY(-50%)' },
  input: { width: '100%', minHeight: 46, padding: '11px 12px 11px 42px', border: '1px solid #d1d5db', borderRadius: 10, outline: 0, fontSize: '1rem', boxSizing: 'border-box' },
  searchButton: { minHeight: 46, padding: '0 20px', display: 'grid', placeItems: 'center', background: '#ef4444', color: '#fff', border: 0, borderRadius: 10, fontWeight: 800 },
  realtimeBadge: { width: 'fit-content', marginBottom: 16, padding: '7px 11px', display: 'flex', alignItems: 'center', gap: 6, background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: 999, fontSize: '.76rem', fontWeight: 700 },
  errorBox: { display: 'flex', alignItems: 'center', gap: 9, padding: 14, background: '#fef2f2', color: '#b91c1c', borderRadius: 10 },
  emptyBox: { padding: '26px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 14 },
  emptyText: { margin: 0, color: '#6b7280' },
  results: { display: 'flex', flexDirection: 'column', gap: 18 },
  orderCard: { overflow: 'hidden', border: '1px solid #e5e7eb', borderRadius: 16 },
  orderHeader: { padding: 15, display: 'flex', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid #f1f5f9' },
  orderLabel: { display: 'block', color: '#9ca3af', fontSize: '.67rem', fontWeight: 800, letterSpacing: '.08em' },
  orderNumber: { display: 'block', color: '#1f2937', fontSize: '1.18rem' },
  orderDate: { display: 'flex', alignItems: 'center', gap: 5, color: '#6b7280', fontSize: '.76rem', textAlign: 'right' },
  statusBanner: { margin: 15, padding: 13, display: 'flex', alignItems: 'flex-start', gap: 10, borderRadius: 12 },
  statusDescription: { display: 'block', marginTop: 2, fontSize: '.82rem', lineHeight: 1.4 },
  progressWrapper: { position: 'relative', margin: '20px 28px 24px', display: 'flex', justifyContent: 'space-between' },
  progressLine: { position: 'absolute', top: 17, left: 18, right: 18, height: 3, background: '#e5e7eb' },
  progressFill: { position: 'absolute', top: 17, left: 18, height: 3, maxWidth: 'calc(100% - 36px)', background: '#ef4444', transition: 'width .35s ease' },
  progressStep: { position: 'relative', zIndex: 1, width: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, textAlign: 'center' },
  progressCircle: { width: 36, height: 36, display: 'grid', placeItems: 'center', borderRadius: '50%', background: '#e5e7eb', color: '#9ca3af', border: '3px solid #fff' },
  progressCircleActive: { background: '#ef4444', color: '#fff', boxShadow: '0 0 0 4px #fee2e2' },
  progressLabel: { fontSize: '.68rem', fontWeight: 700, lineHeight: 1.15 },
  customerBox: { margin: '0 15px 12px', padding: 13, display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12, background: '#f8fafc', borderRadius: 12 },
  infoRow: { minWidth: 0, display: 'flex', alignItems: 'center', gap: 9 },
  infoIcon: { width: 33, height: 33, display: 'grid', placeItems: 'center', flexShrink: 0, background: '#fee2e2', color: '#dc2626', borderRadius: 9 },
  infoContent: { minWidth: 0 },
  infoLabel: { display: 'block', color: '#9ca3af', fontSize: '.68rem', fontWeight: 700 },
  infoValue: { display: 'block', overflow: 'hidden', color: '#374151', fontSize: '.86rem', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  paymentStatus: { margin: '0 15px 14px', padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 9, borderRadius: 10 },
  section: { margin: '0 15px 14px' },
  sectionTitle: { marginBottom: 9, display: 'flex', alignItems: 'center', gap: 7, color: '#374151', fontSize: '.88rem', fontWeight: 800 },
  itemList: { overflow: 'hidden', border: '1px solid #e5e7eb', borderRadius: 10 },
  itemRow: { minHeight: 42, padding: '9px 11px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderBottom: '1px solid #f1f5f9' },
  itemInfo: { minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#4b5563', fontSize: '.88rem' },
  itemQuantity: { minWidth: 27, color: '#dc2626', fontWeight: 800 },
  totalRow: { margin: '0 15px 14px', padding: '13px 0', display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #d1d5db', borderBottom: '1px dashed #d1d5db' },
  notesBox: { margin: '0 15px 15px', padding: 12, background: '#fff7ed', borderRadius: 10 },
  notesTitle: { display: 'flex', alignItems: 'center', gap: 7, color: '#9a3412', fontSize: '.83rem', fontWeight: 800 },
  notesText: { margin: '6px 0 0', color: '#7c2d12', fontSize: '.84rem', lineHeight: 1.45 }
};