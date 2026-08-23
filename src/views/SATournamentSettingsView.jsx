import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api/sub-admin';

const EVENT_CATALOG = [
  { key: 'GOAL', label: 'Goal', mandatory: true },
  { key: 'ASSIST', label: 'Goal Assist', mandatory: false },
  { key: 'YELLOW_CARD', label: 'Yellow Card', mandatory: false },
  { key: 'RED_CARD', label: 'Red Card', mandatory: false },
  { key: 'SAVE', label: 'Goal Save', mandatory: false },
  { key: 'SHOT_ON_TARGET', label: 'Shot On Target', mandatory: false },
  { key: 'SHOT_OFF_TARGET', label: 'Shot Off Target', mandatory: false },
  { key: 'TACKLE', label: 'Successful Tackle', mandatory: false },
  { key: 'INTERCEPTION', label: 'Interception', mandatory: false },
  { key: 'SUBSTITUTION', label: 'Substitution', mandatory: false },
  { key: 'INJURY', label: 'Injury', mandatory: false },
  { key: 'FOUL', label: 'Foul Committed', mandatory: false },
];

const PHASES = ['GROUP_STAGE', 'TOURNAMENT', 'FINALS'];

export default function SATournamentSettingsView() {
  const { currentUser } = useAuth();
  const token = currentUser?.token;
  const [settings, setSettings] = useState({ tracked_events: ['GOAL', 'ASSIST', 'YELLOW_CARD', 'RED_CARD', 'SAVE', 'SHOT_ON_TARGET', 'TACKLE', 'SUBSTITUTION'], active_phase: 'TOURNAMENT', use_two_legged: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/settings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setSettings(prev => ({ ...prev, ...d }))).catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const toggleEvent = (key) => {
    if (key === 'GOAL') return;
    setSettings(prev => ({
      ...prev,
      tracked_events: prev.tracked_events.includes(key)
        ? prev.tracked_events.filter(e => e !== key)
        : [...prev.tracked_events, key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${API}/settings`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading settings...</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 4 }}>Tournament Settings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Configure event tracking, active phase, and fixture defaults.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Settings'}
        </button>
      </div>

      {/* Active Phase */}
      <div className="glass-panel" style={{ marginBottom: 20, padding: 24 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>Active Tournament Phase</h3>
        <div style={{ display: 'flex', gap: 12 }}>
          {PHASES.map(phase => (
            <button key={phase} onClick={() => setSettings(prev => ({ ...prev, active_phase: phase }))}
              style={{ flex: 1, padding: '14px 20px', borderRadius: 12, border: `1px solid ${settings.active_phase === phase ? 'var(--accent-green)' : 'var(--border-color)'}`, background: settings.active_phase === phase ? 'rgba(0,230,153,0.08)' : 'rgba(0,0,0,0.2)', color: settings.active_phase === phase ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {phase.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Two-Legged Default */}
      <div className="glass-panel" style={{ marginBottom: 20, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>Default Two-Legged Fixtures</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>When enabled, "Schedule Match" defaults to home & away legs.</p>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input type="checkbox" checked={!!settings.use_two_legged} onChange={e => setSettings(prev => ({ ...prev, use_two_legged: e.target.checked }))} style={{ width: 18, height: 18, cursor: 'pointer' }} />
          <span style={{ fontWeight: 700, color: settings.use_two_legged ? 'var(--accent-green)' : 'var(--text-muted)' }}>
            {settings.use_two_legged ? 'Enabled' : 'Disabled'}
          </span>
        </label>
      </div>

      {/* Tracked Events */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 6, fontSize: '1rem' }}>Tracked Event Types</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>Enabled events appear in the Match Editor dropdowns. Goals are always tracked.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {EVENT_CATALOG.map(ev => {
            const enabled = settings.tracked_events.includes(ev.key);
            return (
              <button key={ev.key} onClick={() => toggleEvent(ev.key)}
                disabled={ev.mandatory}
                style={{ padding: '12px 16px', borderRadius: 10, border: `1px solid ${enabled ? 'rgba(0,230,153,0.4)' : 'var(--border-color)'}`, background: enabled ? 'rgba(0,230,153,0.08)' : 'rgba(0,0,0,0.2)', color: enabled ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: 600, cursor: ev.mandatory ? 'not-allowed' : 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', opacity: ev.mandatory ? 0.8 : 1 }}>
                <span>{ev.label}</span>
                {ev.mandatory ? <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent-green)', opacity: 0.7 }}>MANDATORY</span>
                  : <span style={{ fontSize: '16px' }}>{enabled ? '✓' : '○'}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
