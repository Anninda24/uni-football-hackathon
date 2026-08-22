import React from 'react';
import { useSystem } from '../context/SystemContext';
import { 
  Trophy, 
  Gavel, 
  UserCheck, 
  LayoutDashboard, 
  Settings, 
  Bomb, 
  Users, 
  Calendar, 
  Award, 
  Newspaper,
  SlidersHorizontal,
  ChevronRight,
  Star,
  Target,
  TrendingUp,
  Crown,
  Clock
} from 'lucide-react';

export const Navigation = ({ activeTab, setActiveTab, setShowNukeModal }) => {
  const { systemState, changePhase, currentUser, teams } = useSystem();

  const getPhaseBadgeColor = (phase) => {
    switch (phase) {
      case 'SETUP': return 'badge-purple';
      case 'REGISTRATION': return 'badge-cyan';
      case 'THE_AUCTION': return 'badge-gold';
      case 'TOURNAMENT': return 'badge-green';
      default: return 'badge-purple';
    }
  };

  return (
    <header className="glass-panel" style={{ borderRadius: '0 0 16px 16px', marginBottom: '24px', borderTop: 'none' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '14px 24px' }}>
        
        {/* Top Header Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
          
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #00e699 0%, #00d9ff 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0, 230, 153, 0.4)',
              fontSize: '1.4rem'
            }}>
              ⚽
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                UNI FOOTBALL <span className="gradient-text-green">FRANCHISE LEAGUE</span>
              </h1>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Official League Platform</span> • <span>State Machine Architecture</span>
              </div>
            </div>
          </div>

          {/* Center: System Phase Indicator & Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '6px 14px', borderRadius: '30px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>SYSTEM STATE:</span>
            <span className={`badge ${getPhaseBadgeColor(systemState.currentPhase)}`} style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
              {systemState.currentPhase === 'THE_AUCTION' && <span className="live-pulse" style={{ marginRight: '6px' }}></span>}
              {systemState.currentPhase}
            </span>

            {/* Super Admin State Override Dropdown */}
            {currentUser.role === 'SUPER_ADMIN' && (
              <select
                value={systemState.currentPhase}
                onChange={(e) => changePhase(e.target.value)}
                style={{
                  background: 'var(--bg-input)',
                  color: 'var(--accent-green)',
                  border: '1px solid var(--accent-green-glow)',
                  borderRadius: '16px',
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <option value="SETUP" style={{ background: '#121826', color: '#f8fafc' }}>Phase 1: SETUP</option>
                <option value="REGISTRATION" style={{ background: '#121826', color: '#f8fafc' }}>Phase 2: REGISTRATION</option>
                <option value="THE_AUCTION" style={{ background: '#121826', color: '#f8fafc' }}>Phase 3: THE AUCTION</option>
                <option value="TOURNAMENT" style={{ background: '#121826', color: '#f8fafc' }}>Phase 4: TOURNAMENT</option>
              </select>
            )}
          </div>

          {/* Right: Nuke Trigger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Nuke Protocol Button (Super Admin) */}
            {currentUser.role === 'SUPER_ADMIN' && (
              <button 
                onClick={() => setShowNukeModal(true)}
                className="btn btn-danger"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                title="Execute Nuke Protocols"
              >
                <Bomb size={16} /> RESET (NUKE)
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Navigation Tabs based on System State & Actor Role */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '12px', overflowX: 'auto' }}>
          
          {/* Landing / Main View Tab */}
          <button
            onClick={() => setActiveTab('LANDING')}
            className={`btn ${activeTab === 'LANDING' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '8px 16px' }}
          >
            <LayoutDashboard size={16} /> 
            {systemState.currentPhase === 'SETUP' && 'Landing & Rules'}
            {systemState.currentPhase === 'REGISTRATION' && 'Player Registration Portal'}
            {systemState.currentPhase === 'THE_AUCTION' && 'Live Auction Podium'}
            {systemState.currentPhase === 'TOURNAMENT' && 'Tournament Hub'}
          </button>

          {/* Phase 1 & 2 Specific Tabs */}
          {(systemState.currentPhase === 'SETUP' || systemState.currentPhase === 'REGISTRATION') && (
            <>
              <button
                onClick={() => setActiveTab('REGISTER_PLAYER')}
                className={`btn ${activeTab === 'REGISTER_PLAYER' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                <UserCheck size={16} /> Player Portal
              </button>
              
              {currentUser.role === 'SUPER_ADMIN' && (
                <button
                  onClick={() => setActiveTab('EVENT_CONFIG')}
                  className={`btn ${activeTab === 'EVENT_CONFIG' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                >
                  <SlidersHorizontal size={16} /> Event Configuration
                </button>
              )}
            </>
          )}

          {/* Phase 3: Auction Specific Tabs */}
          {systemState.currentPhase === 'THE_AUCTION' && (
            <>
              <button
                onClick={() => setActiveTab('AUCTION_PODIUM')}
                className={`btn ${activeTab === 'AUCTION_PODIUM' ? 'btn-gold' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                <Gavel size={16} /> Live Bidding Podium
              </button>
              
              {currentUser.role === 'PODIUM_ADMIN' && (
                <button
                  onClick={() => setActiveTab('PODIUM_CONTROL')}
                  className={`btn ${activeTab === 'PODIUM_CONTROL' ? 'btn-gold' : 'btn-secondary'}`}
                  style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                >
                  <Settings size={16} /> Podium Admin Desk
                </button>
              )}
            </>
          )}

          {/* Phase 4: Tournament Specific Tabs */}
          {systemState.currentPhase === 'TOURNAMENT' && (
            <>
              <button
                onClick={() => setActiveTab('MATCHES')}
                className={`btn ${activeTab === 'MATCHES' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                <Calendar size={16} /> Matches & Legged Fixtures
              </button>
              <button
                onClick={() => setActiveTab('STANDINGS')}
                className={`btn ${activeTab === 'STANDINGS' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                <Trophy size={16} /> Points Table
              </button>
              <button
                onClick={() => setActiveTab('STATS')}
                className={`btn ${activeTab === 'STATS' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                <Award size={16} /> Player Stats
              </button>
              <button
                onClick={() => setActiveTab('NEWS')}
                className={`btn ${activeTab === 'NEWS' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                <Newspaper size={16} /> League News
              </button>
            </>
          )}

          {/* Common Rosters / Teams View Tab */}
          <button
            onClick={() => setActiveTab('TEAMS')}
            className={`btn ${activeTab === 'TEAMS' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '8px 16px' }}
          >
            <Users size={16} /> Franchises & Rosters
          </button>

          {/* Icon Player Role Tabs */}
          {currentUser.role === 'ICON_PLAYER' && (
            <>
              <button
                onClick={() => setActiveTab('CAPTAIN_DASHBOARD')}
                className={`btn ${activeTab === 'CAPTAIN_DASHBOARD' ? 'btn-gold' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                <Crown size={16} /> Captain Dashboard
              </button>
              <button
                onClick={() => setActiveTab('MY_TEAM')}
                className={`btn ${activeTab === 'MY_TEAM' ? 'btn-gold' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                <Users size={16} /> My Team Info
              </button>
              <button
                onClick={() => setActiveTab('MATCH_CENTER')}
                className={`btn ${activeTab === 'MATCH_CENTER' ? 'btn-gold' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                <Calendar size={16} /> Match Center
              </button>
              <button
                onClick={() => setActiveTab('TEAM_PERFORMANCE')}
                className={`btn ${activeTab === 'TEAM_PERFORMANCE' ? 'btn-gold' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                <TrendingUp size={16} /> Team Performance Stats
              </button>
              <button
                onClick={() => setActiveTab('CAPTAIN_ANNOUNCEMENTS')}
                className={`btn ${activeTab === 'CAPTAIN_ANNOUNCEMENTS' ? 'btn-gold' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                <Newspaper size={16} /> Captain Announcements
              </button>
            </>
          )}

          {/* Spectator Before Auction Role Tabs */}
          {currentUser.role === 'SPECTATOR' && (
            <>
              <button
                onClick={() => setActiveTab('HOME_PAGE')}
                className={`btn ${activeTab === 'HOME_PAGE' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                <LayoutDashboard size={16} /> Home Page
              </button>
              <button
                onClick={() => setActiveTab('REGISTERED_PLAYERS')}
                className={`btn ${activeTab === 'REGISTERED_PLAYERS' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                <UserCheck size={16} /> Registered Players List
              </button>
              <button
                onClick={() => setActiveTab('TEAM_ANNOUNCEMENTS')}
                className={`btn ${activeTab === 'TEAM_ANNOUNCEMENTS' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                <Newspaper size={16} /> Team Announcements
              </button>
              <button
                onClick={() => setActiveTab('RULES_CATEGORIES')}
                className={`btn ${activeTab === 'RULES_CATEGORIES' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                <SlidersHorizontal size={16} /> Rules & Categories Overview
              </button>
              <button
                onClick={() => setActiveTab('AUCTION_SCHEDULE')}
                className={`btn ${activeTab === 'AUCTION_SCHEDULE' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                <Calendar size={16} /> Auction Schedule
              </button>
              <button
                onClick={() => setActiveTab('NEWS_UPDATES')}
                className={`btn ${activeTab === 'NEWS_UPDATES' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                <Newspaper size={16} /> News and Updates
              </button>
              <button
                onClick={() => setActiveTab('COUNTDOWN_TIMER')}
                className={`btn ${activeTab === 'COUNTDOWN_TIMER' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                <Clock size={16} /> Countdown Timer
              </button>
            </>
          )}

        </nav>

      </div>
    </header>
  );
};
