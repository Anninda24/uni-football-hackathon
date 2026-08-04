import { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { api } from '../services/api.js';

const SOCKET_URL = 'http://localhost:5000';

// ─────────────────────────────────────────────────────────────────────────────
// Hook: useTournament — REST data + live match score subscriptions
// ─────────────────────────────────────────────────────────────────────────────
export function useTournament() {
  const [matches,     setMatches]     = useState([]);
  const [standings,   setStandings]   = useState([]);
  const [leaderboards, setLeaderboards] = useState({ topScorers: [], topAssists: [], cleanSheets: [] });
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const socketRef = useRef(null);
  const matchesRef = useRef(matches);
  matchesRef.current = matches;

  // Fetch all fixtures from backend
  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/tournament/matches');
      const data = await res.json();
      if (data.success) {
        setMatches(data.matches);
      }
    } catch (e) {
      setError('Failed to load fixtures');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch points table
  const fetchStandings = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tournament/standings');
      const data = await res.json();
      if (data.success) setStandings(data.standings);
    } catch (e) {
      setError('Failed to load standings');
    }
  }, []);

  // Fetch player leaderboards
  const fetchLeaderboards = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tournament/leaderboards');
      const data = await res.json();
      if (data.success) setLeaderboards(data);
    } catch (e) {
      setError('Failed to load leaderboards');
    }
  }, []);

  useEffect(() => {
    fetchMatches();
    fetchStandings();
    fetchLeaderboards();

    // Subscribe to live score updates via WebSocket
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      // Join rooms for all known matches
      matchesRef.current.forEach(m => {
        socket.emit('join_match_room', m.id);
      });
    });

    socket.on('match_score_update', (update) => {
      // Patch the updated match in local state without a full re-fetch
      setMatches((prev) =>
        prev.map((m) =>
          m.id === update.matchId
            ? { ...m, scoreA: update.scoreA, scoreB: update.scoreB, status: update.status, aggScoreA: update.aggScoreA, aggScoreB: update.aggScoreB }
            : m
        )
      );
      // Refresh standings after score change
      fetchStandings();
    });

    return () => socket.disconnect();
  }, [fetchMatches, fetchStandings, fetchLeaderboards]);

  // Ensure we join rooms for any new matches added to state
  useEffect(() => {
    if (socketRef.current) {
      matches.forEach(m => {
        socketRef.current.emit('join_match_room', m.id);
      });
    }
  }, [matches]);

  return {
    matches,
    standings,
    leaderboards,
    loading,
    error,
    refetch: () => {
      fetchMatches();
      fetchStandings();
      fetchLeaderboards();
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Compute winner of a two-legged tie from a match record
// ─────────────────────────────────────────────────────────────────────────────
export function getTwoLeggedWinner(match) {
  if (!match.isTwoLegged) return null;
  if (match.aggScoreA > match.aggScoreB) return match.teamAId;
  if (match.aggScoreB > match.aggScoreA) return match.teamBId;
  return 'DRAW';
}
