import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { Sliders, DollarSign } from 'lucide-react';

export const FinancialRulesView = () => {
  const { systemState, setSystemState, setTeams, addNotification } = useSystem();

  const [totalBudget, setTotalBudget] = useState(systemState.totalBudget || 100000);
  const [minRoster, setMinRoster] = useState(systemState.minRoster || 7);
  const [maxRoster, setMaxRoster] = useState(systemState.maxRoster || 15);

  const handleSubmit = (e) => {
    e.preventDefault();

    const budgetNum = Number(totalBudget);
    const minRosterNum = Number(minRoster);
    const maxRosterNum = Number(maxRoster);

    if (minRosterNum > maxRosterNum) {
      addNotification('error', 'Rule Constraint Error', 'Minimum roster size cannot exceed maximum roster size.');
      return;
    }

    setSystemState(prev => ({
      ...prev,
      totalBudget: budgetNum,
      minRoster: minRosterNum,
      maxRoster: maxRosterNum
    }));

    setTeams(prev => prev.map(t => ({
      ...t,
      budget: budgetNum - t.spent
    })));

    addNotification('success', 'Rules Saved', `Total Budget set to $${budgetNum.toLocaleString()}, Min Roster ${minRosterNum}, Max Roster ${maxRosterNum}.`);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.12) 0%, rgba(0, 230, 153, 0.08) 100%)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sliders color="var(--accent-cyan)" /> Financial & Rule Config Desk
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
          Configure global franchise budget allowances, minimum/maximum squad roster constraints, and automated backend guardrails.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign color="var(--accent-gold)" /> Financial Allowance Settings
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Total Team Budget Allowance ($)</label>
            <input
              type="number"
              className="form-control"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              step="5000"
              min="10000"
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Equal starting allowance allocated to all franchise teams ($100,000 default).
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Min Roster Size</label>
              <input
                type="number"
                className="form-control"
                value={minRoster}
                onChange={(e) => setMinRoster(e.target.value)}
                min="1"
                max="25"
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Min squad size limit
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Max Roster Size</label>
              <input
                type="number"
                className="form-control"
                value={maxRoster}
                onChange={(e) => setMaxRoster(e.target.value)}
                min="1"
                max="30"
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Max squad cap limit
              </span>
            </div>
          </div>

          <button type="submit" className="btn btn-gold" style={{ width: '100%', marginTop: '14px' }}>
            Save Rule Configuration
          </button>
        </form>
      </div>

    </div>
  );
};
