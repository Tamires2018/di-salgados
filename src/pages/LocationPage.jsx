import React from 'react';
import { MapPin, Navigation, Info, Store } from 'lucide-react';

export default function LocationPage() {
  // Substitua este link pelo link de "Incorporar mapa" do seu endereço no Google Maps
const googleMapsEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3106.0464147749867!2d-49.68269612463916!3d-22.212270130066393!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94bfb89aca71d9f5%3A0xbc46fe0724cc9582!2sR.%20Carlos%20Ferrari%2C%202814%20-%20Distrito%20Industrial%2C%20Gar%C3%A7a%20-%20SP%2C%2017400-044!5e0!3m2!1spt-BR!2sbr!4v1771890959137!5m2!1spt-BR!2sbr";
  return (
    <div className="container" style={{ marginTop: '40px', paddingBottom: '60px', maxWidth: '700px' }}>
      
      {/* Bloco do Mapa Centralizado */}
      <div className="order-card" style={{ padding: '0', overflow: 'hidden', marginBottom: '25px' }}>
        <iframe 
          src={googleMapsEmbedUrl}
          width="100%" 
          height="400" 
          style={{ border: 0 }} 
          allowFullScreen="" 
          loading="lazy" 
          title="Localização Di Salgados"
        ></iframe>
        
        <div style={{ padding: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '20px' }}>
            <MapPin size={26} color="var(--primary)" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '1.1rem' }}>Endereço para Retirada</strong>
              <p style={{ color: '#555', fontSize: '1rem', marginTop: '5px', lineHeight: '1.5' }}>
                Rua Carlos Ferrari, 2814 — Distrito Industrial<br />
                Garça - SP, CEP: 17400-044
              </p>
            </div>
          </div>

          <a 
            href="https://www.google.com/maps/dir/?api=1&destination=Rua+Carlos+Ferrari,+2814,+Garça+-+SP"
            target="_blank" 
            rel="noreferrer"
            className="btn-checkout" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px', 
              textDecoration: 'none', 
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            <Navigation size={20} /> Como Chegar (Abrir GPS)
          </a>
        </div>
      </div>

      {/* Aviso de Somente Retirada movido para baixo do mapa */}
      <div className="order-card" style={{ 
        padding: '20px', 
        background: '#fff9e6', 
        border: '1px solid #ffeeba',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <div style={{ 
          background: '#ffc107', 
          padding: '10px', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Store size={24} color="#fff" />
        </div>
        <div>
          <h4 style={{ margin: 0, color: '#856404', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Info size={18} /> Importante: Retirada no Local
          </h4>
          <p style={{ margin: '5px 0 0', color: '#856404', fontSize: '0.9rem' }}>
            Fique atento! Não trabalhamos com entregas. Seu pedido deve ser retirado diretamente em nosso balcão.
          </p>
        </div>
      </div>
    </div>
  );
}