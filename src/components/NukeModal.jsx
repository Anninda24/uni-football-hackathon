import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { Bomb, ShieldAlert, AlertTriangle, Trash2, RefreshCw, X } from 'lucide-react';

export const NukeModal = ({ onClose }) => {
  const { executeNukeProtocol } = useSystem();
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [passcode, setPasscode] = useState('');

  const handleConfirmNuke = (level) => {
    if (passcode.toUpperCase() !== 'NUKE') {
      alert("Invalid Passcode! Type 'NUKE' to confirm irreversible wipe.");
      return;
    }

    executeNukeProtocol(level);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '650px', border: '2px solid var(--accent-red)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bomb color="var(--accent-red)" size={28} />
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--accent-red)' }}>
                THE "LIFECYCLE RESET" (NUKE PROTOCOLS)
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Super Admin Exclusive Protocol to purge seasonal data & cloud storage assets.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '4px 8px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Level Selector Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
          
          {/* Level 1 */}
          <div
            onClick={() => setSelectedLevel(1)}
            style={{
              background: selectedLevel === 1 ? 'rgba(255, 183, 3, 0.15)' : 'var(--bg-input)',
              border: selectedLevel === 1 ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span className="badge badge-gold" style={{ fontSize: '0.8rem' }}>LEVEL 1: TOURNAMENT WIPE</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reverts to Post-Auction</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
              Deletes all match fixtures, scores, points tables, football stats, and news. Retains drafted teams, managers, and auction rosters.
            </p>
          </div>

          {/* Level 2 */}
          <div
            onClick={() => setSelectedLevel(2)}
            style={{
              background: selectedLevel === 2 ? 'rgba(255, 77, 109, 0.15)' : 'var(--bg-input)',
              border: selectedLevel === 2 ? '2px solid var(--accent-red)' : '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span className="badge badge-red" style={{ fontSize: '0.8rem' }}>LEVEL 2: ROSTER WIPE (INC. CLOUD MEDIA)</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reverts to Phase 1 (SETUP)</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
              Deletes all players, teams, managers, auction ledgers, and <strong>destroys Cloud Storage image assets</strong> (no orphaned images). Retains event rules, tiers, and base prices.
            </p>
          </div>

          {/* Level 3 */}
          <div
            onClick={() => setSelectedLevel(3)}
            style={{
              background: selectedLevel === 3 ? 'rgba(157, 78, 221, 0.2)' : 'var(--bg-input)',
              border: selectedLevel === 3 ? '2px solid var(--accent-purple)' : '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span className="badge badge-purple" style={{ fontSize: '0.8rem' }}>LEVEL 3: FACTORY RESET (NUCLEAR)</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Full System Purge</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
              Drops all tables and purges all media folders/cloud images. Clears everything except Super Admin credentials and resets system to initial factory seed.
            </p>
          </div>

        </div>

        {/* Confirmation Passcode Entry */}
        {selectedLevel && (
          <div style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--accent-red)', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '10px' }}>
              <AlertTriangle size={16} /> CONFIRM LEVEL {selectedLevel} PROTOCOL EXECUTION
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Type 'NUKE' to Confirm Action *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Type NUKE"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                style={{ textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800 }}
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => handleConfirmNuke(selectedLevel)}
            disabled={!selectedLevel || passcode.toUpperCase() !== 'NUKE'}
            className="btn btn-danger"
            style={{ flex: 1, padding: '12px', fontSize: '0.95rem' }}
          >
            <Bomb size={18} /> Execute Level {selectedLevel || ''} Reset
          </button>
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
