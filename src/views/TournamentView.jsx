import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { useTournament } from '../hooks/useTournament';
import { 
  Trophy, 
  Calendar, 
  Award, 
  Newspaper, 
  Plus, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Layers,
  Edit3,
  Flame,
  Shield,
  Activity
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export const TournamentView = ({ defaultTab = 'MATCHES' }) => {
  const { 
    systemState, 
    currentUser, 
    teams, 
    players, 
    setFixtures,
    addNotification 
  } = useSystem();

  const { matches: backendMatches, standings: backendStandings, leaderboards, refetch } = useTournament();
  const [rightTab, setRightTab] = useState(defaultTab);
  const [showFixtureModal, setShowFixtureModal] = useState(false);
  const [homeTeamId, setHomeTeamId] = useState(teams[0]?.id || '');
  const [awayTeamId, setAwayTeamId] = useState(teams[1]?.id || '');
  const [venue, setVenue] = useState('University Main Stadium');
  const [date, setDate] = useState('2026-08-25T16:00');
  const [isLegged, setIsLegged] = useState(true);
  const [selectedFixture, setSelectedFixture] = useState(null);
  const [editHomeScore, setEditHomeScore] = useState(0);
  const [editAwayScore, setEditAwayScore] = useState(0);
  const [eventPlayerId, setEventPlayerId] = useState('');
  const [eventType, setEventType] = useState('GOAL');
  const [eventAssistId, setEventAssistId] = useState('');
  const [eventMinute, setEventMinute] = useState(45);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [news, setNews] = useState([
    {
      id: 'news-1',
      title: 'Franchise League 2026 Season Kickoff Announced!',
      content: 'The Super Admin has officially opened player registrations. All university athletes are encouraged to submit their profiles before auction phase begins.',
      date: '2026-07-30T10:00',
      author: 'Super Admin'
    },
    {
      id: 'news-2',
      title: 'Record Platinum Base Price Set at $15,000',
      content: 'Tier rules updated! Platinum base prices start at $15,000, offering intense competition for top marquee players during the live auction.',
      date: '2026-07-31T14:30',
      author: 'League Operations'
    }
  ]);

  // Prefer backend data when available, fallback to local fixtures
  const fixtures = backendMatches.length > 0 ? backendMatches : [];
  const standings = backendStandings.length > 0 ? backendStandings : [];
  const topScorers = leaderboards.topScorers || [];
  const topAssists = leaderboards.topAssists || [];
  const cleanSheetsList = leaderboards.cleanSheets || [];

  const handleCreateFixture = async (e) => {
    e.preventDefault();
    if (homeTeamId === awayTeamId) {
      addNotification('error', 'Invalid Matchup', 'Home and Away teams must be different.');
      return;
    }

    const token = localStorage.getItem('ff_jwt_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}/tournament/matches`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          teamAId: homeTeamId,
          teamBId: awayTeamId,
          teamAName: teams.find(t => t.id === homeTeamId)?.name || '',
          teamBName: teams.find(t => t.id === awayTeamId)?.name || '',
          scheduledTime: date,
          venue,
          isTwoLegged: isLegged
        })
      });
      const data = await res.json();
      if (data.success) {
        addNotification('success', 'Fixtures Created', isLegged ? 'Home and Away fixtures successfully added.' : 'Single match fixture created.');
        refetch();
      } else {
        addNotification('error', 'Error', data.message || 'Failed to create fixtures');
      }
    } catch (err) {
      addNotification('error', 'Network Error', err.message);
    }

    setShowFixtureModal(false);
  };

  const openScoreModal = (fix) => {
    setSelectedFixture(fix);
    setEditHomeScore(fix.scoreA || 0);
    setEditAwayScore(fix.scoreB || 0);
  };

  const handleSaveScore = async (e) => {
    e.preventDefault();
    if (!selectedFixture) return;

    const token = localStorage.getItem('ff_jwt_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}/tournament/matches/${selectedFixture.id}/score`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          scoreA: Number(editHomeScore),
          scoreB: Number(editAwayScore),
          status: 'COMPLETED'
        })
      });
      const data = await res.json();
      if (data.success) {
        addNotification('success', 'Match Score Updated', 'Live match result broadcast & points table auto-updated.');
        refetch();
      } else {
        addNotification('error', 'Error', data.message || 'Failed to update score');
      }
    } catch (err) {
      addNotification('error', 'Network Error', err.message);
    }

    setSelectedFixture(null);
  };

  const handlePostNews = (e) => {
    e.preventDefault();
    if (!newsTitle || !newsContent) return;

    const post = {
      id: 'news-' + Date.now(),
      title: newsTitle,
      content: newsContent,
      date: new Date().toISOString(),
      author: currentUser.name
    };

    setNews(prev => [post, ...prev]);
    setNewsTitle('');
    setNewsContent('');
    addNotification('success', 'News Published', 'Article posted to league news portal.');
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!eventPlayerId || !selectedFixture) return;

    const ply = players.find(p => p.id === eventPlayerId);

    const newEvent = {
      id: 'ev-' + Date.now(),
      type: eventType,
      playerId: eventPlayerId,
      teamId: ply ? ply.soldToTeamId : null,
      minute: Number(eventMinute),
      assistPlayerId: eventAssistId || null
    };

    addNotification('info', 'Match Event Logged', `${eventType} logged at ${eventMinute}'!`);
    setEventPlayerId('');
    setEventAssistId('');
  };

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Right-side Tabbed Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '24px' }}>
        
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {rightTab === 'MATCHES' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {fixtures.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                  <Clock size={36} color="var(--text-dim)" style={{ marginBottom: '10px', opacity: 0.6 }} />
                  <p style={{ fontSize: '0.9rem' }}>No fixtures scheduled. Generate one to get started.</p>
                </div>
              )}
              {fixtures.map(fix => {
                const homeTeam = teams.find(t => t.id === fix.teamAId) || teams.find(t => t.id === fix.homeTeamId);
                const awayTeam = teams.find(t => t.id === fix.teamBId) || teams.find(t => t.id === fix.awayTeamId);
                const pairedFix = fix.pairedMatchId ? fixtures.find(f => f.id === fix.pairedMatchId) : null;

                let aggHome = fix.scoreA || 0;
                let aggAway = fix.scoreB || 0;
                if (pairedFix && pairedFix.status === 'COMPLETED') {
                  if (fix.leg === 1) {
                    aggHome += pairedFix.scoreB || 0;
                    aggAway += pairedFix.scoreA || 0;
                  } else {
                    aggHome += pairedFix.scoreB || 0;
                    aggAway += pairedFix.scoreA || 0;
                  }
                }

                return (
                  <div key={fix.id} className="glass-panel" style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '20px' }}>
                    
                    {/* Home Team */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '2.5rem' }}>{homeTeam?.logo || '⚽'}</span>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{homeTeam?.name}</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HOME TEAM</span>
                      </div>
                    </div>

                    {/* Score & Match Details Center */}
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        {fix.isTwoLegged && (
                          <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                            <Layers size={12} /> 2-LEGGED (LEG {fix.leg})
                          </span>
                        )}
                        <span className={`badge ${fix.status === 'COMPLETED' ? 'badge-green' : fix.status === 'LIVE' ? 'badge-gold' : 'badge-secondary'}`}>
                          {fix.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '2px', color: 'var(--accent-gold)' }}>
                        {fix.scoreA} - {fix.scoreB}
                      </div>

                      {fix.isTwoLegged && pairedFix && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 700, marginTop: '4px' }}>
                          Aggregate Result: {aggHome} - {aggAway}
                        </div>
                      )}

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                        <span><Clock size={12} /> {fix.scheduledTime ? new Date(fix.scheduledTime).toLocaleString() : 'TBD'}</span>
                        <span><MapPin size={12} /> {fix.venue || 'TBD'}</span>
                      </div>

                      {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'PODIUM_ADMIN') && (
                        <button onClick={() => openScoreModal(fix)} className="btn btn-secondary" style={{ marginTop: '10px', padding: '4px 12px', fontSize: '0.75rem' }}>
                          <Edit3 size={12} /> Update Score & Events
                        </button>
                      )}
                    </div>

                    {/* Away Team */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{awayTeam?.name}</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AWAY TEAM</span>
                      </div>
                      <span style={{ fontSize: '2.5rem' }}>{awayTeam?.logo || '⚽'}</span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {rightTab === 'STANDINGS' && (
            <div className="glass-panel" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Trophy color="var(--accent-gold)" /> Automated League Points Table
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Real-time standings updated dynamically from match results (Win: 3pts, Draw: 1pt, Loss: 0pt).
                  </p>
                </div>
                <span className="badge badge-green"><Activity size={14} /> LIVE RE-CALCULATED</span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px' }}>Pos</th>
                    <th style={{ padding: '12px' }}>Franchise Team</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>P</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>W</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>D</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>L</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>GF</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>GA</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>GD</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row, index) => (
                    <tr key={row.teamId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: index === 0 ? 'rgba(255, 183, 3, 0.08)' : 'transparent' }}>
                      <td style={{ padding: '14px', fontWeight: 800, color: index === 0 ? 'var(--accent-gold)' : 'var(--text-main)' }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.4rem' }}>{row.teamLogo}</span>
                        <span>{row.teamName}</span>
                      </td>
                      <td style={{ padding: '14px', textAlign: 'center' }}>{row.played}</td>
                      <td style={{ padding: '14px', textAlign: 'center', color: 'var(--accent-green)', fontWeight: 700 }}>{row.won}</td>
                      <td style={{ padding: '14px', textAlign: 'center' }}>{row.drawn}</td>
                      <td style={{ padding: '14px', textAlign: 'center', color: 'var(--accent-red)' }}>{row.lost}</td>
                      <td style={{ padding: '14px', textAlign: 'center' }}>{row.gf}</td>
                      <td style={{ padding: '14px', textAlign: 'center' }}>{row.ga}</td>
                      <td style={{ padding: '14px', textAlign: 'center', fontWeight: 700 }}>
                        {row.gd > 0 ? `+${row.gd}` : row.gd}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'center', fontWeight: 900, fontSize: '1.1rem', color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>
                        {row.points}
                      </td>
                    </tr>
                  ))}
                  {standings.length === 0 && (
                    <tr><td colSpan="10" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)' }}>No completed matches yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {rightTab === 'STATS' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
              
              {/* Golden Boot Top Scorers */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Flame size={18} /> Golden Boot (Top Scorers)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {topScorers.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No stats recorded yet.</p>}
                  {topScorers.slice(0, 5).map((stat, idx) => (
                    <div key={stat.playerId} style={{ background: 'var(--bg-card-solid)', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 800, color: 'var(--accent-gold)' }}>#{idx + 1}</span>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{stat.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Player ID: {stat.playerId}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>
                        {stat.goals} ⚽
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Playmaker Top Assists */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} /> Playmaker (Top Assists)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {topAssists.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No stats recorded yet.</p>}
                  {topAssists.slice(0, 5).map((stat, idx) => (
                    <div key={stat.playerId} style={{ background: 'var(--bg-card-solid)', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>#{idx + 1}</span>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{stat.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Player ID: {stat.playerId}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                        {stat.assists} 👟
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Golden Glove Clean Sheets */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-green)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={18} /> Golden Glove (Clean Sheets)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {cleanSheetsList.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No stats recorded yet.</p>}
                  {cleanSheetsList.slice(0, 5).map((stat, idx) => (
                    <div key={stat.playerId} style={{ background: 'var(--bg-card-solid)', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 800, color: 'var(--accent-green)' }}>#{idx + 1}</span>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{stat.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Player ID: {stat.playerId}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                        {stat.cleanSheets} 🧤
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {rightTab === 'NEWS' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
              
              {/* News Feed */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px' }}>Official League News Feed</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {news.map(post => (
                    <div key={post.id} style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-green)' }}>{post.title}</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6 }}>{post.content}</p>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>Author: {post.author}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Publish News */}
              {currentUser.role === 'SUPER_ADMIN' && (
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px' }}>Publish News Update</h3>
                  <form onSubmit={handlePostNews}>
                    <div className="form-group">
                      <label className="form-label">Article Headline</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Headline..."
                        value={newsTitle}
                        onChange={(e) => setNewsTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Article Body Content</label>
                      <textarea
                        className="form-control"
                        rows={5}
                        placeholder="Write article details..."
                        value={newsContent}
                        onChange={(e) => setNewsContent(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                      Publish News Post
                    </button>
                  </form>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Right-side vertical tab buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', height: 'fit-content' }}>
          <button
            onClick={() => setRightTab('MATCHES')}
            style={{
              padding: '14px 16px',
              border: 'none',
              borderBottom: rightTab === 'MATCHES' ? '2px solid var(--accent-gold)' : '2px solid transparent',
              background: rightTab === 'MATCHES' ? 'rgba(255, 183, 3, 0.08)' : 'transparent',
              color: rightTab === 'MATCHES' ? 'var(--accent-gold)' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Calendar size={16} /> Matches
          </button>
          <button
            onClick={() => setRightTab('STANDINGS')}
            style={{
              padding: '14px 16px',
              border: 'none',
              borderBottom: rightTab === 'STANDINGS' ? '2px solid var(--accent-green)' : '2px solid transparent',
              background: rightTab === 'STANDINGS' ? 'rgba(0, 230, 153, 0.08)' : 'transparent',
              color: rightTab === 'STANDINGS' ? 'var(--accent-green)' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Trophy size={16} /> Standings
          </button>
          <button
            onClick={() => setRightTab('STATS')}
            style={{
              padding: '14px 16px',
              border: 'none',
              borderBottom: rightTab === 'STATS' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              background: rightTab === 'STATS' ? 'rgba(0, 217, 255, 0.08)' : 'transparent',
              color: rightTab === 'STATS' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Award size={16} /> Stats
          </button>
          <button
            onClick={() => setRightTab('NEWS')}
            style={{
              padding: '14px 16px',
              border: 'none',
              borderBottom: rightTab === 'NEWS' ? '2px solid var(--accent-purple)' : '2px solid transparent',
              background: rightTab === 'NEWS' ? 'rgba(157, 78, 221, 0.08)' : 'transparent',
              color: rightTab === 'NEWS' ? 'var(--accent-purple)' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Newspaper size={16} /> News
          </button>
        </div>

      </div>

      {/* NEW FIXTURE MODAL */}
      {showFixtureModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Generate Tournament Fixture</h3>
            <form onSubmit={handleCreateFixture}>
              <div className="form-group">
                <label className="form-label">Home Team</label>
                <select className="form-control" value={homeTeamId} onChange={(e) => setHomeTeamId(e.target.value)}>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Away Team</label>
                <select className="form-control" value={awayTeamId} onChange={(e) => setAwayTeamId(e.target.value)}>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">The "Legged" Toggle (Home & Away Pair)</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsLegged(true)}
                    className={`btn ${isLegged ? 'btn-gold' : 'btn-secondary'}`}
                    style={{ flex: 1, fontSize: '0.8rem' }}
                  >
                    2-Legged (Home & Away)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLegged(false)}
                    className={`btn ${!isLegged ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, fontSize: '0.8rem' }}
                  >
                    Single Match
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Venue</label>
                  <input type="text" className="form-control" value={venue} onChange={(e) => setVenue(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Date/Time</label>
                  <input type="datetime-local" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-gold" style={{ flex: 1 }}>Create Fixture</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowFixtureModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCORE & EVENTS LOGGER MODAL */}
      {selectedFixture && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '14px' }}>
              Live Score & Match Event Logger
            </h3>

            <form onSubmit={handleSaveScore}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '14px', background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <label className="form-label">{teams.find(t => t.id === selectedFixture.teamAId)?.name || teams.find(t => t.id === selectedFixture.homeTeamId)?.name}</label>
                  <input type="number" className="form-control" style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800 }} value={editHomeScore} onChange={(e) => setEditHomeScore(e.target.value)} min={0} />
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-muted)' }}>VS</div>
                <div style={{ textAlign: 'center' }}>
                  <label className="form-label">{teams.find(t => t.id === selectedFixture.teamBId)?.name || teams.find(t => t.id === selectedFixture.awayTeamId)?.name}</label>
                  <input type="number" className="form-control" style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800 }} value={editAwayScore} onChange={(e) => setEditAwayScore(e.target.value)} min={0} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Final Score</button>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedFixture(null)}>Close</button>
              </div>
            </form>

            <hr style={{ borderColor: 'var(--border-color)', margin: '20px 0' }} />

            <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '10px' }}>Log Individual Player Event</h4>
            <form onSubmit={handleAddEvent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px' }}>
              <select className="form-control" value={eventPlayerId} onChange={(e) => setEventPlayerId(e.target.value)}>
                <option value="">Select Player...</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.jerseyName})</option>)}
              </select>

              <select className="form-control" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                <option value="GOAL">⚽ Goal</option>
                <option value="ASSIST">👟 Assist</option>
                <option value="YELLOW_CARD">🟨 Yellow Card</option>
                <option value="RED_CARD">🟥 Red Card</option>
              </select>

              <button type="submit" className="btn btn-gold">Log</button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
