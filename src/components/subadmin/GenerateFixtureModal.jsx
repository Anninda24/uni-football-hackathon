import React, { useState } from 'react';
import { X, Calendar, MapPin, RefreshCw } from 'lucide-react';

const VENUES = ['Main Stadium', 'North Ground', 'East Arena', 'West Field', 'Training Complex'];

export function GenerateFixtureModal({ teams, onClose, onGenerate }) {
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('15:00');
  const [venue, setVenue] = useState(VENUES[0]);
  const [twoLegged, setTwoLegged] = useState(false);
  const [leg2Date, setLeg2Date] = useState('');
  const [leg2Time, setLeg2Time] = useState('15:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (teamAId === teamBId) { setError('Home and Away teams must differ.'); return; }
    if (!date) { setError('Please select a match date.'); return; }
    setError('');
    setLoading(true);
    try {
      await onGenerate({ teamAId, teamBId, date, time, venue, twoLegged, leg2Date, leg2Time });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to schedule fixture.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: 520 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calendar size={20} color="var(--accent-green)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Schedule Fixture</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        {error && (
          <div style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: 'var(--accent-red)', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Home Team</label>
              <select className="form-control" value={teamAId} onChange={e => setTeamAId(e.target.value)} required>
                <option value="">Select team...</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Away Team</label>
              <select className="form-control" value={teamBId} onChange={e => setTeamBId(e.target.value)} required>
                <option value="">Select team...</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Date (Leg 1)</label>
              <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input type="time" className="form-control" value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Venue</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={14} color="var(--accent-green)" />
              <select className="form-control" value={venue} onChange={e => setVenue(e.target.value)}>
                {VENUES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(0,0,0,0.3)', borderRadius: 10, marginBottom: twoLegged ? 16 : 24, border: '1px solid var(--border-color)' }}>
            <input type="checkbox" id="twoLegged" checked={twoLegged} onChange={e => setTwoLegged(e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
            <label htmlFor="twoLegged" style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
              <RefreshCw size={14} style={{ marginRight: 6, color: '#c084fc', verticalAlign: 'middle' }} />
              Two-Legged Tie (Home & Away)
            </label>
          </div>

          {twoLegged && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24, padding: '14px 16px', background: 'rgba(168,85,247,0.08)', borderRadius: 10, border: '1px solid rgba(168,85,247,0.3)' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ color: '#c084fc' }}>Leg 2 Date</label>
                <input type="date" className="form-control" value={leg2Date} onChange={e => setLeg2Date(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ color: '#c084fc' }}>Leg 2 Time</label>
                <input type="time" className="form-control" value={leg2Time} onChange={e => setLeg2Time(e.target.value)} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Fixture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
