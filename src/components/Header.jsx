import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, LogIn } from 'lucide-react';

export function Header({ activeRoute, setActiveRoute }) {
  const { currentUser, logout, isAuthenticated } = useAuth();

  return (
    <header style={{
      height: '70px',
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand & Logo Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
        }}>
          <Shield style={{ color: '#fff', width: '24px', height: '24px' }} />
        </div>

        <div>
          <div style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            GSTU CSE Football
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>
            OFFICIAL TOURNAMENT PLATFORM
          </div>
        </div>
      </div>

      {/* Auth Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>

        {/* User Auth Action Pill — pushed to far right */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isAuthenticated ? (
            <button
              onClick={() => {
                logout();
                if (setActiveRoute) setActiveRoute('PUBLIC_HOME');
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <LogOut style={{ width: '14px', height: '14px' }} />
              <span>Logout</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (setActiveRoute) setActiveRoute('PUBLIC_LOGIN');
              }}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              <LogIn style={{ width: '14px', height: '14px' }} />
              <span>Login / Register</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
