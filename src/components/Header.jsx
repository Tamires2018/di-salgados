import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCog,
  MapPin,
  Menu,
  X
} from 'lucide-react';

import logoImg from '/Logo.png';
import TrackOrderModal from './TrackOrderModal';
import InstallButton from './InstallButton';

export default function Header() {
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function fecharMenu() {
    setIsMenuOpen(false);
  }

  function abrirAcompanhamento() {
    setIsMenuOpen(false);
    setIsTrackerOpen(true);
  }

  return (
    <>
      <header className="site-header">
        <div className="site-header-content">
          <Link
            to="/"
            className="site-brand"
            onClick={fecharMenu}
          >
            <img
              src={logoImg}
              alt="Logo Di Salgados"
              className="site-logo"
            />

            <span>Di Salgados</span>
          </Link>

          <nav className="site-desktop-nav">
            <Link to="/">Pedidos</Link>
            <Link to="/contato">Contato</Link>
            <Link to="/localizacao">Localização</Link>
          </nav>

          <div className="site-desktop-actions">
            {/* Agora o botão usará a mesma classe e design dos outros */}
            <InstallButton className="site-header-button" iconSize={17} />

            <button
              type="button"
              className="site-header-button"
              onClick={() => setIsTrackerOpen(true)}
            >
              <MapPin size={17} />
              <span>Acompanhar Pedido</span>
            </button>

            <Link
              to="/admin"
              className="site-header-button"
            >
              <UserCog size={17} />
              <span>Painel Admin</span>
            </Link>
          </div>

          <button
            type="button"
            className="site-mobile-button"
            onClick={() => setIsMenuOpen((valorAtual) => !valorAtual)}
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        <div
          className={`site-mobile-menu ${
            isMenuOpen ? 'site-mobile-menu-open' : ''
          }`}
        >
          <nav className="site-mobile-nav">
            <Link to="/" onClick={fecharMenu}>
              Pedidos
            </Link>

            <Link to="/contato" onClick={fecharMenu}>
              Contato
            </Link>

            <Link to="/localizacao" onClick={fecharMenu}>
              Localização
            </Link>

            <button
              type="button"
              onClick={abrirAcompanhamento}
            >
              <MapPin size={19} />
              <span>Acompanhar Pedido</span>
            </button>

            <Link to="/admin" onClick={fecharMenu}>
              <UserCog size={19} />
              <span>Painel Admin</span>
            </Link>

            {/* No celular, usamos um ícone um pouco maior e fechamos o menu ao clicar */}
            <InstallButton iconSize={19} onCustomClick={fecharMenu} />
          </nav>
        </div>
      </header>

      <TrackOrderModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
      />
    </>
  );
}