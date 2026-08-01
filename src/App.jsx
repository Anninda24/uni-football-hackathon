import React, { useState } from 'react';
import { useSystem } from './context/SystemContext';
import { AdminSidebar } from './components/AdminSidebar';
import { LiveValidationBar } from './components/LiveValidationBar';
import { CommandPalette } from './components/CommandPalette';
import { NukeModal } from './components/NukeModal';
import { NotificationsToast } from './components/NotificationsToast';

// Module Views
import { MissionControlView } from './views/MissionControlView';
import { FinancialRulesView } from './views/FinancialRulesView';
import { CategoryManagerView } from './views/CategoryManagerView';
import { BiddingMathMatrixView } from './views/BiddingMathMatrixView';
import { PlayerDirectoryView } from './views/PlayerDirectoryView';
import { FranchiseTeamView } from './views/FranchiseTeamView';
import { ManagerManagementView } from './views/ManagerManagementView';
import { LiveOperationsView } from './views/LiveOperationsView';
import { DangerZoneView } from './views/DangerZoneView';
import { LiveAuctionView } from './views/LiveAuctionView';
import { TournamentView } from './views/TournamentView';

export function App() {
  const { systemState, currentUser } = useSystem();
  
  // Active Module State (2-Column Shell Navigation)
  const [activeModule, setActiveModule] = useState('MISSION_CONTROL');

  // Command Palette & Nuke Modal States
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showNukeModal, setShowNukeModal] = useState(false);

  // Targets for deep linking from Command Palette
  const [editPlayerTarget, setEditPlayerTarget] = useState(null);
  const [editManagerTarget, setEditManagerTarget] = useState(null);

  // Render Active Workspace Module
  const renderActiveModule = () => {
    switch (activeModule) {
      case 'MISSION_CONTROL':
        return <MissionControlView />;
      case 'FINANCIAL_RULES':
        return <FinancialRulesView />;
      case 'CATEGORIES':
        return <CategoryManagerView />;
      case 'BIDDING_MATRIX':
        return <BiddingMathMatrixView />;
      case 'PLAYERS':
        return <PlayerDirectoryView initialEditPlayer={editPlayerTarget} />;
      case 'TEAMS':
        return <FranchiseTeamView />;
      case 'MANAGERS':
        return <ManagerManagementView initialEditManager={editManagerTarget} />;
      case 'LIVE_OPERATIONS':
        return <LiveOperationsView onNavigateToTab={setActiveModule} />;
      case 'DANGER_ZONE':
        return <DangerZoneView onOpenNukeModal={() => setShowNukeModal(true)} />;
      case 'TOURNAMENT':
        return <TournamentView defaultTab="MATCHES" />;
      default:
        return <MissionControlView />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-dark)', color: 'var(--text-main)' }}>
      
      {/* 2-Column Shell Column 1: Left Sidebar Navigation */}
      <AdminSidebar
        activeModule={activeModule}
        setActiveModule={(mod) => {
          setEditPlayerTarget(null);
          setEditManagerTarget(null);
          setActiveModule(mod);
        }}
        setShowNukeModal={setShowNukeModal}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
      />

      {/* 2-Column Shell Column 2: Main Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        
        {/* Persistent Live Validation Header Bar (Phase 1 Prerequisites Bar) */}
        <LiveValidationBar />

        {/* Workspace Main Content Container */}
        <main style={{ flex: 1, padding: '24px', width: '100%', maxWidth: '1600px', margin: '0 auto' }}>
          {renderActiveModule()}
        </main>

        {/* Admin Footer */}
        <footer style={{ borderTop: '1px solid var(--border-color)', padding: '16px 24px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-dim)', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>UniLeague Admin Architecture • 2-Column Shell & State Machine System</div>
          <div style={{ fontSize: '0.75rem' }}>
            Current Active Phase: <strong style={{ color: 'var(--accent-green)' }}>{systemState.currentPhase}</strong> | Actor: <strong style={{ color: 'var(--accent-cyan)' }}>{currentUser.name} ({currentUser.role})</strong>
          </div>
        </footer>

      </div>

      {/* Quick Action Command Palette Modal (Cmd+K / Ctrl+K) */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        setActiveModule={setActiveModule}
        onEditPlayer={(p) => {
          setEditPlayerTarget(p);
          setActiveModule('PLAYERS');
        }}
        onEditManager={(m) => {
          setEditManagerTarget(m);
          setActiveModule('MANAGERS');
        }}
      />

      {/* Nuke Reset Modal */}
      {showNukeModal && (
        <NukeModal onClose={() => setShowNukeModal(false)} />
      )}

      {/* Toast Alerts */}
      <NotificationsToast />

    </div>
  );
}
