import React from 'react';
import { Edit3 } from 'lucide-react';

export function AggregateMatchCard({ legs, teams, isAdmin, onEdit }) {
  if (!legs || legs.length < 2) return null;
  legs.sort((a, b) => a.leg - b.leg);
  const leg1 = legs[0];
  const leg2 = legs[1];
  const teamA = teams.find(t => t.id === leg1.teamAId) || {};
  const teamB = teams.find(t => t.id === leg1.teamBId) || {};
  const colorA = teamA.color || '#3b82f6';
  const colorB = teamB.color || '#ef4444';
  // Aggregate from leg1 perspective: teamA is home in leg1
  const homeGoals = legs.reduce((s, l) => s + (l.teamAId === leg1.teamAId ? l.scoreA : l.scoreB), 0);
  const awayGoals = legs.reduce((s, l) => s + (l.teamBId === leg1.teamBId ? l.scoreB : l.scoreA), 0);
  const dates = legs.map(l => l.scheduledTime ? new Date(l.scheduledTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '').filter(Boolean);

  return (
    <div style={{ marginBottom: 12, borderRadius: 12, border: '1px solid rgba(168,85,247,0.3)', background: 'linear-gradient(135deg, rgba(168,85,247,0.05), var(--bg-card))' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid rgba(168,85,247,0.2)', fontSize: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="sa-two-legged-badge">TWO-LEGGED</span>
          <span style={{ color: 'var(--text-muted)' }}>Aggregate Result · {dates.join(' – ')}</span>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => onEdit(leg1)} style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', color: '#c084fc', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Edit3 size={12} /> Leg 1
            </button>
            <button onClick={() => onEdit(leg2)} style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', color: '#c084fc', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Edit3 size={12} /> Leg 2
            </button>
          </div>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '16px 24px', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: colorA }}></div>
            <span style={{ fontWeight: 700 }}>{teamA.name || leg1.teamAName}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#c084fc' }}>ON AGGREGATE</span>
          <span className="sa-score-display">{homeGoals} – {awayGoals}</span>
          <div style={{ display: 'flex', gap: 8, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span>Leg 1: {leg1.scoreA}-{leg1.scoreB}</span>
            <span>·</span>
            <span>Leg 2: {leg2.scoreA}-{leg2.scoreB}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700 }}>{teamB.name || leg1.teamBName}</span>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: colorB }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
