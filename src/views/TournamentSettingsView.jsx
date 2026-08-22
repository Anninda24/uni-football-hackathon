import React, { useState, useEffect } from 'react';
import { useSystem } from '../context/SystemContext';
import { Settings, Save, CheckCircle2, Shield, Activity, Flame, Award, Zap } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/tournament';

// Available tracking events catalog
export const EVENT_CATALOG = [
  { id: 'GOAL', name: '⚽ Goal', desc: 'Mandatory match goal events (calculates live match score)', mandatory: true, icon: '⚽', color: '#ffb703' },
  { id: 'ASSIST', name: '👟 Goal Assist', desc: 'Track player who provided the goal assist', mandatory: false, icon: '👟', color: '#00d9ff' },
  { id: 'YELLOW_CARD', name: '🟨 Yellow Card', desc: 'Track booking cards issued by referee', mandatory: false, icon: '🟨', color: '#eab308' },
  { id: 'RED_CARD', name: '🟥 Red Card', desc: 'Track send-off red cards', mandatory: false, icon: '🟥', color: '#ef4444' },
  { id: 'GOAL_SAVED', name: '🧤 Goal Saved / Save', desc: 'Track goalkeeper saves per match', mandatory: false, icon: '🧤', color: '#00e699' },
  { id: 'SHOT_ON_TARGET', name: '🎯 Shot on Target', desc: 'Track shots on goal target', mandatory: false, icon: '🎯', color: '#3b82f6' },
  { id: 'SHOT_OFF_TARGET', name: '⚽ Shot Off Target', desc: 'Track wide / missed shots', mandatory: false, icon: '⚽', color: '#94a3b8' },
  { id: 'TACKLE', name: '⚔️ Successful Tackle', desc: 'Track key defensive tackles', mandatory: false, icon: '⚔️', color: '#a855f7' },
  { id: 'INTERCEPTION', name: '🛑 Interception', desc: 'Track pass interceptions by defenders', mandatory: false, icon: '🛑', color: '#f97316' },
  { id: 'SUBSTITUTION', name: '🔄 Substitution', desc: 'Track player tactical substitutions', mandatory: false, icon: '🔄', color: '#06b6d4' },
  { id: 'INJURY', name: '🚑 Injury', desc: 'Track player injury stoppages', mandatory: false, icon: '🚑', color: '#f43f5e' },
  { id: 'FOUL', name: '⚠️ Foul Committed', desc: 'Track fouls called during match', mandatory: false, icon: '⚠️', color: '#eab308' }
];

export const TournamentSettingsView = () => {
  const { addNotification } = useSystem();
  const [enabledEvents, setEnabledEvents] = useState(['GOAL', 'ASSIST', 'YELLOW_CARD', 'RED_CARD', 'GOAL_SAVED', 'TACKLE', 'SHOT_ON_TARGET', 'SUBSTITUTION']);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.enabledEvents)) {
          setEnabledEvents(data.enabledEvents);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleEvent = (eventId) => {
    if (eventId === 'GOAL') return; // Mandatory
    setEnabledEvents(prev => {
      if (prev.includes(eventId)) {
        return prev.filter(id => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    const token = localStorage.getItem('ff_jwt_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ enabledEvents })
      });
      const data = await res.json();
      if (data.success) {
        addNotification('success', 'Settings Saved', 'Match event tracking configuration updated successfully.');
      } else {
        addNotification('error', 'Error', data.message || 'Failed to update settings');
      }
    } catch (err) {
      addNotification('error', 'Backend Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Header Card */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: '24px', border: '1px solid rgba(59, 130, 246, 0.25)', background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '20px', background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', fontSize: '0.78rem', fontWeight: 800, marginBottom: '8px' }}>
            <Settings size={14} /> SUB ADMIN CONFIGURATION CONTROL
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Tournament Match Event Settings
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: '6px 0 0 0' }}>
            Configure which match event types are tracked during live fixtures and displayed in the event logger dropdown.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="btn btn-gold"
          style={{ padding: '14px 28px', fontSize: '0.95rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <Save size={18} /> {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {/* Multi-Select Event Catalog Grid */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
          Configurable Tracked Events Catalog
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.86rem', marginBottom: '20px' }}>
          Select the event types you want active in the Tournament Match Logger. Enabled events will appear in match edit modals for officials.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {EVENT_CATALOG.map(ev => {
            const isEnabled = enabledEvents.includes(ev.id);
            return (
              <div
                key={ev.id}
                onClick={() => toggleEvent(ev.id)}
                style={{
                  padding: '18px',
                  borderRadius: '16px',
                  border: isEnabled ? `1px solid ${ev.color || '#3b82f6'}` : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isEnabled ? `${ev.color || '#3b82f6'}15` : 'rgba(15, 23, 42, 0.5)',
                  cursor: ev.mandatory ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  position: 'relative'
                }}
              >
                <input
                  type="checkbox"
                  checked={isEnabled}
                  disabled={ev.mandatory}
                  onChange={() => toggleEvent(ev.id)}
                  style={{ width: '20px', height: '20px', marginTop: '2px', cursor: ev.mandatory ? 'not-allowed' : 'pointer', accentColor: ev.color || '#3b82f6' }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>{ev.name}</span>
                    {ev.mandatory && (
                      <span className="badge badge-gold" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>MANDATORY</span>
                    )}
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '4px 0 0 0' }}>{ev.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
