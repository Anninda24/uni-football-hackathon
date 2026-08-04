import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Preset Demo Accounts for seamless role testing
export const PRESET_ACCOUNTS = {
  SUPER_ADMIN: {
    id: 'usr-admin',
    name: 'Super Admin',
    email: 'admin@football.com',
    role: 'SUPER_ADMIN',
    avatar: '👑',
    teamId: null
  },
  SUB_ADMIN: {
    id: 'usr-subadmin',
    name: 'Sub Admin',
    email: 'subadmin@football.com',
    role: 'SUB_ADMIN',
    avatar: '🛡️',
    teamId: null
  },
  PODIUM_ADMIN: {
    id: 'usr-podium',
    name: 'Podium Auctioneer',
    email: 'podium@football.com',
    role: 'PODIUM_ADMIN',
    avatar: '🎙️',
    teamId: null
  },
  ICON_PLAYER: {
    id: 'usr-icon-player',
    name: 'Icon Player',
    email: 'icon@football.com',
    role: 'ICON_PLAYER',
    avatar: '⭐',
    teamId: null
  },
  TEAM_MANAGER: {
    id: 'mgr-1',
    name: 'Alex Mercer',
    email: 'alex@thunderbolts.com',
    role: 'TEAM_MANAGER',
    avatar: '👔',
    teamId: 'team-1',
    teamName: 'Thunderbolts FC'
  },
  PLAYER: {
    id: 'ply-1',
    name: 'Julian Sterling',
    email: 'julian@student.edu',
    role: 'PLAYER',
    avatar: '⚽',
    studentId: 'ST-2024-881',
    teamId: 'team-1'
  },
  SPECTATOR: {
    id: 'usr-guest',
    name: 'Guest Spectator',
    email: 'guest@public.com',
    role: 'SPECTATOR',
    avatar: '👁️',
    teamId: null
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ff_current_user');
    return saved ? JSON.parse(saved) : PRESET_ACCOUNTS.SUPER_ADMIN;
  });

  useEffect(() => {
    localStorage.setItem('ff_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Login method supporting email/username and password
  const login = (usernameOrEmail, password, preferredRole = null) => {
    const query = (usernameOrEmail || '').toLowerCase().trim();
    
    // Check preset accounts matching email, id, name prefix or role keyword
    const matchedPreset = Object.values(PRESET_ACCOUNTS).find(acc => {
      if (!query) return false;
      const emailMatch = acc.email.toLowerCase() === query;
      const nameMatch = acc.name.toLowerCase().includes(query) || query.includes(acc.name.toLowerCase().split(' ')[0]);
      const roleMatch = acc.role.toLowerCase() === query || acc.role.toLowerCase().replace('_', '') === query.replace('_', '');
      const idMatch = acc.id.toLowerCase() === query;
      return emailMatch || nameMatch || roleMatch || idMatch;
    });

    if (matchedPreset) {
      setCurrentUser(matchedPreset);
      return { success: true, user: matchedPreset };
    }

    // Default target role based on username keywords if specified
    const targetRole = preferredRole || (query.includes('admin') ? 'SUPER_ADMIN' : query.includes('subadmin') ? 'SUB_ADMIN' : query.includes('podium') ? 'PODIUM_ADMIN' : query.includes('icon') ? 'ICON_PLAYER' : query.includes('mgr') || query.includes('manager') || query.includes('alex') ? 'TEAM_MANAGER' : 'SUPER_ADMIN');

    const newUser = {
      id: `usr-${Date.now()}`,
      name: usernameOrEmail ? (usernameOrEmail.split('@')[0] || usernameOrEmail) : 'Super Admin',
      email: usernameOrEmail && usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail || 'admin'}@football.com`,
      role: targetRole,
      avatar: targetRole === 'SUPER_ADMIN' ? '⚡' : targetRole === 'TEAM_MANAGER' ? '👔' : '👤',
      teamId: null
    };

    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  // Logout resets to SPECTATOR public visitor state
  const logout = () => {
    setCurrentUser(PRESET_ACCOUNTS.SPECTATOR);
  };

  // Switch role directly (Dev / Principal Engineer Quick-Switcher)
  const switchRole = (newRole) => {
    if (PRESET_ACCOUNTS[newRole]) {
      setCurrentUser(PRESET_ACCOUNTS[newRole]);
    } else {
      setCurrentUser(prev => ({ ...prev, role: newRole }));
    }
  };

  const isAuthenticated = currentUser.role !== 'SPECTATOR';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        login,
        logout,
        switchRole,
        isAuthenticated,
        PRESET_ACCOUNTS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
