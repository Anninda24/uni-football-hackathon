import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Preset Demo Accounts for seamless role testing
export const PRESET_ACCOUNTS = {
  SUPER_ADMIN: {
    id: 'usr-admin',
    name: 'Super Admin',
    email: 'admin@football.com',
    role: 'SUPER_ADMIN',
    avatar: '⚡',
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

  // Login method supporting email/password or role selection
  const login = (email, password, preferredRole = 'SPECTATOR') => {
    // Check preset accounts matching role or email
    const matchedPreset = Object.values(PRESET_ACCOUNTS).find(
      acc => acc.email.toLowerCase() === email?.toLowerCase() || acc.role === preferredRole
    );

    if (matchedPreset) {
      setCurrentUser(matchedPreset);
      return { success: true, user: matchedPreset };
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0] || 'Authenticated User',
      email,
      role: preferredRole,
      avatar: preferredRole === 'TEAM_MANAGER' ? '👔' : preferredRole === 'PLAYER' ? '⚽' : '👤',
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
