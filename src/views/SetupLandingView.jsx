import React from 'react';
import { useSystem } from '../context/SystemContext';
import {
  Trophy,
  DollarSign,
  Users,
  Percent,
  Shield,
  Calendar,
  Gavel,
  CheckCircle2,
  Info,
  TrendingUp
} from 'lucide-react';

export const SetupLandingView = () => {
  const { systemState, teams, players } = useSystem();

  const lowestBasePrice = systemState.categories.length > 0
    ? Math.min(...systemState.categories.map(c => c.basePrice))
    : 0;

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Hero Banner */}
      <div className="glass-panel" style={{
        padding: '40px 36px',
        background: 'linear-gradient(135deg, rgba(0,230,153,0.12) 0%, rgba(0,217,255,0.07) 50%, rgba(157,78,221,0.08) 100%)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', fontSize: '8rem', opacity: 0.07, userSelect: 'none' }}>⚽</div>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏆</div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '10px' }}>
          University Football <span className="gradient-text-green">Franchise League</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 20px' }}>
          The complete university football franchise management platform — from player registration through
          live auctions to tournament trophy glory.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <span className="badge badge-purple" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Phase 1: SETUP Active
          </span>
          <span className="badge badge-green">
            <CheckCircle2 size={14} /> {teams.length} Franchises Registered
          </span>
          <span className="badge badge-cyan">
            {players.length} Players Registered
          </span>
        </div>
      </div>

      {/* Event Lifecycle Roadmap */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar color="var(--accent-cyan)" /> Event Lifecycle Phases
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[
            { phase: 'SETUP', label: 'Phase 1', desc: 'Configure rules, categories, teams, and bid math.', icon: '⚙️', color: 'var(--accent-purple)', active: true },
            { phase: 'REGISTRATION', label: 'Phase 2', desc: 'Player portal opens. Register, update, or withdraw.', icon: '📝', color: 'var(--accent-cyan)', active: false },
            { phase: 'THE AUCTION', label: 'Phase 3', desc: 'Live franchise bidding in Normal or Blind mode.', icon: '🔨', color: 'var(--accent-gold)', active: false },
            { phase: 'TOURNAMENT', label: 'Phase 4', desc: 'Live matches, standings, stats, and news portal.', icon: '🏆', color: 'var(--accent-green)', active: false }
          ].map((p, i) => (
            <div key={i} style={{
              background: p.active ? `rgba(${p.color === 'var(--accent-purple)' ? '157,78,221' : '0,0,0'},0.1)` : 'var(--bg-card-solid)',
              border: `1px solid ${p.active ? p.color : 'var(--border-color)'}`,
              borderRadius: '14px',
              padding: '18px',
              opacity: p.active ? 1 : 0.6,
              position: 'relative'
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{p.icon}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: p.color, letterSpacing: '0.1em', marginBottom: '4px' }}>
                {p.label}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>{p.phase}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{p.desc}</div>
              {p.active && (
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <span className="badge badge-purple" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>CURRENT</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Rules Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* Budget & Roster Rules */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign color="var(--accent-gold)" /> League Financial Rules
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Total Franchise Budget', value: `$${systemState.totalBudget.toLocaleString()}`, sub: 'Allocated equally to all teams', color: 'var(--accent-gold)' },
              { label: 'Minimum Required Roster', value: `${systemState.minRoster} Players`, sub: 'Budget Guardrail enforced per team', color: 'var(--accent-green)' },
              { label: 'Lowest Base Price (Reserve)', value: `$${lowestBasePrice.toLocaleString()}`, sub: 'Minimum price for any player slot', color: 'var(--accent-cyan)' },
              { label: 'Max Possible Roster Cost', value: `$${systemState.totalBudget.toLocaleString()}`, sub: 'Cannot exceed total franchise budget', color: 'var(--accent-red)' }
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg-input)', padding: '12px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{item.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>{item.sub}</div>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: item.color, fontFamily: 'var(--font-mono)' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bidding Math Tiers */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Percent color="var(--accent-cyan)" /> Dynamic Bidding Math Tiers
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
            Minimum bid raise increments are calculated dynamically based on the current bid as a percentage of the total franchise budget.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {systemState.raiseTiers.map((tier, i) => {
              const raiseVal = Math.max(100, Math.round((systemState.totalBudget * (tier.raisePct / 100)) / 100) * 100);
              const minVal = (systemState.totalBudget * (tier.minBudgetPct / 100));
              const maxVal = (systemState.totalBudget * (tier.maxBudgetPct / 100));
              return (
                <div key={tier.id} style={{ background: 'var(--bg-input)', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                      Bid: ${minVal.toLocaleString()} → ${maxVal.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      ({tier.minBudgetPct}% – {tier.maxBudgetPct}% of budget)
                    </div>
                  </div>
                  <span className="badge badge-cyan" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
                    Min Raise: +${raiseVal.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Player Categories & Franchises */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* Category Tiers */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield color="var(--accent-green)" /> Player Category Tiers & Base Prices
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {systemState.categories.map(cat => {
              const playersInCat = players.filter(p => p.categoryId === cat.id);
              return (
                <div key={cat.id} style={{ background: 'var(--bg-card-solid)', padding: '14px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.color }} />
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: cat.color }}>{cat.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{playersInCat.length} player(s) registered</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                      ${cat.basePrice.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Base Price</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Franchise Teams */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users color="var(--accent-gold)" /> Registered Franchise Teams
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {teams.map(team => (
              <div key={team.id} style={{ background: 'var(--bg-card-solid)', padding: '14px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.6rem' }}>{team.logo}</span>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{team.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Manager: {team.managerName}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                    ${team.budget.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Allowance</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Academic Sessions */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info color="var(--accent-purple)" size={20} /> Eligible Academic Sessions
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {systemState.academicSessions.map(s => (
            <span key={s} className="badge badge-purple" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>{s}</span>
          ))}
        </div>
      </div>

    </div>
  );
};
