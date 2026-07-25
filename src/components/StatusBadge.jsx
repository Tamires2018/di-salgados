import React from 'react';

export default function StatusBadge({ status }) {
  const map = { 
    novo: 'Novo', 
    em_preparo: 'Em Preparo', 
    pronto: 'Pronto', 
    finalizado: 'Entregue', 
    cancelado: 'Cancelado' 
  };
  
  return (
    <span className={`badge status-${status}`} style={{ padding: '4px 8px', borderRadius: '8px', fontWeight: 'bold' }}>
      {map[status] || status}
    </span>
  );
}