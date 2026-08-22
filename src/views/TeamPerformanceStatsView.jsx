import React from 'react';
import { useSystem } from '../context/SystemContext';
import { Trophy, Target, Award } from 'lucide-react';

export const TeamPerformanceStatsView = () => {
  const { calculatePlayerLeaderboards, players, teams } = useSystem();

  const leaderboards = calculatePlayerLeaderboards();

  const getTeam = (teamId) => teams.find(t => t.id === teamId);

  const topScorer = [...leaderboards].sort((a, b) => b.goals - a.goals).slice(0, 3);
  const topAssists = [...leaderboards].sort((a, b) => b.assists - a.assists).slice(0, 3);
  const mostCards = [...leaderboards].sort((a, b) => (b.yellowCards + b.redCards) - (a.yellowCards + a.redCards)).slice(0, 3);

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        background: 'linear-gradient(135deg, rgba(255,183,3,0.12) 0%, rgba(0,230,153,0.07) 100%)',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-25px', right: '-25px', fontSize: '7rem', opacity: 0.05, pointerEvents: 'none', userSelect: 'none' }}>
          🏆
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Trophy size={26} color="var(--accent-gold)" />
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>Team Performance Stats</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Player statistics aggregated from completed match events
            </p>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>

        {/* Top Scorers */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Target size={18} color="var(--accent-green)" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Top Scorers</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topScorer.filter(s => s.goals > 0).length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', padding: '12px 0' }}>No goals recorded yet.</p>
            ) : (
              topScorer.filter(s => s.goals > 0).map((entry, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: '10px',
                  background: 'rgba(0,230,153,0.05)', border: '1px solid rgba(0,230,153,0.12)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      width: '24px', height: '24px', borderRadius: '6px',
                      background: i === 0 ? 'rgba(255,183,3,0.2)' : 'rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 800, color: i === 0 ? 'var(--accent-gold)' : 'var(--text-muted)'
                    }}>#{i + 1}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{entry.player.name}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                        {entry.team?.logo} {entry.team?.name || 'Unassigned'}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                    {entry.goals}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Assists */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Award size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Top Assists</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topAssists.filter(s => s.assists > 0).length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', padding: '12px 0' }}>No assists recorded yet.</p>
            ) : (
              topAssists.filter(s => s.assists > 0).map((entry, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: '10px',
                  background: 'rgba(0,217,255,0.05)', border: '1px solid rgba(0,217,255,0.12)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      width: '24px', height: '24px', borderRadius: '6px',
                      background: i === 0 ? 'rgba(255,183,3,0.2)' : 'rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 800, color: i === 0 ? 'var(--accent-gold)' : 'var(--text-muted)'
                    }}>#{i + 1}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{entry.player.name}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                        {entry.team?.logo} {entry.team?.name || 'Unassigned'}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                    {entry.assists}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Discipline */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Award size={18} color="var(--accent-red)" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Discipline Record</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {mostCards.filter(s => s.yellowCards + s.redCards > 0).length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', padding: '12px 0' }}>No cards recorded yet.</p>
            ) : (
              mostCards.filter(s => s.yellowCards + s.redCards > 0).map((entry, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: '10px',
                  background: 'rgba(255,77,109,0.05)', border: '1px solid rgba(255,77,109,0.12)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      width: '24px', height: '24px', borderRadius: '6px',
                      background: 'rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)'
                    }}>#{i + 1}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{entry.player.name}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                        {entry.team?.logo} {entry.team?.name || 'Unassigned'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {entry.yellowCards > 0 && (
                      <span className="badge badge-gold" style={{ fontSize: '0.6rem' }}>{entry.yellowCards} YC</span>
                    )}
                    {entry.redCards > 0 && (
                      <span className="badge badge-red" style={{ fontSize: '0.6rem' }}>{entry.redCards} RC</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Full Stats Table */}
      <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <Trophy size={18} color="var(--accent-gold)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>All Player Statistics</h3>
        </div>

        {leaderboards.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textAlign: 'center', padding: '30px' }}>
            No player statistics available. Complete some matches to see data here.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Player</th>
                <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Team</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Goals</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Assists</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>YC</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>RC</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Clean Sheets</th>
              </tr>
            </thead>
            <tbody>
              {leaderboards.map((entry, i) => {
                const team = getTeam(entry.player.soldToTeamId);
                const rowBg = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)';

                return (
                  <tr key={entry.player.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: rowBg }}>
                    <td style={{ padding: '10px 8px', fontSize: '0.85rem', fontWeight: 600 }}>
                      {entry.player.name}
                    </td>
                    <td style={{ padding: '10px 8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {team ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>{team.logo}</span>
                          <span>{team.name}</span>
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>Unassigned</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <span style={{
                        fontWeight: 800, fontSize: '0.9rem',
                        color: entry.goals > 0 ? 'var(--accent-green)' : 'var(--text-dim)',
                        fontFamily: 'var(--font-mono)'
                      }}>{entry.goals}</span>
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <span style={{
                        fontWeight: 800, fontSize: '0.9rem',
                        color: entry.assists > 0 ? 'var(--accent-cyan)' : 'var(--text-dim)',
                        fontFamily: 'var(--font-mono)'
                      }}>{entry.assists}</span>
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <span style={{
                        fontWeight: 800, fontSize: '0.9rem',
                        color: entry.yellowCards > 0 ? 'var(--accent-gold)' : 'var(--text-dim)',
                        fontFamily: 'var(--font-mono)'
                      }}>{entry.yellowCards}</span>
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <span style={{
                        fontWeight: 800, fontSize: '0.9rem',
                        color: entry.redCards > 0 ? 'var(--accent-red)' : 'var(--text-dim)',
                        fontFamily: 'var(--font-mono)'
                      }}>{entry.redCards}</span>
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <span style={{
                        fontWeight: 800, fontSize: '0.9rem',
                        color: entry.cleanSheets > 0 ? 'var(--accent-cyan)' : 'var(--text-dim)',
                        fontFamily: 'var(--font-mono)'
                      }}>{entry.cleanSheets}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
