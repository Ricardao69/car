import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        pointerEvents: 'none'
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.85rem',
              fontFamily: "'Outfit', sans-serif",
              color: '#fff',
              pointerEvents: 'auto',
              animation: 'toastIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: t.type === 'success'
                ? 'linear-gradient(135deg, rgba(16,185,129,0.9), rgba(16,185,129,0.7))'
                : t.type === 'error'
                  ? 'linear-gradient(135deg, rgba(239,68,68,0.9), rgba(239,68,68,0.7))'
                  : 'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(59,130,246,0.7))',
              borderLeft: `4px solid ${t.type === 'success' ? '#10b981' : t.type === 'error' ? '#ef4444' : '#3b82f6'}`
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>
              {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
