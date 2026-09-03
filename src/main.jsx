import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ======================================================
// SERVICE WORKER - NOTIFICAÇÕES PUSH
// ======================================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        '/sw.js',
        {
          scope: '/'
        }
      );

      console.log(
        '[PWA] Service Worker registrado:',
        registration.scope
      );

      // Garante que o navegador atualize o Service Worker
      await registration.update();

      console.log(
        '[PWA] Service Worker atualizado/verificado.'
      );
    } catch (error) {
      console.error(
        '[PWA] Erro ao registrar Service Worker:',
        error
      );
    }
  });
}