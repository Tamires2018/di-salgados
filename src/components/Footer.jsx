import React from 'react';
import logoImg from '/Logo.png';

export default function Footer() {
  return (
    <footer
      className="footer"
      style={{
        background: '#212121',
        color: '#bdbdbd',
        padding: '32px 20px',
        marginTop: '60px'
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px'
        }}
      >
        {/* Logo + Nome */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <img
            src={logoImg}
            alt="Logo Di Salgados"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />

          <span
            style={{
              color: '#fff',
              fontSize: '1.5rem',
              fontWeight: '700'
            }}
          >
            Di Salgados
          </span>
        </div>

        {/* Linha divisória */}
        <div
          style={{
            width: '70px',
            height: '3px',
            background: '#E53935',
            borderRadius: '50px'
          }}
        />

        {/* Horário */}
        <p
          style={{
            margin: 0,
            fontSize: '0.95rem',
            color: '#bdbdbd'
          }}
        >
          Pedidos sujeitos ao horário de funcionamento.
        </p>

        {/* Direitos */}
        <p
          style={{
            margin: 0,
            fontSize: '0.9rem',
            color: '#8f8f8f'
          }}
        >
          © {new Date().getFullYear()} <strong>Di Salgados</strong> • Desenvolvido por{' '}
          <strong>Tamires Ledo</strong>
        </p>
      </div>
    </footer>
  );
}