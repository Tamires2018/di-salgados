import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Trash2, CheckCircle2, Play, PackageCheck, XCircle, 
  PlusCircle, LayoutDashboard, UtensilsCrossed, Edit, X, 
  CreditCard, MessageSquare, ClipboardList, Check, Banknote, Save, ImageIcon, Upload, Star,
  History 
} from 'lucide-react';
import { supabase } from '../services/supabase';
import StatusBadge from '../components/StatusBadge';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';
import OrderCard from '../components/OrderCard';
import CashierSection from '../components/CashierSection';
import { formatCurrency } from '../utils/formatCurrency';
import { notifyNewOrder } from '../services/notifications';

// --- Funções Auxiliares ---
const applyPriceMask = (value) => {
  const cleanValue = value.replace(/\D/g, '');
  if (!cleanValue) return '';
  return `R$ ${(Number(cleanValue) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
};

const parsePrice = (priceString) => {
  if (typeof priceString === 'number') return priceString;
  const cleaned = priceString.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
  return parseFloat(cleaned);
};

// --- Configurações Visuais ---
const NAV_TABS = [
  { id: 'pedidos', label: 'Pedidos', icon: ClipboardList },
  { id: 'caixa', label: 'Caixa', icon: Banknote },
  { id: 'historico', label: 'Histórico do Caixa', icon: History },
  { id: 'adicionar', label: 'Adicionar Item', icon: PlusCircle },
  { id: 'editar', label: 'Editar Cardápio', icon: Edit }
];

const ORDER_ACTIONS = [
  { status: 'em_preparo', label: 'Preparar', icon: Play, bg: '#fef3c7', color: '#b45309' },
  { status: 'pronto', label: 'Pronto', icon: CheckCircle2, bg: '#d1fae5', color: '#065f46' },
  { status: 'finalizado', label: 'Entregue', icon: PackageCheck, bg: '#cffafe', color: '#0891b2' },
  { status: 'cancelado', label: 'Cancelar', icon: XCircle, bg: '#fee2e2', color: '#b91c1c' }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('pedidos');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('todos');
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const isUpdatingLocally = useRef(false);

  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Salgados', image: '' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [cashierStatus, setCashierStatus] = useState({ isOpen: false, data: null });
  const [openingValue, setOpeningValue] = useState('');
  const [cashierHistory, setCashierHistory] = useState([]);

  const [pixConfirmation, setPixConfirmation] = useState({
    isOpen: false,
    orderId: null
  });
  const [confirmingPix, setConfirmingPix] = useState(false);

  const handleFileUpload = async (event, isEditing = false) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('produtos').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('produtos').getPublicUrl(filePath);

      if (isEditing) setEditingProduct({ ...editingProduct, image: publicUrl });
      else setNewProduct({ ...newProduct, image: publicUrl });
      
      setNotification({ message: "Imagem carregada!", type: "success" });
    } catch (error) {
      setNotification({ message: "Erro no upload.", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, feedbacks(stars, comment)')
      .order('created_at', { ascending: false });
    if (!error) setOrders(data);
    else setNotification({ message: "Erro ao carregar pedidos.", type: "error" });
  };

  const loadProducts = async () => {
    const { data, error } = await supabase.from('produtos').select('*').order('name', { ascending: true });
    if (!error) setProducts(data);
    else setNotification({ message: "Erro ao carregar cardápio.", type: "error" });
  };

  const checkCashierStatus = async () => {
    const { data } = await supabase.from('caixa').select('*').eq('status', 'aberto').single();
    setCashierStatus(data ? { isOpen: true, data } : { isOpen: false, data: null });
  };

  const loadCashierHistory = async () => {
    const { data, error } = await supabase.from('caixa').select('*').eq('status', 'fechado').order('fechado_em', { ascending: false });
    if (!error && data) setCashierHistory(data);
  };

  const handleOpenCashier = async () => {
    if (!openingValue) return setNotification({ message: "Informe o valor de abertura.", type: "error" });
    const { data, error } = await supabase.from('caixa').insert([{ valor_abertura: parsePrice(openingValue), status: 'aberto', aberto_em: new Date().toISOString() }]).select().single();
    if (!error) {
      setCashierStatus({ isOpen: true, data });
      setOpeningValue('');
      setNotification({ message: "Caixa aberto com sucesso!", type: "success" });
    }
  };

  const handleCloseCashier = async () => {
    if (!window.confirm("Deseja realmente fechar o caixa?")) return;
    setLoading(true);
    try {
      const { error } = await supabase.rpc('fechar_caixa_preciso', { p_caixa_id: cashierStatus.data.id });
      if (error) throw error;
      setCashierStatus({ isOpen: false, data: null });
      setNotification({ message: "Caixa fechado e valores calculados com sucesso!", type: "success" });
      loadOrders(); 
      loadCashierHistory(); 
    } catch (error) {
      setNotification({ message: "Erro ao fechar caixa.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const refreshAdminData = async () => {
      if (!isMounted) return;

      await Promise.all([
        loadOrders(),
        checkCashierStatus()
      ]);
    };

    loadOrders();
    loadProducts();
    checkCashierStatus();
    loadCashierHistory();

    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Novo pedido recebido:', payload.new);

          notifyNewOrder(payload.new);

          setOrders((currentOrders) => {
            const alreadyExists = currentOrders.some(
              (order) =>
                String(order.id) === String(payload.new.id)
            );

            if (alreadyExists) {
              return currentOrders;
            }

            return [payload.new, ...currentOrders];
          });

          setNotification({
            message: `🔔 Novo pedido #${payload.new.id} recebido!`,
            type: 'success'
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Pedido atualizado:', payload.new);

          setOrders((currentOrders) =>
            currentOrders.map((order) =>
              String(order.id) === String(payload.new.id)
                ? { ...order, ...payload.new }
                : order
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Pedido removido:', payload.old);

          setOrders((currentOrders) =>
            currentOrders.filter(
              (order) =>
                String(order.id) !== String(payload.old.id)
            )
          );
        }
      )
      .subscribe((status) => {
        console.log('Realtime do Admin:', status);

        if (status === 'SUBSCRIBED') {
          console.log('Admin conectado aos novos pedidos.');
        }

        if (
          status === 'CHANNEL_ERROR' ||
          status === 'TIMED_OUT'
        ) {
          console.warn(
            'Realtime do Admin desconectado. O modo de segurança continuará atualizando.'
          );
        }
      });

    const intervalId = window.setInterval(() => {
      refreshAdminData();
    }, 5000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshAdminData();
      }
    };

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    return () => {
      isMounted = false;

      window.clearInterval(intervalId);

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );

      supabase.removeChannel(channel);
    };
  }, []);

  const changeStatus = async (id, newStatus) => {
    const order = orders.find((item) => item.id === id);

    if (!order) {
      setNotification({ message: 'Pedido não encontrado.', type: 'error' });
      return;
    }

    const normalizeText = (value) =>
      String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const paymentMethod = normalizeText(order.payment_method);
    const paymentStatus = normalizeText(order.payment_status || 'pendente');
    const isPix = paymentMethod === 'pix';
    const isFinishing = newStatus === 'finalizado';

    const blockedPaymentStatuses = [
      'cancelado',
      'canceled',
      'recusado',
      'failed',
      'expirado',
      'expired'
    ];

    // Não permite entregar um pedido Pix cancelado, recusado ou expirado.
    if (
      isPix &&
      isFinishing &&
      blockedPaymentStatuses.includes(paymentStatus)
    ) {
      setNotification({
        message: 'Não é possível entregar este pedido porque o pagamento Pix está cancelado, recusado ou expirado.',
        type: 'error'
      });
      return;
    }

    // Se o Pix estiver pendente, abre o nosso modal personalizado.
    if (
      isPix &&
      isFinishing &&
      ['pendente', 'pending', ''].includes(paymentStatus)
    ) {
      setPixConfirmation({
        isOpen: true,
        orderId: id
      });
      return;
    }

    // Fluxo normal para Pix pago, dinheiro, crédito e débito.
    isUpdatingLocally.current = true;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === id
            ? { ...currentOrder, status: newStatus }
            : currentOrder
        )
      );

      setNotification({
        message: 'Status do pedido atualizado!',
        type: 'success'
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setNotification({
        message: 'Erro ao atualizar status.',
        type: 'error'
      });
    } finally {
      isUpdatingLocally.current = false;
    }
  };

  const confirmPixPaymentAndFinish = async () => {
    const orderId = pixConfirmation.orderId;
    if (!orderId || confirmingPix) return;

    setConfirmingPix(true);
    isUpdatingLocally.current = true;

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'finalizado',
          payment_status: 'pago'
        })
        .eq('id', orderId);

      if (error) throw error;

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: 'finalizado',
                payment_status: 'pago'
              }
            : order
        )
      );

      setPixConfirmation({ isOpen: false, orderId: null });
      setNotification({
        message: 'Pagamento Pix confirmado e pedido finalizado!',
        type: 'success'
      });
    } catch (error) {
      console.error('Erro ao finalizar pedido Pix:', error);
      setNotification({
        message: 'Erro ao confirmar o pagamento e finalizar o pedido.',
        type: 'error'
      });
    } finally {
      setConfirmingPix(false);
      isUpdatingLocally.current = false;
    }
  };

  const closePixConfirmation = () => {
    if (confirmingPix) return;
    setPixConfirmation({ isOpen: false, orderId: null });
  };

  const changePaymentStatus = async (id, newPaymentStatus) => {
    if (isUpdatingLocally.current) return;

    const currentOrder = orders.find(
      (order) => String(order.id) === String(id)
    );

    if (!currentOrder) {
      setNotification({
        message: 'Pedido não encontrado.',
        type: 'error'
      });
      return;
    }

    isUpdatingLocally.current = true;

    try {
      const updates = {
        payment_status: newPaymentStatus
      };

      if (newPaymentStatus === 'pago') {
        updates.status = 'novo';
      }

      if (newPaymentStatus === 'pendente') {
        updates.status = 'aguardando_pagamento';
      }

      if (newPaymentStatus === 'cancelado') {
        updates.status = 'cancelado';
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          String(order.id) === String(id)
            ? { ...order, ...data }
            : order
        )
      );

      const messages = {
        pago: 'Pagamento Pix confirmado! O pedido entrou na fila.',
        pendente: 'Pagamento Pix marcado como pendente.',
        cancelado: 'Pagamento Pix e pedido cancelados.'
      };

      setNotification({
        message:
          messages[newPaymentStatus] ||
          `Pagamento atualizado para ${newPaymentStatus}.`,
        type: 'success'
      });
    } catch (error) {
      console.error('Erro ao atualizar pagamento Pix:', error);

      setNotification({
        message: error?.message || 'Erro ao atualizar o pagamento.',
        type: 'error'
      });
    } finally {
      isUpdatingLocally.current = false;
    }
  };

  const deleteOrder = async (id) => {
    if (window.confirm("Excluir este pedido permanentemente?")) {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (!error) {
        setOrders(prev => prev.filter(o => o.id !== id));
        setNotification({ message: "Pedido excluído!", type: "success" });
      }
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('produtos').insert([{ ...newProduct, price: parsePrice(newProduct.price) }]);
    if (!error) {
      setNotification({ message: "Produto adicionado!", type: "success" });
      setNewProduct({ name: '', price: '', category: 'Salgados', image: '' });
      loadProducts();
    } else setNotification({ message: "Erro ao adicionar.", type: "error" });
    setLoading(false);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('produtos').update({ ...editingProduct, price: parsePrice(editingProduct.price) }).eq('id', editingProduct.id);
    if (!error) {
      setNotification({ message: "Produto atualizado!", type: "success" });
      setEditingProduct(null);
      loadProducts();
    }
    setLoading(false);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Remover este item do cardápio?")) {
      const { error } = await supabase.from('produtos').delete().eq('id', id);
      if (!error) {
        setNotification({ message: "Item removido!", type: "success" });
        loadProducts();
      }
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = filter === 'todos' || o.status === filter;
    let isFromCurrentSession = false;
    
    if (cashierStatus.isOpen && cashierStatus.data?.aberto_em) {
      isFromCurrentSession = new Date(o.created_at) >= new Date(cashierStatus.data.aberto_em);
    } else {
      isFromCurrentSession = false; 
    }

    return matchesFilter && isFromCurrentSession;
  });

  return (
    <div className="container" style={{ marginTop: '20px', paddingBottom: '40px' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Gestão Di Salgados</h1>
        <button onClick={() => navigate('/')} className="btn-exit" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 15px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>
          <LogOut size={18} /> Sair
        </button>
      </div>

      {/* TABS DE NAVEGAÇÃO ENXUTAS */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', borderBottom: '1px solid #eee', overflowX: 'auto' }}>
        {NAV_TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '10px', background: 'none', border: 'none', borderBottom: activeTab === tab.id ? '2px solid #ef4444' : 'none', color: activeTab === tab.id ? '#ef4444' : '#666', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
            <tab.icon size={18}/> {tab.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO: PEDIDOS */}
      {activeTab === 'pedidos' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
            {['todos', 'novo', 'em_preparo', 'pronto', 'finalizado', 'cancelado'].map(st => (
              <button key={st} onClick={() => setFilter(st)} style={{ padding: '8px 15px', borderRadius: '20px', border: 'none', background: filter === st ? '#ef4444' : '#f0f0f0', color: filter === st ? 'white' : '#666', cursor: 'pointer', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                {st === 'em_preparo' ? 'EM PREPARO' : st}
              </button>
            ))}
          </div>

          {!cashierStatus.isOpen && (
            <div style={{ background: '#fff9db', padding: '15px', borderRadius: '8px', border: '1px solid #ffec99', marginBottom: '20px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#856404' }}>O caixa está fechado. Abra o caixa para ver os novos pedidos.</p>
            </div>
          )}

          <div className="orders-grid">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onChangeStatus={changeStatus}
                onChangePaymentStatus={changePaymentStatus}
                onDelete={deleteOrder}
              />
            ))}
          </div>
        </>
      )}

      {(activeTab === 'caixa' || activeTab === 'historico') && (
        <CashierSection
          activeTab={activeTab}
          cashierStatus={cashierStatus}
          cashierHistory={cashierHistory}
          orders={orders}
          openingValue={openingValue}
          onOpeningValueChange={(value) => setOpeningValue(applyPriceMask(value))}
          onOpenCashier={handleOpenCashier}
          onCloseCashier={handleCloseCashier}
          loading={loading}
        />
      )}

      {/* CONTEÚDO: ADICIONAR ITEM */}
      {activeTab === 'adicionar' && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><PlusCircle color="#ef4444"/> Novo Produto</h2>
          <form onSubmit={handleAddProduct} style={{ display: 'grid', gap: '15px' }}>
            <input type="text" placeholder="Nome do produto" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
            <input type="text" placeholder="Preço (R$ 0,00)" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: applyPriceMask(e.target.value)})} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
            <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}>
              <option>Salgados</option><option>Salgadinho</option><option>Pasteis</option><option>Bebidas</option><option>Doces</option>
            </select>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ cursor: 'pointer', background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '2px dashed #ddd', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <Upload size={20} color="#666" /><span style={{ color: '#666', fontWeight: '600' }}>{uploading ? 'Carregando...' : 'Selecionar Imagem'}</span>
                  <input type="file" accept="image/*" hidden onChange={(e) => handleFileUpload(e, false)} />
                </label>
                {newProduct.image && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f0fdf4', padding: '10px', borderRadius: '8px', border: '1px solid #bcf0da' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '4px', backgroundImage: `url(${newProduct.image})`, backgroundSize: 'cover' }} />
                    <span style={{ fontSize: '0.8rem', color: '#166534', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>URL gerada com sucesso!</span>
                  </div>
                )}
            </div>
            <button type="submit" disabled={loading || uploading} style={{ padding: '15px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>{loading ? 'Salvando...' : 'Cadastrar Produto'}</button>
          </form>
        </div>
      )}

      {/* CONTEÚDO: EDITAR CARDÁPIO */}
      {activeTab === 'editar' && (
        <div className="products-list" style={{ display: 'grid', gap: '10px' }}>
          {products.map(p => (
            <div key={p.id} style={{ background: 'white', padding: '15px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eee' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {p.image && <img src={p.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />}
                <div><strong style={{ display: 'block' }}>{p.name}</strong><span style={{ color: '#ef4444', fontWeight: 'bold' }}>{formatCurrency(p.price)}</span><span style={{ fontSize: '0.8rem', color: '#999', marginLeft: '10px' }}>({p.category})</span></div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setEditingProduct({...p, price: formatCurrency(p.price)})} style={{ background: '#f0f0f0', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer' }}><Edit size={16}/></button>
                <button onClick={() => handleDeleteProduct(p.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer' }}><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE EDIÇÃO DE PRODUTO */}
      {editingProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', width: '100%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Edit size={20} color="#ef4444"/> Editar Item</h2>
              <button onClick={() => setEditingProduct(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><X size={24}/></button>
            </div>
            <form onSubmit={handleUpdateProduct} style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#666', marginBottom: '5px', display: 'block' }}>Nome do Produto</label>
                <input type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#666', marginBottom: '5px', display: 'block' }}>Preço</label>
                <input type="text" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: applyPriceMask(e.target.value)})} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#666', marginBottom: '5px', display: 'block' }}>Categoria</label>
                <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <option>Salgados</option><option>Salgadinho</option><option>Pasteis</option><option>Bebidas</option><option>Doces</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#666', marginBottom: '5px', display: 'block' }}>Imagem do Produto</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ flex: 1, cursor: 'pointer', background: '#f8f9fa', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Upload size={18} /><span style={{ fontSize: '0.8rem' }}>Trocar</span><input type="file" accept="image/*" hidden onChange={(e) => handleFileUpload(e, true)} />
                    </label>
                    {editingProduct.image && <img src={editingProduct.image} alt="" style={{ width: '50px', height: '50px', borderRadius: '5px', objectFit: 'cover' }} />}
                </div>
              </div>
              <button type="submit" disabled={loading || uploading} style={{ width: '100%', padding: '15px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>{loading ? 'Salvando...' : 'Salvar Alterações'}</button>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={pixConfirmation.isOpen}
        title="Confirmar pagamento Pix"
        message={
          <>
            Este pedido ainda está com o pagamento <strong>pendente</strong>.
            <br /><br />
            Ao continuar, o pagamento será marcado como <strong>Pago</strong> e o pedido será finalizado.
          </>
        }
        confirmText="Marcar como pago e finalizar"
        cancelText="Voltar"
        loading={confirmingPix}
        onConfirm={confirmPixPaymentAndFinish}
        onCancel={closePixConfirmation}
      />

      {notification && <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
}