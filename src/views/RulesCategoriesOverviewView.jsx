import React from 'react';
import { useSystem } from '../context/SystemContext';
import { SlidersHorizontal, Layers, DollarSign, Shield } from 'lucide-react';

export const RulesCategoriesOverviewView = () => {
  const { systemState } = useSystem();
  const { categories, totalBudget, minRoster, raiseTiers } = systemState;

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Hero Header */}
      <div className="glass-panel" style={{
        padding: '28px',
        background: 'linear-gradient(135deg, rgba(0,217,255,0.1) 0%, rgba(0,230,153,0.07) 100%)',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-20px', right: '-20px', fontSize: '7rem', opacity: 0.05,
          pointerEvents: 'none', userSelect: 'none'
        }}>
          <SlidersHorizontal size={120} color="var(--accent-cyan)" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <SlidersHorizontal size={28} color="var(--accent-cyan)" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>
            Rules & Categories Overview
          </h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
          Player category base prices and financial auction rules.
        </p>
      </div>

      {/* Player Categories */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Layers size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Player Categories</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {categories.map((cat) => (
            <div key={cat.id} className="glass-panel" style={{
              padding: '18px',
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{
                  width: '14px', height: '14px', borderRadius: '4px', flexShrink: 0,
                  background: cat.color, boxShadow: `0 0 10px ${cat.color}40`
                }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {cat.name}
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Category ID</div>
              <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {cat.id}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Base Price</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                ${cat.basePrice.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Rules */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <DollarSign size={18} color="var(--accent-gold)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Financial Rules</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          <div style={{
            background: 'rgba(0,230,153,0.06)', border: '1px solid rgba(0,230,153,0.2)',
            borderRadius: '14px', padding: '16px'
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Total Budget
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
              ${totalBudget.toLocaleString()}
            </div>
          </div>
          <div style={{
            background: 'rgba(0,217,255,0.06)', border: '1px solid rgba(0,217,255,0.2)',
            borderRadius: '14px', padding: '16px'
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Min Roster Size
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
              {minRoster} Players
            </div>
          </div>
        </div>

        <div style={{ marginTop: '4px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} color="var(--accent-gold)" />
              Raise Tiers (Min % of Total Budget)
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {raiseTiers.map((tier, i) => (
              <div key={tier.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)',
                borderRadius: '10px', padding: '12px 16px', flexWrap: 'wrap', gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: 'rgba(255,183,3,0.15)', color: 'var(--accent-gold)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 900
                  }}>{i + 1}</span>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                      {tier.minBudgetPct}% – {tier.maxBudgetPct === 100 ? '100%+' : `${tier.maxBudgetPct}%`} Budget
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      ~${Math.round(totalBudget * (tier.minBudgetPct / 100)).toLocaleString()} – {tier.maxBudgetPct === 100 ? '∞' : `$${Math.round(totalBudget * (tier.maxBudgetPct / 100)).toLocaleString()}`}
                    </div>
                  </div>
                </div>
                <div style={{
                  fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-cyan)',
                  fontFamily: 'var(--font-mono)', background: 'rgba(0,217,255,0.1)',
                  padding: '6px 12px', borderRadius: '8px'
                }}>
                  Min Raise {tier.raisePct}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
