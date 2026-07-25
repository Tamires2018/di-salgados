import React, { useState, useEffect } from 'react';
import { Search, Plus, ShoppingCart, Loader2, X } from 'lucide-react';
import { supabase } from '../services/supabase'; 
import { formatCurrency } from '../utils/formatCurrency';
import { estabelecimentoAberto } from '../utils/businessHours';

export default function PedidosPage({ addToCart, cartCount, openCart }) {
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');
  
  const [selectedImage, setSelectedImage] = useState(null); 

  const aberto = estabelecimentoAberto();
  
  const categories = ['Todos', 'Salgados', 'Pasteis', 'Bebidas', 'Doces', 'Salgadinhos'];

  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === '.') {
      return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400';
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    const cleanPath = imagePath.replace(/^\//, '');
    return `https://ozfnhqwjsjqlzjhbzhrr.supabase.co/storage/v1/object/public/produtos/${cleanPath}`;
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('produtos')
          .select('*')
          .eq('active', true) 
          .order('name', { ascending: true });

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const filtered = products.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filter === 'Todos' || item.category === filter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="container">
      <div className="search-container">
        <div className="search-icon-wrapper">
          <Search size={22} />
        </div>
        <input 
          className="search-input" 
          placeholder="Buscar coxinha, kibe, refri..." 
          value={search}
          onChange={e => setSearch(e.target.value)} 
        />
      </div>

      {!aberto && (
      <div
        style={{
          background: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffeeba',
          borderRadius: '10px',
          padding: '12px',
          marginBottom: '20px',
          textAlign: 'center',
          fontWeight: '600'
        }}
      >
        ⚠️ No momento estamos fechados.
        <br />
        Funcionamos de segunda a sexta das <strong>07:00 às 16:10</strong>.
      </div>
    )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', overflowX: 'auto', padding: '5px' }}>
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setFilter(cat)} 
            className="filter-btn"
            style={{ 
              padding: '8px 20px', 
              borderRadius: '20px', 
              border: 'none',
              cursor: 'pointer',
              background: filter === cat ? 'var(--primary)' : '#eee', 
              color: filter === cat ? 'white' : '#666', 
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              transition: '0.2s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>
          <Loader2 className="spinner" size={40} style={{ margin: '0 auto 10px' }} />
          <p>Carregando cardápio delicioso...</p>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {filtered.length > 0 ? (
              filtered.map(item => (
                <div key={item.id} className="product-card">
                  <div className="product-image-container">
                    <img 
                      src={getImageUrl(item.image)} 
                      className="product-image" 
                      alt={item.name} 
                      onClick={() => setSelectedImage({ url: getImageUrl(item.image), name: item.name })}
                      style={{ cursor: 'pointer' }}
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400';
                      }}
                    />
                  </div>
                  
                  <div className="product-content">
                    <div className="product-info">
                      <h3>{item.name}</h3>
                      <p className="product-desc">{item.description || 'Sabor irresistível Di Salgados.'}</p>
                    </div>

                    <div className="product-footer">
                      <span className="price">{formatCurrency(item.price)}</span>
                      <button
                        className="btn-add"
                        disabled={!aberto}
                        onClick={() => aberto && addToCart(item)}
                        style={{
                          opacity: aberto ? 1 : 0.6,
                          cursor: aberto ? 'pointer' : 'not-allowed'
                        }}
                      >
                        {aberto ? (
                          <>
                            Pedir <Plus size={16} />
                          </>
                        ) : (
                          'Fechado'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#999' }}>
                <p>Nenhum produto encontrado com esses critérios.</p>
              </div>
            )}
          </div>
        </>
      )}

      <button className="fab-cart" onClick={openCart}>
        <ShoppingCart size={28} /> 
        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
      </button>

      {selectedImage && (
        <div className="image-modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={() => setSelectedImage(null)}>
              <X size={20} />
            </button>
            <img src={selectedImage.url} alt={selectedImage.name} className="image-modal-img" />
            {/* Aviso agora em negrito */}
            <p className="image-modal-warning"><strong>⚠️ Imagem meramente ilustrativa.</strong></p>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .image-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 99999;
          padding: 20px;
          box-sizing: border-box;
        }
        .image-modal-content {
          background: #fff;
          padding: 15px;
          border-radius: 12px;
          max-width: 400px;
          width: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        .image-modal-img {
          width: 100%;
          max-height: 60vh;
          object-fit: cover;
          border-radius: 8px;
        }
        .image-modal-warning {
          margin-top: 15px;
          color: #333; /* Cor levemente escurecida para destacar o negrito */
          font-size: 14px;
          font-weight: bold; /* Atualizado para negrito */
          text-align: center;
        }
        .image-modal-close {
          position: absolute;
          top: -12px;
          right: -12px;
          background: #ff4757;
          color: white;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: 0.2s;
        }
        .image-modal-close:hover {
          transform: scale(1.1);
        }
      `}} />
    </div>
  );
}