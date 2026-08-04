import React, { useState, useMemo, useEffect } from 'react';
import { useSystem } from '../context/SystemContext';
import { useTournament } from '../hooks/useTournament';
import { 
  Trophy, 
  Calendar, 
  Award, 
  Plus, 
  Clock, 
  MapPin, 
  Layers,
  Edit3,
  Flame,
  Shield,
  Activity,
  Search,
  Crown,
  BarChart3,
  X
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export const TournamentView = ({ defaultTab = 'MATCHES', showTabs = true }) => {
  const { 
    currentUser, 
    teams, 
    players, 
    addNotification 
  } = useSystem();

  const { matches: backendMatches, standings: backendStandings, leaderboards, refetch } = useTournament();
  const [rightTab, setRightTab] = useState(defaultTab);

  // Sync active tab whenever the route changes (sidebar nav in Sub Admin reuses same component)
  useEffect(() => {
    setRightTab(defaultTab);
  }, [defaultTab]);
  
  // Modals state
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

  // Filters state
  const [matchStatusFilter, setMatchStatusFilter] = useState('ALL');
  const [matchSearch, setMatchSearch] = useState('');
  const [standingsMode, setStandingsMode] = useState('ALL');
  const [playerSearch, setPlayerSearch] = useState('');
  const [playerTeamFilter, setPlayerTeamFilter] = useState('ALL');
  const [playerSortKey, setPlayerSortKey] = useState('goals');

  // Add Match Modal state (separate from score edit modal)
  const [showAddMatchModal, setShowAddMatchModal] = useState(false);
  const [addHomeTeamId, setAddHomeTeamId] = useState(teams[0]?.id || '');
  const [addAwayTeamId, setAddAwayTeamId] = useState(teams[1]?.id || '');
  const [addDate, setAddDate] = useState('2026-08-25T16:00');
  const [addReturnDate, setAddReturnDate] = useState('2026-09-01T16:00');
  const [addIsLegged, setAddIsLegged] = useState(false);

  // Data helpers
  const fixtures = backendMatches.length > 0 ? backendMatches : [];
  const standings = backendStandings.length > 0 ? backendStandings : [];
  const topScorers = leaderboards.topScorers || [];
  const topAssists = leaderboards.topAssists || [];
  const cleanSheetsList = leaderboards.cleanSheets || [];

  // Filtered fixtures
  const filteredFixtures = useMemo(() => {
    return fixtures.filter(fix => {
      const homeTeam = teams.find(t => t.id === fix.teamAId || t.id === fix.homeTeamId);
      const awayTeam = teams.find(t => t.id === fix.teamBId || t.id === fix.awayTeamId);
      const searchMatch = !matchSearch.trim() || 
        (homeTeam?.name || fix.teamAName || '').toLowerCase().includes(matchSearch.toLowerCase()) ||
        (awayTeam?.name || fix.teamBName || '').toLowerCase().includes(matchSearch.toLowerCase());
      
      const statusMatch = matchStatusFilter === 'ALL' || fix.status === matchStatusFilter;
      return searchMatch && statusMatch;
    });
  }, [fixtures, teams, matchSearch, matchStatusFilter]);

  // Filtered standings by mode
  const filteredStandings = useMemo(() => {
    if (standingsMode === 'ALL') return standings;
    if (standingsMode === 'SINGLE') return standings.filter(s => !s.isTwoLegged);
    if (standingsMode === 'TWOLEG') return standings.filter(s => s.isTwoLegged);
    return standings;
  }, [standings, standingsMode]);

  // Leader team (1st place)
  const leagueLeader = filteredStandings[0];

  // Combined computed player statistics
  const combinedPlayerStats = useMemo(() => {
    return players.map(p => {
      const scorerObj = topScorers.find(s => s.playerId === p.id);
      const assistObj = topAssists.find(s => s.playerId === p.id);
      const csObj = cleanSheetsList.find(s => s.playerId === p.id);
      const team = teams.find(t => t.id === p.soldToTeamId || t.id === p.teamId);

      return {
        id: p.id,
        name: p.name,
        jerseyName: p.jerseyName || p.name,
        role: p.preferredPosition || p.category || 'Player',
        teamName: team?.name || 'Unassigned',
        teamLogo: team?.logo || '⚽',
        teamId: team?.id || '',
        goals: scorerObj?.goals || p.goals || 0,
        assists: assistObj?.assists || p.assists || 0,
        cleanSheets: csObj?.cleanSheets || p.cleanSheets || 0,
        yellowCards: p.yellowCards || 0,
        redCards: p.redCards || 0,
        played: p.matchesPlayed || (scorerObj?.goals ? 1 : 0)
      };
    }).filter(p => {
      const matchesSearch = !playerSearch.trim() || p.name.toLowerCase().includes(playerSearch.toLowerCase());
      const matchesTeam = playerTeamFilter === 'ALL' || p.teamId === playerTeamFilter;
      return matchesSearch && matchesTeam;
    }).sort((a, b) => (b[playerSortKey] || 0) - (a[playerSortKey] || 0));
  }, [players, teams, topScorers, topAssists, cleanSheetsList, playerSearch, playerTeamFilter, playerSortKey]);

  // Event handlers
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


  const handleAddMatch = async (e) => {
    e.preventDefault();
    if (!addHomeTeamId || !addAwayTeamId || addHomeTeamId === addAwayTeamId) {
      addNotification('error', 'Invalid Selection', 'Please select two different teams.');
      return;
    }

    if (addIsLegged && !addReturnDate) {
      addNotification('error', 'Missing Date', 'Please select a return leg date for the 2nd match.');
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
          teamAId: addHomeTeamId,
          teamBId: addAwayTeamId,
          scheduledTime: addDate,
          returnLegTime: addIsLegged ? addReturnDate : null,
          isTwoLegged: addIsLegged
        })
      });
      const data = await res.json();
      if (data.success) {
        addNotification('success', 'Match Added', addIsLegged ? 'Home and Away fixtures created.' : 'Match scheduled successfully.');
        refetch();
        setShowAddMatchModal(false);
      } else {
        addNotification('error', 'Error', data.message || 'Failed to create match');
      }
    } catch (err) {
      addNotification('error', 'Network Error', err.message);
    }
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!eventPlayerId || !selectedFixture) return;

    const ply = players.find(p => p.id === eventPlayerId);

    addNotification('info', 'Match Event Logged', `${eventType} logged for ${ply?.name || 'Player'} at ${eventMinute}'!`);
    setEventPlayerId('');
    setEventAssistId('');
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Header & Navigation Tabs Bar */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: '24px', border: '1px solid rgba(59, 130, 246, 0.25)', background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '20px', background: 'rgba(0, 230, 153, 0.12)', border: '1px solid rgba(0, 230, 153, 0.3)', color: '#00e699', fontSize: '0.78rem', fontWeight: 800, marginBottom: '8px' }}>
              <Activity size={14} /> GSTU CSE TOURNAMENT HUB
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              Live Tournament & Statistics
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: '6px 0 0 0' }}>
              Fixtures schedule, automated league standings, and comprehensive player performance statistics.
            </p>
          </div>

          {/* Admin Action */}
          {(currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'SUB_ADMIN') && (
            <button
              onClick={() => setShowAddMatchModal(true)}
              className="btn btn-gold"
              style={{ padding: '12px 24px', fontSize: '0.9rem', borderRadius: '12px' }}
            >
              <Plus size={18} /> Add Match
            </button>
          )}
        </div>

        {/* Main Navigation Tabs */}
        {showTabs && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '18px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setRightTab('MATCHES')}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: '1px solid',
              borderColor: rightTab === 'MATCHES' ? '#ffb703' : 'rgba(255, 255, 255, 0.1)',
              background: rightTab === 'MATCHES' ? 'rgba(255, 183, 3, 0.15)' : 'rgba(15, 23, 42, 0.6)',
              color: rightTab === 'MATCHES' ? '#ffb703' : '#94a3b8',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s ease'
            }}
          >
            <Calendar size={18} />
            <span>Matches</span>
            <span className="badge badge-gold" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>{fixtures.length}</span>
          </button>

          <button
            onClick={() => setRightTab('STANDINGS')}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: '1px solid',
              borderColor: rightTab === 'STANDINGS' ? '#00e699' : 'rgba(255, 255, 255, 0.1)',
              background: rightTab === 'STANDINGS' ? 'rgba(0, 230, 153, 0.15)' : 'rgba(15, 23, 42, 0.6)',
              color: rightTab === 'STANDINGS' ? '#00e699' : '#94a3b8',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s ease'
            }}
          >
            <Trophy size={18} />
            <span>Standings</span>
          </button>

          <button
            onClick={() => setRightTab('STATS')}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: '1px solid',
              borderColor: rightTab === 'STATS' ? '#00d9ff' : 'rgba(255, 255, 255, 0.1)',
              background: rightTab === 'STATS' ? 'rgba(0, 217, 255, 0.15)' : 'rgba(15, 23, 42, 0.6)',
              color: rightTab === 'STATS' ? '#00d9ff' : '#94a3b8',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s ease'
            }}
          >
            <Award size={18} />
            <span>Statistics</span>
          </button>
        </div>
        )}
      </div>

      {/* TAB 1: MATCHES VIEW */}
      {rightTab === 'MATCHES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Matches Filter Bar */}
          <div className="glass-panel" style={{ padding: '16px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginRight: '8px' }}>
                Filter Status:
              </span>
              {['ALL', 'LIVE', 'UPCOMING', 'COMPLETED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setMatchStatusFilter(st)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: matchStatusFilter === st ? '#3b82f6' : 'rgba(255, 255, 255, 0.08)',
                    background: matchStatusFilter === st ? 'rgba(59, 130, 246, 0.2)' : 'rgba(15, 23, 42, 0.5)',
                    color: matchStatusFilter === st ? '#60a5fa' : '#94a3b8',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {st}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', minWidth: '260px' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search team name..."
                value={matchSearch}
                onChange={(e) => setMatchSearch(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '38px', height: '38px', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Fixtures List */}
          {filteredFixtures.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '48px', borderRadius: '16px', color: 'var(--text-dim)' }}>
              <Clock size={40} color="var(--text-dim)" style={{ marginBottom: '12px', opacity: 0.6 }} />
              <h3 style={{ margin: 0, color: '#f8fafc' }}>No Matches Found</h3>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '6px' }}>There are no fixtures matching the selected filter criteria.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredFixtures.map(fix => {
                const homeTeam = teams.find(t => t.id === fix.teamAId || t.id === fix.homeTeamId);
                const awayTeam = teams.find(t => t.id === fix.teamBId || t.id === fix.awayTeamId);
                const pairedFix = fix.pairedMatchId ? fixtures.find(f => f.id === fix.pairedMatchId) : null;

                let aggHome = fix.scoreA || 0;
                let aggAway = fix.scoreB || 0;
                if (pairedFix && pairedFix.status === 'COMPLETED') {
                  aggHome += pairedFix.scoreB || 0;
                  aggAway += pairedFix.scoreA || 0;
                }

                return (
                  <div key={fix.id} className="glass-panel" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    
                    {/* Header Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={`badge ${fix.status === 'COMPLETED' ? 'badge-green' : fix.status === 'LIVE' ? 'badge-gold' : 'badge-secondary'}`} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                          {fix.status === 'LIVE' && <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', marginRight: '6px' }} className="animate-pulse" />}
                          {fix.status}
                        </span>
                        {fix.isTwoLegged && (
                          <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                            <Layers size={12} /> 2-LEGGED (LEG {fix.leg || 1})
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span><Clock size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {fix.scheduledTime ? new Date(fix.scheduledTime).toLocaleString() : 'TBD'}</span>
                        <span><MapPin size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {fix.venue || 'Main Stadium'}</span>
                      </div>
                    </div>

                    {/* Teams & Score Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '20px', padding: '10px 0' }}>
                      
                      {/* Home Team */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '2.8rem' }}>{homeTeam?.logo || '⚽'}</span>
                        <div>
                          <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, color: '#f8fafc' }}>{homeTeam?.name || fix.teamAName}</h3>
                          <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>HOME FRANCHISE</span>
                        </div>
                      </div>

                      {/* Scoreboard Center */}
                      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '3px', color: '#ffb703', lineHeight: 1 }}>
                          {fix.scoreA ?? 0} - {fix.scoreB ?? 0}
                        </div>

                        {fix.isTwoLegged && pairedFix && (
                          <div style={{ fontSize: '0.82rem', color: '#00d9ff', fontWeight: 800, marginTop: '6px', padding: '2px 10px', background: 'rgba(0, 217, 255, 0.1)', borderRadius: '10px' }}>
                            Aggregate: {aggHome} - {aggAway}
                          </div>
                        )}

                        {(currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'PODIUM_ADMIN') && (
                          <button onClick={() => openScoreModal(fix)} className="btn btn-secondary" style={{ marginTop: '12px', padding: '6px 14px', fontSize: '0.78rem' }}>
                            <Edit3 size={13} /> Update Score & Events
                          </button>
                        )}
                      </div>

                      {/* Away Team */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, color: '#f8fafc' }}>{awayTeam?.name || fix.teamBName}</h3>
                          <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>AWAY FRANCHISE</span>
                        </div>
                        <span style={{ fontSize: '2.8rem' }}>{awayTeam?.logo || '⚽'}</span>
                      </div>

                    </div>

                    {/* Match Event Log Details */}
                    {fix.events && fix.events.length > 0 && (
                      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.82rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {fix.events.filter(e => e.teamId === fix.teamAId || e.teamId === homeTeam?.id).map((ev, i) => {
                            const ply = players.find(p => p.id === ev.playerId);
                            return (
                              <div key={i} style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{ev.type === 'GOAL' ? '⚽' : ev.type === 'YELLOW_CARD' ? '🟨' : '🟥'}</span>
                                <span style={{ fontWeight: 700 }}>{ply?.name || ev.playerId}</span>
                                <span style={{ color: '#64748b' }}>({ev.minute}')</span>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right', alignItems: 'flex-end' }}>
                          {fix.events.filter(e => e.teamId === fix.teamBId || e.teamId === awayTeam?.id).map((ev, i) => {
                            const ply = players.find(p => p.id === ev.playerId);
                            return (
                              <div key={i} style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: '#64748b' }}>({ev.minute}')</span>
                                <span style={{ fontWeight: 700 }}>{ply?.name || ev.playerId}</span>
                                <span>{ev.type === 'GOAL' ? '⚽' : ev.type === 'YELLOW_CARD' ? '🟨' : '🟥'}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STANDINGS / POINTS TABLE VIEW */}
      {rightTab === 'STANDINGS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Top Podium Showcase Header */}
          {leagueLeader && (
            <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px', border: '1px solid rgba(255, 183, 3, 0.3)', background: 'linear-gradient(135deg, rgba(255, 183, 3, 0.12) 0%, rgba(15, 23, 42, 0.95) 60%, rgba(157, 78, 221, 0.1) 100%)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 900, color: '#ffb703', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    <Crown size={16} /> LEAGUE LEADER PODIUM
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '3rem' }}>{leagueLeader.teamLogo || '🏆'}</span>
                    <div>
                      <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, color: '#ffffff' }}>
                        {leagueLeader.teamName}
                      </h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700 }}>
                        <span style={{ color: '#00e699' }}>1st Place</span>
                        <span>•</span>
                        <span>{leagueLeader.played} Matches Played</span>
                        <span>•</span>
                        <span style={{ color: '#00d9ff' }}>+{leagueLeader.gd} Goal Diff</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top 3 Cards Grid */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  {filteredStandings.slice(0, 3).map((st, i) => (
                    <div
                      key={st.teamId || i}
                      style={{
                        padding: '14px 20px',
                        borderRadius: '16px',
                        background: i === 0 ? 'rgba(255, 183, 3, 0.15)' : i === 1 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(205, 127, 50, 0.15)',
                        border: i === 0 ? '1px solid rgba(255, 183, 3, 0.4)' : i === 1 ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(205, 127, 50, 0.4)',
                        textAlign: 'center',
                        minWidth: '100px'
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>
                        {i === 0 ? '1st Rank' : i === 1 ? '2nd Rank' : '3rd Rank'}
                      </div>
                      <div style={{ fontSize: '1.8rem', margin: '4px 0' }}>{st.teamLogo || '⚽'}</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>{st.teamName}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffb703', fontFamily: 'monospace', marginTop: '2px' }}>{st.points} pts</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Points Table Container */}
          <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#f8fafc' }}>
                  <BarChart3 color="#00e699" /> League Points Table Standings
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                  Updated dynamically from match results (Win: 3pts, Draw: 1pt, Loss: 0pt).
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(15, 23, 42, 0.8)', padding: '4px 8px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                {[
                  { id: 'ALL', label: 'All Fixtures' },
                  { id: 'SINGLE', label: 'Single Matches' },
                  { id: 'TWOLEG', label: 'Two-Legged Ties' }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setStandingsMode(m.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      background: standingsMode === m.id ? '#00e699' : 'transparent',
                      color: standingsMode === m.id ? '#0b0f19' : '#94a3b8',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '14px', textAlign: 'center', width: '60px' }}>Pos</th>
                    <th style={{ padding: '14px' }}>Franchise Team</th>
                    <th style={{ padding: '14px', textAlign: 'center' }}>P</th>
                    <th style={{ padding: '14px', textAlign: 'center' }}>W</th>
                    <th style={{ padding: '14px', textAlign: 'center' }}>D</th>
                    <th style={{ padding: '14px', textAlign: 'center' }}>L</th>
                    <th style={{ padding: '14px', textAlign: 'center' }}>GF</th>
                    <th style={{ padding: '14px', textAlign: 'center' }}>GA</th>
                    <th style={{ padding: '14px', textAlign: 'center' }}>GD</th>
                    <th style={{ padding: '14px', textAlign: 'center' }}>PTS</th>
                    <th style={{ padding: '14px', textAlign: 'center' }}>Form</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStandings.map((row, index) => (
                    <tr key={row.teamId || index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: index === 0 ? 'rgba(255, 183, 3, 0.08)' : index < 3 ? 'rgba(59, 130, 246, 0.04)' : 'transparent' }}>
                      <td style={{ padding: '16px', textAlign: 'center', fontWeight: 900, color: index === 0 ? '#ffb703' : '#f8fafc' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyCenter: 'center', width: '28px', height: '28px', borderRadius: '50%', background: index === 0 ? '#ffb703' : 'rgba(255, 255, 255, 0.06)', color: index === 0 ? '#000' : '#f8fafc' }}>
                          {index + 1}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '1.6rem' }}>{row.teamLogo || '⚽'}</span>
                        <span style={{ fontSize: '1rem', color: '#f8fafc' }}>{row.teamName}</span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', color: '#cbd5e1' }}>{row.played}</td>
                      <td style={{ padding: '16px', textAlign: 'center', color: '#00e699', fontWeight: 800 }}>{row.won}</td>
                      <td style={{ padding: '16px', textAlign: 'center', color: '#cbd5e1' }}>{row.drawn}</td>
                      <td style={{ padding: '16px', textAlign: 'center', color: '#f87171' }}>{row.lost}</td>
                      <td style={{ padding: '16px', textAlign: 'center', color: '#cbd5e1' }}>{row.gf}</td>
                      <td style={{ padding: '16px', textAlign: 'center', color: '#cbd5e1' }}>{row.ga}</td>
                      <td style={{ padding: '16px', textAlign: 'center', fontWeight: 800, color: row.gd > 0 ? '#00e699' : row.gd < 0 ? '#f87171' : '#cbd5e1' }}>
                        {row.gd > 0 ? `+${row.gd}` : row.gd}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', fontWeight: 900, fontSize: '1.2rem', color: '#ffb703', fontFamily: 'monospace' }}>
                        {row.points}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: 'rgba(0, 230, 153, 0.2)', color: '#00e699', fontSize: '0.65rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>W</span>
                          <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: 'rgba(0, 230, 153, 0.2)', color: '#00e699', fontSize: '0.65rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>W</span>
                          <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: 'rgba(100, 116, 139, 0.2)', color: '#94a3b8', fontSize: '0.65rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>D</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredStandings.length === 0 && (
                    <tr><td colSpan="11" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No matches recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STATISTICS VIEW */}
      {rightTab === 'STATS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Top Leaderboard Highlights Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            
            {/* Golden Boot Top Scorers */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', border: '1px solid rgba(255, 183, 3, 0.25)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffb703', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={20} /> Golden Boot (Top Goal Scorers)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {topScorers.slice(0, 5).map((stat, idx) => (
                  <div key={stat.playerId || idx} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 900, color: '#ffb703', width: '20px' }}>#{idx + 1}</span>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>{stat.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Rank #{idx + 1} Candidate</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffb703', fontFamily: 'monospace' }}>
                      {stat.goals} ⚽
                    </span>
                  </div>
                ))}
                {topScorers.length === 0 && <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No goal stats recorded yet.</p>}
              </div>
            </div>

            {/* Playmaker Top Assists */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', border: '1px solid rgba(0, 217, 255, 0.25)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#00d9ff', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} /> Playmaker (Top Assists)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {topAssists.slice(0, 5).map((stat, idx) => (
                  <div key={stat.playerId || idx} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 900, color: '#00d9ff', width: '20px' }}>#{idx + 1}</span>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>{stat.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Playmaker</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#00d9ff', fontFamily: 'monospace' }}>
                      {stat.assists} 👟
                    </span>
                  </div>
                ))}
                {topAssists.length === 0 && <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No assist stats recorded yet.</p>}
              </div>
            </div>

            {/* Golden Glove Clean Sheets */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', border: '1px solid rgba(0, 230, 153, 0.25)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#00e699', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} /> Golden Glove (Clean Sheets)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cleanSheetsList.slice(0, 5).map((stat, idx) => (
                  <div key={stat.playerId || idx} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 900, color: '#00e699', width: '20px' }}>#{idx + 1}</span>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>{stat.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Goalkeeper</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#00e699', fontFamily: 'monospace' }}>
                      {stat.cleanSheets} 🧤
                    </span>
                  </div>
                ))}
                {cleanSheetsList.length === 0 && <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No clean sheet stats recorded yet.</p>}
              </div>
            </div>

          </div>

          {/* Full Player Statistics Table & Filter Bar */}
          <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
            
            {/* Controls Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, color: '#f8fafc' }}>
                Complete Player Performance Directory
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {/* Search */}
                <div style={{ position: 'relative', width: '220px' }}>
                  <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#64748b' }} />
                  <input
                    type="text"
                    placeholder="Search player..."
                    value={playerSearch}
                    onChange={(e) => setPlayerSearch(e.target.value)}
                    className="form-control"
                    style={{ paddingLeft: '36px', height: '36px', fontSize: '0.82rem' }}
                  />
                </div>

                {/* Team Filter */}
                <select
                  value={playerTeamFilter}
                  onChange={(e) => setPlayerTeamFilter(e.target.value)}
                  className="form-control"
                  style={{ width: '160px', height: '36px', fontSize: '0.82rem' }}
                >
                  <option value="ALL">All Franchise Teams</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>

                {/* Sort selector */}
                <select
                  value={playerSortKey}
                  onChange={(e) => setPlayerSortKey(e.target.value)}
                  className="form-control"
                  style={{ width: '140px', height: '36px', fontSize: '0.82rem' }}
                >
                  <option value="goals">Sort: Goals ⚽</option>
                  <option value="assists">Sort: Assists 👟</option>
                  <option value="cleanSheets">Sort: Clean Sheets 🧤</option>
                  <option value="yellowCards">Sort: Yellow Cards 🟨</option>
                  <option value="redCards">Sort: Red Cards 🟥</option>
                </select>
              </div>
            </div>

            {/* Stats Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '14px', width: '50px', textAlign: 'center' }}>#</th>
                    <th style={{ padding: '14px' }}>Player Name</th>
                    <th style={{ padding: '14px' }}>Position / Role</th>
                    <th style={{ padding: '14px' }}>Franchise Team</th>
                    <th style={{ padding: '14px', textAlign: 'center' }}>Goals ⚽</th>
                    <th style={{ padding: '14px', textAlign: 'center' }}>Assists 👟</th>
                    <th style={{ padding: '14px', textAlign: 'center' }}>Clean Sheets 🧤</th>
                    <th style={{ padding: '14px', textAlign: 'center' }}>Yellow 🟨</th>
                    <th style={{ padding: '14px', textAlign: 'center' }}>Red 🟥</th>
                  </tr>
                </thead>
                <tbody>
                  {combinedPlayerStats.map((p, idx) => (
                    <tr key={p.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '14px', textAlign: 'center', fontWeight: 800, color: '#94a3b8' }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '14px', fontWeight: 800, color: '#f8fafc' }}>
                        {p.name}
                      </td>
                      <td style={{ padding: '14px', color: '#94a3b8', fontSize: '0.85rem' }}>
                        {p.role}
                      </td>
                      <td style={{ padding: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{p.teamLogo}</span>
                        <span style={{ fontSize: '0.88rem' }}>{p.teamName}</span>
                      </td>
                      <td style={{ padding: '14px', textAlign: 'center', fontWeight: 900, color: '#ffb703', fontFamily: 'monospace' }}>
                        {p.goals}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'center', fontWeight: 900, color: '#00d9ff', fontFamily: 'monospace' }}>
                        {p.assists}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'center', fontWeight: 900, color: '#00e699', fontFamily: 'monospace' }}>
                        {p.cleanSheets}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'center', fontWeight: 800, color: '#eab308' }}>
                        {p.yellowCards}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'center', fontWeight: 800, color: '#ef4444' }}>
                        {p.redCards}
                      </td>
                    </tr>
                  ))}
                  {combinedPlayerStats.length === 0 && (
                    <tr><td colSpan="9" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No players found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* TAB 4: LEAGUE NEWS VIEW */}
      {rightTab === 'NEWS' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
          
          {/* News Feed */}
          <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '20px', color: '#f8fafc' }}>Official League News Feed</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {news.map(post => (
                <div key={post.id} style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#00e699', margin: 0 }}>{post.title}</h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, margin: '8px 0' }}>{post.content}</p>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '10px' }}>Author: {post.author}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Publish News */}
          {currentUser?.role === 'SUPER_ADMIN' && (
            <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px', height: 'fit-content' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '18px', color: '#f8fafc' }}>Publish News Update</h3>
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
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  Publish News Post
                </button>
              </form>
            </div>
          )}

        </div>
      )}

      {/* NEW FIXTURE MODAL */}
      {showFixtureModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderRadius: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '16px', color: '#f8fafc' }}>Generate Tournament Fixture</h3>
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
                <label className="form-label">Match Format (Legged)</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsLegged(true)}
                    className={`btn ${isLegged ? 'btn-gold' : 'btn-secondary'}`}
                    style={{ flex: 1, fontSize: '0.82rem' }}
                  >
                    2-Legged (Home & Away)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLegged(false)}
                    className={`btn ${!isLegged ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, fontSize: '0.82rem' }}
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
          <div className="modal-content" style={{ maxWidth: '650px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#f8fafc' }}>
                Live Score & Match Event Logger
              </h3>
              <button onClick={() => setSelectedFixture(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveScore}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '14px', background: 'rgba(15, 23, 42, 0.8)', padding: '18px', borderRadius: '14px', marginBottom: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ textAlign: 'center' }}>
                  <label className="form-label">{teams.find(t => t.id === selectedFixture.teamAId || t.id === selectedFixture.homeTeamId)?.name}</label>
                  <input type="number" className="form-control" style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 900, color: '#ffb703' }} value={editHomeScore} onChange={(e) => setEditHomeScore(e.target.value)} min={0} />
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#64748b' }}>VS</div>
                <div style={{ textAlign: 'center' }}>
                  <label className="form-label">{teams.find(t => t.id === selectedFixture.teamBId || t.id === selectedFixture.awayTeamId)?.name}</label>
                  <input type="number" className="form-control" style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 900, color: '#ffb703' }} value={editAwayScore} onChange={(e) => setEditAwayScore(e.target.value)} min={0} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Final Score</button>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedFixture(null)}>Close</button>
              </div>
            </form>

            <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)', margin: '20px 0' }} />

            <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '10px', color: '#f8fafc' }}>Log Individual Player Match Event</h4>
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

              <button type="submit" className="btn btn-gold">Log Event</button>
            </form>

          </div>
        </div>
      )}

      {/* ADD MATCH MODAL */}
      {showAddMatchModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={20} color="#ffb703" /> Schedule New Match
              </h3>
              <button onClick={() => setShowAddMatchModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMatch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Team Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '10px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">🏠 Home Team</label>
                  <select
                    className="form-control"
                    value={addHomeTeamId}
                    onChange={(e) => setAddHomeTeamId(e.target.value)}
                    required
                  >
                    <option value="">Select Home Team…</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id} disabled={t.id === addAwayTeamId}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'rgba(255, 183, 3, 0.15)', border: '2px solid rgba(255, 183, 3, 0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, color: '#ffb703', fontSize: '0.8rem', flexShrink: 0, marginTop: '24px'
                }}>
                  VS
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">✈️ Away Team</label>
                  <select
                    className="form-control"
                    value={addAwayTeamId}
                    onChange={(e) => setAddAwayTeamId(e.target.value)}
                    required
                  >
                    <option value="">Select Away Team…</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id} disabled={t.id === addHomeTeamId}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date / Time */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label"><Clock size={14} style={{ display: 'inline', marginRight: '6px' }} />Date & Time (Leg 1)</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={addDate}
                  onChange={(e) => setAddDate(e.target.value)}
                  required
                />
              </div>

              {addIsLegged && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label"><Clock size={14} style={{ display: 'inline', marginRight: '6px' }} />Date & Time (Leg 2 - Return)</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={addReturnDate}
                    onChange={(e) => setAddReturnDate(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Match Format */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Match Format</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setAddIsLegged(false)}
                    className={`btn ${!addIsLegged ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, fontSize: '0.82rem' }}
                  >
                    Single Match
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddIsLegged(true)}
                    className={`btn ${addIsLegged ? 'btn-gold' : 'btn-secondary'}`}
                    style={{ flex: 1, fontSize: '0.82rem' }}
                  >
                    2-Legged (Home & Away)
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="submit" className="btn btn-gold" style={{ flex: 1 }}>
                  <Plus size={16} /> Add Match
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddMatchModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
