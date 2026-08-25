import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const idRef = useRef(0);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const toast = useMemo(() => ({
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info'),
  }), [addToast]);

  // Make toast callable directly: toast.success(), toast.error(), etc.
  // But also provide a confirm() that returns a promise
  const confirm = useCallback((message, title = 'Confirm') => {
    return new Promise((resolve) => {
      setConfirmState({ message, title, resolve });
    });
  }, []);

  const handleConfirm = (result) => {
    if (confirmState?.resolve) confirmState.resolve(result);
    setConfirmState(null);
  };

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
  };

  const colors = {
    success: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', color: '#34d399' },
    error: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', color: '#f87171' },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' },
    info: { bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.4)', color: '#818cf8' },
  };

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Toast Container */}
      <div style={{
        position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px',
      }}>
        {toasts.map(t => {
          const c = colors[t.type] || colors.info;
          return (
            <div key={t.id} style={{
              background: c.bg, border: `1px solid ${c.border}`, color: c.color,
              padding: '14px 18px', borderRadius: '12px',
              display: 'flex', alignItems: 'center', gap: '12px',
              backdropFilter: 'blur(12px)',
              animation: 'fadeIn 0.25s ease-out',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}>
              {icons[t.type]}
              <span style={{ flex: 1, fontSize: '0.95rem', color: 'var(--text-main, #e2e8f0)' }}>{t.message}</span>
              <button onClick={() => dismissToast(t.id)} style={{
                background: 'none', border: 'none', color: c.color, cursor: 'pointer', padding: '2px',
              }}>
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirm Modal */}
      {confirmState && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <div style={{
            background: 'var(--glass-bg, rgba(15, 23, 42, 0.95))',
            border: '1px solid var(--border, rgba(148, 163, 184, 0.1))',
            borderRadius: '16px', padding: '32px', maxWidth: '420px', width: '90%',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                background: 'rgba(245, 158, 11, 0.15)', padding: '8px', borderRadius: '8px',
                display: 'flex',
              }}>
                <AlertTriangle size={22} color="#fbbf24" />
              </div>
              <h3 style={{ margin: 0 }}>{confirmState.title}</h3>
            </div>
            <p style={{ color: 'var(--text-muted, #94a3b8)', marginBottom: '24px', lineHeight: 1.6 }}>
              {confirmState.message}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="secondary" onClick={() => handleConfirm(false)} style={{ padding: '10px 20px' }}>
                Cancel
              </button>
              <button className="primary" onClick={() => handleConfirm(true)} style={{ padding: '10px 20px' }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
