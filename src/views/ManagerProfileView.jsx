import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystem } from '../context/SystemContext';
import { User, Edit3, Save, X, Mail, Phone, Shield, Key, UserCog } from 'lucide-react';

export const ManagerProfileView = () => {
  const { currentUser } = useAuth();
  const { managers, setManagers, addNotification } = useSystem();

  const myManager = managers.find(m => m.id === currentUser?.id || (m.email && m.email.toLowerCase() === currentUser?.email?.toLowerCase())) || (currentUser?.role === 'TEAM_MANAGER' ? {
    id: currentUser.id,
    name: currentUser.name || 'Manager',
    email: currentUser.email || '',
    username: currentUser.email?.split('@')[0] || 'manager',
    mobile: '',
    teamId: currentUser.teamId || null,
    teamName: currentUser.teamName || 'Unassigned'
  } : null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    username: '',
    mobile: ''
  });

  const startEdit = () => {
    if (!myManager) return;
    setEditForm({
      name: myManager.name || '',
      email: myManager.email || '',
      username: myManager.username || '',
      mobile: myManager.mobile || ''
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm({ name: '', email: '', username: '', mobile: '' });
  };

  const saveEdit = (e) => {
    e.preventDefault();
    if (!myManager) return;
    setManagers(prev => prev.map(m => m.id === myManager.id ? { ...m, ...editForm } : m));
    addNotification('success', 'Profile Updated', 'Your manager profile has been updated.');
    setIsEditing(false);
  };

  if (!myManager) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '60px 24px' }}>
        <div className="glass-panel" style={{ padding: '40px' }}>
          <User size={48} color="var(--text-dim)" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>No Manager Profile Found</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Your manager profile has not been created yet. Please contact the system administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserCog color="var(--accent-cyan)" /> My Manager Profile
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              View and manage your manager account details.
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
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={editForm.username}
                  onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={editForm.mobile}
                  onChange={(e) => setEditForm(prev => ({ ...prev, mobile: e.target.value }))}
                />
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
                <img src={myManager.imageUrl} alt={myManager.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 6px 0' }}>{myManager.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, background: 'rgba(255,255,255,0.1)', padding: '3px 8px', borderRadius: '6px' }}>
                    {myManager.username || 'No username'}
                  </span>
                  <span className={`badge ${myManager.status === 'BANNED' ? 'badge-red' : 'badge-green'}`} style={{ fontSize: '0.7rem' }}>
                    {myManager.status === 'BANNED' ? 'Banned' : 'Active'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {[
                { label: 'Email', value: myManager.email, icon: Mail },
                { label: 'Username', value: myManager.username || 'N/A', icon: User },
                { label: 'Mobile', value: myManager.mobile || 'N/A', icon: Phone },
                { label: 'Role', value: 'TEAM_MANAGER', icon: Shield },
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
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Key size={18} color="var(--accent-gold)" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, marginBottom: '4px' }}>Password</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' }}>
                  ••••••••
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
