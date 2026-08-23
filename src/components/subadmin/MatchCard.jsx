import React, { useState } from 'react';
import { Play, Square, Trash2, Edit3, Users, Info, Plus, Minus } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export function MatchCard({ match, isAdmin, teams, onStartLive, onFinish, onDelete, onEdit, onScoreChange, onOpenLineup, onOpenInfo }) {
  const [scoreLoading, setScoreLoading] = useState(false);

  const teamA = teams.find(t => t.id === match.teamAId) || {};
  const teamB = teams.find(t => t.id === match.teamBId) || {};

  const colorA = teamA.color || '#3b82f6';
  const colorB = teamB.color || '#ef4444';

  const handleScore = async (side, delta) => {
    const newA = side === 'A' ? Math.max(0, match.scoreA + delta) : match.scoreA;
    const newB = side === 'B' ? Math.max(0, match.scoreB + delta) : match.scoreB;
    setScoreLoading(true);
    try { await onScoreChange(match.id, newA, newB); } finally { setScoreLoading(false); }
  };

  const dateStr = match.scheduledTime ? new Date(match.scheduledTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
  const timeStr = match.scheduledTime ? new Date(match.scheduledTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '';

  const goals = match.events?.filter(e => e.type === 'GOAL') || [];
  const yellows = match.events?.filter(e => e.type === 'YELLOW_CARD') || [];
  const reds = match.events?.filter(e => e.type === 'RED_CARD') || [];

  const aGoals = goals.filter(e => e.teamSide === 'A');
  const bGoals = goals.filter(e => e.teamSide === 'B');
  const aYellows = yellows.filter(e => e.teamSide === 'A');
  const bYellows = yellows.filter(e => e.teamSide === 'B');
  const aReds = reds.filter(e => e.teamSide === 'A');
  const bReds = reds.filter(e => e.teamSide === 'B');

  return (
    <div className={`sa-match-card ${match.status === 'LIVE' ? 'is-live' : ''}`} style={{ marginBottom: 12 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>{dateStr} {timeStr && `· ${timeStr}`} {match.venue && `· ${match.venue}`}</span>
        {match.isTwoLegged && <span className="sa-leg-badge">LEG {match.leg}</span>}
        {isAdmin && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => onOpenLineup(match)} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Users size={12} /> Lineup
            </button>
            <button onClick={() => onOpenInfo(match)} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Info size={12} /> Info
            </button>
            <button onClick={() => onEdit(match)} style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', color: '#fbbf24', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Edit3 size={12} /> Edit
            </button>
            {match.status === 'UPCOMING' && (
              <button onClick={() => onStartLive(match.id)} style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', color: '#4ade80', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Play size={12} /> Start
              </button>
            )}
            {match.status === 'LIVE' && (
              <button onClick={() => onFinish(match.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', color: '#f87171', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Square size={12} /> Finish
              </button>
            )}
            {match.status !== 'COMPLETED' && (
              <button onClick={() => onDelete(match.id)} style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', color: 'rgba(248,113,113,0.7)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Trash2 size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main score row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '16px 24px', gap: 16 }}>
        {/* Team A */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: colorA, boxShadow: `0 0 8px ${colorA}80` }}></div>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>{match.teamAName || teamA.name || 'Team A'}</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{teamA.shortName || ''} · Home</span>
        </div>

        {/* Score / Status */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 160 }}>
          <StatusBadge status={match.status} />
          {match.status === 'UPCOMING' ? (
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 2 }}>VS</span>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isAdmin && match.status === 'LIVE' ? (
                <>
                  <div className="sa-score-control">
                    <button className="sa-score-btn decrement" onClick={() => handleScore('A', -1)} disabled={scoreLoading}><Minus size={10} /></button>
                    <span className="sa-score-display" style={{ fontSize: 28, minWidth: 36, textAlign: 'center' }}>{match.scoreA}</span>
                    <button className="sa-score-btn increment" onClick={() => handleScore('A', 1)} disabled={scoreLoading}><Plus size={10} /></button>
                  </div>
                  <span style={{ fontSize: 24, color: 'var(--text-muted)', fontWeight: 300 }}>-</span>
                  <div className="sa-score-control">
                    <button className="sa-score-btn decrement" onClick={() => handleScore('B', -1)} disabled={scoreLoading}><Minus size={10} /></button>
                    <span className="sa-score-display" style={{ fontSize: 28, minWidth: 36, textAlign: 'center' }}>{match.scoreB}</span>
                    <button className="sa-score-btn increment" onClick={() => handleScore('B', 1)} disabled={scoreLoading}><Plus size={10} /></button>
                  </div>
                </>
              ) : (
                <span className="sa-score-display">{match.scoreA} - {match.scoreB}</span>
              )}
            </div>
          )}
          {match.status === 'LIVE' && match.currentMinute && (
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#f87171', letterSpacing: 1 }}>{match.currentMinute}&apos;</span>
          )}
          {match.penaltyA != null && match.penaltyB != null && match.status === 'COMPLETED' && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({match.penaltyA}-{match.penaltyB} pens)</span>
          )}
        </div>

        {/* Team B */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>{match.teamBName || teamB.name || 'Team B'}</span>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: colorB, boxShadow: `0 0 8px ${colorB}80` }}></div>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{teamB.shortName || ''} · Away</span>
        </div>
      </div>

      {/* Events Row */}
      {(aGoals.length > 0 || bGoals.length > 0 || aYellows.length > 0 || bYellows.length > 0 || aReds.length > 0 || bReds.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, borderTop: '1px solid var(--border-color)', padding: '8px 16px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px' }}>
            {aGoals.map((e, i) => <span key={i} className="sa-event-item">⚽ {e.minute}&apos;</span>)}
            {aYellows.map((e, i) => <span key={i} className="sa-event-item"><span className="sa-yellow-card"></span> {e.minute}&apos;</span>)}
            {aReds.map((e, i) => <span key={i} className="sa-event-item"><span className="sa-red-card"></span> {e.minute}&apos;</span>)}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', justifyContent: 'flex-end' }}>
            {bGoals.map((e, i) => <span key={i} className="sa-event-item">⚽ {e.minute}&apos;</span>)}
            {bYellows.map((e, i) => <span key={i} className="sa-event-item"><span className="sa-yellow-card"></span> {e.minute}&apos;</span>)}
            {bReds.map((e, i) => <span key={i} className="sa-event-item"><span className="sa-red-card"></span> {e.minute}&apos;</span>)}
          </div>
        </div>
      )}
    </div>
  );
}
