import React, { useState } from 'react';
import { X, Trophy } from 'lucide-react';

const TABS = ['Events', 'Lineup', 'Stats', 'Summary'];

const EVENT_CONFIG = {
  GOAL:            { label: 'Goals', emoji: '\u26bd' },
  ASSIST:          { label: 'Assists', emoji: '\uD83C\uDFAF' },
  YELLOW_CARD:     { label: 'Yellow Cards', emoji: '\uD83D\uDFE8' },
  RED_CARD:        { label: 'Red Cards', emoji: '\uD83D\uDFE5' },
  SAVE:            { label: 'Saves', emoji: '\uD83E\uDEF4' },
  SHOT_ON_TARGET:  { label: 'Shots On Target', emoji: '\uD83C\uDFF9' },
  SHOT_OFF_TARGET: { label: 'Shots Off Target', emoji: '\uD83D\uDEAB' },
  TACKLE:          { label: 'Tackles', emoji: '\uD83E\uDD4B' },
  INTERCEPTION:    { label: 'Interceptions', emoji: '\u2709\uFE0F' },
  SUBSTITUTION:    { label: 'Substitutions', emoji: '\uD83D\uDD04' },
  INJURY:          { label: 'Injuries', emoji: '\uD83E\uDE79' },
  FOUL:            { label: 'Fouls', emoji: '\u274C' },
};

