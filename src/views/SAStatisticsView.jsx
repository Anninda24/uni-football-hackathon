import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api/sub-admin';
const POSITIONS = ['ALL', 'GK', 'DEF', 'MID', 'FWD'];
const SORT_OPTIONS = [
  { key: 'goals', label: 'Goals' },
  { key: 'assists', label: 'Assists' },
  { key: 'saves', label: 'Saves' },
  { key: 'yellow', label: 'Yellow Cards' },
  { key: 'red', label: 'Red Cards' },
];

export default function SAStatisticsView() {
  const { currentUser } = useAuth();
  const token = currentUser?.token;
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState('ALL');
  const [teamFilter, setTeamFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('goals');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      fetch(`${API}/statistics`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/teams`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => []),
    ]).then(([ps, ts]) => {
      setPlayers(Array.isArray(ps) ? ps : []);
      setTeams(Array.isArray(ts) ? ts : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const filtered = players
    .filter(p => {
      if (posFilter !== 'ALL' && (p.position || p.primaryPosition) !== posFilter) return false;
      if (teamFilter !== 'ALL' && p.teamId !== teamFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return (p.jerseyName || p.user?.name || '').toLowerCase().includes(s);
      }
      return true;
    })
    .sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));

  // Leader cards
  const topGoal = [...players].sort((a, b) => (b.goals || 0) - (a.goals || 0))[0];
  const topAssist = [...players].sort((a, b) => (b.assists || 0) - (a.assists || 0))[0];
  const topGK = [...players].filter(p => (p.position || p.primaryPosition) === 'GK').sort((a, b) => (b.saves || 0) - (a.saves || 0))[0];

  const leaderCards = [
    { title: 'Golden Boot', icon: '🥇', player: topGoal, stat: topGoal?.goals || 0, label: 'Goals' },
    { title: 'Top Assist', icon: '🅰️', player: topAssist, stat: topAssist?.assists || 0, label: 'Assists' },
    { title: 'Best Keeper', icon: '🧤', player: topGK, stat: topGK?.saves || 0, label: 'Saves' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 4 }}>Player Statistics</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Stats derived in real-time from match events.</p>
      </div>

      {/* Leader cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {leaderCards.map(card => (
          <div key={card.title} className="sa-leader-card">
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              {card.icon} {card.title}
            </div>
            {card.player ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700 }}>{card.player.jerseyName || card.player.user?.name || '—'}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-green)', lineHeight: 1 }}>{card.stat}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{card.label}</div>
                </div>
              </div>
            ) : <span style={{ color: 'var(--text-dim)' }}>No data yet</span>}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '0 12px', flex: 1, maxWidth: 260 }}>
          <Search size={14} color="var(--text-muted)" />
          <input placeholder="Search players..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-main)', fontSize: '0.9rem', width: '100%', paddingTop: 8, paddingBottom: 8 }} />
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.3)', padding: 4, borderRadius: 10 }}>
          {POSITIONS.map(p => <button key={p} onClick={() => setPosFilter(p)} style={{ padding: '5px 10px', borderRadius: 7, border: 'none', background: posFilter === p ? 'var(--bg-card-solid)' : 'transparent', color: posFilter === p ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>{p}</button>)}
        </div>
        <select className="form-control" style={{ width: 'auto', padding: '7px 12px', fontSize: '0.85rem' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          {SORT_OPTIONS.map(s => <option key={s.key} value={s.key}>Sort: {s.label}</option>)}
        </select>
        {teams.length > 0 && (
          <select className="form-control" style={{ width: 'auto', padding: '7px 12px', fontSize: '0.85rem' }} value={teamFilter} onChange={e => setTeamFilter(e.target.value)}>
            <option value="ALL">All Teams</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="sa-stat-header">
          <span>#</span><span>Player</span>
          <span title="Goals">G</span><span title="Assists">A</span><span title="Yellow Cards">Y</span>
          <span title="Red Cards">R</span><span title="Saves">SV</span><span title="Tackles">TK</span>
        </div>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading statistics...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>No players match your filters.</div>
        ) : (
          filtered.map((p, i) => {
            const team = teams.find(t => t.id === p.teamId);
            const name = p.jerseyName || p.user?.name || p.id;
            const pos = p.position || p.primaryPosition || 'MID';
            const isExpanded = expandedId === p.id;
            return (
              <div key={p.id}>
                <div className="sa-stat-player-row" onClick={() => setExpandedId(isExpanded ? null : p.id)}>
                  <span style={{ fontWeight: 800, color: 'var(--text-dim)', textAlign: 'center', fontSize: '12px' }}>{i + 1}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <span style={{ fontWeight: 700, fontSize: '13px' }}>{name}</span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {team?.color && <div style={{ width: 6, height: 6, borderRadius: '50%', background: team.color }}></div>}
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{team?.shortName || team?.name || ''} · {pos}</span>
                    </div>
                  </div>
                  <span style={{ textAlign: 'center', fontWeight: p.goals > 0 ? 700 : 400, color: p.goals > 0 ? 'var(--accent-green)' : 'var(--text-dim)' }}>{p.goals || 0}</span>
                  <span style={{ textAlign: 'center', fontWeight: p.assists > 0 ? 700 : 400, color: p.assists > 0 ? 'var(--accent-cyan)' : 'var(--text-dim)' }}>{p.assists || 0}</span>
                  <span style={{ textAlign: 'center', color: p.yellow > 0 ? '#fbbf24' : 'var(--text-dim)' }}>{p.yellow || 0}</span>
                  <span style={{ textAlign: 'center', color: p.red > 0 ? '#f87171' : 'var(--text-dim)' }}>{p.red || 0}</span>
                  <span style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{p.saves || 0}</span>
                  <span style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{p.tackles || 0}</span>
                </div>
                {isExpanded && (
                  <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 8 }}>Match events for {name}:</p>
                    {(p.events || []).length === 0 ? (
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>No events recorded.</span>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {(p.events || []).map((ev, ei) => (
                          <span key={ei} style={{ padding: '3px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.07)', fontSize: '11px', fontWeight: 700 }}>
                            {ev.kind} {ev.minute}'
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
