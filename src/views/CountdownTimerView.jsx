import React from 'react';

export const CountdownTimerView = () => {
  return (
    <div className="glass-panel" style={{ padding: '32px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Countdown Timer</h2>
      <p style={{ color: 'var(--text-muted)' }}>Countdown to the next major league event.</p>
    </div>
  );
};
