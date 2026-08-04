import React from 'react';

export const RegisteredPlayersListView = () => {
  return (
    <div className="glass-panel" style={{ padding: '32px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Registered Players List</h2>
      <p style={{ color: 'var(--text-muted)' }}>Browse all registered players before the auction begins.</p>
    </div>
  );
};
