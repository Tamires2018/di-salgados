import React, { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import {
  UserCog,
  MapPin,
  Menu,
  X,
  Moon,
  Sun
} from 'lucide-react';

import logoImg from '/Logo.png';

import TrackOrderModal from './TrackOrderModal';
import InstallButton from './InstallButton';

const STORAGE_KEY = 'di-salgados-theme';

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const savedTheme =
    localStorage.getItem(STORAGE_KEY);

  if (
    savedTheme === 'dark' ||
    savedTheme === 'light'
  ) {
    return savedTheme;
  }

  return 'light';
}

export default function Header() {
  const [isTrackerOpen, setIsTrackerOpen] =
    useState(false);

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  /*
   * Tema do Header
   */
  const [darkMode, setDarkMode] =
    useState(
      () => getInitialTheme() === 'dark'
    );

  /*
   * Aplica o tema globalmente.
   */
  useEffect(() => {
    const theme = darkMode
      ? 'dark'
      : 'light';

    document.documentElement.dataset.theme =
      theme;

    localStorage.setItem(
      STORAGE_KEY,
      theme
    );
  }, [darkMode]);

  /*
   * Sincroniza com os outros botões
   * de tema do site, principalmente
   * o ThemeToggle usado no Admin.
   */
  useEffect(() => {
    const syncTheme = (event) => {
      const nextTheme = event.detail;

      if (
        nextTheme === 'dark' ||
        nextTheme === 'light'
      ) {
        setDarkMode(
          nextTheme === 'dark'
        );
      }
    };

    window.addEventListener(
      'di-salgados-theme-change',
      syncTheme
    );

    return () => {
      window.removeEventListener(
        'di-salgados-theme-change',
        syncTheme
      );
    };
  }, []);

  /*
   * Sincroniza caso o tema seja
   * alterado em outra aba/janela.
   */
  useEffect(() => {
    const syncStorageTheme = () => {
      const savedTheme =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (
        savedTheme === 'dark' ||
        savedTheme === 'light'
      ) {
        setDarkMode(
          savedTheme === 'dark'
        );
      }
    };

    window.addEventListener(
      'storage',
      syncStorageTheme
    );

    return () => {
      window.removeEventListener(
        'storage',
        syncStorageTheme
      );
    };
  }, []);

  /*
   * Alterna entre claro e escuro.
   */
  function toggleTheme() {
    const nextDarkMode =
      !darkMode;

    const nextTheme =
      nextDarkMode
        ? 'dark'
        : 'light';

    setDarkMode(nextDarkMode);

    document.documentElement.dataset.theme =
      nextTheme;

    localStorage.setItem(
      STORAGE_KEY,
      nextTheme
    );

    /*
     * Avisa os outros ThemeToggle
     * existentes na aplicação.
     */
    window.dispatchEvent(
      new CustomEvent(
        'di-salgados-theme-change',
        {
          detail: nextTheme
        }
      )
    );
  }

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

          {/* LOGO */}
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

            <span>
              Di Salgados
            </span>
          </Link>


          {/* MENU DESKTOP */}
          <nav className="site-desktop-nav">

            <Link to="/">
              Pedidos
            </Link>

            <Link to="/contato">
              Contato
            </Link>

            <Link to="/localizacao">
              Localização
            </Link>

          </nav>


          {/* AÇÕES DESKTOP */}
          <div className="site-desktop-actions">

            {/* Botão de tema */}
            <button
              type="button"
              className="site-header-button site-theme-desktop-button"
              onClick={toggleTheme}
              aria-label={
                darkMode
                  ? 'Ativar modo claro'
                  : 'Ativar modo escuro'
              }
              title={
                darkMode
                  ? 'Modo claro'
                  : 'Modo escuro'
              }
            >
              {darkMode ? (
                <Sun size={17} />
              ) : (
                <Moon size={17} />
              )}
            </button>


            {/* INSTALAR */}
            <InstallButton
              className="site-header-button"
              iconSize={17}
            />


            {/* ACOMPANHAR PEDIDO */}
            <button
              type="button"
              className="site-header-button"
              onClick={() =>
                setIsTrackerOpen(true)
              }
            >
              <MapPin size={17} />

              <span>
                Acompanhar Pedido
              </span>
            </button>


            {/* PAINEL ADMIN */}
            <Link
              to="/admin"
              className="site-header-button"
            >
              <UserCog size={17} />

              <span>
                Painel Admin
              </span>
            </Link>

          </div>


          {/* AÇÕES MOBILE */}
          <div className="site-mobile-actions">

            {/* Botão de tema no celular */}
            <button
              type="button"
              className="site-theme-button"
              onClick={toggleTheme}
              aria-label={
                darkMode
                  ? 'Ativar modo claro'
                  : 'Ativar modo escuro'
              }
              title={
                darkMode
                  ? 'Modo claro'
                  : 'Modo escuro'
              }
            >
              {darkMode ? (
                <Sun size={21} />
              ) : (
                <Moon size={21} />
              )}
            </button>


            {/* MENU MOBILE */}
            <button
              type="button"
              className="site-mobile-button"
              onClick={() =>
                setIsMenuOpen(
                  (valorAtual) =>
                    !valorAtual
                )
              }
              aria-label={
                isMenuOpen
                  ? 'Fechar menu'
                  : 'Abrir menu'
              }
            >
              {isMenuOpen ? (
                <X size={26} />
              ) : (
                <Menu size={26} />
              )}
            </button>

          </div>

        </div>


        {/* MENU MOBILE */}
        <div
          className={`site-mobile-menu ${
            isMenuOpen
              ? 'site-mobile-menu-open'
              : ''
          }`}
        >
          <nav className="site-mobile-nav">

            <Link
              to="/"
              onClick={fecharMenu}
            >
              Pedidos
            </Link>


            <Link
              to="/contato"
              onClick={fecharMenu}
            >
              Contato
            </Link>


            <Link
              to="/localizacao"
              onClick={fecharMenu}
            >
              Localização
            </Link>


            <button
              type="button"
              onClick={
                abrirAcompanhamento
              }
            >
              <MapPin size={19} />

              <span>
                Acompanhar Pedido
              </span>
            </button>


            <Link
              to="/admin"
              onClick={fecharMenu}
            >
              <UserCog size={19} />

              <span>
                Painel Admin
              </span>
            </Link>


            <InstallButton
              iconSize={19}
              onCustomClick={
                fecharMenu
              }
            />

          </nav>
        </div>

      </header>


      {/* MODAL ACOMPANHAR PEDIDO */}
      <TrackOrderModal
        isOpen={isTrackerOpen}
        onClose={() =>
          setIsTrackerOpen(false)
        }
      />
    </>
  );
}