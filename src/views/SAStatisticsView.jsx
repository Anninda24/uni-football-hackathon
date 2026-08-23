import React from 'react';
import { useStatistics } from '../hooks/useSubAdminData';

export function SAStatisticsView() {
  const { players, loading } = useStatistics();
  return (
    <div className="glass-panel p-6">
      <h2 className="text-2xl gradient-text-green mb-4">Player Statistics</h2>
      {loading ? <p>Loading...</p> : <p>{players.length} players found</p>}
    </div>
  );
}
