import React from 'react';
import { useSystem } from '../context/SystemContext';
import { 
  Sliders, 
  SlidersHorizontal,
  Activity, 
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
  ShieldAlert,
  Crown,
  Calendar,
  TrendingUp,
  Newspaper,
  LayoutDashboard,
  Clock
} from 'lucide-react';

export const AdminSidebar = ({ activeModule, setActiveModule, setShowNukeModal, onOpenCommandPalette }) => {
  const { systemState, changePhase, currentUser, setCurrentUser, teams } = useSystem();

  const handleRoleChange = (role) => {
    setCurrentUser({
      id: role === 'ICON_PLAYER' ? 'usr-icon-player' : role === 'SPECTATOR' ? 'usr-spectator' : 'usr-super-admin',
      name: role === 'ICON_PLAYER' ? 'Icon Player' : role === 'SPECTATOR' ? 'Spectator (Before Auction)' : 'Super Admin',
      email: role === 'ICON_PLAYER' ? 'icon@football.com' : role === 'SPECTATOR' ? 'spectator@football.com' : 'admin@football.com',
      role,
      teamId: null
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
            value={currentUser.role}
            onChange={(e) => handleRoleChange(e.target.value)}
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
            <option value="ICON_PLAYER">⭐ Icon Player</option>
            <option value="SPECTATOR">👁️ Spectator (Before Auction)</option>
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

        {/* Super Admin Sidebar Sections */}
        {currentUser.role === 'SUPER_ADMIN' && (
          <>
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
          </>
        )}

        {/* Icon Player Sidebar Section */}
        {currentUser.role === 'ICON_PLAYER' && (
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px 6px 8px' }}>
              CAPTAIN HUB
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button onClick={() => setActiveModule('CAPTAIN_DASHBOARD')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', background: activeModule === 'CAPTAIN_DASHBOARD' ? 'rgba(255, 183, 3, 0.15)' : 'transparent', color: activeModule === 'CAPTAIN_DASHBOARD' ? 'var(--accent-gold)' : 'var(--text-main)', border: activeModule === 'CAPTAIN_DASHBOARD' ? '1px solid rgba(255, 183, 3, 0.3)' : '1px solid transparent', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}><Crown size={16} color={activeModule === 'CAPTAIN_DASHBOARD' ? 'var(--accent-gold)' : 'var(--text-muted)'} /> Captain Dashboard</button>
              <button onClick={() => setActiveModule('MY_TEAM')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', background: activeModule === 'MY_TEAM' ? 'rgba(255, 183, 3, 0.15)' : 'transparent', color: activeModule === 'MY_TEAM' ? 'var(--accent-gold)' : 'var(--text-main)', border: activeModule === 'MY_TEAM' ? '1px solid rgba(255, 183, 3, 0.3)' : '1px solid transparent', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}><Users size={16} color={activeModule === 'MY_TEAM' ? 'var(--accent-gold)' : 'var(--text-muted)'} /> My Team Info</button>
              <button onClick={() => setActiveModule('MATCH_CENTER')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', background: activeModule === 'MATCH_CENTER' ? 'rgba(255, 183, 3, 0.15)' : 'transparent', color: activeModule === 'MATCH_CENTER' ? 'var(--accent-gold)' : 'var(--text-main)', border: activeModule === 'MATCH_CENTER' ? '1px solid rgba(255, 183, 3, 0.3)' : '1px solid transparent', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}><Calendar size={16} color={activeModule === 'MATCH_CENTER' ? 'var(--accent-gold)' : 'var(--text-muted)'} /> Match Center</button>
              <button onClick={() => setActiveModule('TEAM_PERFORMANCE')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', background: activeModule === 'TEAM_PERFORMANCE' ? 'rgba(255, 183, 3, 0.15)' : 'transparent', color: activeModule === 'TEAM_PERFORMANCE' ? 'var(--accent-gold)' : 'var(--text-main)', border: activeModule === 'TEAM_PERFORMANCE' ? '1px solid rgba(255, 183, 3, 0.3)' : '1px solid transparent', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}><TrendingUp size={16} color={activeModule === 'TEAM_PERFORMANCE' ? 'var(--accent-gold)' : 'var(--text-muted)'} /> Team Performance Stats</button>
              <button onClick={() => setActiveModule('CAPTAIN_ANNOUNCEMENTS')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', background: activeModule === 'CAPTAIN_ANNOUNCEMENTS' ? 'rgba(255, 183, 3, 0.15)' : 'transparent', color: activeModule === 'CAPTAIN_ANNOUNCEMENTS' ? 'var(--accent-gold)' : 'var(--text-main)', border: activeModule === 'CAPTAIN_ANNOUNCEMENTS' ? '1px solid rgba(255, 183, 3, 0.3)' : '1px solid transparent', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}><Newspaper size={16} color={activeModule === 'CAPTAIN_ANNOUNCEMENTS' ? 'var(--accent-gold)' : 'var(--text-muted)'} /> Captain Announcements</button>
            </div>
          </div>
        )}

        {/* Spectator Before Auction Sidebar Section */}
        {currentUser.role === 'SPECTATOR' && (
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px 6px 8px' }}>
              SPECTATOR HUB
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button onClick={() => setActiveModule('HOME_PAGE')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', background: activeModule === 'HOME_PAGE' ? 'rgba(0, 217, 255, 0.15)' : 'transparent', color: activeModule === 'HOME_PAGE' ? 'var(--accent-cyan)' : 'var(--text-main)', border: activeModule === 'HOME_PAGE' ? '1px solid rgba(0, 217, 255, 0.3)' : '1px solid transparent', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}><LayoutDashboard size={16} color={activeModule === 'HOME_PAGE' ? 'var(--accent-cyan)' : 'var(--text-muted)'} /> Home Page</button>
              <button onClick={() => setActiveModule('REGISTERED_PLAYERS')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', background: activeModule === 'REGISTERED_PLAYERS' ? 'rgba(0, 217, 255, 0.15)' : 'transparent', color: activeModule === 'REGISTERED_PLAYERS' ? 'var(--accent-cyan)' : 'var(--text-main)', border: activeModule === 'REGISTERED_PLAYERS' ? '1px solid rgba(0, 217, 255, 0.3)' : '1px solid transparent', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}><UserCheck size={16} color={activeModule === 'REGISTERED_PLAYERS' ? 'var(--accent-cyan)' : 'var(--text-muted)'} /> Registered Players List</button>
              <button onClick={() => setActiveModule('TEAM_ANNOUNCEMENTS')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', background: activeModule === 'TEAM_ANNOUNCEMENTS' ? 'rgba(0, 217, 255, 0.15)' : 'transparent', color: activeModule === 'TEAM_ANNOUNCEMENTS' ? 'var(--accent-cyan)' : 'var(--text-main)', border: activeModule === 'TEAM_ANNOUNCEMENTS' ? '1px solid rgba(0, 217, 255, 0.3)' : '1px solid transparent', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}><Newspaper size={16} color={activeModule === 'TEAM_ANNOUNCEMENTS' ? 'var(--accent-cyan)' : 'var(--text-muted)'} /> Team Announcements</button>
              <button onClick={() => setActiveModule('RULES_CATEGORIES')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', background: activeModule === 'RULES_CATEGORIES' ? 'rgba(0, 217, 255, 0.15)' : 'transparent', color: activeModule === 'RULES_CATEGORIES' ? 'var(--accent-cyan)' : 'var(--text-main)', border: activeModule === 'RULES_CATEGORIES' ? '1px solid rgba(0, 217, 255, 0.3)' : '1px solid transparent', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}><SlidersHorizontal size={16} color={activeModule === 'RULES_CATEGORIES' ? 'var(--accent-cyan)' : 'var(--text-muted)'} /> Rules & Categories Overview</button>
              <button onClick={() => setActiveModule('AUCTION_SCHEDULE')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', background: activeModule === 'AUCTION_SCHEDULE' ? 'rgba(0, 217, 255, 0.15)' : 'transparent', color: activeModule === 'AUCTION_SCHEDULE' ? 'var(--accent-cyan)' : 'var(--text-main)', border: activeModule === 'AUCTION_SCHEDULE' ? '1px solid rgba(0, 217, 255, 0.3)' : '1px solid transparent', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}><Calendar size={16} color={activeModule === 'AUCTION_SCHEDULE' ? 'var(--accent-cyan)' : 'var(--text-muted)'} /> Auction Schedule</button>
              <button onClick={() => setActiveModule('NEWS_UPDATES')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', background: activeModule === 'NEWS_UPDATES' ? 'rgba(0, 217, 255, 0.15)' : 'transparent', color: activeModule === 'NEWS_UPDATES' ? 'var(--accent-cyan)' : 'var(--text-main)', border: activeModule === 'NEWS_UPDATES' ? '1px solid rgba(0, 217, 255, 0.3)' : '1px solid transparent', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}><Newspaper size={16} color={activeModule === 'NEWS_UPDATES' ? 'var(--accent-cyan)' : 'var(--text-muted)'} /> News and Updates</button>
              <button onClick={() => setActiveModule('COUNTDOWN_TIMER')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', background: activeModule === 'COUNTDOWN_TIMER' ? 'rgba(0, 217, 255, 0.15)' : 'transparent', color: activeModule === 'COUNTDOWN_TIMER' ? 'var(--accent-cyan)' : 'var(--text-main)', border: activeModule === 'COUNTDOWN_TIMER' ? '1px solid rgba(0, 217, 255, 0.3)' : '1px solid transparent', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}><Clock size={16} color={activeModule === 'COUNTDOWN_TIMER' ? 'var(--accent-cyan)' : 'var(--text-muted)'} /> Countdown Timer</button>
            </div>
          </div>
        )}

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
