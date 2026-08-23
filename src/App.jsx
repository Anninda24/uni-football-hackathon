import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SystemPhaseProvider, useSystemPhase } from './context/SystemPhaseContext';
import { SystemProvider, useSystem } from './context/SystemContext';
import { Lock } from 'lucide-react';

// Layout & Components
import { Header } from './components/Header';
import { DynamicSidebar } from './components/DynamicSidebar';
import { PublicLayout } from './components/PublicLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CommandPalette } from './components/CommandPalette';
import { NukeModal } from './components/NukeModal';
import { NotificationsToast } from './components/NotificationsToast';

// Lazy-loaded Module Views — code split per route for faster initial load
const MissionControlView        = lazy(() => import('./views/MissionControlView').then(m => ({ default: m.MissionControlView })));
const FinancialRulesView        = lazy(() => import('./views/FinancialRulesView').then(m => ({ default: m.FinancialRulesView })));
const CategoryManagerView       = lazy(() => import('./views/CategoryManagerView').then(m => ({ default: m.CategoryManagerView })));
const BiddingMathMatrixView     = lazy(() => import('./views/BiddingMathMatrixView').then(m => ({ default: m.BiddingMathMatrixView })));
const PlayerDirectoryView       = lazy(() => import('./views/PlayerDirectoryView').then(m => ({ default: m.PlayerDirectoryView })));
const FranchiseTeamView         = lazy(() => import('./views/FranchiseTeamView').then(m => ({ default: m.FranchiseTeamView })));
const ManagerManagementView     = lazy(() => import('./views/ManagerManagementView').then(m => ({ default: m.ManagerManagementView })));
const LiveOperationsView        = lazy(() => import('./views/LiveOperationsView').then(m => ({ default: m.LiveOperationsView })));
const DangerZoneView            = lazy(() => import('./views/DangerZoneView').then(m => ({ default: m.DangerZoneView })));
const LiveAuctionView           = lazy(() => import('./views/LiveAuctionView').then(m => ({ default: m.LiveAuctionView })));
const TournamentView            = lazy(() => import('./views/TournamentView').then(m => ({ default: m.TournamentView })));
const CaptainDashboardView      = lazy(() => import('./views/CaptainDashboardView').then(m => ({ default: m.CaptainDashboardView })));
const MyTeamInfoView            = lazy(() => import('./views/MyTeamInfoView').then(m => ({ default: m.MyTeamInfoView })));
const HomePageView              = lazy(() => import('./views/HomePageView').then(m => ({ default: m.HomePageView })));
const RulesCategoriesOverviewView = lazy(() => import('./views/RulesCategoriesOverviewView').then(m => ({ default: m.RulesCategoriesOverviewView })));
const AuctionScheduleView       = lazy(() => import('./views/AuctionScheduleView').then(m => ({ default: m.AuctionScheduleView })));
const PlayerRegistrationView    = lazy(() => import('./views/PlayerRegistrationView').then(m => ({ default: m.PlayerRegistrationView })));
const LoginRegisterView         = lazy(() => import('./views/LoginRegisterView').then(m => ({ default: m.LoginRegisterView })));
const AuctionRulesTabbedView    = lazy(() => import('./views/AuctionRulesTabbedView').then(m => ({ default: m.AuctionRulesTabbedView })));
const PlayerPoolTabbedView      = lazy(() => import('./views/PlayerPoolTabbedView').then(m => ({ default: m.PlayerPoolTabbedView })));
const TeamManagementTabbedView  = lazy(() => import('./views/TeamManagementTabbedView').then(m => ({ default: m.TeamManagementTabbedView })));
const SettingsTabbedView        = lazy(() => import('./views/SettingsTabbedView').then(m => ({ default: m.SettingsTabbedView })));
const PlayerProfileView         = lazy(() => import('./views/PlayerProfileView').then(m => ({ default: m.PlayerProfileView })));
const ManagerProfileView        = lazy(() => import('./views/ManagerProfileView').then(m => ({ default: m.ManagerProfileView })));
const TeamPerformanceStatsView  = lazy(() => import('./views/TeamPerformanceStatsView').then(m => ({ default: m.TeamPerformanceStatsView })));
const TournamentSettingsView    = lazy(() => import('./views/TournamentSettingsView').then(m => ({ default: m.TournamentSettingsView })));

