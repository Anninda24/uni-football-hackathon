import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Preset Demo Accounts for seamless role testing
export const PRESET_ACCOUNTS = {
  SUPER_ADMIN: {
    id: 'usr-admin',
    name: 'Super Admin',
    email: 'admin@gmail.com',
    role: 'SUPER_ADMIN',
    avatar: '👑',
    teamId: null
  },
  SUB_ADMIN: {
    id: 'usr-subadmin',
    name: 'Sub Admin',
    email: 'subadmin@gmail.com',
    role: 'SUB_ADMIN',
    avatar: '🛡️',
    teamId: null
  },
  PODIUM_ADMIN: {
    id: 'usr-podium',
    name: 'Podium Auctioneer',
    email: 'podium@gmail.com',
    role: 'PODIUM_ADMIN',
    avatar: '🎙️',
    teamId: null
  },
  ICON_PLAYER: {
    id: 'usr-icon-player',
    name: 'Icon Player',
    email: 'icon@gmail.com',
    role: 'ICON_PLAYER',
    avatar: '⭐',
    teamId: null
  },
  TEAM_MANAGER: {
    id: 'mgr-1',
    name: 'Alex Mercer',
    email: 'manager@gmail.com',
    role: 'TEAM_MANAGER',
    avatar: '👔',
    teamId: 'team-1',
    teamName: 'Thunderbolts FC'
  },
  PLAYER: {
    id: 'ply-1',
    name: 'Julian Sterling',
    email: 'player@gmail.com',
    role: 'PLAYER',
    avatar: '⚽',
    studentId: 'ST-2026-001',
    teamId: 'team-1'
  },
  SPECTATOR: {
    id: 'usr-guest',
    name: 'Guest Spectator',
    email: 'spectator@gmail.com',
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

    // Automatically obtain real JWT token from backend for API authentication
    if (currentUser?.email) {
      fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email, password: '123456' })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.token) {
          localStorage.setItem('ff_jwt_token', data.token);
        }
      })
      .catch(() => {
        // Silently catch if backend is offline
      });
    }
  }, [currentUser]);

  // Login method supporting email/username and password
  const login = async (usernameOrEmail, password, preferredRole = null) => {
    const query = (usernameOrEmail || '').toLowerCase().trim();
    
    // Check backend login first if user provided password
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: query, password: password || '123456' })
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('ff_jwt_token', data.token);
        const userObj = {
          ...data.user,
          avatar: data.user.role === 'SUPER_ADMIN' ? '👑' : data.user.role === 'SUB_ADMIN' ? '🛡️' : data.user.role === 'PODIUM_ADMIN' ? '🎙️' : data.user.role === 'TEAM_MANAGER' ? '👔' : '⚽'
        };
        setCurrentUser(userObj);
        return { success: true, user: userObj };
      }
    } catch {
      // Fallback to preset local matching if backend offline
    }

    // Fallback: Check preset accounts matching email, id, name prefix or role keyword
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

    const targetRole = preferredRole || (query.includes('admin') ? 'SUPER_ADMIN' : query.includes('subadmin') ? 'SUB_ADMIN' : query.includes('podium') ? 'PODIUM_ADMIN' : query.includes('icon') ? 'ICON_PLAYER' : query.includes('mgr') || query.includes('manager') || query.includes('alex') ? 'TEAM_MANAGER' : 'SUPER_ADMIN');

    const newUser = {
      id: `usr-${Date.now()}`,
      name: usernameOrEmail || 'User',
      email: query.includes('@') ? query : `${query}@university.edu`,
      role: targetRole,
      avatar: targetRole === 'SUPER_ADMIN' ? '👑' : targetRole === 'SUB_ADMIN' ? '🛡️' : targetRole === 'PODIUM_ADMIN' ? '🎙️' : targetRole === 'TEAM_MANAGER' ? '👔' : '⚽',
      teamId: targetRole === 'TEAM_MANAGER' ? 'team-1' : null
    };

    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = () => {
    localStorage.removeItem('ff_jwt_token');
    setCurrentUser(PRESET_ACCOUNTS.SPECTATOR);
  };

  const switchRole = (roleKey) => {
    if (PRESET_ACCOUNTS[roleKey]) {
      setCurrentUser(PRESET_ACCOUNTS[roleKey]);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      setCurrentUser,
      PRESET_ACCOUNTS,
      login,
      logout,
      switchRole,
      isAuthenticated: currentUser.role !== 'SPECTATOR'
    }}>
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
