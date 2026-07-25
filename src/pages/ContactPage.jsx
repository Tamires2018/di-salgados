import React from 'react';
import { MessageCircle, Instagram, Mail, Clock, Phone, Info } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="container" style={{ marginTop: '40px', maxWidth: '800px', paddingBottom: '40px' }}>
      <h2 style={{ textAlign: 'center', fontWeight: 800, marginBottom: '30px' }}>
        Fale Conosco
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        
        {/* Canais de Atendimento */}
        <div className="order-card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Canais Diretos</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <a href="https://wa.me/5514988040296" target="_blank" rel="noreferrer" 
               style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: '#25D366', fontWeight: 'bold', fontSize: '1.1rem' }}>
              <MessageCircle size={24} /> WhatsApp
            </a>

            <a href="https://instagram.com/dionizia_ledo" target="_blank" rel="noreferrer"
               style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: '#E1306C', fontWeight: 'bold', fontSize: '1.1rem' }}>
              <Instagram size={24} /> @dionizia_ledo
            </a>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)' }}>
              <Mail size={24} color="var(--primary)" /> salgadosdi92@gmail.com
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)' }}>
              <Phone size={24} color="var(--primary)" /> (14) 98804-0296
            </div>
          </div>
        </div>

        {/* Horário Único de Funcionamento */}
        <div className="order-card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>
            <Clock size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Horário de Funcionamento
          </h3>
          
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #eee' }}>
              <span>Segunda a Sexta</span>
              <strong>07:00 - 16:10</strong>
            </li>
            <li style={{ padding: '15px 0', color: '#ff4444', textAlign: 'center', fontWeight: 'bold' }}>
              Fechado aos Sábados, Domingos e Feriados
            </li>
          </ul>
        </div>

      </div>

      {/* Dúvidas Frequentes Ajustadas */}
      <div className="order-card" style={{ marginTop: '30px', padding: '20px' }}>
        <h3 style={{ marginBottom: '15px' }}>Dúvidas Frequentes</h3>
        
        <details style={{ marginBottom: '10px', cursor: 'pointer' }}>
          <summary style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
             Como funciona a retirada?
          </summary>
          <p style={{ padding: '10px', color: '#666', marginLeft: '20px' }}>
            Após realizar seu pedido pelo site, nós o preparamos e você retira diretamente em nosso balcão assim que o status for atualizado para "Pronto".
          </p>
        </details>

        <details style={{ cursor: 'pointer' }}>
          <summary style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Aceitam quais formas de pagamento?
          </summary>
          <p style={{ padding: '10px', color: '#666', marginLeft: '20px' }}>
            Aceitamos PIX, Cartões de Crédito/Débito e Dinheiro diretamente no balcão no momento da retirada.
          </p>
        </details>
      </div>
    </div>
  );
}