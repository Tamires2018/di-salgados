import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const SupabaseService = {
  async createOrder(orderData) {
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        customer_name: orderData.customer.name,
        customer_phone: orderData.customer.phone,
        items: orderData.items,
        total: orderData.total,
        payment_method: orderData.payment,
        notes: orderData.notes,
        status: 'novo'
      }]);
    if (error) throw error;
    return data;
  },

  async getOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateStatus(id, newStatus) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);
    if (error) throw error;
  }
};