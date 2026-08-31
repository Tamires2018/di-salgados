import React, { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { supabase } from '../services/supabase';

// Cole aqui a sua Public Key gerada nas chaves VAPID
const PUBLIC_VAPID_KEY = 'SUA_CHAVE_PUBLICA_AQUI';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function AdminNotificationBell() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkSubscription();
  }, []);

  async function checkSubscription() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    }
  }

  async function toggleSubscription() {
    if (!('serviceWorker' in navigator)) {
      alert('Seu navegador não suporta notificações.');
      return;
    }

    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;

      if (isSubscribed) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          await supabase.from('admin_subscriptions').delete().eq('endpoint', subscription.endpoint);
        }
        setIsSubscribed(false);
        alert('Notificações desativadas.');
      } else {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          alert('Permissão de notificação negada pelo usuário.');
          setLoading(false);
          return;
        }

        const convertedKey = urlBase64ToUint8Array(PUBLIC_VAPID_KEY);
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey
        });

        const subJson = subscription.toJSON();

        const { error } = await supabase.from('admin_subscriptions').upsert({
          endpoint: subJson.endpoint,
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth
        }, { onConflict: 'endpoint' });

        if (error) throw error;

        setIsSubscribed(true);
        alert('Notificações ativadas com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao alternar inscrições:', error);
      alert('Erro ao configurar notificações.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleSubscription}
      disabled={loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        padding: '8px 15px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        background: isSubscribed ? '#f0fdf4' : 'white',
        color: isSubscribed ? '#166534' : '#666',
        cursor: 'pointer',
        fontWeight: 'normal',
        fontSize: '1rem',
        whiteSpace: 'nowrap'
      }}
      title={isSubscribed ? 'Notificações ativadas' : 'Ativar notificações'}
    >
      {isSubscribed ? <Bell size={18} color="#166534" /> : <BellOff size={18} color="#999" />}
      <span>{isSubscribed ? 'Ativas' : 'Alerta'}</span>
    </button>
  );
}