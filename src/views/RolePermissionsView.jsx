import React from 'react';
import { useSystem } from '../context/SystemContext';
import { Shield, Key, CheckCircle2, Lock, UserCheck, Gavel, Crown } from 'lucide-react';

export const RolePermissionsView = () => {
  const { currentUser, setCurrentUser, addNotification } = useSystem();

  const permissionsMatrix = [
    { module: 'Mission Control & Phase State Machine', superAdmin: true, podiumAdmin: false, manager: false, spectator: false },
    { module: 'Financial & Rule Configuration', superAdmin: true, podiumAdmin: false, manager: false, spectator: false },
    { module: 'Tier & Category Base Prices', superAdmin: true, podiumAdmin: false, manager: false, spectator: false },
    { module: 'Bidding Math Matrix Rules', superAdmin: true, podiumAdmin: false, manager: false, spectator: false },
    { module: 'Player Directory & Ban Disqualifications', superAdmin: true, podiumAdmin: true, manager: false, spectator: false },
    { module: 'Franchise & Manager Setup', superAdmin: true, podiumAdmin: false, manager: false, spectator: false },
    { module: 'Live Auction Stage Controls (Auctioneer Desk)', superAdmin: true, podiumAdmin: true, manager: false, spectator: false },
    { module: 'Place Live Bids in Auction (Phase 3)', superAdmin: false, podiumAdmin: false, manager: true, spectator: false },
    { module: 'View Public Landing & Standings', superAdmin: true, podiumAdmin: true, manager: true, spectator: true },
    { module: 'Lifecycle Reset Protocols (Danger Zone)', superAdmin: true, podiumAdmin: false, manager: false, spectator: false }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.15) 0%, rgba(0, 217, 255, 0.1) 100%)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield color="#c77dff" /> Role & Admin Permissions Desk
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
          Manage Podium Admin logins, Super Admin privilege levels, and inspect global RBAC access control policies.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
        
        {/* Admin Accounts Overview */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Crown color="var(--accent-gold)" /> Admin Privilege Levels
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', border: '1px solid var(--accent-green)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-green)' }}>👑 LEVEL 1: SUPER ADMIN</span>
                <span className="badge badge-green">FULL ACCESS</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Unrestricted system control. Can execute state machine phase shifts, modify financial math rules, manage managers, and trigger Level 1-3 Nuke resets.
              </p>
            </div>

            <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', border: '1px solid var(--accent-gold)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-gold)' }}>🎙️ LEVEL 2: PODIUM ADMIN (AUCTIONEER)</span>
                <span className="badge badge-gold">STAGE ACCESS</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Controls the Live Podium desk during Phase 3. Can pull players to stage, start/stop timers, accept normal/blind bids, and finalize player sales.
              </p>
            </div>

            <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', border: '1px solid var(--accent-cyan)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>🛡️ LEVEL 3: TEAM MANAGER</span>
                <span className="badge badge-cyan">BIDDING ONLY</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Franchise access token. Can place incremental and sealed blind bids for their assigned team during Phase 3, constrained by backend Budget Guardrails.
              </p>
            </div>

          </div>
        </div>

        {/* Global RBAC Permissions Matrix */}
        <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock color="var(--accent-cyan)" /> Global Role Access Control Matrix
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 8px' }}>FEATURE / MODULE</th>
                <th style={{ padding: '10px 8px', textAlign: 'center' }}>SUPER ADMIN</th>
                <th style={{ padding: '10px 8px', textAlign: 'center' }}>PODIUM ADMIN</th>
                <th style={{ padding: '10px 8px', textAlign: 'center' }}>MANAGER</th>
                <th style={{ padding: '10px 8px', textAlign: 'center' }}>PUBLIC</th>
              </tr>
            </thead>
            <tbody>
              {permissionsMatrix.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px 8px', fontWeight: 600 }}>{row.module}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    {row.superAdmin ? <CheckCircle2 size={16} color="var(--accent-green)" /> : <Lock size={14} color="var(--text-dim)" />}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    {row.podiumAdmin ? <CheckCircle2 size={16} color="var(--accent-gold)" /> : <Lock size={14} color="var(--text-dim)" />}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    {row.manager ? <CheckCircle2 size={16} color="var(--accent-cyan)" /> : <Lock size={14} color="var(--text-dim)" />}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    {row.spectator ? <CheckCircle2 size={16} color="var(--text-muted)" /> : <Lock size={14} color="var(--text-dim)" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
