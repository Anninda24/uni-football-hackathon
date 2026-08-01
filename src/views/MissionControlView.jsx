import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { Activity, Radio, Shield, Users, UserCheck, DollarSign, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Cpu, Database } from 'lucide-react';

export const MissionControlView = () => {
  const { systemState, changePhase, teams, players, managers, currentUser } = useSystem();
  
  const [pendingPhase, setPendingPhase] = useState(null);
  const [confirmStep, setConfirmStep] = useState(0); // 0 = none, 1 = warning, 2 = confirm text
  const [typedConfirm, setTypedConfirm] = useState('');

  // Calculations
  const approvedPlayers = players.filter(p => p.status === 'APPROVED');
  const soldPlayers = players.filter(p => p.status === 'SOLD');
  const totalAllocatedBudget = teams.reduce((acc, t) => acc + t.budget, 0);
  const totalSpentBudget = teams.reduce((acc, t) => acc + t.spent, 0);

  const startPhaseTransition = (newPhase) => {
    if (newPhase === systemState.currentPhase) return;
    setPendingPhase(newPhase);
    setConfirmStep(1);
    setTypedConfirm('');
  };

  const handleExecuteTransition = () => {
    if (pendingPhase) {
      changePhase(pendingPhase);
      setPendingPhase(null);
      setConfirmStep(0);
      setTypedConfirm('');
    }
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(0, 230, 153, 0.12) 0%, rgba(0, 217, 255, 0.08) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity color="var(--accent-green)" /> Mission Control — Global State Engine
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
              Real-time monitoring hub for system phase transitions, WebSocket health telemetry, and state machine integrity.
            </p>
          </div>

          {/* Real-time WebSocket Ping Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.4)', padding: '8px 16px', borderRadius: '30px', border: '1px solid var(--border-color)' }}>
            <span className="live-pulse" style={{ background: '#00e699', boxShadow: '0 0 10px #00e699' }}></span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
              WS Live (12ms latency)
            </span>
          </div>
        </div>
      </div>

      {/* System Health Telemetry Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>ACTIVE PHASE</span>
            <Activity size={16} color="var(--accent-green)" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '8px', color: 'var(--accent-green)' }}>
            {systemState.currentPhase}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            State Machine Active
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>FRANCHISE TEAMS</span>
            <Users size={16} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '8px', color: 'var(--text-main)' }}>
            {teams.length} Franchises
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            {managers.length} Managers Linked
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>PLAYER REGISTRATIONS</span>
            <UserCheck size={16} color="var(--accent-gold)" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '8px', color: 'var(--accent-gold)' }}>
            {players.length} Total ({approvedPlayers.length} Approved)
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            {soldPlayers.length} Drafted / Sold
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>LEAGUE BUDGET ALLOCATION</span>
            <DollarSign size={16} color="var(--accent-green)" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '8px', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
            ${totalAllocatedBudget.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Spent: ${totalSpentBudget.toLocaleString()}
          </div>
        </div>

      </div>

      {/* Global Phase Transition Controller */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw color="var(--accent-green)" /> State Machine Phase Transition Hub
        </h3>
        
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Transitioning global phases updates state rules, locks specific administrative modules, and notifies connected WebSocket subscribers in real time.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {[
            { phase: 'SETUP', name: 'Phase 1: SETUP', desc: 'Configure total budget, player tiers, bidding math matrix & franchises.', color: 'purple' },
            { phase: 'REGISTRATION', name: 'Phase 2: REGISTRATION', desc: 'Open player portal for candidate profile & document submissions.', color: 'cyan' },
            { phase: 'THE_AUCTION', name: 'Phase 3: THE AUCTION', desc: 'Live auction podium bidding stage for team managers & podium admin.', color: 'gold' },
            { phase: 'TOURNAMENT', name: 'Phase 4: TOURNAMENT', desc: 'Fixtures, legged matches, live standings points table & player statistics.', color: 'green' }
          ].map(p => {
            const isCurrent = systemState.currentPhase === p.phase;
            return (
              <div
                key={p.phase}
                style={{
                  background: isCurrent ? 'rgba(0, 230, 153, 0.1)' : 'var(--bg-card-solid)',
                  border: isCurrent ? '2px solid var(--accent-green)' : '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>{p.name}</span>
                    {isCurrent && <span className="badge badge-green">ACTIVE</span>}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {p.desc}
                  </p>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <button
                    onClick={() => startPhaseTransition(p.phase)}
                    disabled={isCurrent || currentUser.role !== 'SUPER_ADMIN'}
                    className={`btn ${isCurrent ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ width: '100%', fontSize: '0.82rem' }}
                  >
                    {isCurrent ? 'Current Active Phase' : `Transition to ${p.phase}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-step Confirmation Modal for Phase Transition */}
      {confirmStep > 0 && pendingPhase && (
        <div className="modal-overlay" onClick={() => setConfirmStep(0)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: 'var(--accent-gold)' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                Confirm Phase Transition: {systemState.currentPhase} &rarr; {pendingPhase}
              </h3>
            </div>

            {confirmStep === 1 && (
              <div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '16px', lineHeight: 1.5 }}>
                  You are about to transition the global state machine to <strong>{pendingPhase}</strong>.
                  This change will affect active navigation locking, player portal registration status, and live WebSocket broadcasts.
                </p>
                <div style={{ background: 'rgba(255, 183, 3, 0.1)', border: '1px solid rgba(255, 183, 3, 0.3)', padding: '12px', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--accent-gold)', marginBottom: '20px' }}>
                  ⚠️ Step 1 of 2: Please acknowledge that module access policies will immediately re-sync across all connected manager sessions.
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setConfirmStep(2)} className="btn btn-gold" style={{ flex: 1 }}>
                    Proceed to Step 2 (Security Prompt)
                  </button>
                  <button onClick={() => setConfirmStep(0)} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {confirmStep === 2 && (
              <div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Step 2 of 2: Type <strong>TRANSITION</strong> below to authorize phase state change:
                </p>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type TRANSITION"
                  value={typedConfirm}
                  onChange={(e) => setTypedConfirm(e.target.value.toUpperCase())}
                  style={{ marginBottom: '20px', letterSpacing: '0.1em', fontWeight: 700 }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleExecuteTransition}
                    disabled={typedConfirm !== 'TRANSITION'}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    Execute Phase Change
                  </button>
                  <button onClick={() => setConfirmStep(0)} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
