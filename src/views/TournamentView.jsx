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
  Trash2,
  Activity,
  Search,
  Crown,
  BarChart3,
  X,
  Users,
  ShieldCheck,
  Zap,
  Flame,
  CheckCircle2,
  AlertTriangle,
  FolderPlus,
  RefreshCw
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const ALL_EVENT_LABELS = [
  { id: 'GOAL', label: '⚽ Goal' },
  { id: 'ASSIST', label: '👟 Goal Assist' },
  { id: 'YELLOW_CARD', label: '🟨 Yellow Card' },
  { id: 'RED_CARD', label: '🟥 Red Card' },
  { id: 'GOAL_SAVED', label: '🧤 Goal Saved / Save' },
  { id: 'SHOT_ON_TARGET', label: '🎯 Shot on Target' },
  { id: 'SHOT_OFF_TARGET', label: '⚽ Shot Off Target' },
  { id: 'TACKLE', label: '⚔️ Successful Tackle' },
  { id: 'INTERCEPTION', label: '🛑 Interception' },
  { id: 'SUBSTITUTION', label: '🔄 Substitution' },
  { id: 'INJURY', label: '🚑 Injury' },
  { id: 'FOUL', label: '⚠️ Foul Committed' }
];

export const TournamentView = ({ defaultTab = 'MATCHES', showTabs = true, readOnly = false }) => {
  const { 
    currentUser, 
    teams, 
    players, 
    addNotification 
  } = useSystem();

  const { 
    matches: backendMatches, 
    standings: backendStandings, 
    leaderboards, 
    groups: backendGroups,
    refetch 
  } = useTournament();

  const [rightTab, setRightTab] = useState(defaultTab);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('ALL');

  useEffect(() => {
    setRightTab(defaultTab);
  }, [defaultTab]);

  // Admin permission check (SUPER_ADMIN, PODIUM_ADMIN, and SUB_ADMIN allowed)
  const canEdit = !readOnly && (
    currentUser?.role === 'SUPER_ADMIN' || 
    currentUser?.role === 'PODIUM_ADMIN' || 
    currentUser?.role === 'SUB_ADMIN'
  );

  // Modals state
  const [selectedFixture, setSelectedFixture] = useState(null);
  const [deletingMatch, setDeletingMatch] = useState(null);
  const [showAddMatchModal, setShowAddMatchModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);

  // Add Match Modal Form state (supports 2-legged dual dates)
  const [addHomeTeamId, setAddHomeTeamId] = useState(teams[0]?.id || '');
  const [addAwayTeamId, setAddAwayTeamId] = useState(teams[1]?.id || '');
  const [addLeg1Date, setAddLeg1Date] = useState('2026-08-25T16:00');
  const [addLeg2Date, setAddLeg2Date] = useState('2026-09-01T16:00');
  const [addIsLegged, setAddIsLegged] = useState(false);
  const [addGroupId, setAddGroupId] = useState('');

  // Event Logger Form state
  const [eventType, setEventType] = useState('GOAL');
  const [eventPlayerId, setEventPlayerId] = useState('');
  const [eventAssistId, setEventAssistId] = useState('');
  const [eventMinute, setEventMinute] = useState(45);
  const [eventSubmitting, setEventSubmitting] = useState(false);

  // Configurable Event Types loaded from settings
  const [enabledEventTypes, setEnabledEventTypes] = useState(['GOAL', 'ASSIST', 'YELLOW_CARD', 'RED_CARD', 'GOAL_SAVED', 'TACKLE', 'SHOT_ON_TARGET', 'SUBSTITUTION']);

  // Group Management Form state
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#3b82f6');
  const [selectedGroupTeamIds, setSelectedGroupTeamIds] = useState([]);

  // Filters state
  const [matchStatusFilter, setMatchStatusFilter] = useState('ALL');
  const [matchSearch, setMatchSearch] = useState('');
  const [playerSearch, setPlayerSearch] = useState('');
  const [playerTeamFilter, setPlayerTeamFilter] = useState('ALL');
  const [playerSortKey, setPlayerSortKey] = useState('goals');

  // Fetch enabled event types from backend settings API
  useEffect(() => {
    fetch(`${API_BASE}/tournament/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.enabledEvents)) {
          setEnabledEventTypes(data.enabledEvents);
        }
      })
      .catch(() => {});
  }, []);

  // Data helpers
  const fixtures = backendMatches.length > 0 ? backendMatches : [];
  const standings = backendStandings.length > 0 ? backendStandings : [];
  const groups = backendGroups.length > 0 ? backendGroups : [];
  const topScorers = leaderboards.topScorers || [];
  const topAssists = leaderboards.topAssists || [];
  const cleanSheetsList = leaderboards.cleanSheets || [];
  const topSavers = leaderboards.topSavers || [];
  const allStatsMap = leaderboards.allPlayerStatsMap || {};

  // Check for teams unassigned to any group (Strict 1-to-1 partition check)
  const assignedTeamIds = useMemo(() => {
    const set = new Set();
    groups.forEach(g => {
      if (Array.isArray(g.teamIds)) g.teamIds.forEach(id => set.add(id));
    });
    return set;
  }, [groups]);

  const unassignedTeams = useMemo(() => {
    return teams.filter(t => !assignedTeamIds.has(t.id));
  }, [teams, assignedTeamIds]);

  // Available options for Event Logger select dropdown
  const availableEventOptions = useMemo(() => {
    return ALL_EVENT_LABELS.filter(ev => enabledEventTypes.includes(ev.id));
  }, [enabledEventTypes]);

  // Refetch standings when group filter changes
  useEffect(() => {
    refetch(selectedGroupFilter === 'ALL' ? null : selectedGroupFilter);
  }, [selectedGroupFilter, refetch]);

  // Filtered fixtures
  const filteredFixtures = useMemo(() => {
    return fixtures.filter(fix => {
      const homeTeam = teams.find(t => t.id === fix.teamAId || t.id === fix.homeTeamId);
      const awayTeam = teams.find(t => t.id === fix.teamBId || t.id === fix.awayTeamId);
      const searchMatch = !matchSearch.trim() || 
        (homeTeam?.name || fix.teamAName || '').toLowerCase().includes(matchSearch.toLowerCase()) ||
        (awayTeam?.name || fix.teamBName || '').toLowerCase().includes(matchSearch.toLowerCase());
      
      const statusMatch = matchStatusFilter === 'ALL' || fix.status === matchStatusFilter;
      const groupMatch  = selectedGroupFilter === 'ALL' || fix.groupId === selectedGroupFilter;
      return searchMatch && statusMatch && groupMatch;
    });
  }, [fixtures, teams, matchSearch, matchStatusFilter, selectedGroupFilter]);

  const leagueLeader = standings[0];

  // Combined computed player statistics
  const combinedPlayerStats = useMemo(() => {
    return players.map(p => {
      const statObj = allStatsMap[p.id] || {};
      const scorerObj = topScorers.find(s => s.playerId === p.id);
      const assistObj = topAssists.find(s => s.playerId === p.id);
      const csObj = cleanSheetsList.find(s => s.playerId === p.id);
      const saverObj = topSavers.find(s => s.playerId === p.id);
      const team = teams.find(t => t.id === p.soldToTeamId || t.id === p.teamId);

      return {
        id: p.id,
        name: p.name,
        jerseyName: p.jerseyName || p.name,
        role: p.preferredPosition || p.category || 'Player',
        teamName: team?.name || 'Unassigned',
        teamLogo: team?.logo || '⚽',
        teamId: team?.id || '',
        goals:       statObj.goals       ?? scorerObj?.goals       ?? p.goals       ?? 0,
        assists:     statObj.assists     ?? assistObj?.assists     ?? p.assists     ?? 0,
        cleanSheets: statObj.cleanSheets ?? csObj?.cleanSheets     ?? p.cleanSheets ?? 0,
        saves:       statObj.saves       ?? saverObj?.saves       ?? p.saves       ?? 0,
        yellowCards: statObj.yellowCards ?? 0,
        redCards:    statObj.redCards    ?? 0,
        played:      statObj.played      ?? p.matchesPlayed       ?? 0
      };
    }).filter(p => {
      const matchesSearch = !playerSearch.trim() || p.name.toLowerCase().includes(playerSearch.toLowerCase());
      const matchesTeam = playerTeamFilter === 'ALL' || p.teamId === playerTeamFilter;
      return matchesSearch && matchesTeam;
    }).sort((a, b) => (b[playerSortKey] || 0) - (a[playerSortKey] || 0));
  }, [players, teams, allStatsMap, topScorers, topAssists, cleanSheetsList, topSavers, playerSearch, playerTeamFilter, playerSortKey]);

  // ── Match Handlers ─────────────────────────────────────────────────────────

  const handleAddMatch = async (e) => {
    e.preventDefault();
    if (!addHomeTeamId || !addAwayTeamId || addHomeTeamId === addAwayTeamId) {
      addNotification('error', 'Invalid Selection', 'Please select two different teams.');
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
          teamAName: teams.find(t => t.id === addHomeTeamId)?.name || '',
          teamBName: teams.find(t => t.id === addAwayTeamId)?.name || '',
          scheduledTimeLeg1: addLeg1Date,
          scheduledTimeLeg2: addIsLegged ? addLeg2Date : null,
          isTwoLegged: addIsLegged,
          groupId: addGroupId || null
        })
      });
      const data = await res.json();
      if (data.success) {
        addNotification('success', 'Match Added', addIsLegged ? 'Leg 1 & Leg 2 return fixtures scheduled.' : 'Match scheduled successfully.');
        refetch();
        setShowAddMatchModal(false);
      } else {
        addNotification('error', 'Error', data.message || 'Failed to create match. Ensure system phase is set to TOURNAMENT.');
      }
    } catch (err) {
      addNotification('error', 'Backend Server Offline', 'Cannot reach backend at localhost:5000. Please run: cd server && npm start');
    }
  };

  const handleDeleteMatch = async () => {
    if (!deletingMatch) return;
    const token = localStorage.getItem('ff_jwt_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}/tournament/matches/${deletingMatch.id}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();
      if (data.success) {
        addNotification('success', 'Match Deleted', 'Fixture and stats permanently removed.');
        refetch();
      } else {
        addNotification('error', 'Error', data.message || 'Failed to delete match.');
      }
    } catch (err) {
      addNotification('error', 'Backend Error', 'Could not delete fixture.');
    }
    setDeletingMatch(null);
  };

  // ── Event Logger Handlers ──────────────────────────────────────────────────

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!eventPlayerId || !selectedFixture) {
      addNotification('error', 'Missing Data', 'Please select a player.');
      return;
    }

    const playerObj = players.find(p => p.id === eventPlayerId);
    const playerTeamId = playerObj?.soldToTeamId || playerObj?.teamId || selectedFixture.teamAId;

    setEventSubmitting(true);
    const token = localStorage.getItem('ff_jwt_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}/tournament/matches/${selectedFixture.id}/events`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: eventType,
          teamId: playerTeamId,
          playerId: eventPlayerId,
          assistPlayerId: eventType === 'GOAL' && eventAssistId ? eventAssistId : null,
          minute: Number(eventMinute)
        })
      });
      const data = await res.json();
      if (data.success) {
        addNotification('success', 'Event Logged', `${eventType} recorded for ${playerObj?.name || 'Player'} at ${eventMinute}'! Score & stats auto-updated.`);
        setSelectedFixture(data.match || selectedFixture);
        setEventPlayerId('');
        setEventAssistId('');
        refetch();
      } else {
        addNotification('error', 'Error', data.message || 'Failed to log event.');
      }
    } catch (err) {
      addNotification('error', 'Backend Error', err.message);
    } finally {
      setEventSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!selectedFixture) return;
    const token = localStorage.getItem('ff_jwt_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}/tournament/matches/${selectedFixture.id}/events/${eventId}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();
      if (data.success) {
        addNotification('success', 'Event Removed', 'Event removed and stats rolled back.');
        setSelectedFixture(data.match || selectedFixture);
        refetch();
      }
    } catch (err) {
      addNotification('error', 'Backend Error', err.message);
    }
  };

  const handleCompleteMatch = async () => {
    if (!selectedFixture) return;
    const token = localStorage.getItem('ff_jwt_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}/tournament/matches/${selectedFixture.id}/complete`, {
        method: 'POST',
        headers
      });
      const data = await res.json();
      if (data.success) {
        addNotification('success', 'Match Completed!', 'Match status set to COMPLETED and clean sheet bonuses auto-awarded.');
        setSelectedFixture(null);
        refetch();
      }
    } catch (err) {
      addNotification('error', 'Backend Error', err.message);
    }
  };

  // ── Group Management Handlers (Enforces Strict 1-to-1 Partition) ───────────

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const token = localStorage.getItem('ff_jwt_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}/tournament/groups`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: newGroupName,
          color: newGroupColor,
          teamIds: selectedGroupTeamIds
        })
      });
      const data = await res.json();
      if (data.success) {
        addNotification('success', 'Group Created', `Group "${newGroupName}" created. Teams partitioned strictly.`);
        setNewGroupName('');
        setSelectedGroupTeamIds([]);
        refetch();
      } else {
        addNotification('error', 'Error', data.message || 'Failed to create group.');
      }
    } catch (err) {
      addNotification('error', 'Backend Error', err.message);
    }
  };

  const handleDeleteGroup = async (groupId, groupName) => {
    const token = localStorage.getItem('ff_jwt_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}/tournament/groups/${groupId}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();
      if (data.success) {
        addNotification('success', 'Group Deleted', `Group "${groupName}" removed.`);
        if (selectedGroupFilter === groupId) setSelectedGroupFilter('ALL');
        refetch();
      }
    } catch (err) {
      addNotification('error', 'Backend Error', err.message);
    }
  };

  // Auto-Partition button logic (divides unassigned teams evenly across groups)
  const handleAutoBalanceGroups = async () => {
    if (groups.length === 0) {
      addNotification('error', 'No Groups', 'Please create at least one group before auto-partitioning.');
      return;
    }
    if (unassignedTeams.length === 0) {
      addNotification('info', 'All Assigned', 'All teams are already assigned to a group.');
      return;
    }

    const token = localStorage.getItem('ff_jwt_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // Distribute unassigned teams across existing groups round-robin
    const groupDistributions = Object.fromEntries(groups.map(g => [g.id, [...(g.teamIds || [])]]));
    unassignedTeams.forEach((t, idx) => {
      const targetGroup = groups[idx % groups.length];
      groupDistributions[targetGroup.id].push(t.id);
    });

    try {
      for (const group of groups) {
        await fetch(`${API_BASE}/tournament/groups/${group.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ teamIds: groupDistributions[group.id] })
        });
      }
      addNotification('success', 'Teams Partitioned', 'All unassigned teams evenly partitioned into groups.');
      refetch();
    } catch (err) {
      addNotification('error', 'Auto-Partition Error', err.message);
    }
  };

  // Players eligible for event dropdowns
  const matchPlayers = useMemo(() => {
    if (!selectedFixture) return [];
    return players.filter(p => {
      const teamId = p.soldToTeamId || p.teamId;
      return teamId === selectedFixture.teamAId || teamId === selectedFixture.teamBId;
    });
  }, [players, selectedFixture]);

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
              Fixtures schedule, automated group standings, and comprehensive player performance statistics.
            </p>
          </div>

          {/* Admin Action Buttons */}
          {canEdit && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowGroupModal(true)}
                className="btn btn-secondary"
                style={{ padding: '12px 20px', fontSize: '0.9rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}
              >
                <FolderPlus size={18} /> Manage Groups
                {unassignedTeams.length > 0 && (
                  <span style={{ position: 'absolute', top: '-6px', right: '-6px', width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                )}
              </button>
              <button
                onClick={() => setShowAddMatchModal(true)}
                className="btn btn-gold"
                style={{ padding: '12px 24px', fontSize: '0.9rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={18} /> Add Match
              </button>
            </div>
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

      {/* Group Filter Bar */}
      {(rightTab === 'MATCHES' || rightTab === 'STANDINGS') && groups.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', background: 'rgba(15, 23, 42, 0.6)', padding: '10px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginRight: '6px' }}>Group Stage Filter:</span>
          <button
            onClick={() => setSelectedGroupFilter('ALL')}
            style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', border: '1px solid',
              borderColor: selectedGroupFilter === 'ALL' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
              background: selectedGroupFilter === 'ALL' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              color: selectedGroupFilter === 'ALL' ? '#60a5fa' : '#94a3b8'
            }}
          >
            All Teams
          </button>
          {groups.map(g => (
            <button
              key={g.id}
              onClick={() => setSelectedGroupFilter(g.id)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', border: '1px solid',
                borderColor: selectedGroupFilter === g.id ? g.color || '#3b82f6' : 'rgba(255,255,255,0.1)',
                background: selectedGroupFilter === g.id ? `${g.color || '#3b82f6'}22` : 'transparent',
                color: selectedGroupFilter === g.id ? g.color || '#60a5fa' : '#94a3b8'
              }}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

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
                const groupObj  = groups.find(g => g.id === fix.groupId);

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
                        {groupObj && (
                          <span className="badge" style={{ fontSize: '0.7rem', background: `${groupObj.color || '#3b82f6'}25`, color: groupObj.color || '#60a5fa', border: `1px solid ${groupObj.color || '#3b82f6'}44` }}>
                            {groupObj.name}
                          </span>
                        )}
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

                        {/* Admin Controls */}
                        {canEdit && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            <button onClick={() => setSelectedFixture(fix)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Edit3 size={13} /> Edit Score & Events
                            </button>
                            <button onClick={() => setDeletingMatch(fix)} className="btn" style={{ padding: '6px 10px', fontSize: '0.78rem', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
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
                            const plyName = ev.player?.jerseyName || ev.player?.user?.name || players.find(p => p.id === ev.playerId)?.name || 'Player';
                            const icon = ev.type === 'GOAL' ? '⚽' : ev.type === 'YELLOW_CARD' ? '🟨' : ev.type === 'RED_CARD' ? '🟥' : ev.type === 'GOAL_SAVED' ? '🧤' : '⚡';
                            return (
                              <div key={i} style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{icon}</span>
                                <span style={{ fontWeight: 700 }}>{plyName}</span>
                                {ev.assistPlayer && <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>(ast: {ev.assistPlayer?.jerseyName || ev.assistPlayer?.user?.name})</span>}
                                <span style={{ color: '#64748b' }}>({ev.minute}')</span>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right', alignItems: 'flex-end' }}>
                          {fix.events.filter(e => e.teamId === fix.teamBId || e.teamId === awayTeam?.id).map((ev, i) => {
                            const plyName = ev.player?.jerseyName || ev.player?.user?.name || players.find(p => p.id === ev.playerId)?.name || 'Player';
                            const icon = ev.type === 'GOAL' ? '⚽' : ev.type === 'YELLOW_CARD' ? '🟨' : ev.type === 'RED_CARD' ? '🟥' : ev.type === 'GOAL_SAVED' ? '🧤' : '⚡';
                            return (
                              <div key={i} style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: '#64748b' }}>({ev.minute}')</span>
                                {ev.assistPlayer && <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>(ast: {ev.assistPlayer?.jerseyName || ev.assistPlayer?.user?.name})</span>}
                                <span style={{ fontWeight: 700 }}>{plyName}</span>
                                <span>{icon}</span>
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
                    <span style={{ fontSize: '3rem' }}>{leagueLeader.teamLogo || teams.find(t => t.id === leagueLeader.id)?.logo || '🏆'}</span>
                    <div>
                      <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, color: '#ffffff' }}>
                        {leagueLeader.name || leagueLeader.teamName || teams.find(t => t.id === leagueLeader.id)?.name || 'Leader Team'}
                      </h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700 }}>
                        <span style={{ color: '#00e699' }}>1st Place</span>
                        <span>•</span>
                        <span>{leagueLeader.mp} Matches Played</span>
                        <span>•</span>
                        <span style={{ color: '#00d9ff' }}>+{leagueLeader.gd} Goal Diff</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top 3 Cards Grid */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  {standings.slice(0, 3).map((st, i) => {
                    const teamObj = teams.find(t => t.id === st.id || t.id === st.teamId);
                    const name = st.name || st.teamName || teamObj?.name || `Team #${i+1}`;
                    const logo = st.teamLogo || teamObj?.logo || '⚽';
                    const pts = st.points ?? st.pts ?? 0;
                    return (
                      <div
                        key={st.id || i}
                        style={{
                          padding: '14px 20px',
                          borderRadius: '16px',
                          background: i === 0 ? 'rgba(255, 183, 3, 0.15)' : i === 1 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(205, 127, 50, 0.15)',
                          border: i === 0 ? '1px solid rgba(255, 183, 3, 0.4)' : i === 1 ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(205, 127, 50, 0.4)',
                          textAlign: 'center',
                          minWidth: '110px'
                        }}
                      >
                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>
                          {i === 0 ? '1st Rank' : i === 1 ? '2nd Rank' : '3rd Rank'}
                        </div>
                        <div style={{ fontSize: '1.8rem', margin: '4px 0' }}>{logo}</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>{name}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffb703', fontFamily: 'monospace', marginTop: '2px' }}>{pts} pts</div>
                      </div>
                    );
                  })}
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
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  Auto-calculated from completed fixture results. (Win: 3pts, Draw: 1pt, Loss: 0pt)
                </p>
              </div>
            </div>

            {/* Standings Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px' }}>Pos</th>
                    <th style={{ padding: '12px' }}>Franchise Team</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>MP</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>W</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>D</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>L</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>GF</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>GA</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>GD</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: '#ffb703' }}>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                        No standings data available yet. Complete matches to generate points table.
                      </td>
                    </tr>
                  ) : (
                    standings.map((st, idx) => {
                      const teamObj = teams.find(t => t.id === st.id || t.id === st.teamId);
                      const name = st.name || st.teamName || teamObj?.name || 'Unknown Team';
                      const logo = st.teamLogo || teamObj?.logo || '⚽';
                      const pts = st.points ?? st.pts ?? 0;
                      return (
                        <tr key={st.id || idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: idx === 0 ? 'rgba(255, 183, 3, 0.04)' : 'transparent' }}>
                          <td style={{ padding: '14px 12px', fontWeight: 800, color: idx === 0 ? '#ffb703' : '#94a3b8' }}>
                            #{idx + 1}
                          </td>
                          <td style={{ padding: '14px 12px', fontWeight: 800, color: '#f8fafc' }}>
                            <span style={{ marginRight: '8px' }}>{logo}</span> {name}
                          </td>
                          <td style={{ padding: '14px 12px', textAlign: 'center', color: '#cbd5e1' }}>{st.mp}</td>
                          <td style={{ padding: '14px 12px', textAlign: 'center', color: '#00e699', fontWeight: 700 }}>{st.w}</td>
                          <td style={{ padding: '14px 12px', textAlign: 'center', color: '#ffb703' }}>{st.d}</td>
                          <td style={{ padding: '14px 12px', textAlign: 'center', color: '#ef4444' }}>{st.l}</td>
                          <td style={{ padding: '14px 12px', textAlign: 'center', color: '#cbd5e1' }}>{st.gf}</td>
                          <td style={{ padding: '14px 12px', textAlign: 'center', color: '#cbd5e1' }}>{st.ga}</td>
                          <td style={{ padding: '14px 12px', textAlign: 'center', fontWeight: 800, color: st.gd > 0 ? '#00e699' : st.gd < 0 ? '#ef4444' : '#94a3b8' }}>
                            {st.gd > 0 ? `+${st.gd}` : st.gd}
                          </td>
                          <td style={{ padding: '14px 12px', textAlign: 'center', fontWeight: 900, color: '#ffb703', fontSize: '1.05rem', fontFamily: 'monospace' }}>
                            {pts}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PLAYER STATISTICS VIEW */}
      {rightTab === 'STATS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Leaders Showcase Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            
            {/* Top Scorer Card */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 183, 3, 0.3)', background: 'linear-gradient(135deg, rgba(255, 183, 3, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#ffb703', textTransform: 'uppercase', letterSpacing: '0.05em' }}>⚽ Golden Boot Leader</span>
                <Flame size={18} color="#ffb703" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: '#f8fafc' }}>
                {topScorers[0]?.name || combinedPlayerStats[0]?.jerseyName || 'N/A'}
              </h3>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffb703', fontFamily: 'monospace', marginTop: '6px' }}>
                {topScorers[0]?.goals || combinedPlayerStats[0]?.goals || 0} Goals
              </div>
            </div>

            {/* Playmaker Card */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(0, 217, 255, 0.3)', background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#00d9ff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>👟 Top Assist Provider</span>
                <Zap size={18} color="#00d9ff" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: '#f8fafc' }}>
                {topAssists[0]?.name || 'N/A'}
              </h3>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#00d9ff', fontFamily: 'monospace', marginTop: '6px' }}>
                {topAssists[0]?.assists || 0} Assists
              </div>
            </div>

            {/* Golden Glove Card */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(0, 230, 153, 0.3)', background: 'linear-gradient(135deg, rgba(0, 230, 153, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#00e699', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🧤 Clean Sheet Champion</span>
                <ShieldCheck size={18} color="#00e699" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: '#f8fafc' }}>
                {cleanSheetsList[0]?.name || 'N/A'}
              </h3>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#00e699', fontFamily: 'monospace', marginTop: '6px' }}>
                {cleanSheetsList[0]?.cleanSheets || 0} Clean Sheets
              </div>
            </div>

          </div>

          {/* Player Stats Table */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                Overall Player Performance Leaderboard
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <select
                  className="form-control"
                  style={{ width: '160px', height: '36px', fontSize: '0.82rem' }}
                  value={playerSortKey}
                  onChange={(e) => setPlayerSortKey(e.target.value)}
                >
                  <option value="goals">Sort by Goals</option>
                  <option value="assists">Sort by Assists</option>
                  <option value="cleanSheets">Sort by Clean Sheets</option>
                  <option value="saves">Sort by Saves</option>
                </select>

                <div style={{ position: 'relative', width: '220px' }}>
                  <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#64748b' }} />
                  <input
                    type="text"
                    placeholder="Search player..."
                    className="form-control"
                    style={{ paddingLeft: '32px', height: '36px', fontSize: '0.82rem' }}
                    value={playerSearch}
                    onChange={(e) => setPlayerSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 12px' }}>Player Name</th>
                    <th style={{ padding: '10px 12px' }}>Franchise Team</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Role</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', color: '#ffb703' }}>Goals</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', color: '#00d9ff' }}>Assists</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', color: '#00e699' }}>Clean Sheets</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', color: '#a855f7' }}>Saves</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', color: '#eab308' }}>🟨</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', color: '#ef4444' }}>🟥</th>
                  </tr>
                </thead>
                <tbody>
                  {combinedPlayerStats.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '12px', fontWeight: 800, color: '#f8fafc' }}>
                        {p.jerseyName || p.name}
                      </td>
                      <td style={{ padding: '12px', color: '#94a3b8' }}>
                        {p.teamName}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>
                        {p.role}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 900, color: '#ffb703' }}>
                        {p.goals}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 900, color: '#00d9ff' }}>
                        {p.assists}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 900, color: '#00e699' }}>
                        {p.cleanSheets}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 900, color: '#a855f7' }}>
                        {p.saves}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#eab308' }}>
                        {p.yellowCards}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#ef4444' }}>
                        {p.redCards}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALS SECTION ─────────────────────────────────────────────────── */}

      {/* MATCH EDIT & EVENT RECORDING MODAL */}
      {selectedFixture && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px', borderRadius: '24px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Edit3 color="#ffb703" size={22} /> Live Score & Match Event Logger
              </h3>
              <button onClick={() => setSelectedFixture(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {/* Scoreboard Header Box */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '14px', background: 'rgba(15, 23, 42, 0.9)', padding: '20px', borderRadius: '16px', marginBottom: '20px', border: '1px solid rgba(255, 183, 3, 0.2)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Home Team</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc', marginTop: '4px' }}>
                  {teams.find(t => t.id === selectedFixture.teamAId)?.name || selectedFixture.teamAName}
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffb703', fontFamily: 'monospace' }}>
                  {selectedFixture.scoreA || 0}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#64748b' }}>VS</div>
                <span className="badge badge-gold" style={{ marginTop: '4px', fontSize: '0.72rem' }}>
                  {selectedFixture.status}
                </span>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Away Team</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc', marginTop: '4px' }}>
                  {teams.find(t => t.id === selectedFixture.teamBId)?.name || selectedFixture.teamBName}
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffb703', fontFamily: 'monospace' }}>
                  {selectedFixture.scoreB || 0}
                </div>
              </div>
            </div>

            {/* Logged Events List */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', marginBottom: '10px' }}>Logged Match Events ({selectedFixture.events?.length || 0})</h4>
              <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(15, 23, 42, 0.5)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                {(!selectedFixture.events || selectedFixture.events.length === 0) ? (
                  <div style={{ color: '#64748b', fontSize: '0.82rem', textAlign: 'center', padding: '12px' }}>No events logged yet for this match.</div>
                ) : (
                  selectedFixture.events.map(ev => {
                    const plyName = ev.player?.jerseyName || ev.player?.user?.name || players.find(p => p.id === ev.playerId)?.name || 'Player';
                    const labelObj = ALL_EVENT_LABELS.find(l => l.id === ev.type);
                    const iconLabel = labelObj?.label || ev.type;
                    return (
                      <div key={ev.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '8px', fontSize: '0.83rem' }}>
                        <span>
                          <strong style={{ color: '#ffb703' }}>{ev.minute}'</strong> — {iconLabel}: <strong>{plyName}</strong>
                          {ev.assistPlayer && <span style={{ color: '#94a3b8' }}> (Assist: {ev.assistPlayer.jerseyName || ev.assistPlayer.user?.name})</span>}
                        </span>
                        <button onClick={() => handleDeleteEvent(ev.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px 6px' }}>
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Log New Event Form — Dynamically filtered by Tournament Settings */}
            <form onSubmit={handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(30, 41, 59, 0.4)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffb703' }}>Record New Event</div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Event Type</label>
                  <select className="form-control" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                    {availableEventOptions.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Match Minute</label>
                  <input type="number" min={1} max={120} className="form-control" value={eventMinute} onChange={(e) => setEventMinute(e.target.value)} required />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Player</label>
                <select className="form-control" value={eventPlayerId} onChange={(e) => setEventPlayerId(e.target.value)} required>
                  <option value="">Select Player...</option>
                  {matchPlayers.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.jerseyName}) — {teams.find(t => t.id === p.soldToTeamId || t.id === p.teamId)?.name || 'Team'}</option>
                  ))}
                </select>
              </div>

              {eventType === 'GOAL' && (
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Assister (Optional)</label>
                  <select className="form-control" value={eventAssistId} onChange={(e) => setEventAssistId(e.target.value)}>
                    <option value="">No Assist (Solo / Penalty)</option>
                    {matchPlayers.filter(p => p.id !== eventPlayerId).map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.jerseyName})</option>
                    ))}
                  </select>
                </div>
              )}

              <button type="submit" disabled={eventSubmitting} className="btn btn-gold" style={{ padding: '10px', fontSize: '0.85rem', marginTop: '4px' }}>
                <Plus size={16} /> Log Event & Auto-Update Score
              </button>
            </form>

            {/* Action Bar */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="button" onClick={handleCompleteMatch} className="btn btn-primary" style={{ flex: 1 }}>
                <CheckCircle2 size={16} /> Mark Match COMPLETED
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedFixture(null)}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CONFIRM DELETE MATCH MODAL */}
      {deletingMatch && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', borderRadius: '20px', textAlign: 'center' }}>
            <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc', margin: 0 }}>Delete Match Fixture?</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '8px 0 20px 0' }}>
              This will permanently delete fixture <strong>{deletingMatch.teamAName} vs {deletingMatch.teamBName}</strong> and all recorded events.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleDeleteMatch} className="btn" style={{ flex: 1, background: '#ef4444', color: '#fff' }}>
                Confirm Delete
              </button>
              <button onClick={() => setDeletingMatch(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MATCH MODAL — Supports 2-Legged Dual Datetime Pickers */}
      {showAddMatchModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={20} color="#ffb703" /> Schedule New Match
              </h3>
              <button onClick={() => setShowAddMatchModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMatch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Group Selection */}
              {groups.length > 0 && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Assign to Group Stage (Optional)</label>
                  <select className="form-control" value={addGroupId} onChange={(e) => setAddGroupId(e.target.value)}>
                    <option value="">No Group (Regular League)</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              )}

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

              {/* Match Format Selector */}
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

              {/* Date Pickers (Dual dates when 2-Legged is enabled) */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  <Clock size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  {addIsLegged ? 'Leg 1 Date & Time (Home Leg)' : 'Date & Time'}
                </label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={addLeg1Date}
                  onChange={(e) => setAddLeg1Date(e.target.value)}
                  required
                />
              </div>

              {addIsLegged && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#00d9ff' }}>
                    <Clock size={14} style={{ display: 'inline', marginRight: '6px' }} />
                    Leg 2 Date & Time (Return Leg)
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={addLeg2Date}
                    onChange={(e) => setAddLeg2Date(e.target.value)}
                    required
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="submit" className="btn btn-gold" style={{ flex: 1 }}>
                  <Plus size={16} /> {addIsLegged ? 'Add 2-Legged Fixtures' : 'Add Single Match'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddMatchModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GROUP MANAGEMENT MODAL — Strict 1-to-1 Partition Rule Enforcement */}
      {showGroupModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '560px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FolderPlus size={20} color="#00e699" /> Manage Tournament Groups
              </h3>
              <button onClick={() => setShowGroupModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Strict Single-Group Partition Warning Badge */}
            {unassignedTeams.length > 0 ? (
              <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px 16px', borderRadius: '12px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ fontSize: '0.82rem', color: '#f87171', fontWeight: 700 }}>
                  ⚠️ Rule: Every team must belong to exactly 1 group. ({unassignedTeams.length} unassigned team(s))
                </div>
                <button onClick={handleAutoBalanceGroups} className="btn" style={{ padding: '5px 12px', fontSize: '0.75rem', background: '#ef4444', color: '#fff' }}>
                  <RefreshCw size={12} style={{ display: 'inline', marginRight: '4px' }} /> Auto-Partition
                </button>
              </div>
            ) : (
              <div style={{ background: 'rgba(0, 230, 153, 0.1)', border: '1px solid rgba(0, 230, 153, 0.3)', padding: '10px 14px', borderRadius: '12px', marginBottom: '18px', fontSize: '0.82rem', color: '#00e699', fontWeight: 700 }}>
                ✓ Strict Partition Satisfied: All {teams.length} teams belong to exactly one group.
              </div>
            )}

            {/* Existing Groups List */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>Existing Groups</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                {groups.length === 0 ? (
                  <div style={{ color: '#64748b', fontSize: '0.82rem', textAlign: 'center', padding: '12px' }}>No groups created yet. Create a group below.</div>
                ) : (
                  groups.map(g => (
                    <div key={g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(15,23,42,0.6)', borderRadius: '10px', border: `1px solid ${g.color || '#3b82f6'}44` }}>
                      <span style={{ fontWeight: 800, color: g.color || '#3b82f6' }}>{g.name} ({g.teamIds?.length || 0} teams)</span>
                      <button onClick={() => handleDeleteGroup(g.id, g.name)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Create Group Form */}
            <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(30, 41, 59, 0.4)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#00e699' }}>Create New Group</div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Group Name (e.g. Group A)"
                  className="form-control"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  required
                />
                <input
                  type="color"
                  value={newGroupColor}
                  onChange={(e) => setNewGroupColor(e.target.value)}
                  style={{ width: '42px', height: '42px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'none' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Assign Teams to Group (Enforces Strict 1-to-1 Partition)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                  {teams.map(t => {
                    const currentGroup = groups.find(g => Array.isArray(g.teamIds) && g.teamIds.includes(t.id));
                    return (
                      <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#cbd5e1', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedGroupTeamIds.includes(t.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedGroupTeamIds(prev => [...prev, t.id]);
                            else setSelectedGroupTeamIds(prev => prev.filter(id => id !== t.id));
                          }}
                        />
                        <span>{t.name}</span>
                        {currentGroup && (
                          <span style={{ fontSize: '0.7rem', color: currentGroup.color || '#3b82f6' }}>({currentGroup.name})</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              <button type="submit" className="btn btn-gold" style={{ padding: '10px', fontSize: '0.85rem' }}>
                <Plus size={16} /> Create Group & Partition Teams
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
