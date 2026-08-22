import React from 'react';
import { useSystem } from '../context/SystemContext';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

export const AuctionScheduleView = () => {
  const { fixtures, teams } = useSystem();

  const getTeam = (teamId) => teams.find(t => t.id === teamId);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const grouped = fixtures.reduce((acc, fix) => {
    const dateKey = new Date(fix.date).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(fix);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Hero Header */}
      <div className="glass-panel" style={{
        padding: '28px',
        background: 'linear-gradient(135deg, rgba(0,217,255,0.1) 0%, rgba(157,78,221,0.07) 100%)',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-20px', right: '-20px', fontSize: '7rem', opacity: 0.05,
          pointerEvents: 'none', userSelect: 'none'
        }}>
          <Calendar size={120} color="var(--accent-cyan)" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <Calendar size={28} color="var(--accent-cyan)" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>
            Auction Schedule
          </h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
          Upcoming and completed fixture timeline grouped by date.
        </p>
      </div>

      {sortedDates.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
          <Calendar size={40} color="var(--text-dim)" style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '0.9rem' }}>No fixtures scheduled yet.</p>
        </div>
      ) : (
        sortedDates.map((dateKey) => {
          const dayFixtures = grouped[dateKey];
          const isToday = dateKey === new Date().toDateString();
          return (
            <div key={dateKey} className="glass-panel" style={{ padding: '22px' }}>
              {/* Date Header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px',
                paddingBottom: '10px', borderBottom: '1px solid var(--border-color)'
              }}>
                <Calendar size={18} color={isToday ? 'var(--accent-gold)' : 'var(--accent-cyan)'} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isToday ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                    {formatDate(dateKey)}
                    {isToday && <span style={{ marginLeft: '8px', fontSize: '0.65rem' }} className="badge badge-gold">TODAY</span>}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    {dayFixtures.length} fixture{dayFixtures.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Fixture Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {dayFixtures.map((fix) => {
                  const home = getTeam(fix.homeTeamId);
                  const away = getTeam(fix.awayTeamId);
                  return (
                    <div key={fix.id} style={{
                      background: fix.status === 'COMPLETED' ? 'rgba(0,230,153,0.05)' : 'rgba(0,217,255,0.06)',
                      border: `1px solid ${fix.status === 'COMPLETED' ? 'rgba(0,230,153,0.15)' : 'rgba(0,217,255,0.15)'}`,
                      borderRadius: '14px', padding: '14px 16px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                        {/* Home Team */}
                        <div style={{
                          width: '44px', height: '44px', borderRadius: '12px',
                          background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.4rem', flexShrink: 0
                        }}>
                          {home?.logo || '?'}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{home?.name || 'Unknown'}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Home</div>
                        </div>

                        {/* VS */}
                        <div style={{
                          fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-dim)',
                          textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 6px'
                        }}>
                          VS
                        </div>

                        {/* Away Team */}
                        <div style={{
                          width: '44px', height: '44px', borderRadius: '12px',
                          background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.4rem', flexShrink: 0
                        }}>
                          {away?.logo || '?'}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{away?.name || 'Unknown'}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Away</div>
                        </div>
                      </div>

                      {/* Details */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        {fix.status === 'COMPLETED' ? (
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800,
                            color: 'var(--accent-green)', background: 'rgba(0,230,153,0.1)',
                            padding: '4px 10px', borderRadius: '8px'
                          }}>
                            {fix.homeScore} - {fix.awayScore}
                          </span>
                        ) : (
                          <span style={{
                            fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700,
                            background: 'rgba(0,217,255,0.1)', padding: '4px 10px', borderRadius: '8px'
                          }}>
                            {formatTime(fix.date)}
                          </span>
                        )}
                        <span className={`badge ${fix.status === 'COMPLETED' ? 'badge-green' : fix.status === 'UPCOMING' ? 'badge-cyan' : 'badge-gold'}`}>
                          {fix.status}
                        </span>
                        {fix.isLegged && (
                          <span style={{
                            fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700,
                            background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '6px'
                          }}>
                            Leg {fix.leg}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
