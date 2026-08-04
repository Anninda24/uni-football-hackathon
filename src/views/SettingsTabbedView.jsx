import React, { useState } from 'react';
import { Settings, ShieldAlert, Calendar } from 'lucide-react';
import { DangerZoneView } from './DangerZoneView';
import { TournamentSettingsView } from './TournamentSettingsView';

export const SettingsTabbedView = ({ onOpenNukeModal }) => {
  const [activeTab, setActiveTab] = useState('LAYOUT');

  const tabs = [
    { id: 'LAYOUT', label: 'Layout', icon: ShieldAlert, activeColor: '#ef4444', activeBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', activeText: '#ffffff' },
    { id: 'TOURNAMENT_SETTINGS', label: 'Tournament Settings', icon: Calendar, activeColor: '#00d9ff', activeBg: 'linear-gradient(135deg, #00d9ff 0%, #0088cc 100%)', activeText: '#031710' }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header + Tab Bar */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings color="var(--accent-cyan)" /> Settings
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px', margin: 0 }}>
            Manage system configuration, lifecycle protocols, and tournament settings.
          </p>
        </div>

        {/* Horizontal Tab Buttons */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.8)', padding: '6px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? tab.activeBg : 'transparent',
                  color: isActive ? tab.activeText : '#cbd5e1',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'LAYOUT' && <DangerZoneView onOpenNukeModal={onOpenNukeModal} />}
        {activeTab === 'TOURNAMENT_SETTINGS' && <TournamentSettingsView />}
      </div>
    </div>
  );
};
