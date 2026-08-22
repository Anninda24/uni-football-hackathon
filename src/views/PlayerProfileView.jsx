import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystem } from '../context/SystemContext';
import { User, Edit3, Save, X, Mail, Calendar, Hash, Shirt, Shield } from 'lucide-react';

export const PlayerProfileView = () => {
  const { currentUser } = useAuth();
  const { players, setPlayers, addNotification, systemState } = useSystem();

  const positions = systemState.positions || [];

  const myPlayer = players.find(p => p.id === currentUser.id || p.email === currentUser.email);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    jerseyName: '',
    jerseyNumber: '',
    primaryPosition: '',
    secondaryPositions: [],
    imageUrl: ''
  });

  const startEdit = () => {
    if (!myPlayer) return;
    setEditForm({
      name: myPlayer.name,
      email: myPlayer.email || '',
      jerseyName: myPlayer.jerseyName || '',
      jerseyNumber: myPlayer.jerseyNumber || '',
      primaryPosition: myPlayer.primaryPosition || '',
      secondaryPositions: myPlayer.secondaryPositions || [],
      imageUrl: myPlayer.imageUrl || ''
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      name: '',
      email: '',
      jerseyName: '',
      jerseyNumber: '',
      primaryPosition: '',
      secondaryPositions: [],
      imageUrl: ''
    });
  };

  const saveEdit = (e) => {
    e.preventDefault();
    if (!myPlayer) return;

    setPlayers(prev => prev.map(p => p.id === myPlayer.id ? {
      ...p,
      ...editForm
    } : p));
    addNotification('success', 'Profile Updated', 'Your player profile has been updated.');
    setIsEditing(false);
  };

  const toggleSecondaryPosition = (code) => {
    if (code === editForm.primaryPosition) return;
    setEditForm(prev => {
      const exists = prev.secondaryPositions.includes(code);
      return {
        ...prev,
        secondaryPositions: exists
          ? prev.secondaryPositions.filter(p => p !== code)
          : [...prev.secondaryPositions, code]
      };
    });
  };

  if (!myPlayer) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '60px 24px' }}>
        <div className="glass-panel" style={{ padding: '40px' }}>
          <User size={48} color="var(--text-dim)" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>No Player Profile Found</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Your player profile has not been created yet. Please complete registration from the home page.
          </p>
        </div>
      </div>
    );
  }

  const category = systemState.categories.find(c => c.id === myPlayer.categoryId);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User color="var(--accent-green)" /> My Player Profile
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              View and manage your player registration details.
            </p>
          </div>
          {!isEditing && (
            <button onClick={startEdit} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Edit3 size={16} /> Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={saveEdit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-control"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">Jersey Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={editForm.jerseyName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, jerseyName: e.target.value.toUpperCase() }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Jersey Number *</label>
                <input
                  type="text"
                  className="form-control"
                  value={editForm.jerseyNumber}
                  onChange={(e) => setEditForm(prev => ({ ...prev, jerseyNumber: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Primary Position * (Select Exactly One)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {positions.map(pos => (
                  <button
                    type="button"
                    key={pos.code}
                    onClick={() => setEditForm(prev => ({
                      ...prev,
                      primaryPosition: pos.code,
                      secondaryPositions: prev.secondaryPositions.filter(p => p !== pos.code)
                    }))}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: editForm.primaryPosition === pos.code ? '2px solid var(--accent-green)' : '1px solid var(--border-color)',
                      background: editForm.primaryPosition === pos.code ? 'rgba(0, 230, 153, 0.2)' : 'var(--bg-input)',
                      color: editForm.primaryPosition === pos.code ? 'var(--accent-green)' : 'var(--text-muted)'
                    }}
                  >
                    {pos.code}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Secondary Positions (Optional)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {positions.map(pos => {
                  const isPrimary = editForm.primaryPosition === pos.code;
                  const isSelected = editForm.secondaryPositions.includes(pos.code);
                  return (
                    <button
                      type="button"
                      key={pos.code}
                      onClick={() => toggleSecondaryPosition(pos.code)}
                      disabled={isPrimary}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: isPrimary ? 'not-allowed' : 'pointer',
                        opacity: isPrimary ? 0.4 : 1,
                        border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                        background: isSelected ? 'rgba(0, 217, 255, 0.2)' : 'var(--bg-input)',
                        color: isSelected ? 'var(--accent-cyan)' : 'var(--text-dim)'
                      }}
                    >
                      + {pos.code}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Save size={16} /> Save Changes
              </button>
              <button type="button" onClick={cancelEdit} className="btn btn-secondary">
                <X size={16} /> Cancel
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{
                width: '100px', height: '100px', borderRadius: '16px', overflow: 'hidden',
                border: '2px solid var(--border-color)', background: 'var(--bg-card-solid)', flexShrink: 0
              }}>
                <img src={myPlayer.imageUrl} alt={myPlayer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 6px 0' }}>{myPlayer.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, background: 'rgba(255,255,255,0.1)', padding: '3px 8px', borderRadius: '6px' }}>
                    #{myPlayer.jerseyNumber || '10'} {myPlayer.jerseyName}
                  </span>
                  {category && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: category.color, background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '6px' }}>
                      {category.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {[
                { label: 'Student ID', value: myPlayer.studentId, icon: Hash },
                { label: 'Email', value: myPlayer.email, icon: Mail },
                { label: 'Session', value: myPlayer.session, icon: Calendar },
                { label: 'Primary Position', value: myPlayer.primaryPosition, icon: Shield },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} style={{
                    background: 'var(--bg-card-solid)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <Icon size={16} color="var(--accent-cyan)" />
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>{item.label}</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{
              background: 'var(--bg-card-solid)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '14px'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, marginBottom: '6px' }}>Secondary Positions</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {myPlayer.secondaryPositions && myPlayer.secondaryPositions.length > 0 ? (
                  myPlayer.secondaryPositions.map(pos => (
                    <span key={pos} className="badge badge-cyan" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                      {pos}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>None specified</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
