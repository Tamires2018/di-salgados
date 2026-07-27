import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [rememberMe, setRememberMe] = useState(false); // Novo estado para o checkbox
  const nav = useNavigate();

  // Carrega os dados salvos ao montar o componente
  useEffect(() => {
    const savedUser = localStorage.getItem('remembered_admin_user');
    const savedPass = localStorage.getItem('remembered_admin_pass');
    
    if (savedUser && savedPass) {
      setU(savedUser);
      setP(savedPass);
      setRememberMe(true);
    }
  }, []);

  const login = (e) => {
    e.preventDefault();
    if(u === 'DiSalgados' && p === '202518') { 
      
      // Lógica de persistência do "Lembre-se de mim"
      if (rememberMe) {
        localStorage.setItem('remembered_admin_user', u);
        localStorage.setItem('remembered_admin_pass', p);
      } else {
        localStorage.removeItem('remembered_admin_user');
        localStorage.removeItem('remembered_admin_pass');
      }

      StorageService.setAdminAuth(true); 
      nav('/admin/pedidos'); 
    }
    else alert('Usuário ou senha incorretos!');
  };

  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: '20px',
      background: '#f8f9fa' 
    }}>
      <div style={{ 
        maxWidth: '400px', 
        width: '100%', 
        background: 'white', 
        padding: '40px', 
        borderRadius: '16px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
        textAlign: 'center'
      }}>
        <div style={{ 
          background: '#fee2e2', 
          width: '60px', 
          height: '60px', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 20px' 
        }}>
          <Lock color="#ef4444" size={30} />
        </div>

        <h2 style={{ marginBottom: '8px', color: '#1f2937' }}>Login Admin</h2>
        <p style={{ color: '#6b7280', marginBottom: '32px', fontSize: '0.9rem' }}>
          Gerencie seus pedidos de forma simples
        </p>

        <form onSubmit={login}>
          <div style={{ textAlign: 'left', marginBottom: '16px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#4b5563', textTransform: 'uppercase' }}>Usuário</label>
            <input 
              placeholder="Ex: admin" 
              value={u} // Vinculado ao estado para auto-preenchimento
              onChange={e => setU(e.target.value)} 
              style={{
                width: '100%', 
                padding: '12px', 
                marginTop: '6px',
                borderRadius: '8px', 
                border: '1px solid #d1d5db',
                outline: 'none',
                fontSize: '1rem'
              }} 
            />
          </div>

          <div style={{ textAlign: 'left', marginBottom: '16px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#4b5563', textTransform: 'uppercase' }}>Senha</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={p} // Vinculado ao estado para auto-preenchimento
              onChange={e => setP(e.target.value)} 
              style={{
                width: '100%', 
                padding: '12px', 
                marginTop: '6px',
                borderRadius: '8px', 
                border: '1px solid #d1d5db',
                outline: 'none',
                fontSize: '1rem'
              }} 
            />
          </div>

          {/* Checkbox Lembre-se de mim */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '24px',
            justifyContent: 'flex-start'
          }}>
            <input 
              type="checkbox" 
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <label htmlFor="remember" style={{ fontSize: '0.9rem', color: '#4b5563', cursor: 'pointer', userSelect: 'none' }}>
              Lembre-se de mim
            </label>
          </div>

          <button style={{
            width: '100%', 
            padding: '14px', 
            background: '#ef4444', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            fontWeight: 'bold', 
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#dc2626'}
          onMouseOut={(e) => e.target.style.background = '#ef4444'}
          >
            Acessar Painel
          </button>
        </form>
      </div>
    </div>
  );
}