import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystem } from '../context/SystemContext';
import { Bomb, AlertTriangle, ShieldAlert } from 'lucide-react';

export const DangerZoneView = ({ onOpenNukeModal }) => {
  const { currentUser } = useAuth();

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(255, 77, 109, 0.15) 0%, rgba(201, 24, 74, 0.1) 100%)', border: '1px solid rgba(255, 77, 109, 0.4)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-red)' }}>
          <Bomb size={28} /> Danger Zone — Lifecycle Reset Protocols
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
          Strict administrative access point for executing Level 1, Level 2 (Roster & Cloud Asset Wipe), and Level 3 (Factory Reset) reset protocols.
        </p>
      </div>

      {!isSuperAdmin ? (
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--accent-red)' }}>
          <ShieldAlert size={36} style={{ marginBottom: '10px' }} />
          <h3>Unauthorized Access Level</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Only Super Admin role level can execute Danger Zone protocols.
          </p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: 'rgba(255, 77, 109, 0.1)', border: '1px solid rgba(255, 77, 109, 0.3)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent-red)' }}>
            <AlertTriangle size={24} />
            <div style={{ fontSize: '0.88rem' }}>
              <strong>CAUTION:</strong> Executing lifecycle reset actions permanently purges system tables, match histories, and player Cloudinary images.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            
            <div style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '8px' }}>
                LEVEL 1: TOURNAMENT WIPE
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '16px' }}>
                Deletes matches, scores, points tables, stats, and news posts. Reverts state to exact moment auction completed.
              </p>
            </div>

            <div style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-red)', marginBottom: '8px' }}>
                LEVEL 2: ROSTER & CLOUD ASSET WIPE
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '16px' }}>
                Wipes players, rosters, managers, auction ledgers, and triggers API hook to delete Cloudinary media files. Retains rules.
              </p>
            </div>

            <div style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--accent-red)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-red)', marginBottom: '8px' }}>
                LEVEL 3: FACTORY RESET (NUCLEAR)
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '16px' }}>
                Drops all custom database state, wipes local storage, purges media folders, and resets system to initial factory state.
              </p>
            </div>

          </div>

          <button
            onClick={onOpenNukeModal}
            className="btn btn-danger"
            style={{ padding: '14px', fontSize: '1rem', marginTop: '10px' }}
          >
            <Bomb size={20} /> Open Lifecycle Reset Protocol Modal (Nuke Control)
          </button>

        </div>
      )}

    </div>
  );
};
