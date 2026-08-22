import React, { useState, useEffect } from 'react';
import { useSystem } from '../context/SystemContext';
import { useAuth } from '../context/AuthContext';
import { Search, User, Shield, Users, Layers, Activity, Gavel, Key, Radio, X } from 'lucide-react';

export const CommandPalette = ({ isOpen, onClose, setActiveModule, onEditPlayer, onEditManager }) => {
  const { players, managers, teams, systemState, changePhase } = useSystem();
  const { currentUser } = useAuth();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.studentId.toLowerCase().includes(query.toLowerCase()) ||
    p.jerseyName.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const filteredManagers = managers.filter(m =>
    m.name.toLowerCase().includes(query.toLowerCase()) ||
    m.email.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const filteredTeams = teams.filter(t =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.managerName.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', padding: '20px', borderRadius: '16px' }}
      >
        {/* Search Input Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', pb: '14px', marginBottom: '16px' }}>
          <Search size={20} color="var(--accent-green)" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, player name, manager, or phase..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontSize: '1.1rem',
              fontWeight: 600,
              width: '100%',
              outline: 'none'
            }}
          />
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '4px 8px' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '420px', overflowY: 'auto' }}>
          
          {/* System Phase Actions — SUPER_ADMIN only */}
          {currentUser.role === 'SUPER_ADMIN' && (
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
                SYSTEM PHASE QUICK ACTIONS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {['SETUP', 'REGISTRATION', 'THE_AUCTION', 'TOURNAMENT'].map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      changePhase(p);
                      onClose();
                    }}
                    style={{
                      background: systemState.currentPhase === p ? 'rgba(0, 230, 153, 0.2)' : 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'var(--text-main)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>Switch to {p}</span>
                    {systemState.currentPhase === p && <span className="badge badge-green">ACTIVE</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sockets / Health Check */}
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
              SYSTEM DIAGNOSTICS & MODULE SHORTCUTS
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setActiveModule('MISSION_CONTROL'); onClose(); }}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              >
                <Activity size={14} color="var(--accent-green)" /> Mission Control & Socket Ping
              </button>
              <button
                onClick={() => { setActiveModule('CATEGORIES'); onClose(); }}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              >
                <Layers size={14} color="var(--accent-cyan)" /> Category Base Prices
              </button>
              <button
                onClick={() => { setActiveModule('BIDDING_MATRIX'); onClose(); }}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              >
                <Gavel size={14} color="var(--accent-gold)" /> Bidding Math Matrix
              </button>
            </div>
          </div>

          {/* Players Search Results */}
          {filteredPlayers.length > 0 && (
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
                PLAYERS DIRECTORY MATCHES ({filteredPlayers.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {filteredPlayers.map(player => (
                  <div
                    key={player.id}
                    onClick={() => {
                      setActiveModule('PLAYERS');
                      if (onEditPlayer) onEditPlayer(player);
                      onClose();
                    }}
                    style={{
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={player.imageUrl} alt="" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{player.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {player.studentId} • {player.primaryPosition}</div>
                      </div>
                    </div>
                    <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>View Profile</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Managers Search Results */}
          {filteredManagers.length > 0 && (
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
                MANAGERS MATCHES ({filteredManagers.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {filteredManagers.map(mgr => (
                  <div
                    key={mgr.id}
                    onClick={() => {
                      setActiveModule('MANAGERS');
                      if (onEditManager) onEditManager(mgr);
                      onClose();
                    }}
                    style={{
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={mgr.imageUrl} alt="" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{mgr.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{mgr.email} • {mgr.mobile || 'No mobile'}</div>
                      </div>
                    </div>
                    <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>Edit Manager</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center' }}>
          Press <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>ESC</kbd> to close Command Palette
        </div>

      </div>
    </div>
  );
};
