import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registra o Service Worker responsável pelas notificações Push
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');

      console.log(
        '[PWA] Service Worker registrado:',
        registration.scope
      );
    } catch (error) {
      console.error(
        '[PWA] Erro ao registrar Service Worker:',
        error
      );
    }
  });
}