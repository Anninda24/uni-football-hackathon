import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { Percent, Calculator, CheckCircle2, RefreshCw } from 'lucide-react';

export const BiddingMathMatrixView = () => {
  const { systemState, setSystemState, calculateMinimumRaise, addNotification } = useSystem();

  // Test Calculator State
  const [testBidInput, setTestBidInput] = useState(15000);

  // Math Tiers local form state
  const [tiers, setTiers] = useState(systemState.raiseTiers || []);

  const handleUpdateTier = (id, field, value) => {
    setTiers(prev => prev.map(t => t.id === id ? { ...t, [field]: Number(value) } : t));
  };

  const handleSaveTiers = (e) => {
    e.preventDefault();
    setSystemState(prev => ({
      ...prev,
      raiseTiers: tiers
    }));
    addNotification('success', 'Bidding Matrix Locked', 'Percentage raise tiers successfully updated.');
  };

  // Preview Calculator calculation
  const totalBudget = systemState.totalBudget || 100000;
  const currentBidNum = Number(testBidInput) || 0;
  const currentBidPct = ((currentBidNum / totalBudget) * 100).toFixed(2);
  
  const calculatedRaise = calculateMinimumRaise(currentBidNum);
  const nextMinBid = currentBidNum + calculatedRaise;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.12) 0%, rgba(157, 78, 221, 0.08) 100%)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Percent color="var(--accent-cyan)" /> Bidding Math Matrix & Live Preview Calculator
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
          Configure percentage-based raise tiers and test bid increment logic with the built-in simulator before locking rules.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        
        {/* Tier Config Form */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Percent color="var(--accent-cyan)" /> Configurable Minimum Raise Tiers
          </h3>

          <form onSubmit={handleSaveTiers}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              {tiers.map((tier, idx) => {
                const minVal = Math.round(totalBudget * (tier.minBudgetPct / 100));
                const maxVal = Math.round(totalBudget * (tier.maxBudgetPct / 100));
                const raiseVal = Math.round((totalBudget * (tier.raisePct / 100)) / 100) * 100;
                return (
                  <div key={tier.id} style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Tier {idx + 1}: Range {tier.minBudgetPct}% &ndash; {tier.maxBudgetPct}% of Budget</span>
                      <span className="badge badge-cyan">+{tier.raisePct}% Raise (+${raiseVal.toLocaleString()})</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Min % Budget</label>
                        <input
                          type="number"
                          className="form-control"
                          value={tier.minBudgetPct}
                          onChange={(e) => handleUpdateTier(tier.id, 'minBudgetPct', e.target.value)}
                          step="0.5"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Max % Budget</label>
                        <input
                          type="number"
                          className="form-control"
                          value={tier.maxBudgetPct}
                          onChange={(e) => handleUpdateTier(tier.id, 'maxBudgetPct', e.target.value)}
                          step="0.5"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Raise %</label>
                        <input
                          type="number"
                          className="form-control"
                          value={tier.raisePct}
                          onChange={(e) => handleUpdateTier(tier.id, 'raisePct', e.target.value)}
                          step="0.05"
                          min="0.05"
                          max="10"
                        />
                      </div>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '8px' }}>
                      Applies to bid amounts from ${minVal.toLocaleString()} up to ${maxVal.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Lock & Apply Bidding Math Tiers
            </button>
          </form>
        </div>

        {/* Built-in Live Preview Calculator */}
        <div className="glass-panel" style={{ padding: '28px', background: 'var(--bg-card-solid)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calculator color="var(--accent-gold)" /> Built-in Live Preview Calculator
          </h3>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
            Test math logic in real time before locking rules for Phase 3 (THE AUCTION).
          </p>

          <div className="form-group">
            <label className="form-label">Simulated Current Bid Amount ($)</label>
            <input
              type="number"
              className="form-control"
              value={testBidInput}
              onChange={(e) => setTestBidInput(e.target.value)}
              step="100"
              style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>BID AS PERCENTAGE OF TOTAL BUDGET (${totalBudget.toLocaleString()})</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {currentBidPct}% of Budget
              </div>
            </div>

            <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>CALCULATED MANDATORY MINIMUM RAISE</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>
                +${calculatedRaise.toLocaleString()}
              </div>
            </div>

            <div style={{ background: 'rgba(0, 230, 153, 0.12)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(0, 230, 153, 0.3)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>NEXT MINIMUM PERMISSIBLE BID</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                ${nextMinBid.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
