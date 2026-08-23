import React from 'react';
import { useFixtures } from '../hooks/useSubAdminData';

export function SAMatchesView() {
  const { matches, loading } = useFixtures();
  return (
    <div className="glass-panel p-6">
      <h2 className="text-2xl gradient-text-green mb-4">Matches</h2>
      {loading ? <p>Loading...</p> : <p>{matches.length} matches found</p>}
    </div>
  );
}
