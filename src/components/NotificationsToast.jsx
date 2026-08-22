import React from 'react';
import { useSystem } from '../context/SystemContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const NotificationsToast = () => {
  const { notifications } = useSystem();

  if (!notifications || notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '380px',
      width: '100%'
    }}>
      {notifications.map(n => (
        <div
          key={n.id}
          className="glass-panel"
          style={{
            padding: '14px 18px',
            borderRadius: '14px',
            background: 'var(--bg-card-solid)',
            borderLeft: `4px solid ${
              n.type === 'success' ? 'var(--accent-green)' :
              n.type === 'error' ? 'var(--accent-red)' :
              n.type === 'warning' ? 'var(--accent-gold)' : 'var(--accent-cyan)'
            }`,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {n.type === 'success' && <CheckCircle2 size={20} color="var(--accent-green)" style={{ shrink: 0, marginTop: '2px' }} />}
          {n.type === 'error' && <AlertCircle size={20} color="var(--accent-red)" style={{ shrink: 0, marginTop: '2px' }} />}
          {n.type === 'warning' && <AlertTriangle size={20} color="var(--accent-gold)" style={{ shrink: 0, marginTop: '2px' }} />}
          {n.type === 'info' && <Info size={20} color="var(--accent-cyan)" style={{ shrink: 0, marginTop: '2px' }} />}

          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0 }}>{n.title}</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0', lineHeight: 1.3 }}>{n.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
