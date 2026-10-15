import { supabase } from './supabase';

export async function getStoreStatus() {
  const { data, error } = await supabase.from('store_status').select('manually_closed').eq('id', 1).single();
  if (error) throw error;
  return data.manually_closed;
}

export async function setStoreClosed(closed, password) {
  const { error } = await supabase.rpc('set_store_closed', {
    p_closed: closed,
    p_password: password
  });
  if (error) throw error;
  window.dispatchEvent(new Event('store-status-changed'));
}
