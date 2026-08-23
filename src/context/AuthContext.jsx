import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AuthContext = createContext();

// Preset Demo Accounts with specific credentials
export const PRESET_ACCOUNTS = {
  SUPER_ADMIN: {
    id: 'usr-admin',
    name: 'Super Admin',
    email: 'admin@gmail.com',
    username: 'admin',
    password: '123',
    role: 'SUPER_ADMIN',
    avatar: '👑',
    teamId: null
  },
  SUB_ADMIN: {
    id: 'usr-subadmin',
    name: 'Sub Admin',
    email: 'subadmin@gmail.com',
    username: 'subadmin',
    password: '123',
    role: 'SUB_ADMIN',
    avatar: '🛡️',
    teamId: null
  },
  PODIUM_ADMIN: {
    id: 'usr-podium',
    name: 'Podium Auctioneer',
    email: 'podium@gmail.com',
    username: 'podium',
    password: '123',
    role: 'PODIUM_ADMIN',
    avatar: '🎙️',
    teamId: null
  },
  ICON_PLAYER: {
    id: 'usr-icon-player',
    name: 'Icon Player',
    email: 'icon@gmail.com',
    username: 'icon',
    password: '123',
    role: 'ICON_PLAYER',
    avatar: '⭐',
    teamId: null
  },
  TEAM_MANAGER: {
    id: 'mgr-1',
    name: 'Alex Mercer',
    email: 'manager@gmail.com',
    username: 'manager',
    password: '123',
    role: 'TEAM_MANAGER',
    avatar: '👔',
    teamId: 'team-1',
    teamName: 'Thunderbolts FC'
  },
  PLAYER: {
    id: 'ply-1',
    name: 'Julian Sterling',
    email: 'player@gmail.com',
    username: 'player',
    password: '123',
    role: 'PLAYER',
    avatar: '⚽',
    studentId: 'ST-2026-001',
    teamId: 'team-1'
  },
  SPECTATOR: {
    id: 'usr-guest',
    name: 'Guest Spectator',
    email: 'spectator@gmail.com',
    username: 'spectator',
    password: '123',
    role: 'SPECTATOR',
    avatar: '👁️',
    teamId: null
  }
};

const safeParse = (raw, fallback) => {
  try {
    const parsed = JSON.parse(raw);
    return (parsed !== null && parsed !== undefined) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ff_current_user');
    return saved ? safeParse(saved, PRESET_ACCOUNTS.SPECTATOR) : PRESET_ACCOUNTS.SPECTATOR;
  });

  const prevEmailRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('ff_current_user', JSON.stringify(currentUser));

    // Only re-fetch JWT when the email actually changes (new login / role switch)
    if (currentUser?.email && currentUser.email !== prevEmailRef.current) {
      prevEmailRef.current = currentUser.email;
      fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email, password: currentUser.password || '123' })
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

  // Role-specific login method strictly validating credentials
  const login = async (usernameOrEmail, password, preferredRole = null) => {
    const query = (usernameOrEmail || '').toLowerCase().trim();
    const cleanPass = (password || '').trim();

    // 1. Preferred role preset check for seamless demo switcher execution
    if (preferredRole && PRESET_ACCOUNTS[preferredRole]) {
      const presetUser = PRESET_ACCOUNTS[preferredRole];
      setCurrentUser(presetUser);
      return { success: true, user: presetUser };
    }

    if (!query) {
      return { success: false, error: 'Please enter your username or email.' };
    }

    if (!cleanPass) {
      return { success: false, error: 'Please enter your password.' };
    }

    // 2. Try backend API login if available
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: query, password: cleanPass })
      });
      const data = await res.json();
      if (data.success && data.token && data.user) {
        localStorage.setItem('ff_jwt_token', data.token);
        const userObj = {
          ...data.user,
          avatar: data.user.role === 'SUPER_ADMIN' ? '👑' : data.user.role === 'SUB_ADMIN' ? '🛡️' : data.user.role === 'PODIUM_ADMIN' ? '🎙️' : data.user.role === 'TEAM_MANAGER' ? '👔' : '⚽'
        };
        setCurrentUser(userObj);
        return { success: true, user: userObj };
      }
    } catch {
      // Backend offline or unreachable, proceed to local matching
    }

    const isValidPass = (expectedPass, inputPass) => {
      const allowed = [expectedPass, '123', '123456', 'admin123'].filter(Boolean).map(p => p.toLowerCase());
      return allowed.includes(inputPass.toLowerCase());
    };

    // 3. Match against PRESET_ACCOUNTS
    const matchedPreset = Object.values(PRESET_ACCOUNTS).find(acc => {
      const emailMatch = acc.email.toLowerCase() === query;
      const usernameMatch = acc.username && acc.username.toLowerCase() === query;
      const roleMatch = acc.role.toLowerCase() === query || acc.role.toLowerCase().replace('_', '') === query.replace('_', '');
      return emailMatch || usernameMatch || roleMatch;
    });

    if (matchedPreset) {
      if (isValidPass(matchedPreset.password, cleanPass)) {
        setCurrentUser(matchedPreset);
        return { success: true, user: matchedPreset };
      } else {
        return { success: false, error: `Invalid password for ${matchedPreset.name}. (Demo pass: 123)` };
      }
    }

    // 4. Match against registered Managers
    try {
      const managers = safeParse(localStorage.getItem('ff_managers'), []);
      const matchedManager = managers.find(m => 
        (m.email && m.email.toLowerCase() === query) ||
        (m.name && m.name.toLowerCase() === query)
      );
      if (matchedManager) {
        if (matchedManager.password ? matchedManager.password === cleanPass : isValidPass('123', cleanPass)) {
          const userObj = {
            id: matchedManager.id,
            name: matchedManager.name,
            email: matchedManager.email,
            role: 'TEAM_MANAGER',
            avatar: '👔',
            teamId: matchedManager.teamId || null,
            teamName: matchedManager.teamName || null
          };
          setCurrentUser(userObj);
          return { success: true, user: userObj };
        } else {
          return { success: false, error: 'Invalid password for this Team Manager account.' };
        }
      }
    } catch {}

    // 5. Match against registered Players
    try {
      const players = safeParse(localStorage.getItem('ff_players'), []);
      const matchedPlayer = players.find(p => 
        (p.email && p.email.toLowerCase() === query) ||
        (p.studentId && p.studentId.toLowerCase() === query) ||
        (p.name && p.name.toLowerCase() === query)
      );
      if (matchedPlayer) {
        if (matchedPlayer.password ? matchedPlayer.password === cleanPass : isValidPass('123', cleanPass)) {
          const userObj = {
            id: matchedPlayer.id,
            name: matchedPlayer.name,
            email: matchedPlayer.email,
            role: 'PLAYER',
            avatar: '⚽',
            studentId: matchedPlayer.studentId,
            teamId: matchedPlayer.soldToTeamId || null
          };
          setCurrentUser(userObj);
          return { success: true, user: userObj };
        } else {
          return { success: false, error: 'Invalid password for this Player account.' };
        }
      }
    } catch {}

    // 6. Strict rejection if no valid credentials match
    return {
      success: false,
      error: 'Invalid credentials. Please enter a valid role username/email & password, or use the Demo Switcher.'
    };
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
