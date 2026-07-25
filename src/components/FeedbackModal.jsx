import React, { useState } from 'react';
import { Star, X } from 'lucide-react';

export default function FeedbackModal({ isOpen, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

const handleSubmit = () => {
    if (rating === 0) {
      alert("Por favor, selecione uma nota antes de enviar.");
      return;
    }
    // Alterado de 'rating' para 'stars' para coincidir com sua tabela no Supabase
    onSubmit({ stars: rating, comment }); 
    onClose();
  };

  return (
    <div className="feedback-overlay">
      <div className="feedback-container">
        <button className="feedback-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="feedback-header">
          <h2>Sua opinião é importante!</h2>
          <p>Como foi sua experiência com a Di Salgados?</p>
        </div>

        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="star-button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            >
              <Star
                size={40}
                fill={(hover || rating) >= star ? "#ffb400" : "none"}
                color={(hover || rating) >= star ? "#ffb400" : "#ccc"}
                strokeWidth={2}
              />
            </button>
          ))}
        </div>

        <div className="feedback-comment">
          <label>Deixe um comentário (opcional)</label>
          <textarea
            placeholder="Conte-nos o que você achou dos nossos salgados..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <button className="btn-send-feedback" onClick={handleSubmit}>
          Enviar Avaliação
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .feedback-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          padding: 20px;
        }
        .feedback-container {
          background: white;
          width: 100%;
          max-width: 450px;
          padding: 30px;
          border-radius: 20px;
          position: relative;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        .feedback-close {
          position: absolute;
          top: 15px; right: 15px;
          background: none; border: none; cursor: pointer; color: #666;
        }
        .feedback-header h2 { margin-bottom: 10px; color: #333; }
        .feedback-header p { color: #666; margin-bottom: 25px; }
        .star-rating {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 25px;
        }
        .star-button {
          background: none; border: none; cursor: pointer;
          transition: transform 0.2s;
        }
        .star-button:hover { transform: scale(1.15); }
        .feedback-comment { text-align: left; margin-bottom: 25px; }
        .feedback-comment label { 
          display: block; margin-bottom: 8px; font-weight: bold; color: #444; 
        }
        .feedback-comment textarea {
          width: 100%;
          height: 100px;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #ddd;
          resize: none;
          font-family: inherit;
        }
        .btn-send-feedback {
          background: #28a745;
          color: white;
          border: none;
          width: 100%;
          padding: 15px;
          border-radius: 10px;
          font-weight: bold;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.3s;
        }
        .btn-send-feedback:hover { background: #218838; }
      `}} />
    </div>
  );
}