import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystem } from '../context/SystemContext';
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const LiveValidationBar = () => {
  const { currentUser } = useAuth();
  const { systemState, teams, changePhase } = useSystem();

  const isMinTeams = teams.length >= 2;
  const isHasTier = (systemState.categories || []).length >= 1;
  const isMathValid = (systemState.raiseTiers || []).length >= 1;
  const isBudgetValid = systemState.totalBudget > 0;

  const allPrerequisitesMet = isMinTeams && isHasTier && isMathValid && isBudgetValid;

  return (
    <div style={{
      background: 'rgba(18, 24, 38, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '10px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
      sticky: 'top',
      top: 0,
      zIndex: 90
    }}>
      {/* Title & Phase Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 800 }}>
          <ShieldCheck size={16} color="var(--accent-green)" />
          <span style={{ color: 'var(--text-muted)' }}>PHASE 1 PREREQUISITES VALIDATION BAR:</span>
        </div>

        {allPrerequisitesMet ? (
          <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
            <CheckCircle2 size={12} /> ALL PREREQUISITES PASSED
          </span>
        ) : (
          <span className="badge badge-red" style={{ fontSize: '0.72rem' }}>
            <AlertCircle size={12} /> ACTION REQUIRED BEFORE PHASE 2
          </span>
        )}
      </div>

      {/* Checklist items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        
        {/* Check 1: Teams */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 600 }}>
          {isMinTeams ? (
            <CheckCircle2 size={14} color="var(--accent-green)" />
          ) : (
            <XCircle size={14} color="var(--accent-red)" />
          )}
          <span style={{ color: isMinTeams ? 'var(--text-main)' : 'var(--accent-red)' }}>
            Min 2 Teams ({teams.length}/2)
          </span>
        </div>

        {/* Check 2: Player Tiers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 600 }}>
          {isHasTier ? (
            <CheckCircle2 size={14} color="var(--accent-green)" />
          ) : (
            <XCircle size={14} color="var(--accent-red)" />
          )}
          <span style={{ color: isHasTier ? 'var(--text-main)' : 'var(--accent-red)' }}>
            Tier Defined ({systemState.categories?.length || 0})
          </span>
        </div>

        {/* Check 3: Bidding Math Matrix */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 600 }}>
          {isMathValid ? (
            <CheckCircle2 size={14} color="var(--accent-green)" />
          ) : (
            <XCircle size={14} color="var(--accent-red)" />
          )}
          <span style={{ color: isMathValid ? 'var(--text-main)' : 'var(--accent-red)' }}>
            Math Matrix Validated
          </span>
        </div>

        {/* Check 4: Budget */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 600 }}>
          {isBudgetValid ? (
            <CheckCircle2 size={14} color="var(--accent-green)" />
          ) : (
            <XCircle size={14} color="var(--accent-red)" />
          )}
          <span style={{ color: isBudgetValid ? 'var(--text-main)' : 'var(--accent-red)' }}>
            Budget &gt; $0 (${(systemState.totalBudget || 0).toLocaleString()})
          </span>
        </div>

        {/* Phase Transition Action Trigger */}
        {systemState.currentPhase === 'SETUP' && currentUser.role === 'SUPER_ADMIN' && (
          <button
            onClick={() => changePhase('REGISTRATION')}
            disabled={!allPrerequisitesMet}
            className="btn btn-primary"
            style={{ padding: '4px 12px', fontSize: '0.78rem', borderRadius: '8px' }}
          >
            Launch Phase 2 (REGISTRATION) <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
