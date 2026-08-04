import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystemPhase, SYSTEM_PHASES } from '../context/SystemPhaseContext';
import { Shield, ChevronDown, User, LogOut, LogIn, Activity } from 'lucide-react';

export function Header({ activeRoute, setActiveRoute }) {
  const { currentUser, logout, PRESET_ACCOUNTS, isAuthenticated } = useAuth();
  const { currentPhase, setPhase } = useSystemPhase();
  const [showPhaseMenu, setShowPhaseMenu] = useState(false);

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '#ef4444' };
      case 'PODIUM_ADMIN':
        return { bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '#a855f7' };
      case 'TEAM_MANAGER':
        return { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '#f59e0b' };
      case 'PLAYER':
        return { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '#3b82f6' };
      default:
        return { bg: 'rgba(156, 163, 175, 0.15)', color: '#9ca3af', border: '#6b7280' };
    }
  };

  const roleStyle = getRoleBadgeStyle(currentUser.role);

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

      {/* Global Phase Status & Role Control Tools */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>

        {/* System Phase Status Dropdown — SUPER_ADMIN only */}
        {currentUser.role === 'SUPER_ADMIN' && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowPhaseMenu(!showPhaseMenu)}
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: `1px solid ${currentPhase.badgeColor}55`,
                borderRadius: '20px',
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#f8fafc',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Activity style={{ width: '14px', height: '14px', color: currentPhase.badgeColor }} />
              <span>{currentPhase.label}</span>
              <span style={{
                fontSize: '0.68rem',
                background: `${currentPhase.badgeColor}33`,
                color: currentPhase.badgeColor,
                padding: '2px 8px',
                borderRadius: '10px',
                fontWeight: 700
              }}>
                ACTIVE
              </span>
              <ChevronDown style={{ width: '14px', height: '14px', opacity: 0.6 }} />
            </button>

            {showPhaseMenu && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '260px',
                background: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
                padding: '8px',
                zIndex: 200
              }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', padding: '6px 10px', fontWeight: 700, textTransform: 'uppercase' }}>
                  System Phase Controller
                </div>
                {Object.values(SYSTEM_PHASES).map((phase) => (
                  <button
                    key={phase.id}
                    onClick={() => {
                      setPhase(phase.id);
                      setShowPhaseMenu(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: currentPhase.id === phase.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      color: currentPhase.id === phase.id ? '#60a5fa' : '#cbd5e1',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      margin: '2px 0'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{phase.label}</span>
                      {currentPhase.id === phase.id && (
                        <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 800 }}>✓</span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400 }}>{phase.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

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
