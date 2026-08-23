import React from 'react';
import { useStandings } from '../hooks/useSubAdminData';

export function SAStandingsView() {
  const { standings, loading } = useStandings();
  return (
    <div className="glass-panel p-6">
      <h2 className="text-2xl gradient-text-green mb-4">Standings</h2>
      {loading ? <p>Loading...</p> : <p>{standings.length} teams found</p>}
    </div>
  );
}
