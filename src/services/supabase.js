import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ozfnhqwjsjqlzjhbzhrr.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96Zm5ocXdqc2pxbHpqaGJ6aHJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NjIyMjEsImV4cCI6MjA4NjMzODIyMX0.VEo-nntZUiwEPnqhT0tRCdJ4nKbu6FtW-Xq52DGLyJI';

export const supabase = createClient(supabaseUrl, supabaseKey);

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