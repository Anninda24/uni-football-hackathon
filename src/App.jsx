import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SystemPhaseProvider, useSystemPhase } from './context/SystemPhaseContext';
import { SystemProvider, useSystem } from './context/SystemContext';

// Layout & Components
import { Header } from './components/Header';
import { DynamicSidebar } from './components/DynamicSidebar';
import { PublicLayout } from './components/PublicLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
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
import { CaptainDashboardView } from './views/CaptainDashboardView';
import { MyTeamInfoView } from './views/MyTeamInfoView';
import { HomePageView } from './views/HomePageView';
import { RulesCategoriesOverviewView } from './views/RulesCategoriesOverviewView';
import { AuctionScheduleView } from './views/AuctionScheduleView';
import { PlayerRegistrationView } from './views/PlayerRegistrationView';
import { LoginRegisterView } from './views/LoginRegisterView';
import { AuctionRulesTabbedView } from './views/AuctionRulesTabbedView';
import { PlayerPoolTabbedView } from './views/PlayerPoolTabbedView';
import { TeamManagementTabbedView } from './views/TeamManagementTabbedView';
import { SettingsTabbedView } from './views/SettingsTabbedView';
import { PlayerProfileView } from './views/PlayerProfileView';
import { TeamPerformanceStatsView } from './views/TeamPerformanceStatsView';

