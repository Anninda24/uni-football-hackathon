import React, { useState } from 'react';
import { Gavel, Sliders, Percent } from 'lucide-react';
import { FinancialRulesView } from './FinancialRulesView';
import { BiddingMathMatrixView } from './BiddingMathMatrixView';

export const AuctionRulesTabbedView = () => {
  const [activeTab, setActiveTab] = useState('FINANCIAL');

  const tabs = [
    { id: 'FINANCIAL', label: 'Financial Rules', icon: Sliders, activeColor: '#00d9ff', activeBg: 'linear-gradient(135deg, #00d9ff 0%, #0088cc 100%)', activeText: '#031710' },
    { id: 'BIDDING_MATRIX', label: 'Bidding Math Matrix', icon: Percent, activeColor: '#00e699', activeBg: 'linear-gradient(135deg, #00e699 0%, #00b377 100%)', activeText: '#031710' }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header + Tab Bar */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Gavel color="var(--accent-cyan)" /> Auction Rules Configuration
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px', margin: 0 }}>
            Manage financial allowances, roster constraints, and bidding math matrix tiers.
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
        {activeTab === 'FINANCIAL' && <FinancialRulesView />}
        {activeTab === 'BIDDING_MATRIX' && <BiddingMathMatrixView />}
      </div>
    </div>
  );
};