// Shared loading fallback for Suspense
function ViewLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px',
      color: '#64748b',
      fontSize: '0.9rem',
      gap: '10px'
    }}>
      <div style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        border: '2px solid rgba(0, 230, 153, 0.2)',
        borderTopColor: 'var(--accent-green)',
        animation: 'spin 0.7s linear infinite'
      }} />
      Loading…
    </div>
  );
}

function AppContent() {
  const { currentUser } = useAuth();
  const { currentPhase, isAuction, isTournament } = useSystemPhase();

  // Active Route state
  const [activeRoute, setActiveRoute] = useState('DEFAULT');

  // Command Palette & Nuke Modal States
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showNukeModal, setShowNukeModal] = useState(false);

  // Get default route when role changes or DEFAULT is requested
  const getDefaultRouteForRole = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':   return 'SUPER_ADMIN_DASHBOARD';
      case 'SUB_ADMIN':     return 'SUB_ADMIN_TEAMS';
      case 'ICON_PLAYER':   return 'CAPTAIN_DASHBOARD';
      case 'PLAYER':        return 'PLAYER_MY_PROFILE';
      case 'TEAM_MANAGER':  return 'MANAGER_MY_TEAM';
      case 'PODIUM_ADMIN':  return 'PODIUM_AUCTION_CONTROL';
      case 'SPECTATOR':
      default:              return 'PUBLIC_HOME';
    }
  };

  const effectiveRoute = useMemo(
    () => activeRoute === 'DEFAULT' ? getDefaultRouteForRole(currentUser.role) : activeRoute,
    [activeRoute, currentUser.role]
  );

  // Redirect to home when role becomes SPECTATOR and current route is protected
  useEffect(() => {
    if (currentUser.role === 'SPECTATOR' && !effectiveRoute.startsWith('PUBLIC_')) {
      setActiveRoute('PUBLIC_HOME');
    }
  }, [currentUser.role, effectiveRoute]);

  // Sub-Admin Phase 4 Lock Screen (Unlocked strictly during Phase 4: Tournament for SUB_ADMIN)
  const renderSubAdminLockedScreen = () => (
    <div className="glass-panel" style={{ textAlign: 'center', padding: '64px 32px', borderRadius: '24px', maxWidth: '680px', margin: '40px auto', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', border: '2px solid rgba(239, 68, 68, 0.4)' }}>
        <Lock size={32} color="#f87171" />
      </div>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f8fafc', margin: 0 }}>Sub-Admin Dashboard Locked</h2>
      <p style={{ color: '#94a3b8', fontSize: '1rem', margin: '12px 0 24px 0', lineHeight: 1.6 }}>
        The tournament has not started yet. Sub-Admin tournament operations will automatically unlock when <strong>Phase 4: Tournament</strong> is activated by the Super Admin.
      </p>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontSize: '0.85rem', fontWeight: 800 }}>
        Current League Phase: {currentPhase.label}
      </div>
    </div>
  );

  // View Resolver strictly mapping routes to components
  const renderRouteView = () => {
    // Check if Sub-Admin is attempting to access Sub-Admin features before Phase 4 (Tournament)
    if (currentUser.role === 'SUB_ADMIN' && !isTournament && effectiveRoute.startsWith('SUB_ADMIN_')) {
      return renderSubAdminLockedScreen();
    }

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
            <PlayerPoolTabbedView />
          </ProtectedRoute>
        );

      case 'SUPER_ADMIN_TEAM_MANAGEMENT':
        return (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <TeamManagementTabbedView />
          </ProtectedRoute>
        );

      case 'SUPER_ADMIN_SETTINGS':
        return (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <SettingsTabbedView onOpenNukeModal={() => setShowNukeModal(true)} />
          </ProtectedRoute>
        );

      // --- SUB ADMIN ROUTES ---
      case 'SUB_ADMIN_TEAMS':
        return (
          <ProtectedRoute allowedRoles={['SUB_ADMIN', 'SUPER_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            {!isTournament && currentUser.role === 'SUB_ADMIN' ? renderSubAdminLockedScreen() : <FranchiseTeamView />}
          </ProtectedRoute>
        );

      case 'SUB_ADMIN_MATCHES':
        return (
          <ProtectedRoute allowedRoles={['SUB_ADMIN', 'SUPER_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            {!isTournament && currentUser.role === 'SUB_ADMIN' ? renderSubAdminLockedScreen() : <TournamentView defaultTab="MATCHES" showTabs={false} />}
          </ProtectedRoute>
        );

      case 'SUB_ADMIN_STANDINGS':
        return (
          <ProtectedRoute allowedRoles={['SUB_ADMIN', 'SUPER_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            {!isTournament && currentUser.role === 'SUB_ADMIN' ? renderSubAdminLockedScreen() : <TournamentView defaultTab="STANDINGS" showTabs={false} />}
          </ProtectedRoute>
        );

      case 'SUB_ADMIN_STATISTICS':
        return (
          <ProtectedRoute allowedRoles={['SUB_ADMIN', 'SUPER_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            {!isTournament && currentUser.role === 'SUB_ADMIN' ? renderSubAdminLockedScreen() : <TournamentView defaultTab="STATS" showTabs={false} />}
          </ProtectedRoute>
        );

      case 'SUB_ADMIN_SETTINGS':
        return (
          <ProtectedRoute allowedRoles={['SUB_ADMIN', 'SUPER_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            {!isTournament && currentUser.role === 'SUB_ADMIN' ? renderSubAdminLockedScreen() : <TournamentSettingsView />}
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

      // --- PLAYER ROUTES ---
      case 'PLAYER_MY_PROFILE':
        return (
          <ProtectedRoute allowedRoles={['PLAYER', 'SUPER_ADMIN', 'SUB_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <PlayerProfileView />
          </ProtectedRoute>
        );

      case 'PLAYER_MY_TEAM':
        return (
          <ProtectedRoute allowedRoles={['PLAYER', 'SUPER_ADMIN', 'SUB_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <MyTeamInfoView />
          </ProtectedRoute>
        );

      // --- TEAM MANAGER ROUTES ---
      case 'MANAGER_MY_PROFILE':
        return (
          <ProtectedRoute allowedRoles={['TEAM_MANAGER', 'SUPER_ADMIN', 'SUB_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <ManagerProfileView />
          </ProtectedRoute>
        );

      case 'MANAGER_MY_TEAM':
        return (
          <ProtectedRoute allowedRoles={['TEAM_MANAGER', 'SUPER_ADMIN', 'SUB_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <MyTeamInfoView />
          </ProtectedRoute>
        );

      case 'MANAGER_AUCTION':
        return (
          <ProtectedRoute allowedRoles={['TEAM_MANAGER', 'SUPER_ADMIN', 'SUB_ADMIN']} onUnauthorizedRedirect={setActiveRoute}>
            <LiveAuctionView />
          </ProtectedRoute>
        );

      // --- PUBLIC / SPECTATOR ROUTES ---
      case 'PUBLIC_HOME':
        return <HomePageView onNavigate={setActiveRoute} />;

      case 'PUBLIC_LOGIN':
        return <LoginRegisterView initialTab="LOGIN" onLoginSuccess={() => setActiveRoute('DEFAULT')} />;

      case 'PUBLIC_REGISTER':
        return <LoginRegisterView initialTab="REGISTER" onLoginSuccess={() => setActiveRoute('DEFAULT')} />;

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

      case 'PLAYER_DIRECTORY':
        return (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUB_ADMIN', 'PODIUM_ADMIN', 'ICON_PLAYER', 'PLAYER', 'TEAM_MANAGER']} onUnauthorizedRedirect={setActiveRoute}>
            <PlayerDirectoryView />
          </ProtectedRoute>
        );

      default:
        return <HomePageView onNavigate={setActiveRoute} />;
    }
  };

  const isPublicLayout = currentUser.role === 'SPECTATOR' || effectiveRoute.startsWith('PUBLIC_');

  if (isPublicLayout) {
    return (
      <PublicLayout activeRoute={effectiveRoute} setActiveRoute={setActiveRoute}>
        <Suspense fallback={<ViewLoader />}>
          {renderRouteView()}
        </Suspense>
      </PublicLayout>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark, #0b0f19)', color: 'var(--text-main, #f8fafc)' }}>
      <Header activeRoute={effectiveRoute} setActiveRoute={setActiveRoute} />

      <div style={{ flex: 1, display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
        <DynamicSidebar activeRoute={effectiveRoute} setActiveRoute={setActiveRoute} />

        <main style={{ flex: 1, padding: '28px', width: '100%', maxWidth: '1600px', margin: '0 auto', overflowX: 'hidden' }}>
          <Suspense fallback={<ViewLoader />}>
            {renderRouteView()}
          </Suspense>
        </main>
      </div>

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        setActiveModule={setActiveRoute}
        onEditPlayer={() => {}}
        onEditManager={() => {}}
      />

      {showNukeModal && <NukeModal onClose={() => setShowNukeModal(false)} />}

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
