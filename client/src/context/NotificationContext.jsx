import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback((message, type = 'success', duration = 4500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const newToast = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <NotificationContext.Provider value={{ notify, removeToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast" style={{
            borderColor: toast.type === 'error' ? 'var(--accent-rose)' 
              : toast.type === 'success' ? 'var(--accent-emerald)'
              : toast.type === 'warning' ? 'var(--accent-amber)' : 'var(--accent-blue)'
          }}>
            {toast.type === 'success' && <CheckCircle2 size={18} color="var(--accent-emerald)" />}
            {toast.type === 'error' && <AlertCircle size={18} color="var(--accent-rose)" />}
            {toast.type === 'warning' && <AlertTriangle size={18} color="var(--accent-amber)" />}
            {toast.type === 'info' && <Info size={18} color="var(--accent-blue)" />}
            <div style={{ flex: 1, fontSize: '0.85rem' }}>{toast.message}</div>
            <button 
              onClick={() => removeToast(toast.id)} 
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
