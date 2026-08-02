import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import PedidosPage from './pages/PedidosPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ContactPage from './pages/ContactPage';
import LocationPage from './pages/LocationPage';
import PrivateRoute from './routes/PrivateRoute';
import Toast from './components/Toast';
import OrderTrackingModal from './components/OrderTrackingModal';
import { initializeNotifications } from './services/notifications';
import './styles/global.css';

export default function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [tempGeneralNote, setTempGeneralNote] = useState('');

  const [currentOrderId, setCurrentOrderId] = useState(() => {
    return localStorage.getItem('currentOrderId');
  });

  const [showOrderTracking, setShowOrderTracking] = useState(() => {
    return Boolean(localStorage.getItem('currentOrderId'));
  });

  useEffect(() => {
    initializeNotifications();
  }, []);

  const totalValue = cart.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((cartItem) => cartItem.id === item.id);

      if (exists) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, qty: cartItem.qty + 1 }
            : cartItem
        );
      }

      return [...prev, { ...item, qty: 1, note: '' }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item
      )
    );
  };

  const updateItemNote = (id, note) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, note } : item
      )
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleOrderCreated = (orderId) => {
    const normalizedId = String(orderId);

    localStorage.setItem('currentOrderId', normalizedId);
    setCurrentOrderId(normalizedId);
  };

  const handleOrderComplete = () => {
    setCart([]);
    setTempGeneralNote('');
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setShowOrderTracking(true);

    setNotification({
      message: '🚀 Pedido enviado com sucesso!',
      type: 'success'
    });
  };

  return (
    <HashRouter>
      <Header />

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <PedidosPage
                addToCart={addToCart}
                cartCount={cart.length}
                openCart={() => setIsCartOpen(true)}
              />
            }
          />

          <Route path="/contato" element={<ContactPage />} />
          <Route path="/localizacao" element={<LocationPage />} />
          <Route path="/admin" element={<AdminLoginPage />} />

          <Route
            path="/admin/pedidos"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>

      <Footer />

      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQty={updateQty}
        updateItemNote={updateItemNote}
        removeItem={removeItem}
        onCheckout={(note) => {
          setTempGeneralNote(note);
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        totalValue={totalValue}
        notesFromCart={tempGeneralNote}
        onOrderCreated={handleOrderCreated}
        onOrderSuccess={handleOrderComplete}
      />

      {showOrderTracking && currentOrderId && (
        <OrderTrackingModal
          orderId={currentOrderId}
          onClose={() => setShowOrderTracking(false)}
        />
      )}
    </HashRouter>
  );
}