import React from 'react';
import { useSystem } from '../context/SystemContext';
import { Gavel, Radio, Lock, ArrowRight, Play, Eye } from 'lucide-react';
import { LiveAuctionView } from './LiveAuctionView';

export const LiveOperationsView = ({ onNavigateToTab }) => {
  const { systemState } = useSystem();

  const isAuctionPhase = systemState.currentPhase === 'THE_AUCTION' || systemState.currentPhase === 'AUCTION';

  if (!isAuctionPhase) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '40px 24px', border: '1px solid rgba(255, 183, 3, 0.3)' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(255, 183, 3, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            color: 'var(--accent-gold)'
          }}>
            <Lock size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '8px' }}>
            Live Operations Center Disabled & Locked
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            The Podium Controller / Auctioneer desk is strictly locked outside Phase 3 (THE AUCTION).
            Current Global Phase is <strong style={{ color: 'var(--accent-green)' }}>{systemState.currentPhase}</strong>.
          </p>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Complete Phase 1 prerequisites and advance to Phase 3 via Mission Control to unlock live stage controls.
          </div>
        </div>
      </div>
    );
  }

  // Render Full Podium Controls when in Phase 3
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="live-pulse"></span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--accent-gold)' }}>
            LIVE AUCTION PODIUM OPERATIONAL DESK
          </h2>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Super Admin / Podium Controller Desk Active
        </div>
      </div>

      <LiveAuctionView isPodiumAdmin={true} />
    </div>
  );
};
