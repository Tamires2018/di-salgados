export const StorageService = {
  getOrders: () => JSON.parse(localStorage.getItem('orders') || '[]'),
  saveOrder: (order) => {
    const orders = StorageService.getOrders();
    const lastId = orders.length > 0 ? parseInt(orders[0].id) : 0;
    const nextId = String(lastId + 1).padStart(4, '0');
    const newOrder = { ...order, id: nextId, createdAt: new Date().toISOString() };
    orders.unshift(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    return newOrder;
  },
  updateOrderStatus: (orderId, newStatus) => {
    const orders = StorageService.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].status = newStatus;
      localStorage.setItem('orders', JSON.stringify(orders));
      return true;
    }
    return false;
  },
  // Dentro do seu StorageService.js
  deleteOrder: (id) => {
    const orders = StorageService.getOrders();
    const filtered = orders.filter(o => o.id !== id);
    localStorage.setItem('di_salgados_orders', JSON.stringify(filtered));
  },
  getAdminAuth: () => localStorage.getItem('adminAuth') === 'true',
  setAdminAuth: (status) => {
    if (status) localStorage.setItem('adminAuth', 'true');
    else localStorage.removeItem('adminAuth');
  },
  init: () => {
    if (!localStorage.getItem('orders')) {
      const initialOrders = [
        {
          id: '0002',
          createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          customer: { name: 'Maria Silva', phone: '(11) 99999-1234' },
          payment: 'pix',
          notes: 'Capricha no molho da coxinha!',
          items: [
            { id: '1', name: 'Coxinha', price: 6.50, qty: 3 },
            { id: '7', name: 'Coca-Cola Lata', price: 5.00, qty: 2 }
          ],
          total: 29.50,
          status: 'novo'
        }
      ];
      localStorage.setItem('orders', JSON.stringify(initialOrders));
    }
  }
};