function AppContent() {
  const { currentUser } = useAuth();
  const { isAuction, isTournament } = useSystemPhase();

  // Active Route state
  const [activeRoute, setActiveRoute] = useState('DEFAULT');

  // Command Palette & Nuke Modal States
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showNukeModal, setShowNukeModal] = useState(false);

  // Targets for deep linking
  const [editPlayerTarget, setEditPlayerTarget] = useState(null);
  const [editManagerTarget, setEditManagerTarget] = useState(null);

  // Get default route when role changes or DEFAULT is requested
  const getDefaultRouteForRole = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'SUPER_ADMIN_DASHBOARD';
      case 'SUB_ADMIN':
        return 'SUB_ADMIN_TEAMS';
      case 'ICON_PLAYER':
        return 'CAPTAIN_DASHBOARD';
      case 'PLAYER':
        return 'PLAYER_MY_PROFILE';
      case 'TEAM_MANAGER':
        return 'MANAGER_MY_TEAM';
      case 'PODIUM_ADMIN':
        return 'PODIUM_AUCTION_CONTROL';
      case 'SPECTATOR':
      default:
        return 'PUBLIC_HOME';
    }
  };

  const effectiveRoute = activeRoute === 'DEFAULT' ? getDefaultRouteForRole(currentUser.role) : activeRoute;

  // Sync active route when user role changes
  useEffect(() => {
    if (activeRoute === 'DEFAULT') return;
    // Reset to role's default if switching away from spectator to dashboard role
    if (currentUser.role === 'SPECTATOR' && !effectiveRoute.startsWith('PUBLIC_')) {
      setActiveRoute('PUBLIC_HOME');
    }
  }, [currentUser.role]);

  // View Resolver strictly mapping routes to components
  const renderRouteView = () => {
    switch (effectiveRoute) {
      // --- SUPER ADMIN ROUTES ---
      case 'SUPER_ADMIN_DASHBOARD':
        return (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <MissionControlView />
          </ProtectedRoute>
        );

      case 'SUPER_ADMIN_AUCTION_RULES':
        return (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <AuctionRulesTabbedView />
          </ProtectedRoute>
        );

      case 'SUPER_ADMIN_PLAYER_POOL_CATEGORY':
        return (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <PlayerPoolTabbedView initialEditPlayer={editPlayerTarget} />
          </ProtectedRoute>
        );

      case 'SUPER_ADMIN_TEAM_MANAGEMENT':
        return (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <TeamManagementTabbedView initialEditManager={editManagerTarget} />
          </ProtectedRoute>
        );

      case 'SUPER_ADMIN_SETTINGS':
        return (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <SettingsTabbedView onOpenNukeModal={() => setShowNukeModal(true)} />
          </ProtectedRoute>
        );

      // --- PLAYER ROUTES ---
      case 'PLAYER_MY_PROFILE':
        return (
          <ProtectedRoute allowedRoles={['PLAYER', 'SUPER_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <PlayerProfileView />
          </ProtectedRoute>
        );

      case 'PLAYER_MY_TEAM':
        return (
          <ProtectedRoute allowedRoles={['PLAYER', 'SUPER_ADMIN', 'TEAM_MANAGER']} onUnauthorizedRedirect={setActiveRoute}>
            <MyTeamInfoView />
          </ProtectedRoute>
        );

      // --- TEAM MANAGER ROUTES ---
      case 'MANAGER_MY_PROFILE':
        return (
          <ProtectedRoute allowedRoles={['TEAM_MANAGER', 'SUPER_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <ManagerManagementView />
          </ProtectedRoute>
        );

      case 'MANAGER_MY_TEAM':
        return (
          <ProtectedRoute allowedRoles={['TEAM_MANAGER', 'SUPER_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <MyTeamInfoView />
          </ProtectedRoute>
        );

      case 'MANAGER_AUCTION':
        return (
          <ProtectedRoute allowedRoles={['TEAM_MANAGER', 'SUPER_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <LiveAuctionView />
          </ProtectedRoute>
        );

      // --- SUB ADMIN ROUTES ---
      case 'SUB_ADMIN_TEAMS':
        return (
          <ProtectedRoute allowedRoles={['SUB_ADMIN', 'SUPER_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <FranchiseTeamView />
          </ProtectedRoute>
        );

      case 'SUB_ADMIN_MATCHES':
        return (
          <ProtectedRoute allowedRoles={['SUB_ADMIN', 'SUPER_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <TournamentView defaultTab="MATCHES" showTabs={false} />
          </ProtectedRoute>
        );

      case 'SUB_ADMIN_STANDINGS':
        return (
          <ProtectedRoute allowedRoles={['SUB_ADMIN', 'SUPER_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <TournamentView defaultTab="STANDINGS" showTabs={false} />
          </ProtectedRoute>
        );

      case 'SUB_ADMIN_STATISTICS':
        return (
          <ProtectedRoute allowedRoles={['SUB_ADMIN', 'SUPER_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <TournamentView defaultTab="STATS" showTabs={false} />
          </ProtectedRoute>
        );

      // --- PODIUM ADMIN ROUTES ---
      case 'PODIUM_PLAYER_POOL':
        return (
          <ProtectedRoute allowedRoles={['PODIUM_ADMIN', 'SUPER_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <PlayerDirectoryView />
          </ProtectedRoute>
        );

      case 'PODIUM_AUCTION_CONTROL':
        return (
          <ProtectedRoute allowedRoles={['PODIUM_ADMIN', 'SUPER_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <LiveAuctionView />
          </ProtectedRoute>
        );

      case 'PODIUM_TEAMS':
        return (
          <ProtectedRoute allowedRoles={['PODIUM_ADMIN', 'SUPER_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <FranchiseTeamView />
          </ProtectedRoute>
        );

      case 'PODIUM_AUCTION_HISTORY':
        return (
          <ProtectedRoute allowedRoles={['PODIUM_ADMIN', 'SUPER_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <LiveOperationsView onNavigateToTab={() => {}} />
          </ProtectedRoute>
        );

      // --- ICON PLAYER ROUTES ---
      case 'CAPTAIN_DASHBOARD':
        return (
          <ProtectedRoute allowedRoles={['ICON_PLAYER', 'SUPER_ADMIN', 'SUB_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <CaptainDashboardView />
          </ProtectedRoute>
        );

      case 'MY_TEAM':
        return (
          <ProtectedRoute allowedRoles={['ICON_PLAYER', 'SUPER_ADMIN', 'SUB_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <MyTeamInfoView />
          </ProtectedRoute>
        );

      case 'ICON_PLAYER_AUCTION':
        return (
          <ProtectedRoute allowedRoles={['ICON_PLAYER', 'SUPER_ADMIN', 'SUB_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <LiveAuctionView />
          </ProtectedRoute>
        );

      // --- PUBLIC / SPECTATOR ROUTES ---
      case 'PUBLIC_HOME':
        return <HomePageView onNavigate={setActiveRoute} />;

      case 'PUBLIC_LOGIN':
        return <LoginRegisterView onLoginSuccess={() => setActiveRoute('DEFAULT')} />;

      case 'PUBLIC_RULEBOOK':
        return <RulesCategoriesOverviewView />;

      case 'PUBLIC_SCHEDULE':
        return <AuctionScheduleView />;

      case 'PUBLIC_LIVE_AUCTION':
        return (
          <ProtectedRoute allowedPhases={['AUCTION']} onUnauthorizedRedirect={setActiveRoute}>
            <LiveAuctionView />
          </ProtectedRoute>
        );

      case 'PUBLIC_LIVE_TOURNAMENT':
        return <TournamentView defaultTab="MATCHES" readOnly={true} />;

      default:
        return <HomePageView onNavigate={setActiveRoute} />;
    }
  };

  // Determine whether to render Public Landing Page Layout or Dashboard Shell Layout
  const isPublicLayout = currentUser.role === 'SPECTATOR' || effectiveRoute.startsWith('PUBLIC_');

  if (isPublicLayout) {
    return (
      <PublicLayout activeRoute={effectiveRoute} setActiveRoute={setActiveRoute}>
        {renderRouteView()}
      </PublicLayout>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark, #0b0f19)', color: 'var(--text-main, #f8fafc)' }}>
      {/* Dynamic Top Header */}
      <Header activeRoute={effectiveRoute} setActiveRoute={setActiveRoute} />

      {/* 2-Column Shell Container */}
      <div style={{ flex: 1, display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
        {/* Role-Specific Dynamic Sidebar */}
        <DynamicSidebar activeRoute={effectiveRoute} setActiveRoute={setActiveRoute} />

        {/* Main Workspace Workspace Area */}
        <main style={{ flex: 1, padding: '28px', width: '100%', maxWidth: '1600px', margin: '0 auto', overflowX: 'hidden' }}>
          {renderRouteView()}
        </main>
      </div>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        setActiveModule={setActiveRoute}
        onEditPlayer={(p) => setEditPlayerTarget(p)}
        onEditManager={(m) => setEditManagerTarget(m)}
      />

      {/* Nuke Modal */}
      {showNukeModal && <NukeModal onClose={() => setShowNukeModal(false)} />}

      {/* Toast System */}
      <NotificationsToast />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <SystemPhaseProvider>
        <SystemProvider>
          <AppContent />
        </SystemProvider>
      </SystemPhaseProvider>
    </AuthProvider>
  );
}
