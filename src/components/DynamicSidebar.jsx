import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystemPhase } from '../context/SystemPhaseContext';
import {
  LayoutDashboard,
  Gavel,
  Users,
  ShieldAlert,
  Settings,
  UserCheck,
  Trophy,
  Award,
  BookOpen,
  Calendar,
  Radio,
  History,
  Home,
  LogIn,
  LogOut,
  Crown,
  Lock,
  TrendingUp,
  Shield
} from 'lucide-react';

export function DynamicSidebar({ activeRoute, setActiveRoute }) {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { currentPhaseId, isAuction, isTournament } = useSystemPhase();

  const role = currentUser.role;

  // Build role-specific route structures strictly per requirements
  const getMenuItems = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return [
          { id: 'SUPER_ADMIN_DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'SUPER_ADMIN_AUCTION_RULES', label: 'Auction Rules', icon: Gavel },
          { id: 'SUPER_ADMIN_PLAYER_POOL_CATEGORY', label: 'Player Pool and Category', icon: Users },
          { id: 'SUPER_ADMIN_TEAM_MANAGEMENT', label: 'Team Management', icon: Trophy },
          { id: 'SUPER_ADMIN_SETTINGS', label: 'Settings', icon: Settings }
        ];

      case 'SUB_ADMIN':
        return [
          { id: 'SUB_ADMIN_TEAMS', label: 'Teams', icon: Trophy },
          { id: 'SUB_ADMIN_MATCHES', label: 'Matches', icon: Calendar },
          { id: 'SUB_ADMIN_STANDINGS', label: 'Standings', icon: TrendingUp },
          { id: 'SUB_ADMIN_STATISTICS', label: 'Statistics', icon: Award }
        ];

      case 'ICON_PLAYER':
        return [
          { id: 'CAPTAIN_DASHBOARD', label: 'Captain Dashboard', icon: Crown },
          { id: 'MY_TEAM', label: 'My Team Info', icon: Users },
          { id: 'ICON_PLAYER_AUCTION', label: 'Auction', icon: Gavel }
        ];

      case 'PLAYER':
        return [
          { id: 'PLAYER_MY_PROFILE', label: 'My Profile', icon: UserCheck },
          { id: 'PLAYER_MY_TEAM', label: 'My Team', icon: Trophy }
        ];

      case 'TEAM_MANAGER':
        return [
          { id: 'MANAGER_MY_PROFILE', label: 'My Profile', icon: UserCheck },
          { id: 'MANAGER_MY_TEAM', label: 'My Team', icon: Trophy },
          { id: 'MANAGER_AUCTION', label: 'Auction', icon: Gavel }
        ];

      case 'PODIUM_ADMIN':
        return [
          { id: 'PODIUM_PLAYER_POOL', label: 'Player Pool', icon: Users },
          { id: 'PODIUM_AUCTION_CONTROL', label: 'Auction Control', icon: Gavel },
          { id: 'PODIUM_TEAMS', label: 'Teams', icon: Trophy },
          { id: 'PODIUM_AUCTION_HISTORY', label: 'Auction History', icon: History }
        ];

      case 'SPECTATOR':
      default:
        return [
          { id: 'PUBLIC_HOME', label: 'Home', icon: Home, enabled: true },
          { id: 'PUBLIC_RULEBOOK', label: 'Rulebook', icon: BookOpen, enabled: true },
          { id: 'PUBLIC_SCHEDULE', label: 'Schedule', icon: Calendar, enabled: true },
          {
            id: 'PUBLIC_LIVE_AUCTION',
            label: 'Live Auction',
            icon: Radio,
            enabled: isAuction,
            phaseRequired: 'Phase 3: Auction'
          },
          {
            id: 'PUBLIC_LIVE_TOURNAMENT',
            label: 'Live Tournament',
            icon: Trophy,
            enabled: isTournament,
            phaseRequired: 'Phase 4: Tournament'
          }
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside style={{
      width: '260px',
      background: 'rgba(15, 23, 42, 0.95)',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'calc(100vh - 70px)',
      padding: '20px 14px'
    }}>
      {/* Sidebar Role Header & Auth Action */}
      <div style={{
        padding: '12px 14px',
        marginBottom: '16px',
        borderRadius: '10px',
        background: 'rgba(30, 41, 59, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '1.4rem' }}>{currentUser.avatar || '🛡️'}</div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#3b82f6', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {role.replace('_', ' ')}
            </div>
          </div>
        </div>

        {/* Log Out Button - positioned above Main Menu tabs */}
        {isAuthenticated && (
          <button
            onClick={() => {
              logout();
              if (setActiveRoute) setActiveRoute('PUBLIC_HOME');
            }}
            style={{
              width: '100%',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut style={{ width: '14px', height: '14px' }} />
            <span>Logout</span>
          </button>
        )}
      </div>

      {/* Dynamic Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 12px' }}>
          Main Menu
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeRoute === item.id;
          const isDisabled = item.enabled === false;

          return (
            <button
              key={item.id}
              disabled={isDisabled}
              onClick={() => {
                if (!isDisabled) setActiveRoute(item.id);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.15) 100%)'
                  : 'transparent',
                borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                color: isDisabled
                  ? '#475569'
                  : isActive
                  ? '#60a5fa'
                  : '#cbd5e1',
                fontSize: '0.88rem',
                fontWeight: isActive ? 700 : 500,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                opacity: isDisabled ? 0.5 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon style={{ width: '18px', height: '18px', color: isActive ? '#3b82f6' : isDisabled ? '#475569' : '#94a3b8' }} />
                <span>{item.label}</span>
              </div>

              {isDisabled && (
                <span title={`Requires ${item.phaseRequired}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                  <Lock style={{ width: '10px', height: '10px' }} />
                  <span>Locked</span>
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Phase Info Footer Pill */}
      <div style={{
        marginTop: 'auto',
        padding: '12px',
        borderRadius: '8px',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        fontSize: '0.74rem',
        color: '#64748b'
      }}>
        <div style={{ fontWeight: 700, color: '#94a3b8', marginBottom: '2px' }}>
          Current Active Phase
        </div>
        <div style={{ color: '#38bdf8', fontWeight: 600 }}>
          {currentPhaseId.replace('_', ' ')}
        </div>
      </div>
    </aside>
  );
}
