import React, { createContext, useContext, useState, useEffect } from 'react';

export const SYSTEM_PHASES = {
  SETUP: {
    id: 'SETUP',
    num: 1,
    name: 'Setup',
    label: 'Phase 1: Setup',
    badgeColor: '#3b82f6',
    description: 'League rules, base prices, categories, and franchise setup.'
  },
  REGISTRATION: {
    id: 'REGISTRATION',
    num: 2,
    name: 'Registration',
    label: 'Phase 2: Registration',
    badgeColor: '#eab308',
    description: 'Player registration, profile verification, and team nominations.'
  },
  AUCTION: {
    id: 'AUCTION',
    num: 3,
    name: 'Auction',
    label: 'Phase 3: Auction',
    badgeColor: '#ef4444',
    description: 'Live player auction, bidding math matrix, and roster assembly.'
  },
  TOURNAMENT: {
    id: 'TOURNAMENT',
    num: 4,
    name: 'Tournament',
    label: 'Phase 4: Tournament',
    badgeColor: '#22c55e',
    description: 'Live match center, tournament fixtures, and leaderboards.'
  }
};

const SystemPhaseContext = createContext();

export const SystemPhaseProvider = ({ children }) => {
  const [currentPhaseId, setCurrentPhaseId] = useState(() => {
    const saved = localStorage.getItem('ff_system_phase');
    // Normalize 'THE_AUCTION' or legacy names to 'AUCTION'
    if (saved === 'THE_AUCTION') return 'AUCTION';
    return saved && SYSTEM_PHASES[saved] ? saved : 'SETUP';
  });

  useEffect(() => {
    localStorage.setItem('ff_system_phase', currentPhaseId);
  }, [currentPhaseId]);

  const setPhase = (phaseId) => {
    const normalized = phaseId === 'THE_AUCTION' ? 'AUCTION' : phaseId;
    if (SYSTEM_PHASES[normalized]) {
      setCurrentPhaseId(normalized);
      localStorage.setItem('ff_system_phase', normalized);
      // Also update system_state for backward compatibility with existing views
      try {
        const existingState = localStorage.getItem('ff_system_state');
        if (existingState) {
          const parsed = JSON.parse(existingState);
          parsed.currentPhase = normalized;
          localStorage.setItem('ff_system_state', JSON.stringify(parsed));
        }
      } catch (e) {
        console.error('Failed to sync system_state phase:', e);
      }
    }
  };

  const currentPhase = SYSTEM_PHASES[currentPhaseId] || SYSTEM_PHASES.SETUP;

  return (
    <SystemPhaseContext.Provider
      value={{
        currentPhase,
        currentPhaseId,
        setPhase,
        SYSTEM_PHASES,
        isSetup: currentPhaseId === 'SETUP',
        isRegistration: currentPhaseId === 'REGISTRATION',
        isAuction: currentPhaseId === 'AUCTION',
        isTournament: currentPhaseId === 'TOURNAMENT'
      }}
    >
      {children}
    </SystemPhaseContext.Provider>
  );
};

export const useSystemPhase = () => {
  const context = useContext(SystemPhaseContext);
  if (!context) {
    throw new Error('useSystemPhase must be used within a SystemPhaseProvider');
  }
  return context;
};
