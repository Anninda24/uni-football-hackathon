import React from 'react';
import { useSystemPhase } from '../context/SystemPhaseContext';
import { useAuth } from '../context/AuthContext';
import { Shield, Home, LogIn, BookOpen, Calendar, Radio, Trophy, Lock, UserCheck, UserPlus } from 'lucide-react';

export function PublicLayout({ activeRoute, setActiveRoute, children }) {
  const { currentPhase, isRegistration, isAuction, isTournament } = useSystemPhase();
  const { currentUser } = useAuth();

  const navItems = [
    { id: 'PUBLIC_HOME', label: 'Home', icon: Home, enabled: true },
    { id: 'PUBLIC_RULEBOOK', label: 'Rulebook', icon: BookOpen, enabled: true },
    { id: 'PUBLIC_SCHEDULE', label: 'Schedule', icon: Calendar, enabled: true },
    {
      id: 'PUBLIC_LIVE_AUCTION',
      label: 'Live Auction',
      icon: Radio,
      enabled: isAuction,
      phaseNotice: 'Active in Phase 3: Auction'
    },
    {
      id: 'PUBLIC_LIVE_TOURNAMENT',
      label: 'Live Tournament',
      icon: Trophy,
      enabled: true
    }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark, #0b0f19)', color: 'var(--text-main, #f8fafc)' }}>
      {/* Top Public Navigation Bar */}
      <nav style={{
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0 32px',
        height: '74px',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* Brand Logo */}
        <div
          onClick={() => setActiveRoute('PUBLIC_HOME')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center'
          }}>
            <Shield style={{ color: '#fff', width: '22px', height: '22px' }} />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
            GSTU CSE <span style={{ color: '#3b82f6' }}>FOOTBALL TOURNAMENT</span>
          </span>
        </div>

        {/* Public Navigation Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.id;
            const isDisabled = !item.enabled;

            return (
              <button
                key={item.id}
                disabled={isDisabled}
                onClick={() => {
                  if (!isDisabled) setActiveRoute(item.id);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  color: isDisabled ? '#475569' : isActive ? '#60a5fa' : '#cbd5e1',
                  fontSize: '0.86rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  opacity: isDisabled ? 0.6 : 1
                }}
              >
                <Icon style={{ width: '16px', height: '16px', color: isActive ? '#3b82f6' : isDisabled ? '#475569' : '#94a3b8' }} />
                <span>{item.label}</span>
                {isDisabled && (
                  <span style={{ fontSize: '0.65rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Lock style={{ width: '10px', height: '10px' }} />
                    Phase Only
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Top Right Corner Auth Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {currentUser.role !== 'SPECTATOR' && (
            <button
              onClick={() => setActiveRoute('DEFAULT')}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <UserCheck style={{ width: '14px', height: '14px' }} />
              <span>Go to {currentUser.role.replace('_', ' ')} Dashboard</span>
            </button>
          )}

          {/* Login Button — Always Available */}
          <button
            onClick={() => setActiveRoute('PUBLIC_LOGIN')}
            style={{
              background: activeRoute === 'PUBLIC_LOGIN' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              color: '#60a5fa',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <LogIn style={{ width: '15px', height: '15px' }} />
            <span>Login</span>
          </button>

          {/* Register Button — ONLY shown in Phase 2: Registration */}
          {isRegistration && (
            <button
              onClick={() => setActiveRoute('PUBLIC_REGISTER')}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <UserPlus style={{ width: '15px', height: '15px' }} />
              <span>Register</span>
            </button>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '32px 24px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        {children}
      </main>

      {/* Public Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '24px 32px',
        background: 'rgba(15, 23, 42, 0.95)',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>GSTU CSE Football Tournament — Official Departmental Franchise & Tournament Platform</div>
        <div>Current League Phase: <strong style={{ color: currentPhase.badgeColor }}>{currentPhase.label}</strong></div>
      </footer>
    </div>
  );
}
