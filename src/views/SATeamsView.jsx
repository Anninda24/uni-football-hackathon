import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Trash2, Shield, MapPin, DollarSign, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api/sub-admin';
const COLOR_PRESETS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#374151'];

export default function SATeamsView() {
  const { currentUser } = useAuth();
  const token = currentUser?.token;
  const isAdmin = ['SUB_ADMIN', 'SUPER_ADMIN'].includes(currentUser?.role);

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [secondaryColor, setSecondaryColor] = useState('#1e293b');
  const [venue, setVenue] = useState('');
  const [budget, setBudget] = useState('100000');
  const [logoUrl, setLogoUrl] = useState('');

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/teams`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setTeams(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchTeams();
  }, [fetchTeams, token]);

  const openCreate = () => {
    setEditingTeam(null);
    setName('');
    setShortName('');
    setColor(COLOR_PRESETS[0]);
    setSecondaryColor('#1e293b');
    setVenue('');
    setBudget('100000');
    setLogoUrl('');
    setShowModal(true);
  };

  const openEdit = (team) => {
    setEditingTeam(team);
    setName(team.name);
    setShortName(team.shortName || '');
    setColor(team.color || COLOR_PRESETS[0]);
    setSecondaryColor(team.secondaryColor || '#1e293b');
    setVenue(team.venue || '');
    setBudget(String(team.budget || 100000));
    setLogoUrl(team.logoUrl || '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      shortName: shortName || name.slice(0, 3).toUpperCase(),
      color,
      secondaryColor,
      venue,
      budget: Number(budget),
      logoUrl,
    };

    try {
      let res;
      if (editingTeam) {
        res = await fetch(`${API}/teams/${editingTeam.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API}/teams`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
      }
      if (res.ok) {
        fetchTeams();
        setShowModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    try {
      const res = await fetch(`${API}/teams/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) {
        setTeams(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 4 }}>Franchise Teams</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Manage competing teams, home venues, and budgets.</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Create Team
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading teams...</div>
      ) : teams.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 10 }}>🛡️</div>
          <p>No teams created yet. {isAdmin && 'Click "Create Team" to add one.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {teams.map(team => (
            <div key={team.id} className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', overflow: 'hidden' }}>
              {/* Colored side ribbon */}
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: team.color || '#3b82f6' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 2 }}>{team.name}</h3>
                  <span className="badge badge-cyan" style={{ fontSize: '10px' }}>{team.shortName || 'TME'}</span>
                </div>
                {team.logoUrl && (
                  <img src={team.logoUrl} alt={team.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', background: 'rgba(255,255,255,0.05)', padding: 4 }} />
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={13} color="var(--accent-green)" />
                  <span>Venue: {team.venue || 'TBD'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <DollarSign size={13} color="var(--accent-gold)" />
                  <span>Budget: <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>${(team.budget || 0).toLocaleString()}</span></span>
                </div>
                {team.manager && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Shield size={13} color="#a855f7" />
                    <span>Manager: {team.manager.name}</span>
                  </div>
                )}
              </div>

              {isAdmin && (
                <div style={{ display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--border-color)' }}>
                  <button className="btn btn-secondary" style={{ flex: 1, padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => openEdit(team)}>
                    <Edit3 size={12} /> Edit
                  </button>
                  <button className="btn btn-danger" style={{ flex: 1, padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleDelete(team.id)}>
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: 460 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{editingTeam ? 'Edit Team' : 'Create Team'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Team Name</label>
                <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Engineering Eagles" />
              </div>

              <div className="form-group">
                <label className="form-label">Short Name (2-4 Chars)</label>
                <input type="text" className="form-control" value={shortName} onChange={e => setShortName(e.target.value.toUpperCase())} maxLength={4} placeholder="e.g. ENG" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Primary Color</label>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input type="color" className="form-control" style={{ width: 44, height: 38, padding: 2, cursor: 'pointer' }} value={color} onChange={e => setColor(e.target.value)} />
                    <span style={{ fontSize: '0.8rem', fontMono: true }}>{color}</span>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Secondary Color</label>
                  <input type="color" className="form-control" style={{ width: '100%', height: 38, padding: 2, cursor: 'pointer' }} value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label font-heading">Home Venue</label>
                <input type="text" className="form-control" value={venue} onChange={e => setVenue(e.target.value)} placeholder="e.g. East Arena" />
              </div>

              <div className="form-group">
                <label className="form-label">Allocated Budget ($)</label>
                <input type="number" className="form-control" value={budget} onChange={e => setBudget(e.target.value)} required min={0} />
              </div>

              <div className="form-group">
                <label className="form-label">Logo URL</label>
                <input type="text" className="form-control" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingTeam ? 'Save Changes' : 'Create Team'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
