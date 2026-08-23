import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api/sub-admin';

export default function SAStandingsView() {
  const { currentUser } = useAuth();
  const token = currentUser?.token;
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('ALL');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API}/standings?mode=${mode}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setStandings(Array.isArray(d) ? d : [])).catch(() => setStandings([]))
      .finally(() => setLoading(false));
  }, [token, mode]);

  const MODES = ['ALL', 'SINGLE', 'TWOLEG'];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 4 }}>Standings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Points table auto-computed from completed match results.</p>
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.3)', padding: 4, borderRadius: 10 }}>
          {MODES.map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: mode === m ? 'var(--bg-card-solid)' : 'transparent', color: mode === m ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>{m}</button>
          ))}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading standings...</div>
        ) : standings.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 10 }}>📊</div>
            <p>No completed matches yet. Standings will appear here once matches are finished.</p>
          </div>
        ) : (
          <table className="sa-standings-table">
            <thead>
              <tr>
                <th style={{ width: 36, textAlign: 'center' }}>#</th>
                <th>Team</th>
                <th>MP</th><th>W</th><th>D</th><th>L</th>
                <th>GF</th><th>GA</th><th>GD</th>
                <th>Pts</th>
                <th>Form</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, i) => (
                <tr key={row.teamId} className={i === 0 ? 'leader' : ''}>
                  <td style={{ fontWeight: 800, color: i === 0 ? '#FFB800' : 'var(--text-muted)', textAlign: 'center' }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {row.color && <div style={{ width: 8, height: 8, borderRadius: '50%', background: row.color, flexShrink: 0 }}></div>}
                      <span style={{ fontWeight: 600 }}>{row.name}</span>
                      {row.shortName && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.shortName}</span>}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{row.played}</td>
                  <td style={{ color: '#4ade80', fontWeight: 700 }}>{row.won}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{row.drawn}</td>
                  <td style={{ color: '#f87171' }}>{row.lost}</td>
                  <td>{row.gf}</td>
                  <td>{row.ga}</td>
                  <td style={{ fontWeight: 700, color: row.gd > 0 ? '#4ade80' : row.gd < 0 ? '#f87171' : 'var(--text-muted)' }}>
                    {row.gd > 0 ? '+' : ''}{row.gd}
                  </td>
                  <td>
                    <span className={`sa-points-badge${i === 0 ? ' leader' : ''}`}>{row.points}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                      {(row.form || []).map((f, fi) => (
                        <span key={fi} className={`sa-form-badge ${f}`}>{f === 'win' ? 'W' : f === 'draw' ? 'D' : 'L'}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
