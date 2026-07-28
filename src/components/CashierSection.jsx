import React from 'react';
import { Banknote, ClipboardList, History, Lock, Unlock } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

const getOrdersForCashier = (cashier, allOrders) => {
  if (!cashier?.aberto_em || !cashier?.fechado_em) return [];

  const openedAt = new Date(cashier.aberto_em).getTime();
  const closedAt = new Date(cashier.fechado_em).getTime();

  return allOrders.filter((order) => {
    const createdAt = new Date(order.created_at).getTime();

    return (
      order.status === 'finalizado' &&
      createdAt >= openedAt &&
      createdAt <= closedAt
    );
  });
};

const parseOrderItems = (items) => {
  try {
    const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
    return Array.isArray(parsedItems) ? parsedItems : [];
  } catch (error) {
    console.error('Erro ao ler os itens do pedido:', error);
    return [];
  }
};

export default function CashierSection({
  activeTab,
  cashierStatus,
  cashierHistory,
  orders,
  openingValue,
  onOpeningValueChange,
  onOpenCashier,
  onCloseCashier,
  loading = false
}) {
  if (activeTab === 'caixa') {
    const currentSales = cashierStatus.isOpen && cashierStatus.data?.aberto_em
      ? orders
          .filter((order) => (
            order.status === 'finalizado' &&
            new Date(order.created_at) >= new Date(cashierStatus.data.aberto_em)
          ))
          .reduce((total, order) => total + Number(order.total || 0), 0)
      : 0;

    return (
      <div style={styles.sectionCard}>
        <h2 style={styles.title}>
          <Banknote color="#ef4444" /> Gestão de Caixa
        </h2>

        {!cashierStatus.isOpen ? (
          <div style={styles.emptyState}>
            <Lock size={48} color="#999" style={{ marginBottom: '15px' }} />

            <h3 style={{ margin: '0 0 10px' }}>O caixa está FECHADO</h3>

            <p style={{ color: '#666', marginBottom: '25px' }}>
              Informe o valor em dinheiro disponível para iniciar o expediente.
            </p>

            <div style={styles.openCashierForm}>
              <input
                type="text"
                placeholder="Valor inicial (Ex: R$ 50,00)"
                value={openingValue}
                onChange={(event) => onOpeningValueChange(event.target.value)}
                disabled={loading}
                style={styles.openingInput}
              />

              <button
                type="button"
                onClick={onOpenCashier}
                disabled={loading}
                style={{
                  ...styles.openButton,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                <Unlock size={18} />
                {loading ? 'ABRINDO CAIXA...' : 'ABRIR CAIXA AGORA'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={styles.summaryGrid}>
              <div style={styles.neutralSummaryCard}>
                <span style={styles.neutralSummaryLabel}>ABERTO EM</span>
                <div style={styles.neutralSummaryValue}>
                  {new Date(cashierStatus.data.aberto_em).toLocaleString('pt-BR')}
                </div>
              </div>

              <div style={styles.greenSummaryCard}>
                <span style={styles.greenSummaryLabel}>VALOR DE ABERTURA</span>
                <div style={styles.greenSummaryValue}>
                  {formatCurrency(cashierStatus.data.valor_abertura)}
                </div>
              </div>

              <div style={styles.redSummaryCard}>
                <span style={styles.redSummaryLabel}>VENDAS FINALIZADAS</span>
                <div style={styles.redSummaryValue}>
                  {formatCurrency(currentSales)}
                </div>
              </div>
            </div>

            <div style={styles.operationNotice}>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#856404' }}>
                O caixa está operando. Todas as vendas finalizadas a partir de agora serão somadas ao fechamento.
              </p>
            </div>

            <button
              type="button"
              onClick={onCloseCashier}
              disabled={loading}
              style={{
                ...styles.closeButton,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              <Lock size={20} />
              {loading ? 'FECHANDO CAIXA...' : 'ENCERRAR EXPEDIENTE E FECHAR CAIXA'}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'historico') {
    return (
      <div style={styles.sectionCard}>
        <h2 style={styles.title}>
          <History color="#ef4444" /> Histórico do Caixa
        </h2>

        {cashierHistory.length === 0 ? (
          <div style={styles.emptyState}>
            <History size={48} color="#999" style={{ marginBottom: '15px' }} />
            <h3 style={{ margin: '0 0 10px', color: '#666' }}>Nenhum caixa fechado</h3>
            <p style={{ color: '#999', margin: 0 }}>
              Os registros de caixas encerrados aparecerão aqui.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {cashierHistory.map((cashier) => {
              const sessionOrders = getOrdersForCashier(cashier, orders);

              return (
                <div key={cashier.id} style={styles.historyCard}>
                  <div style={styles.historyHeader}>
                    <div>
                      <strong style={styles.closedAt}>
                        Fechado em: {new Date(cashier.fechado_em).toLocaleString('pt-BR')}
                      </strong>

                      <span style={styles.openedAt}>
                        Aberto em: {new Date(cashier.aberto_em).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div style={styles.historyTotals}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={styles.historyLabel}>Abertura</span>
                        <strong style={styles.historyOpeningValue}>
                          {formatCurrency(cashier.valor_abertura)}
                        </strong>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={styles.historyLabel}>Vendas</span>
                        <strong style={styles.historySalesValue}>
                          {formatCurrency(cashier.valor_vendas)}
                        </strong>
                      </div>

                      <div style={styles.finalTotalBox}>
                        <span style={{ ...styles.historyLabel, color: '#333' }}>Total final</span>
                        <strong style={styles.finalTotalValue}>
                          {formatCurrency(cashier.valor_total)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {sessionOrders.length > 0 && (
                    <div style={styles.sessionOrdersSection}>
                      <span style={styles.sessionOrdersTitle}>
                        <ClipboardList size={16} />
                        Pedidos finalizados neste turno:
                      </span>

                      <div style={{ display: 'grid', gap: '10px' }}>
                        {sessionOrders.map((order) => {
                          const items = parseOrderItems(order.items);

                          return (
                            <div key={order.id} style={styles.orderCard}>
                              <div style={styles.orderHeader}>
                                <div>
                                  <strong style={styles.orderNumber}>
                                    Pedido #{order.id.toString().slice(-2)}
                                  </strong>

                                  <span style={styles.orderDate}>
                                    {new Date(order.created_at).toLocaleString('pt-BR')}
                                  </span>

                                  <div style={styles.customerName}>{order.customer_name}</div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                  <strong style={styles.orderTotal}>
                                    {formatCurrency(order.total)}
                                  </strong>

                                  <div style={styles.paymentMethod}>
                                    {order.payment_method?.toUpperCase()}
                                  </div>
                                </div>
                              </div>

                              <div style={styles.itemsBox}>
                                {items.length === 0 ? (
                                  <span style={{ fontSize: '0.85rem', color: '#999' }}>
                                    Nenhum item encontrado.
                                  </span>
                                ) : (
                                  items.map((item, index) => (
                                    <div
                                      key={`${order.id}-${index}`}
                                      style={{
                                        ...styles.itemRow,
                                        borderBottom: index !== items.length - 1
                                          ? '1px solid #eee'
                                          : 'none'
                                      }}
                                    >
                                      <span>
                                        <strong style={{ color: '#ef4444' }}>
                                          {item.qty || 1}x
                                        </strong>{' '}
                                        {item.name}
                                      </span>

                                      <span>
                                        {formatCurrency(
                                          Number(item.price || 0) * Number(item.qty || 1)
                                        )}
                                      </span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return null;
}

const styles = {
  sectionCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
  },
  title: {
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    border: '2px dashed #ddd',
    borderRadius: '12px'
  },
  openCashierForm: {
    maxWidth: '300px',
    margin: '0 auto',
    display: 'grid',
    gap: '15px'
  },
  openingInput: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    textAlign: 'center',
    fontSize: '1.1rem'
  },
  openButton: {
    padding: '15px',
    borderRadius: '8px',
    border: 'none',
    background: '#22c55e',
    color: 'white',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '30px'
  },
  neutralSummaryCard: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #eee'
  },
  neutralSummaryLabel: {
    fontSize: '0.85rem',
    color: '#666',
    fontWeight: 'bold'
  },
  neutralSummaryValue: {
    fontSize: '1.1rem',
    fontWeight: '700',
    marginTop: '5px'
  },
  greenSummaryCard: {
    background: '#f0fdf4',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #bcf0da'
  },
  greenSummaryLabel: {
    fontSize: '0.85rem',
    color: '#166534',
    fontWeight: 'bold'
  },
  greenSummaryValue: {
    fontSize: '1.3rem',
    fontWeight: '900',
    color: '#15803d',
    marginTop: '5px'
  },
  redSummaryCard: {
    background: '#fef2f2',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #fecaca'
  },
  redSummaryLabel: {
    fontSize: '0.85rem',
    color: '#991b1b',
    fontWeight: 'bold'
  },
  redSummaryValue: {
    fontSize: '1.3rem',
    fontWeight: '900',
    color: '#b91c1c',
    marginTop: '5px'
  },
  operationNotice: {
    background: '#fff9db',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #ffec99',
    marginBottom: '25px',
    textAlign: 'center'
  },
  closeButton: {
    width: '100%',
    padding: '18px',
    borderRadius: '10px',
    border: 'none',
    background: '#ef4444',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },
  historyCard: {
    background: '#f8f9fa',
    padding: '15px',
    borderRadius: '10px',
    border: '1px solid #eee',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px'
  },
  closedAt: {
    display: 'block',
    color: '#333',
    fontSize: '1.1rem'
  },
  openedAt: {
    fontSize: '0.85rem',
    color: '#666'
  },
  historyTotals: {
    display: 'flex',
    gap: '25px',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  historyLabel: {
    fontSize: '0.8rem',
    color: '#666',
    display: 'block',
    fontWeight: 'bold'
  },
  historyOpeningValue: {
    color: '#15803d',
    fontSize: '1.1rem'
  },
  historySalesValue: {
    color: '#b91c1c',
    fontSize: '1.1rem'
  },
  finalTotalBox: {
    textAlign: 'right',
    borderLeft: '2px solid #ddd',
    paddingLeft: '20px'
  },
  finalTotalValue: {
    color: '#000',
    fontSize: '1.3rem'
  },
  sessionOrdersSection: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px dashed #ccc'
  },
  sessionOrdersTitle: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#555',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    marginBottom: '10px'
  },
  orderCard: {
    background: '#fff',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '10px'
  },
  orderNumber: {
    fontSize: '1rem',
    display: 'block',
    color: '#ef4444'
  },
  orderDate: {
    fontSize: '0.8rem',
    color: '#666'
  },
  customerName: {
    fontSize: '0.9rem',
    marginTop: '4px',
    fontWeight: '600'
  },
  orderTotal: {
    fontSize: '1.1rem',
    color: '#000'
  },
  paymentMethod: {
    fontSize: '0.8rem',
    color: '#666',
    marginTop: '4px',
    fontWeight: 'bold'
  },
  itemsBox: {
    background: '#f8f9fa',
    padding: '10px',
    borderRadius: '6px'
  },
  itemRow: {
    fontSize: '0.85rem',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '4px 0'
  }
};