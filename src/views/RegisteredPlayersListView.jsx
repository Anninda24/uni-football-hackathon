import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { UserCheck, Search, Filter, Shield } from 'lucide-react';

export const RegisteredPlayersListView = () => {
  const { players, systemState } = useSystem();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterSession, setFilterSession] = useState('ALL');

  const approvedPlayers = players.filter(p => p.status === 'APPROVED');

  const filteredPlayers = approvedPlayers.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.jerseyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === 'ALL' || p.categoryId === filterCategory;
    const matchSess = filterSession === 'ALL' || p.session === filterSession;
    return matchSearch && matchCat && matchSess;
  });

  const getCategoryColor = (categoryId) => {
    const cat = systemState.categories.find(c => c.id === categoryId);
    return cat ? cat.color : 'var(--text-muted)';
  };

  const getCategoryName = (categoryId) => {
    const cat = systemState.categories.find(c => c.id === categoryId);
    return cat ? cat.name : categoryId;
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck color="var(--accent-green)" /> Registered Players
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Browse all approved registered players before the auction begins ({approvedPlayers.length} Total).
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="var(--accent-cyan)" />
            <span className="badge badge-green">ONLY APPROVED</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', background: 'var(--bg-card-solid)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px', background: 'var(--bg-input)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <Search size={16} color="var(--text-dim)" />
            <input
              type="text"
              placeholder="Search by Name, Student ID, Jersey..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', fontSize: '0.85rem', width: '100%' }}
            />
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} color="var(--text-dim)" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', padding: '6px 10px', fontSize: '0.8rem', outline: 'none' }}
            >
              <option value="ALL">All Categories</option>
              {systemState.categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Session Filter */}
          <select
            value={filterSession}
            onChange={(e) => setFilterSession(e.target.value)}
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', padding: '6px 10px', fontSize: '0.8rem', outline: 'none' }}
          >
            <option value="ALL">All Sessions</option>
            {systemState.academicSessions.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Players Table */}
      <div className="glass-panel" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '14px 16px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Name</th>
              <th style={{ padding: '14px 16px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Position</th>
              <th style={{ padding: '14px 16px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category</th>
              <th style={{ padding: '14px 16px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Base Price</th>
              <th style={{ padding: '14px 16px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Session</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  No approved players match your filters.
                </td>
              </tr>
            ) : (
              filteredPlayers.map((player) => {
                const catColor = getCategoryColor(player.categoryId);
                return (
                  <tr key={player.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '8px', overflow: 'hidden',
                          border: `1px solid ${catColor}`, flexShrink: 0, background: 'var(--bg-card-solid)'
                        }}>
                          {player.imageUrl ? (
                            <img src={player.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>👤</div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{player.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{player.studentId}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: catColor, background: 'rgba(0,0,0,0.3)', padding: '3px 8px', borderRadius: '6px' }}>
                        {player.primaryPosition}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 700, color: catColor,
                        background: `${catColor}22`, padding: '3px 10px', borderRadius: '6px',
                        border: `1px solid ${catColor}44`
                      }}>
                        {getCategoryName(player.categoryId)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-green)' }}>
                      ${player.basePrice?.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {player.session}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
