import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MatchCard } from '../components/subadmin/MatchCard';
import { AggregateMatchCard } from '../components/subadmin/AggregateMatchCard';
import { GenerateFixtureModal } from '../components/subadmin/GenerateFixtureModal';
import { MatchEditorModal } from '../components/subadmin/MatchEditorModal';

const API = 'http://localhost:5000/api/sub-admin';

export default function SAMatchesView() {
  const { currentUser } = useAuth();
  const token = currentUser?.token;
  const isAdmin = ['SUB_ADMIN', 'SUPER_ADMIN'].includes(currentUser?.role);

  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showGenerate, setShowGenerate] = useState(false);
  const [editorMatch, setEditorMatch] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, tRes, pRes] = await Promise.all([
        fetch(`${API}/fixtures`, { headers }),
        fetch(`${API}/teams`, { headers }).catch(() => ({ json: () => [] })),
        fetch('http://localhost:5000/api/player', { headers }).catch(() => ({ json: () => [] })),
      ]);
      const [ms, ts, ps] = await Promise.all([mRes.json(), tRes.json(), pRes.json()]);
      setMatches(Array.isArray(ms) ? ms : []);
      setTeams(Array.isArray(ts) ? ts : []);
      setPlayers(Array.isArray(ps) ? ps : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { if (token) fetchAll(); }, [fetchAll]);

  const apiPatch = (url, body) => fetch(url, { method: 'PATCH', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json());
  const apiDelete = (url) => fetch(url, { method: 'DELETE', headers }).then(r => r.json());
  const apiPost = (url, body) => fetch(url, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json());

  const handleGenerate = async (data) => {
    const res = await apiPost(`${API}/fixtures/generate`, data);
    if (res.matches) { setMatches(prev => [...prev, ...res.matches]); }
  };

  const handleStartLive = async (id) => {
    await apiPatch(`${API}/fixtures/${id}/status`, { status: 'LIVE' });
    setMatches(prev => prev.map(m => m.id === id ? { ...m, status: 'LIVE' } : m));
  };

  const handleFinish = async (id) => {
    if (!window.confirm('Mark this match as completed?')) return;
    await apiPatch(`${API}/fixtures/${id}/status`, { status: 'COMPLETED' });
    setMatches(prev => prev.map(m => m.id === id ? { ...m, status: 'COMPLETED' } : m));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fixture? This cannot be undone.')) return;
    await apiDelete(`${API}/fixtures/${id}`);
    setMatches(prev => prev.filter(m => m.id !== id));
  };

  const handleScoreChange = async (id, scoreA, scoreB) => {
    await apiPatch(`${API}/fixtures/${id}/score`, { scoreA, scoreB });
    setMatches(prev => prev.map(m => m.id === id ? { ...m, scoreA, scoreB } : m));
  };

  const handleAddEvent = async (matchId, eventData) => {
    const ev = await apiPost(`${API}/fixtures/${matchId}/events`, eventData);
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, events: [...(m.events || []), ev] } : m));
  };

  const handleDeleteEvent = async (matchId, eventId) => {
    await apiDelete(`${API}/fixtures/${matchId}/events/${eventId}`);
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, events: (m.events || []).filter(e => e.id !== eventId) } : m));
  };

  const handleSaveEditor = async (matchId, data) => {
    const updated = await apiPatch(`${API}/fixtures/${matchId}`, data);
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, ...updated } : m));
  };

  // Filter & sort
  const filtered = matches
    .filter(m => {
      if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return (m.teamAName || '').toLowerCase().includes(s) || (m.teamBName || '').toLowerCase().includes(s);
      }
      return true;
    })
    .sort((a, b) => {
      const order = { LIVE: 0, UPCOMING: 1, COMPLETED: 2 };
      const od = (order[a.status] ?? 3) - (order[b.status] ?? 3);
      if (od !== 0) return od;
      return new Date(a.scheduledTime) - new Date(b.scheduledTime);
    });

  // Group two-legged completed pairs for aggregate display
  const rendered = [];
  const usedIds = new Set();

  for (const m of filtered) {
    if (usedIds.has(m.id)) continue;
    if (m.fixtureGroupId && m.status === 'COMPLETED') {
      const legs = filtered.filter(x => x.fixtureGroupId === m.fixtureGroupId);
      if (legs.every(l => l.status === 'COMPLETED') && legs.length > 1) {
        legs.forEach(l => usedIds.add(l.id));
        rendered.push({ type: 'aggregate', legs, key: m.fixtureGroupId });
        continue;
      }
    }
    usedIds.add(m.id);
    rendered.push({ type: 'single', match: m, key: m.id });
  }

  const STATUS_FILTERS = ['ALL', 'LIVE', 'UPCOMING', 'COMPLETED'];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 4 }}>Matches</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Manage fixtures, live scores, and match events.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={fetchAll} style={{ padding: '8px 14px' }}><RefreshCw size={14} /></button>
          {isAdmin && <button className="btn btn-primary" onClick={() => setShowGenerate(true)}><Plus size={16} /> Schedule Match</button>}
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.3)', padding: 4, borderRadius: 10 }}>
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setStatusFilter(f)} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: statusFilter === f ? 'var(--bg-card-solid)' : 'transparent', color: statusFilter === f ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>{f}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '0 12px', flex: 1, maxWidth: 300 }}>
          <Search size={14} color="var(--text-muted)" />
          <input placeholder="Search teams..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-main)', fontSize: '0.9rem', width: '100%', paddingTop: 8, paddingBottom: 8 }} />
        </div>
      </div>

      {/* Match list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading fixtures...</div>
      ) : rendered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 10 }}>⚽</div>
          <p>No fixtures found. {isAdmin && 'Click "Schedule Match" to create one.'}</p>
        </div>
      ) : (
        rendered.map(item => {
          if (item.type === 'aggregate') {
            return <AggregateMatchCard key={item.key} legs={item.legs} teams={teams} isAdmin={isAdmin} onEdit={setEditorMatch} />;
          }
          return (
            <MatchCard key={item.key} match={item.match} isAdmin={isAdmin} teams={teams}
              onStartLive={handleStartLive} onFinish={handleFinish} onDelete={handleDelete}
              onEdit={setEditorMatch} onScoreChange={handleScoreChange}
              onOpenLineup={m => setEditorMatch(m)} onOpenInfo={m => setEditorMatch(m)} />
          );
        })
      )}

      {showGenerate && (
        <GenerateFixtureModal teams={teams} onClose={() => setShowGenerate(false)} onGenerate={handleGenerate} />
      )}

      {editorMatch && (
        <MatchEditorModal match={editorMatch} teams={teams} players={players} onClose={() => setEditorMatch(null)}
          onSave={handleSaveEditor} onAddEvent={handleAddEvent} onDeleteEvent={handleDeleteEvent} />
      )}
    </div>
  );
}
