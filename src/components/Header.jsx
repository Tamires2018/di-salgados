import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserCog, MapPin } from 'lucide-react'; 
import logoImg from '/Logo.png'; 
import TrackOrderModal from './TrackOrderModal';

export default function Header() {
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="brand">
          <img src={logoImg} alt="Di Salgados Logo" className="logo-header" />
          <span>Di Salgados</span>
        </Link>
        
        <nav className="nav-links">
          <Link to="/">Pedidos</Link>          
          <Link to="/contato">Contato</Link>
          <Link to="/localizacao">Localização</Link>
        </nav>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          
          {/* Botão limpo: Agora ele puxa 100% do CSS .admin-button */}
          <button 
            onClick={() => setIsTrackerOpen(true)}
            className="admin-button"
            style={{ cursor: 'pointer' }}
          >
            <MapPin size={16} />
            <span>Acompanhar Pedido</span>
          </button>
        
          <Link to="/admin" className="admin-button">
            <UserCog size={16} />
            <span>Painel Admin</span>
          </Link>

        </div>
      </div>

      <TrackOrderModal 
        isOpen={isTrackerOpen} 
        onClose={() => setIsTrackerOpen(false)} 
      />
    </header>
  );
}