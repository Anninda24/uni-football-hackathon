import React from 'react';
import { useSystem } from '../context/SystemContext';
import { 
  Sliders, 
  Activity, 
  Shield, 
  Percent, 
  Users, 
  UserCheck, 
  UserCog, 
  Lock, 
  Radio, 
  AlertTriangle, 
  Layers, 
  Settings, 
  Bomb, 
  Search, 
  Trophy, 
  Gavel, 
  ExternalLink,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export const AdminSidebar = ({ activeModule, setActiveModule, setShowNukeModal, onOpenCommandPalette }) => {
  const { systemState, changePhase, currentUser, setCurrentUser, teams } = useSystem();

  const handleRoleChange = (role, teamId = null) => {
    let name = 'Super Admin';
    if (role === 'PODIUM_ADMIN') name = 'The Auctioneer (Podium Admin)';
    if (role === 'TEAM_MANAGER') {
      const t = teams.find(team => team.id === teamId) || teams[0];
      name = `Manager: ${t.name}`;
      teamId = t?.id || null;
    }
    if (role === 'PLAYER') name = 'Julian Sterling (Player)';
    if (role === 'SPECTATOR') name = 'Public Spectator';

    setCurrentUser({
      id: 'usr-' + role.toLowerCase(),
      name,
      email: role.toLowerCase() + '@football.com',
      role,
      teamId
    });
  };

  const getPhaseBadge = (phase) => {
    switch (phase) {
      case 'SETUP': return { label: 'PHASE 1: SETUP', color: 'badge-purple' };
      case 'REGISTRATION': return { label: 'PHASE 2: REGISTRATION', color: 'badge-cyan' };
      case 'THE_AUCTION': return { label: 'PHASE 3: THE AUCTION', color: 'badge-gold' };
      case 'TOURNAMENT': return { label: 'PHASE 4: TOURNAMENT', color: 'badge-green' };
      default: return { label: phase, color: 'badge-purple' };
    }
  };

  const currentBadge = getPhaseBadge(systemState.currentPhase);

  // Helper to determine menu item locking/warnings
  const isPhase3 = systemState.currentPhase === 'THE_AUCTION';
  const isPhase4 = systemState.currentPhase === 'TOURNAMENT';

  return (
    <aside style={{
      width: '280px',
      minWidth: '280px',
      background: 'rgba(12, 17, 29, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      userSelect: 'none'
    }}>
      {/* 1. Header Area: Branding & Logo */}
      <div style={{ padding: '20px 18px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #00e699 0%, #00d9ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(0, 230, 153, 0.35)',
            fontSize: '1.3rem'
          }}>
            ⚽
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: '6px' }}>
              UniLeague <span className="gradient-text-green">Admin</span>
            </h1>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              State Machine Engine v2.4
            </div>
          </div>
        </div>

        {/* Phase Badge Widget */}
        <div style={{
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700 }}>GLOBAL PHASE:</span>
          <span className={`badge ${currentBadge.color}`} style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
            {isPhase3 && <span className="live-pulse" style={{ marginRight: '4px' }}></span>}
            {systemState.currentPhase}
          </span>
        </div>

        {/* Actor Simulator Selector */}
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.04em' }}>ACTOR ROLE:</label>
          <select
            value={currentUser.role === 'TEAM_MANAGER' ? `TM-${currentUser.teamId}` : currentUser.role}
            onChange={(e) => {
              const val = e.target.value;
              if (val.startsWith('TM-')) {
                handleRoleChange('TEAM_MANAGER', val.replace('TM-', ''));
              } else {
                handleRoleChange(val);
              }
            }}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--accent-cyan)',
              borderRadius: '8px',
              color: 'var(--accent-cyan)',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '6px 10px',
              outline: 'none',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            <option value="SUPER_ADMIN">👑 Super Admin</option>
            <option value="PODIUM_ADMIN">🎙️ Podium Admin (Auctioneer)</option>
            {teams.map(t => (
              <option key={t.id} value={`TM-${t.id}`}>🛡️ Manager: {t.name}</option>
            ))}
            <option value="SPECTATOR">👁️ Spectator View</option>
          </select>
        </div>

        {/* Quick Command Palette Button */}
        <button
          onClick={onOpenCommandPalette}
          className="btn btn-secondary"
          style={{ width: '100%', marginTop: '12px', padding: '6px 10px', fontSize: '0.78rem', justifyContent: 'space-between', borderRadius: '8px' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search size={14} color="var(--accent-green)" /> Quick Search
          </span>
          <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Structured Sidebar Navigation Links */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Section A: System Core */}
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px 6px 8px' }}>
            SECTION A: SYSTEM CORE
          </div>
          
          <button
            onClick={() => setActiveModule('MISSION_CONTROL')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '9px 12px',
              borderRadius: '10px',
              background: activeModule === 'MISSION_CONTROL' ? 'rgba(0, 230, 153, 0.15)' : 'transparent',
              color: activeModule === 'MISSION_CONTROL' ? 'var(--accent-green)' : 'var(--text-main)',
              border: activeModule === 'MISSION_CONTROL' ? '1px solid rgba(0, 230, 153, 0.3)' : '1px solid transparent',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={16} color={activeModule === 'MISSION_CONTROL' ? 'var(--accent-green)' : 'var(--text-muted)'} />
              Mission Control
            </span>
            <span className="badge badge-green" style={{ fontSize: '0.62rem', padding: '2px 6px' }}>LIVE</span>
          </button>
        </div>

        {/* Section B: Event Setup & Rules (Phase 1 Focus) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px 6px 8px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              SECTION B: SETUP & RULES
            </span>
            {(isPhase3 || isPhase4) && (
              <span title="Rules locked in active auction/tournament" style={{ fontSize: '0.65rem', color: 'var(--accent-gold)' }}>
                <Lock size={12} />
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={() => setActiveModule('FINANCIAL_RULES')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '10px',
                background: activeModule === 'FINANCIAL_RULES' ? 'rgba(0, 217, 255, 0.15)' : 'transparent',
                color: activeModule === 'FINANCIAL_RULES' ? 'var(--accent-cyan)' : 'var(--text-main)',
                border: activeModule === 'FINANCIAL_RULES' ? '1px solid rgba(0, 217, 255, 0.3)' : '1px solid transparent',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sliders size={16} color={activeModule === 'FINANCIAL_RULES' ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                Financial & Rule Config
              </span>
            </button>

            <button
              onClick={() => setActiveModule('CATEGORIES')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '10px',
                background: activeModule === 'CATEGORIES' ? 'rgba(0, 217, 255, 0.15)' : 'transparent',
                color: activeModule === 'CATEGORIES' ? 'var(--accent-cyan)' : 'var(--text-main)',
                border: activeModule === 'CATEGORIES' ? '1px solid rgba(0, 217, 255, 0.3)' : '1px solid transparent',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Layers size={16} color={activeModule === 'CATEGORIES' ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                Tier & Category Manager
              </span>
              {systemState.currentPhase === 'REGISTRATION' && (
                <span title="Modifying base prices requires sync" style={{ color: 'var(--accent-gold)' }}>
                  <AlertTriangle size={12} />
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveModule('BIDDING_MATRIX')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '10px',
                background: activeModule === 'BIDDING_MATRIX' ? 'rgba(0, 217, 255, 0.15)' : 'transparent',
                color: activeModule === 'BIDDING_MATRIX' ? 'var(--accent-cyan)' : 'var(--text-main)',
                border: activeModule === 'BIDDING_MATRIX' ? '1px solid rgba(0, 217, 255, 0.3)' : '1px solid transparent',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Percent size={16} color={activeModule === 'BIDDING_MATRIX' ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                Bidding Math Matrix
              </span>
            </button>
          </div>
        </div>

        {/* Section C: Entities & Roster Management */}
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px 6px 8px' }}>
            SECTION C: ENTITIES & ROSTER
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={() => setActiveModule('PLAYERS')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '10px',
                background: activeModule === 'PLAYERS' ? 'rgba(0, 230, 153, 0.15)' : 'transparent',
                color: activeModule === 'PLAYERS' ? 'var(--accent-green)' : 'var(--text-main)',
                border: activeModule === 'PLAYERS' ? '1px solid rgba(0, 230, 153, 0.3)' : '1px solid transparent',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserCheck size={16} color={activeModule === 'PLAYERS' ? 'var(--accent-green)' : 'var(--text-muted)'} />
                Player Directory
              </span>
            </button>

            <button
              onClick={() => setActiveModule('TEAMS')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '10px',
                background: activeModule === 'TEAMS' ? 'rgba(0, 230, 153, 0.15)' : 'transparent',
                color: activeModule === 'TEAMS' ? 'var(--accent-green)' : 'var(--text-main)',
                border: activeModule === 'TEAMS' ? '1px solid rgba(0, 230, 153, 0.3)' : '1px solid transparent',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={16} color={activeModule === 'TEAMS' ? 'var(--accent-green)' : 'var(--text-muted)'} />
                Franchise & Team Setup
              </span>
            </button>

            <button
              onClick={() => setActiveModule('MANAGERS')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '10px',
                background: activeModule === 'MANAGERS' ? 'rgba(0, 230, 153, 0.15)' : 'transparent',
                color: activeModule === 'MANAGERS' ? 'var(--accent-green)' : 'var(--text-main)',
                border: activeModule === 'MANAGERS' ? '1px solid rgba(0, 230, 153, 0.3)' : '1px solid transparent',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserCog size={16} color={activeModule === 'MANAGERS' ? 'var(--accent-green)' : 'var(--text-muted)'} />
                Manager Management
              </span>
            </button>

            <button
              onClick={() => setActiveModule('ROLES_PERMISSIONS')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '10px',
                background: activeModule === 'ROLES_PERMISSIONS' ? 'rgba(157, 78, 221, 0.15)' : 'transparent',
                color: activeModule === 'ROLES_PERMISSIONS' ? '#c77dff' : 'var(--text-main)',
                border: activeModule === 'ROLES_PERMISSIONS' ? '1px solid rgba(157, 78, 221, 0.3)' : '1px solid transparent',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield size={16} color={activeModule === 'ROLES_PERMISSIONS' ? '#c77dff' : 'var(--text-muted)'} />
                Role & Admin Permissions
              </span>
            </button>
          </div>
        </div>

        {/* Section D: System Operations (Bottom Tier) */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px 6px 8px' }}>
            SECTION D: SYSTEM OPERATIONS
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {/* Live Operations Center (Disabled/Locked until Phase 3) */}
            <button
              onClick={() => {
                if (isPhase3) setActiveModule('LIVE_OPERATIONS');
              }}
              disabled={!isPhase3}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '10px',
                background: activeModule === 'LIVE_OPERATIONS' ? 'rgba(255, 183, 3, 0.15)' : 'transparent',
                color: isPhase3 ? (activeModule === 'LIVE_OPERATIONS' ? 'var(--accent-gold)' : 'var(--text-main)') : 'var(--text-dim)',
                border: activeModule === 'LIVE_OPERATIONS' ? '1px solid rgba(255, 183, 3, 0.3)' : '1px solid transparent',
                cursor: isPhase3 ? 'pointer' : 'not-allowed',
                opacity: isPhase3 ? 1 : 0.5,
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Gavel size={16} color={isPhase3 ? 'var(--accent-gold)' : 'var(--text-dim)'} />
                Live Operations Center
              </span>
              {!isPhase3 ? (
                <Lock size={14} color="var(--text-dim)" />
              ) : (
                <span className="badge badge-gold" style={{ fontSize: '0.6rem', padding: '2px 5px' }}>STAGE</span>
              )}
            </button>

            {/* Danger Zone */}
            <button
              onClick={() => setActiveModule('DANGER_ZONE')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '10px',
                background: activeModule === 'DANGER_ZONE' ? 'rgba(255, 77, 109, 0.15)' : 'transparent',
                color: activeModule === 'DANGER_ZONE' ? 'var(--accent-red)' : 'var(--text-main)',
                border: activeModule === 'DANGER_ZONE' ? '1px solid rgba(255, 77, 109, 0.3)' : '1px solid transparent',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bomb size={16} color={activeModule === 'DANGER_ZONE' ? 'var(--accent-red)' : 'var(--text-muted)'} />
                Danger Zone (Reset)
              </span>
            </button>
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border-color)', fontSize: '0.72rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>UniLeague Admin v2.4</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-green)' }}>
          <span className="live-pulse" style={{ width: '6px', height: '6px' }}></span> Online
        </span>
      </div>
    </aside>
  );
};
