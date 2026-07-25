import React, { useState } from 'react';
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
import './styles/global.css';

export default function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [tempGeneralNote, setTempGeneralNote] = useState('');

  const totalValue = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const addToCart = (item) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1, note: '' }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => 
      i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i
    ));
  };

  const updateItemNote = (id, note) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, note: note } : i));
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const handleOrderComplete = () => {
    setCart([]); 
    setTempGeneralNote(''); 
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setNotification({ message: '🚀 Pedido enviado com sucesso!', type: 'success' });
  };

  return (
    <HashRouter>
      <Header />  
      <main className="main-content">
        <Routes>
          <Route path="/" element={<PedidosPage addToCart={addToCart} cartCount={cart.length} openCart={() => setIsCartOpen(true)} />} />
          <Route path="/contato" element={<ContactPage />} />
          <Route path="/localizacao" element={<LocationPage />} />
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin/pedidos" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        </Routes>
      </main>
      <Footer />

      {notification && <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

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
        onOrderSuccess={handleOrderComplete}
      />
    </HashRouter>
  );
}