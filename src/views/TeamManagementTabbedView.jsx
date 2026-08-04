import React, { useState } from 'react';
import { Shield, UserCog, Crown } from 'lucide-react';
import { FranchiseTeamView } from './FranchiseTeamView';
import { ManagerManagementView } from './ManagerManagementView';
import { CaptainDashboardView } from './CaptainDashboardView';

export const TeamManagementTabbedView = ({ initialEditManager = null }) => {
  const [activeSubTab, setActiveSubTab] = useState(initialEditManager ? 'MANAGERS' : 'TEAMS');

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Header & Sub-Navigation Tabs */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield color="var(--accent-cyan)" /> Team & Manager Administration
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px', margin: 0 }}>
            Manage batch franchise teams, assign team captains & managers, and configure squad parameters.
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.8)', padding: '6px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={() => setActiveSubTab('TEAMS')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              background: activeSubTab === 'TEAMS' ? 'linear-gradient(135deg, #00d9ff 0%, #0088cc 100%)' : 'transparent',
              color: activeSubTab === 'TEAMS' ? '#031710' : '#cbd5e1',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <Shield size={16} /> Franchise Teams
          </button>

          <button
            onClick={() => setActiveSubTab('MANAGERS')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              background: activeSubTab === 'MANAGERS' ? 'linear-gradient(135deg, #00e699 0%, #00b377 100%)' : 'transparent',
              color: activeSubTab === 'MANAGERS' ? '#031710' : '#cbd5e1',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <UserCog size={16} /> Manager Management
          </button>

          <button
            onClick={() => setActiveSubTab('CAPTAINS')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              background: activeSubTab === 'CAPTAINS' ? 'linear-gradient(135deg, #ffb703 0%, #e09f00 100%)' : 'transparent',
              color: activeSubTab === 'CAPTAINS' ? '#1f1400' : '#cbd5e1',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <Crown size={16} /> Icon Captains
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeSubTab === 'TEAMS' && <FranchiseTeamView />}
        {activeSubTab === 'MANAGERS' && <ManagerManagementView initialEditManager={initialEditManager} />}
        {activeSubTab === 'CAPTAINS' && <CaptainDashboardView />}
      </div>
    </div>
  );
};
