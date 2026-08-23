import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export function useFixtures(filter = 'ALL', search = '') {
  const { currentUser } = useAuth();
  const token = currentUser?.token;
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(\/api/sub-admin/fixtures?status=\&search=\\, {
        headers: { Authorization: \Bearer \\ }
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
