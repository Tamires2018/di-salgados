import React from 'react';
import { Heart } from 'lucide-react';
import logoImg from '/Logo.png';

export default function Footer() {
  return (
    <footer className="footer" style={{ background: '#212121', color: '#aaa', padding: '40px 0 20px', textAlign: 'center' }}>
      <div className="container">
        <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <img src={logoImg} alt="Logo" style={{ height: '40px', borderRadius: '50%' }} />
          Di Salgados
        </div>
        <p>&copy; {new Date().getFullYear()} Di Salgados. Feito com <Heart size={14} fill="red" color="red" /> por Tamires Ledo</p>
      </div>
    </footer>
  );
}