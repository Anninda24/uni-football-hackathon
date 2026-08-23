import React from 'react';

export function StatusBadge({ status }) {
  if (status === 'LIVE') {
    return (
      <div className="sa-status-badge live">
        <span className="live-pulse"></span>
        LIVE
      </div>
    );
  }
  if (status === 'COMPLETED') {
    return <div className="sa-status-badge completed">COMPLETED</div>;
  }
  return <div className="sa-status-badge upcoming">UPCOMING</div>;
}
