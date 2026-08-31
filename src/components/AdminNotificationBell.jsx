import React, { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { supabase } from '../services/supabase';
import Toast from './Toast';

// Cole a sua chave pública VAPID aqui entre as aspas
const PUBLIC_VAPID_KEY = 'BGKOF-fFpPj11kUMHDlM0f3H8SI7vC5uke7_F0DQN_Zk9_82nFc46FeTLFNkLtnuXcoLVsSnZN2sfQC56yib3WQ';

function urlBase64ToUint8Array(base64String) {
  if (!base64String) {
    throw new Error("A chave VAPID pública está vazia!");
  }
  
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

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
  const [toast, setToast] = useState(null);

  useEffect(() => {
    checkSubscription();
  }, []);

  async function checkSubscription() {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (err) {
      console.error('Erro ao checar inscrição:', err);
    }
  }

  async function toggleSubscription() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setToast({ message: 'Seu navegador não suporta notificações push.', type: 'error' });
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
        setToast({ message: 'Notificações desativadas.', type: 'error' }); // <- Mudamos para 'error' aqui!
      } else {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setToast({ message: 'Permissão de notificação negada pelo navegador.', type: 'error' });
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
        setToast({ message: 'Notificações ativadas com sucesso!', type: 'success' });
      }
    } catch (error) {
      console.error('Erro detalhado:', error);
      setToast({ message: `Erro: ${error.message || error}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
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
          border: '1px solid',
          borderColor: isSubscribed ? '#bcf0da' : '#fca5a5',
          background: isSubscribed ? '#f0fdf4' : '#fef2f2',
          color: isSubscribed ? '#166534' : '#dc2626',
          cursor: 'pointer',
          fontSize: '1rem',
          whiteSpace: 'nowrap'
        }}
        title={isSubscribed ? 'Notificações ativadas' : 'Ativar notificações'}
      >
        {isSubscribed ? <Bell size={18} color="#166534" /> : <BellOff size={18} color="#dc2626" />}
        <span>{isSubscribed ? 'Ativas' : 'Alerta'}</span>
      </button>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </>
  );
}