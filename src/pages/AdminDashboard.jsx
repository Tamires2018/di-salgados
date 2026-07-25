import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Trash2, CheckCircle2, Play, PackageCheck, XCircle, 
  PlusCircle, LayoutDashboard, UtensilsCrossed, Edit, X, 
  CreditCard, MessageSquare, ClipboardList, Check, Banknote, Save, ImageIcon, Upload, Star,
  Lock, Unlock, History 
} from 'lucide-react';
import { supabase } from '../services/supabase';
import StatusBadge from '../components/StatusBadge';
import Toast from '../components/Toast';
import { formatCurrency } from '../utils/formatCurrency';

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

// NOVA FUNÇÃO: Busca os pedidos completos realizados neste turno de caixa
const getOrdersForCashier = (caixa, allOrders) => {
  return allOrders.filter(order => 
    order.status === 'finalizado' && 
    order.created_at >= caixa.aberto_em && 
    order.created_at <= caixa.fechado_em
  );
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
    loadOrders();
    loadProducts();
    checkCashierStatus();
    loadCashierHistory(); 
    const channel = supabase.channel('db_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadOrders()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const changeStatus = async (id, newStatus) => {
    isUpdatingLocally.current = true;
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (!error) setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    else setNotification({ message: "Erro ao atualizar status.", type: "error" });
    isUpdatingLocally.current = false;
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
            {filteredOrders.map(order => {
              const noteRaw = order.notes || "";
              const noteParts = noteRaw.split('|');
              const trocoPart = noteParts.find(p => p.includes('TROCO PARA:'))?.split(':')[1]?.trim();
              const feedbackData = order.feedbacks && order.feedbacks[0];
              const ratingVal = feedbackData?.stars || order.rating || noteParts.find(p => p.includes('FEEDBACK_STARS:'))?.split(':')[1]?.trim();
              const feedbackComment = feedbackData?.comment || order.feedback || noteParts.find(p => p.includes('FEEDBACK_COMMENT:'))?.split(':')[1]?.trim();
              
              let finalObservation = "";
              const obsPart = noteParts.find(p => p.includes('OBS_GERAL:'));
              if (obsPart) finalObservation = obsPart.split('OBS_GERAL:')[1]?.trim();
              else {
                const simple = noteRaw.trim();
                const pay = (order.payment_method || "").trim();
                if (simple !== "" && !simple.includes('PAYMENT:') && !simple.includes('TROCO PARA:') && !simple.includes('FEEDBACK_STARS:') && !simple.includes('FEEDBACK_COMMENT:') && simple.toLowerCase() !== pay.toLowerCase()) {
                  finalObservation = simple;
                }
              }

              return (
                <div key={order.id} style={{ background: 'white', borderRadius: '12px', padding: '15px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: `5px solid var(--status-${order.status})` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ margin: 0 }}>Pedido #{order.id.toString().slice(-2)}</h3>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#999' }}>{new Date(order.created_at).toLocaleString()}</span>
                      <p style={{ margin: '5px 0', fontWeight: '700' }}>{order.customer_name} <span style={{ fontWeight: '400', color: '#666' }}>- {order.customer_phone}</span></p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <StatusBadge status={order.status} />
                      <div style={{ fontSize: '1.2rem', fontWeight: '900', marginTop: '5px' }}>{formatCurrency(order.total)}</div>
                      <button onClick={() => deleteOrder(order.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', marginTop: '5px' }}><Trash2 size={18}/></button>
                    </div>
                  </div>

                  <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>
                    <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <UtensilsCrossed size={16}/> Itens Pedidos:
                    </p>
                    {(() => {
                      try {
                        const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                        return (items || []).map((item, i) => (
                          <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span><strong style={{ color: '#ef4444' }}>{item.qty || 1}x</strong> {item.name}</span>
                              <span>{formatCurrency(item.price * (item.qty || 1))}</span>
                            </div>
                            {item.note && <div style={{ fontSize: '0.85rem', color: '#d35400', fontWeight: '600', marginTop: '4px' }}>↳ OBS: {item.note}</div>}
                          </div>
                        ));
                      } catch (e) { return <p>Erro ao ler itens.</p> }
                    })()}

                    {finalObservation && finalObservation.toLowerCase() !== 'null' && (
                      <div style={{ marginTop: '12px', padding: '10px', background: '#fff9db', borderRadius: '6px', border: '1px solid #ffec99' }}>
                        <strong style={{ fontSize: '0.8rem', color: '#856404', display: 'flex', alignItems: 'center', gap: '4px' }}><MessageSquare size={14}/> OBSERVAÇÃO DO CLIENTE:</strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#444', fontWeight: '500' }}>{finalObservation}</p>
                      </div>
                    )}

                    {trocoPart && (
                      <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#666' }}>
                        <Banknote size={14} style={{ verticalAlign: 'middle', marginRight: '5px', color: '#28a745' }}/> 
                        <strong>Troco para:</strong> {trocoPart}
                      </div>
                    )}

                    <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#666' }}>
                      <CreditCard size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }}/> 
                      <strong>Pagamento:</strong> {order.payment_method?.toUpperCase()}
                    </div>

                    {(ratingVal || feedbackComment) && (
                      <div style={{ marginTop: '15px', padding: '12px', background: '#fefce8', borderRadius: '8px', border: '1px solid #fde047' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: feedbackComment ? '8px' : '0' }}>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[...Array(5)].map((_, i) => (<Star key={i} size={16} fill={i < Number(ratingVal) ? "#f59e0b" : "none"} color="#f59e0b" />))}
                          </div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#854d0e' }}>AVALIAÇÃO ({ratingVal || 0}/5)</span>
                        </div>
                        {feedbackComment && (
                          <div style={{ marginTop: '5px', borderTop: '1px solid #fef08a', paddingTop: '5px' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#713f12', fontStyle: 'italic', lineHeight: '1.4' }}>"{feedbackComment}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* BOTÕES ENXUTOS */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {ORDER_ACTIONS.map(action => (
                      <button key={action.status} onClick={() => changeStatus(order.id, action.status)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: action.bg, color: action.color, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                        <action.icon size={16}/> {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* CONTEÚDO: CAIXA */}
      {activeTab === 'caixa' && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Banknote color="#ef4444"/> Gestão de Caixa</h2>
          {!cashierStatus.isOpen ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed #ddd', borderRadius: '12px' }}>
              <Lock size={48} color="#999" style={{ marginBottom: '15px' }} />
              <h3 style={{ margin: '0 0 10px 0' }}>O caixa está FECHADO</h3>
              <p style={{ color: '#666', marginBottom: '25px' }}>Informe o valor em dinheiro disponível para iniciar o expediente.</p>
              <div style={{ maxWidth: '300px', margin: '0 auto', display: 'grid', gap: '15px' }}>
                <input type="text" placeholder="Valor Inicial (Ex: R$ 50,00)" value={openingValue} onChange={(e) => setOpeningValue(applyPriceMask(e.target.value))} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', textAlign: 'center', fontSize: '1.1rem' }} />
                <button onClick={handleOpenCashier} style={{ padding: '15px', borderRadius: '8px', border: 'none', background: '#22c55e', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Unlock size={18}/> ABRIR CAIXA AGORA
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #eee' }}>
                  <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: 'bold' }}>ABERTO EM</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', marginTop: '5px' }}>{new Date(cashierStatus.data.aberto_em).toLocaleString()}</div>
                </div>
                <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px solid #bcf0da' }}>
                  <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 'bold' }}>VALOR DE ABERTURA</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#15803d', marginTop: '5px' }}>{formatCurrency(cashierStatus.data.valor_abertura)}</div>
                </div>
                <div style={{ background: '#fef2f2', padding: '20px', borderRadius: '12px', border: '1px solid #fecaca' }}>
                  <span style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: 'bold' }}>VENDAS (FINALIZADAS)</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#b91c1c', marginTop: '5px' }}>{formatCurrency(orders.filter(o => o.status === 'finalizado' && o.created_at > cashierStatus.data.aberto_em).reduce((acc, curr) => acc + curr.total, 0))}</div>
                </div>
              </div>
              <div style={{ background: '#fff9db', padding: '20px', borderRadius: '12px', border: '1px solid #ffec99', marginBottom: '25px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#856404' }}>O caixa está operando. Todas as vendas finalizadas a partir de agora serão somadas ao fechamento.</p>
              </div>
              <button onClick={handleCloseCashier} style={{ width: '100%', padding: '18px', borderRadius: '10px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Lock size={20}/> ENCERRAR EXPEDIENTE E FECHAR CAIXA
              </button>
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO: HISTÓRICO DO CAIXA COM LISTA DE PEDIDOS */}
      {activeTab === 'historico' && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><History color="#ef4444"/> Histórico do Caixa</h2>
          {cashierHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed #ddd', borderRadius: '12px' }}>
              <History size={48} color="#999" style={{ marginBottom: '15px' }} />
              <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Nenhum caixa fechado</h3>
              <p style={{ color: '#999' }}>Os registros de caixas encerrados aparecerão aqui.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {cashierHistory.map(caixa => (
                <div key={caixa.id} style={{ background: '#f8f9fa', padding: '15px', borderRadius: '10px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  
                  {/* Informações Principais do Caixa */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <strong style={{ display: 'block', color: '#333', fontSize: '1.1rem' }}>Fechado em: {new Date(caixa.fechado_em).toLocaleString()}</strong>
                      <span style={{ fontSize: '0.85rem', color: '#666' }}>Aberto em: {new Date(caixa.aberto_em).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}><span style={{ fontSize: '0.8rem', color: '#666', display: 'block', fontWeight: 'bold' }}>Abertura</span><strong style={{ color: '#15803d', fontSize: '1.1rem' }}>{formatCurrency(caixa.valor_abertura)}</strong></div>
                      <div style={{ textAlign: 'right' }}><span style={{ fontSize: '0.8rem', color: '#666', display: 'block', fontWeight: 'bold' }}>Vendas</span><strong style={{ color: '#b91c1c', fontSize: '1.1rem' }}>{formatCurrency(caixa.valor_vendas)}</strong></div>
                      <div style={{ textAlign: 'right', borderLeft: '2px solid #ddd', paddingLeft: '20px' }}><span style={{ fontSize: '0.8rem', color: '#333', display: 'block', fontWeight: 'bold' }}>Total Final</span><strong style={{ color: '#000', fontSize: '1.3rem' }}>{formatCurrency(caixa.valor_total)}</strong></div>
                    </div>
                  </div>

                  {/* Sessão de Pedidos Deste Turno (Substituindo os itens agrupados) */}
                  {(() => {
                    const sessionOrders = getOrdersForCashier(caixa, orders);
                    if (sessionOrders.length === 0) return null;
                    return (
                      <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #ccc' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#555', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                          <ClipboardList size={16} /> Pedidos finalizados neste turno:
                        </span>
                        
                        <div style={{ display: 'grid', gap: '10px' }}>
                          {sessionOrders.map(order => {
                            let items = [];
                            try { items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items; } catch (e) {}

                            return (
                              <div key={order.id} style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                  <div>
                                    <strong style={{ fontSize: '1rem', display: 'block', color: '#ef4444' }}>Pedido #{order.id.toString().slice(-2)}</strong>
                                    <span style={{ fontSize: '0.8rem', color: '#666' }}>{new Date(order.created_at).toLocaleString()}</span>
                                    <div style={{ fontSize: '0.9rem', marginTop: '4px', fontWeight: '600' }}>{order.customer_name}</div>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    <strong style={{ fontSize: '1.1rem', color: '#000' }}>{formatCurrency(order.total)}</strong>
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px', fontWeight: 'bold' }}>{order.payment_method?.toUpperCase()}</div>
                                  </div>
                                </div>
                                
                                <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '6px' }}>
                                  {items.map((item, i) => (
                                    <div key={i} style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: i !== items.length - 1 ? '1px solid #eee' : 'none' }}>
                                      <span><strong style={{ color: '#ef4444' }}>{item.qty || 1}x</strong> {item.name}</span>
                                      <span>{formatCurrency(item.price * (item.qty || 1))}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                </div>
              ))}
            </div>
          )}
        </div>
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

      {notification && <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
}