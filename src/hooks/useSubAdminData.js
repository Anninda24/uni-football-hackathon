import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export function useStandings(mode = 'ALL') {
  const { currentUser } = useAuth();
  const token = currentUser?.token;
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStandings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sub-admin/standings?mode=' + mode, {
        headers: { Authorization: 'Bearer ' + token }
      });
      const data = await res.json();
      setStandings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, mode]);

  useEffect(() => { 
    if (token) fetchStandings(); 
  }, [fetchStandings, token]);

  return { standings, loading, refetch: fetchStandings };
}

export function useStatistics(teamId = '', position = 'ALL', search = '') {
  const { currentUser } = useAuth();
  const token = currentUser?.token;
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sub-admin/statistics', {
        headers: { Authorization: 'Bearer ' + token }
      });
      let data = await res.json();
      
      if (teamId) data = data.filter(p => p.teamId === teamId);
      if (position && position !== 'ALL') data = data.filter(p => p.position === position);
      if (search) data = data.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

      setPlayers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, teamId, position, search]);

  useEffect(() => { 
    if (token) fetchStats(); 
  }, [fetchStats, token]);

  return { players, loading, refetch: fetchStats };
}

export function useFixtures(filter = 'ALL', search = '') {
  const { currentUser } = useAuth();
  const token = currentUser?.token;
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sub-admin/fixtures?status=' + filter + '&search=' + search, {
        headers: { Authorization: 'Bearer ' + token }
      });
      const data = await res.json();
      setMatches(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, filter, search]);

  useEffect(() => { 
    if (token) fetchMatches(); 
  }, [fetchMatches, token]);

  return { matches, setMatches, loading, refetch: fetchMatches };
}
