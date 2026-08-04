import { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';
const API = 'http://localhost:5000/api/tournament';

const safeFetch = async (url) => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

export function useTournament() {
  const [matches,      setMatches]      = useState([]);
  const [standings,    setStandings]    = useState([]);
  const [leaderboards, setLeaderboards] = useState({
    topScorers: [],
    topAssists: [],
    cleanSheets: [],
    topSavers: [],
    allPlayerStats: [],
    allPlayerStatsMap: {}
  });
  const [groups,       setGroups]       = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const socketRef  = useRef(null);
  const matchesRef = useRef(matches);
  matchesRef.current = matches;

  const fetchMatches = useCallback(async (groupId = null) => {
    setLoading(true);
    const url = groupId ? `${API}/matches?groupId=${groupId}` : `${API}/matches`;
    const data = await safeFetch(url);
    if (data?.success) { setMatches(data.matches); setBackendOnline(true); }
    setLoading(false);
  }, []);

  const fetchStandings = useCallback(async (groupId = null) => {
    const url = groupId ? `${API}/standings?groupId=${groupId}` : `${API}/standings`;
    const data = await safeFetch(url);
    if (data?.success) setStandings(data.standings);
  }, []);

  const fetchLeaderboards = useCallback(async () => {
    const data = await safeFetch(`${API}/leaderboards`);
    if (data?.success) {
      setLeaderboards({
        topScorers: data.topScorers || [],
        topAssists: data.topAssists || [],
        cleanSheets: data.cleanSheets || [],
        topSavers: data.topSavers || [],
        allPlayerStats: data.allPlayerStats || [],
        allPlayerStatsMap: data.allPlayerStatsMap || {}
      });
    }
  }, []);

  const fetchGroups = useCallback(async () => {
    const data = await safeFetch(`${API}/groups`);
    if (data?.success) setGroups(data.groups);
  }, []);

  const refetch = useCallback((groupId = null) => {
    fetchMatches(groupId);
    fetchStandings(groupId);
    fetchLeaderboards();
    fetchGroups();
  }, [fetchMatches, fetchStandings, fetchLeaderboards, fetchGroups]);

  useEffect(() => {
    fetchMatches();
    fetchStandings();
    fetchLeaderboards();
    fetchGroups();

    let socket;
    try {
      socket = io(SOCKET_URL, { transports: ['websocket'], reconnectionAttempts: 5, timeout: 5000 });
      socketRef.current = socket;

      socket.on('connect',    () => setBackendOnline(true));
      socket.on('disconnect', () => setBackendOnline(false));

      socket.on('match_score_update', (update) => {
        setMatches(prev => prev.map(m =>
          m.id === update.matchId
            ? { ...m, scoreA: update.scoreA, scoreB: update.scoreB, status: update.status, aggScoreA: update.aggScoreA, aggScoreB: update.aggScoreB }
            : m
        ));
        fetchStandings();
        fetchLeaderboards();
      });
    } catch { /* graceful */ }

    return () => { if (socket) socket.disconnect(); };
  }, [fetchMatches, fetchStandings, fetchLeaderboards, fetchGroups]);

  useEffect(() => {
    if (socketRef.current?.connected) {
      matches.forEach(m => socketRef.current.emit('join_match_room', m.id));
    }
  }, [matches]);

  return { matches, standings, leaderboards, groups, loading, backendOnline, refetch, fetchStandings, fetchMatches };
}

export function getTwoLeggedWinner(match) {
  if (!match.isTwoLegged) return null;
  if (match.aggScoreA > match.aggScoreB) return match.teamAId;
  if (match.aggScoreB > match.aggScoreA) return match.teamBId;
  return 'DRAW';
}
