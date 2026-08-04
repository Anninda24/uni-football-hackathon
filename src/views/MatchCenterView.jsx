import React from 'react';
import { useTournament } from '../hooks/useTournament';
import { Calendar, Award, Clock, Users } from 'lucide-react';

export const MatchCenterView = () => {
  const { matches, standings, leaderboards, loading, error } = useTournament();

  const [rightTab, setRightTab] = useState('UPCOMING');

  const getTeam = (teamId) => {
    return { id: teamId, name: teamId };
  };

  const upcomingFixtures = matches.filter(f => f.status === 'UPCOMING');
  const completedFixtures = matches.filter(f => f.status === 'COMPLETED');

  const getResultBadge = (homeScore, awayScore) => {
    if (homeScore > awayScore) return 'W';
    if (homeScore < awayScore) return 'L';
    return 'D';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading matches...</div>;
  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--accent-red)' }}>Error: {error}</div>;

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        background: 'linear-gradient(135deg, rgba(0,217,255,0.12) 0%, rgba(0,230,153,0.07) 100%)',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-25px', right: '-25px', fontSize: '7rem', opacity: 0.05, pointerEvents: 'none', userSelect: 'none' }}>
          ⚽
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={26} color="var(--accent-cyan)" />
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>Match Center</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Upcoming fixtures and recent results across the league
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Matches */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <Clock size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Upcoming Matches</h3>
          <span className="badge badge-cyan" style={{ fontSize: '0.65rem', marginLeft: '4px' }}>{upcomingFixtures.length}</span>
        </div>

        {upcomingFixtures.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
            <Clock size={36} color="var(--text-dim)" style={{ marginBottom: '10px', opacity: 0.6 }} />
            <p style={{ fontSize: '0.9rem' }}>No upcoming matches scheduled.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcomingFixtures.map(fixture => {
              const homeTeam = getTeam(fixture.teamAId);
              const awayTeam = getTeam(fixture.teamBId);

              return (
                <div key={fixture.id} style={{
                  background: 'rgba(0,217,255,0.06)',
                  border: '1px solid rgba(0,217,255,0.15)',
                  borderRadius: '14px',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  {/* Teams Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '200px' }}>
                    {/* Home Team */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.3rem', flexShrink: 0
                      }}>
                        {homeTeam?.logo || '⚽'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{homeTeam?.name || 'TBD'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>HOME</div>
                      </div>
                    </div>

                    {/* VS */}
                    <div style={{
                      fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>VS</div>

                    {/* Away Team */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.3rem', flexShrink: 0
                      }}>
                        {awayTeam?.logo || '⚽'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{awayTeam?.name || 'TBD'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>AWAY</div>
                      </div>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {formatDate(fixture.scheduledTime)}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginTop: '2px' }}>
                        <Clock size={10} color="var(--text-dim)" />
                        {formatTime(fixture.scheduledTime)}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        <Users size={10} color="var(--text-dim)" style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                        {fixture.venue}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                      {fixture.isTwoLegged && (
                        <span className="badge badge-gold" style={{ fontSize: '0.6rem' }}>
                          Leg {fixture.leg}
                        </span>
                      )}
                      {fixture.pairedMatchId && (
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>
                          2-Legged
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Results */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <Award size={18} color="var(--accent-gold)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Recent Results</h3>
          <span className="badge badge-gold" style={{ fontSize: '0.65rem', marginLeft: '4px' }}>{completedFixtures.length}</span>
        </div>

        {completedFixtures.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
            <Award size={36} color="var(--text-dim)" style={{ marginBottom: '10px', opacity: 0.6 }} />
            <p style={{ fontSize: '0.9rem' }}>No completed matches yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {completedFixtures.map(fixture => {
              const homeTeam = getTeam(fixture.teamAId);
              const awayTeam = getTeam(fixture.teamBId);
              const result = getResultBadge(fixture.scoreA, fixture.scoreB);

              const bgColor = result === 'W' ? 'rgba(0,230,153,0.07)' : result === 'L' ? 'rgba(255,77,109,0.07)' : 'rgba(255,183,3,0.07)';
              const borderColor = result === 'W' ? 'rgba(0,230,153,0.2)' : result === 'L' ? 'rgba(255,77,109,0.2)' : 'rgba(255,183,3,0.2)';
              const badgeClass = result === 'W' ? 'badge-green' : result === 'L' ? 'badge-red' : 'badge-gold';

              return (
                <div key={fixture.id} style={{
                  background: bgColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '14px',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  {/* Teams Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.3rem', flexShrink: 0
                      }}>
                        {homeTeam?.logo || '⚽'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{homeTeam?.name || 'TBD'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>HOME</div>
                      </div>
                    </div>

                    <div style={{
                      fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>VS</div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.3rem', flexShrink: 0
                      }}>
                        {awayTeam?.logo || '⚽'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{awayTeam?.name || 'TBD'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>AWAY</div>
                      </div>
                    </div>
                  </div>

                  {/* Score + Badge + Date */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {formatDate(fixture.scheduledTime)}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        {fixture.venue}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.05rem',
                        color: 'var(--text-primary)'
                      }}>
                        {fixture.scoreA} - {fixture.scoreB}
                      </span>
                      <span className={`badge ${badgeClass}`} style={{ fontSize: '0.65rem', padding: '4px 10px' }}>
                        {result}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
