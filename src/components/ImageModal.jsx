import React from 'react';
import { X } from 'lucide-react';

export default function ImageModal({ imageUrl, onClose }) {
  if (!imageUrl) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem',
        animation: 'fadeIn 0.2s ease forwards'
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '-40px', right: 0,
            background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
            padding: '0.5rem',
            zIndex: 10000
          }}
        >
          <X size={32} />
        </button>
        <img 
          src={imageUrl} 
          alt="Full screen" 
          style={{
            maxWidth: '100%',
            maxHeight: '85vh',
            objectFit: 'contain',
            borderRadius: '8px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            animation: 'zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }} 
        />
      </div>
    </div>
  );
}