function EventSection({ title, emoji, events, side, players, onAdd, onDelete, showAssist = false }) {
  const [playerId, setPlayerId] = useState('');
  const [minute, setMinute] = useState('');
  const [assistId, setAssistId] = useState('');
  const [isPenalty, setIsPenalty] = useState(false);

  const handleAdd = () => {
    if (!playerId) return;
    onAdd({ playerId, minute: Number(minute) || 0, assistPlayerId: assistId || undefined, isPenalty, teamSide: side });
    setPlayerId(''); setMinute(''); setAssistId(''); setIsPenalty(false);
  };

  return (
    <div className="sa-event-section">
      <div className="sa-event-section-header">
        <span className="sa-event-section-title">{emoji} {title} <span style={{ color: 'var(--text-dim)' }}>({events.length})</span></span>
        <button
          onClick={handleAdd}
          style={{ background: 'rgba(0,230,153,0.1)', border: '1px solid rgba(0,230,153,0.3)', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', color: 'var(--accent-green)', fontSize: '11px', fontWeight: 700 }}
        >+ Add</button>
      </div>

      <div className="sa-event-adder-row">
        <select className="form-control" style={{ flex: 2, padding: '5px 8px', fontSize: '12px' }} value={playerId} onChange={e => setPlayerId(e.target.value)}>
          <option value="">Player...</option>
          {players.map(p => <option key={p.id} value={p.id}>{p.jerseyNumber ? `#${p.jerseyNumber} ` : ''}{p.jerseyName || p.user?.name || p.id}</option>)}
        </select>
        <input type="number" placeholder="Min" className="form-control" style={{ width: 56, padding: '5px 8px', fontSize: '12px' }} value={minute} onChange={e => setMinute(e.target.value)} min={0} max={120} />
        {showAssist && (
          <select className="form-control" style={{ flex: 1, padding: '5px 8px', fontSize: '12px' }} value={assistId} onChange={e => setAssistId(e.target.value)}>
            <option value="">Assist...</option>
            {players.filter(p => p.id !== playerId).map(p => <option key={p.id} value={p.id}>{p.jerseyName || p.user?.name}</option>)}
          </select>
        )}
        {showAssist && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '11px', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
            <input type="checkbox" checked={isPenalty} onChange={e => setIsPenalty(e.target.checked)} />
            PEN
          </label>
        )}
      </div>

      {events.map((ev, i) => {
        const scorer = players.find(p => p.id === ev.playerId);
        const assister = ev.assistPlayerId ? players.find(p => p.id === ev.assistPlayerId) : null;
        return (
          <div key={ev.id || i} className="sa-event-list-item">
            <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{scorer?.jerseyName || scorer?.user?.name || ev.playerId}</span>
              <span style={{ color: 'var(--text-dim)' }}>{ev.minute}'</span>
              {ev.isPenalty && <span style={{ fontSize: '10px', color: 'var(--accent-gold)' }}>PEN</span>}
              {assister && <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>({assister.jerseyName || assister.user?.name})</span>}
            </span>
            <button onClick={() => onDelete(ev.id || i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.6)', padding: '0 4px' }}>X</button>
          </div>
        );
      })}
    </div>
  );
}

function LineupEditor({ players, lineup, onReorder }) {
  const ordered = [...players].sort((a, b) => {
    const posA = lineup.indexOf(a.id);
    const posB = lineup.indexOf(b.id);
    return (posA === -1 ? 999 : posA) - (posB === -1 ? 999 : posB);
  });

  return (
    <div>
      {ordered.map((p, i) => (
        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderRadius: 8, background: i < 11 ? 'rgba(0,230,153,0.05)' : 'rgba(0,0,0,0.2)', border: `1px solid ${i < 11 ? 'rgba(0,230,153,0.15)' : 'var(--border-color)'}`, marginBottom: 4 }}>
          <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-dim)', width: 20, textAlign: 'right' }}>{i + 1}</span>
          <span style={{ flex: 1, fontSize: '13px' }}>{p.jerseyName || p.user?.name}</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.07)', padding: '2px 6px', borderRadius: 4 }}>{p.position || p.primaryPosition || 'MID'}</span>
          {i < 11 && <span style={{ fontSize: '10px', color: 'var(--accent-green)' }}>XI</span>}
          {i === 10 && <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>(last of Starting XI)</span>}
          <div style={{ display: 'flex', gap: 2 }}>
            {i > 0 && <button onClick={() => onReorder(i, i - 1)} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '10px' }}>↑</button>}
            {i < ordered.length - 1 && <button onClick={() => onReorder(i, i + 1)} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '10px' }}>↓</button>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MatchEditorModal({ match, teams, players, onClose, onSave, onDeleteEvent, onAddEvent, trackedEvents = [] }) {
  const [tab, setTab] = useState('Events');
  const [saving, setSaving] = useState(false);

  const teamA = teams.find(t => t.id === match.teamAId) || {};
  const teamB = teams.find(t => t.id === match.teamBId) || {};

  const aPlayers = players.filter(p => p.teamId === match.teamAId);
  const bPlayers = players.filter(p => p.teamId === match.teamBId);

  const lineupA = (match.lineups || []).filter(l => l.teamSide === 'A').sort((a, b) => a.positionOrder - b.positionOrder).map(l => l.playerId);
  const lineupB = (match.lineups || []).filter(l => l.teamSide === 'B').sort((a, b) => a.positionOrder - b.positionOrder).map(l => l.playerId);

  const getEvents = (side, type) => (match.events || []).filter(e => e.teamSide === side && e.type === type);

  const enabledTypes = trackedEvents.length > 0 ? trackedEvents : Object.keys(EVENT_CONFIG);

  const [mvpId, setMvpId] = useState(match.mvpId || '');
  const [penaltyA, setPenaltyA] = useState(match.penaltyA ?? '');
  const [penaltyB, setPenaltyB] = useState(match.penaltyB ?? '');
  const [venue, setVenue] = useState(match.venue || '');
  const [currentMinute, setCurrentMinute] = useState(match.currentMinute || '');

  const allPlayers = [...aPlayers, ...bPlayers];

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(match.id, { mvpId: mvpId || undefined, penaltyA: penaltyA !== '' ? Number(penaltyA) : undefined, penaltyB: penaltyB !== '' ? Number(penaltyB) : undefined, venue, currentMinute: currentMinute !== '' ? Number(currentMinute) : undefined });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const colorA = teamA.color || '#3b82f6';
  const colorB = teamB.color || '#ef4444';

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: 820, maxHeight: '92vh', padding: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: colorA }}></div>
              <span style={{ fontWeight: 700 }}>{match.teamAName || teamA.name}</span>
            </div>
            <span style={{ color: 'var(--text-muted)', fontWeight: 900, fontSize: '1.1rem' }}>{match.scoreA} - {match.scoreB}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 700 }}>{match.teamBName || teamB.name}</span>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: colorB }}></div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        {/* Tab bar */}
        <div style={{ padding: '12px 24px 0', flexShrink: 0 }}>
          <div className="sa-tab-bar">
            {TABS.map(t => <button key={t} className={`sa-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>)}
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 20px' }}>
          {tab === 'Events' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, paddingTop: 16 }}>
              {/* Team A */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontWeight: 700, fontSize: '0.9rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: colorA }}></div>
                  {match.teamAName || teamA.name}
                </div>
                {enabledTypes.map(type => {
                  if (!EVENT_CONFIG[type]) return null;
                  const { label, emoji } = EVENT_CONFIG[type];
                  return (
                    <EventSection key={type} title={label} emoji={emoji} events={getEvents('A', type)} side="A" players={aPlayers} showAssist={type === 'GOAL'}
                      onAdd={ev => onAddEvent(match.id, { ...ev, type, teamId: match.teamAId })}
                      onDelete={id => onDeleteEvent(match.id, id)} />
                  );
                })}
              </div>
              {/* Team B */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontWeight: 700, fontSize: '0.9rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: colorB }}></div>
                  {match.teamBName || teamB.name}
                </div>
                {enabledTypes.map(type => {
                  if (!EVENT_CONFIG[type]) return null;
                  const { label, emoji } = EVENT_CONFIG[type];
                  return (
                    <EventSection key={type} title={label} emoji={emoji} events={getEvents('B', type)} side="B" players={bPlayers} showAssist={type === 'GOAL'}
                      onAdd={ev => onAddEvent(match.id, { ...ev, type, teamId: match.teamBId })}
                      onDelete={id => onDeleteEvent(match.id, id)} />
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'Lineup' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, paddingTop: 16 }}>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: colorA }}></div>
                  {match.teamAName} Lineup
                </div>
                <LineupEditor players={aPlayers} lineup={lineupA} onReorder={(from, to) => {
                  const items = [...lineupA];
                  const [moved] = items.splice(from, 1);
                  items.splice(to, 0, moved);
                }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: colorB }}></div>
                  {match.teamBName} Lineup
                </div>
                <LineupEditor players={bPlayers} lineup={lineupB} onReorder={(from, to) => {
                  const items = [...lineupB];
                  const [moved] = items.splice(from, 1);
                  items.splice(to, 0, moved);
                }} />
              </div>
            </div>
          )}

          {tab === 'Stats' && (
            <div style={{ paddingTop: 16 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>Aggregate team stats (not per-player).</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {['Fouls', 'Corners', 'Tackles', 'Saves', 'Shots on Target', 'Shots Off Target'].map(stat => (
                  <div key={stat} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{stat}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: colorA, fontWeight: 700, marginBottom: 4 }}>{match.teamAName}</div>
                        <input type="number" min={0} defaultValue={0} className="form-control" style={{ width: 60, textAlign: 'center' }} />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: colorB, fontWeight: 700, marginBottom: 4 }}>{match.teamBName}</div>
                        <input type="number" min={0} defaultValue={0} className="form-control" style={{ width: 60, textAlign: 'center' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'Summary' && (
            <div style={{ paddingTop: 16, maxWidth: 420 }}>
              <div className="form-group">
                <label className="form-label"><Trophy size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />MVP</label>
                <select className="form-control" value={mvpId} onChange={e => setMvpId(e.target.value)}>
                  <option value="">No MVP selected</option>
                  {allPlayers.map(p => <option key={p.id} value={p.id}>{p.jerseyName || p.user?.name}</option>)}
                </select>
              </div>
              {match.scoreA === match.scoreB && (
                <div className="form-group">
                  <label className="form-label">Penalty Shootout</label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input type="number" min={0} className="form-control" style={{ width: 70 }} value={penaltyA} onChange={e => setPenaltyA(e.target.value)} placeholder={match.teamAName} />
                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                    <input type="number" min={0} className="form-control" style={{ width: 70 }} value={penaltyB} onChange={e => setPenaltyB(e.target.value)} placeholder={match.teamBName} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Penalty scores do not affect the official scoreline.</span>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Venue</label>
                <input type="text" className="form-control" value={venue} onChange={e => setVenue(e.target.value)} />
              </div>
              {match.status === 'LIVE' && (
                <div className="form-group">
                  <label className="form-label">Current Minute</label>
                  <input type="number" min={0} max={120} className="form-control" style={{ width: 90 }} value={currentMinute} onChange={e => setCurrentMinute(e.target.value)} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );
}
