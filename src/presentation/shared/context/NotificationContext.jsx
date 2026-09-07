import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

let notifyGlobal = (message, type = 'info') => {};

export const setGlobalNotifier = (fn) => {
  notifyGlobal = fn;
};

export const emitNotification = (message, type = 'info') => {
  notifyGlobal(message, type);
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  React.useEffect(() => {
    setGlobalNotifier(addNotification);
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '420px'
      }}>
        {notifications.map((n) => {
          let bg = '#0284c7';
          let border = '#0369a1';
          let icon = 'ℹ️';

          if (n.type === 'error') {
            bg = '#ef4444';
            border = '#b91c1c';
            icon = '⚠️';
          } else if (n.type === 'success') {
            bg = '#10b981';
            border = '#047857';
            icon = '✅';
          } else if (n.type === 'warning') {
            bg = '#f59e0b';
            border = '#d97706';
            icon = '⚡';
          }

          return (
            <div
              key={n.id}
              style={{
                background: bg,
                color: 'white',
                padding: '14px 18px',
                borderRadius: '10px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                borderLeft: `6px solid ${border}`,
                animation: 'slideIn 0.3s ease-out'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                <span>{n.message}</span>
              </div>
              <button
                onClick={() => removeNotification(n.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      addNotification: emitNotification,
      removeNotification: () => {}
    };
  }
  return context;
};

export default NotificationProvider;
