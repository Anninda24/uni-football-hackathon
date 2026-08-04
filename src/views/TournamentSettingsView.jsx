import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { Settings, Plus, Trash2, Calendar, Users, Save } from 'lucide-react';

export const TournamentSettingsView = () => {
  const { systemState, addAcademicSession, removeAcademicSession, addPosition, removePosition, addNotification } = useSystem();

  const [newSession, setNewSession] = useState('');
  const [newPositionCode, setNewPositionCode] = useState('');
  const [newPositionName, setNewPositionName] = useState('');

  const handleAddSession = (e) => {
    e.preventDefault();
    if (!newSession.trim()) {
      addNotification('error', 'Invalid Input', 'Session cannot be empty.');
      return;
    }
    if (systemState.academicSessions.includes(newSession.trim())) {
      addNotification('warning', 'Duplicate', 'This session already exists.');
      return;
    }
    addAcademicSession(newSession.trim());
    setNewSession('');
  };

  const handleAddPosition = (e) => {
    e.preventDefault();
    if (!newPositionCode.trim() || !newPositionName.trim()) {
      addNotification('error', 'Invalid Input', 'Position code and name are required.');
      return;
    }
    if (systemState.positions.some(p => p.code === newPositionCode.trim().toUpperCase())) {
      addNotification('warning', 'Duplicate', 'This position code already exists.');
      return;
    }
    addPosition({
      code: newPositionCode.trim().toUpperCase(),
      name: newPositionName.trim()
    });
    setNewPositionCode('');
    setNewPositionName('');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings color="var(--accent-cyan)" />
          Tournament Settings
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Manage academic sessions and playing positions for player registrations.
        </p>
      </div>

      {/* Academic Sessions */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Calendar size={20} color="var(--accent-green)" />
          Academic Sessions
        </h3>
        <form onSubmit={handleAddSession} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. 2027/2028"
            value={newSession}
            onChange={(e) => setNewSession(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Add Session
          </button>
        </form>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {systemState.academicSessions.map(session => (
            <div key={session} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: 'var(--bg-card-solid)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px'
            }}>
              <span style={{ fontWeight: 600 }}>{session}</span>
              <button
                onClick={() => removeAcademicSession(session)}
                className="btn btn-danger"
                style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Positions */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Users size={20} color="var(--accent-cyan)" />
          Playing Positions
        </h3>
        <form onSubmit={handleAddPosition} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Code (e.g. CDM)"
            value={newPositionCode}
            onChange={(e) => setNewPositionCode(e.target.value.toUpperCase())}
            style={{ width: '120px' }}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Position Name (e.g. Defensive Midfielder)"
            value={newPositionName}
            onChange={(e) => setNewPositionName(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Add Position
          </button>
        </form>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {systemState.positions.map(pos => (
            <div key={pos.code} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: 'var(--bg-card-solid)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontWeight: 800,
                  color: 'var(--accent-cyan)',
                  background: 'rgba(0, 217, 255, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.85rem'
                }}>
                  {pos.code}
                </span>
                <span style={{ fontWeight: 600 }}>{pos.name}</span>
              </div>
              <button
                onClick={() => removePosition(pos.code)}
                className="btn btn-danger"
                style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
