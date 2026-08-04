import React, { createContext, useContext, useState, useEffect } from 'react';

const SystemContext = createContext();

// Initial Default State according to PRD
const INITIAL_SYSTEM_STATE = {
  // Phase state: 'SETUP', 'REGISTRATION', 'THE_AUCTION', 'TOURNAMENT'
  currentPhase: 'SETUP',
  
  // Rule configs
  totalBudget: 100000, // $100,000 allowance per team
  minRoster: 7, // Minimum 7 players required per team
  
  academicSessions: ['2024/2025', '2025/2026', '2026/2027'],
  
  // Player Categories with Base Prices
  categories: [
    { id: 'cat-icon', name: 'Icon', basePrice: 0, color: '#ef4444' },
    { id: 'cat-plat', name: 'Platinum', basePrice: 15000, color: '#00d9ff' },
    { id: 'cat-gold', name: 'Gold', basePrice: 10000, color: '#ffb703' },
    { id: 'cat-silver', name: 'Silver', basePrice: 6000, color: '#c0c0c0' },
    { id: 'cat-bronze', name: 'Bronze', basePrice: 3000, color: '#cd7f32' }
  ],
  
  // Percentage-based minimum raise tiers (Percentage of total budget)
  // Example: 0-3% of total budget ($0-$3,000) -> min raise 0.15% ($150)
  // 3-10% ($3,000-$10,000) -> min raise 0.5% ($500)
  // >10% (>$10,000) -> min raise 1.0% ($1,000)
  raiseTiers: [
    { id: 'rt-1', minBudgetPct: 0, maxBudgetPct: 3, raisePct: 0.15 },
    { id: 'rt-2', minBudgetPct: 3, maxBudgetPct: 10, raisePct: 0.5 },
    { id: 'rt-3', minBudgetPct: 10, maxBudgetPct: 100, raisePct: 1.0 }
  ]
};

// Initial Franchise Managers
const INITIAL_MANAGERS = [
  { id: 'mgr-1', name: 'Alex Mercer', email: 'alex@thunderbolts.com', mobile: '+1-555-0101', password: 'pass_thunder_2026', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', cloudPublicId: 'cld_mgr_1', teamId: 'team-1', status: 'ACTIVE', createdAt: '2026-07-25' },
  { id: 'mgr-2', name: 'Sarah Jenkins', email: 'sarah@vanguard.com', mobile: '+1-555-0102', password: 'pass_vanguard_2026', imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80', cloudPublicId: 'cld_mgr_2', teamId: 'team-2', status: 'ACTIVE', createdAt: '2026-07-26' },
  { id: 'mgr-3', name: 'Marcus Vance', email: 'marcus@apex.com', mobile: '+1-555-0103', password: 'pass_apex_2026', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', cloudPublicId: 'cld_mgr_3', teamId: 'team-3', status: 'ACTIVE', createdAt: '2026-07-27' },
  { id: 'mgr-4', name: 'Elena Rostova', email: 'elena@titans.com', mobile: '+1-555-0104', password: 'pass_titans_2026', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80', cloudPublicId: 'cld_mgr_4', teamId: 'team-4', status: 'ACTIVE', createdAt: '2026-07-28' }
];

// Initial Franchises / Teams
const INITIAL_TEAMS = [
  { id: 'team-1', name: 'Thunderbolts FC', managerId: 'mgr-1', managerName: 'Alex Mercer', logo: '⚡', primaryColor: '#00e699', budget: 100000, spent: 0, roster: [], purchaseHistory: [], captainId: null, viceCaptainId: null },
  { id: 'team-2', name: 'Vanguard Lions', managerId: 'mgr-2', managerName: 'Sarah Jenkins', logo: '🦁', primaryColor: '#ffb703', budget: 100000, spent: 0, roster: [], purchaseHistory: [], captainId: null, viceCaptainId: null },
  { id: 'team-3', name: 'Apex Predators', managerId: 'mgr-3', managerName: 'Marcus Vance', logo: '🦈', primaryColor: '#00d9ff', budget: 100000, spent: 0, roster: [], purchaseHistory: [], captainId: null, viceCaptainId: null },
  { id: 'team-4', name: 'Titan Knights', managerId: 'mgr-4', managerName: 'Elena Rostova', logo: '🛡️', primaryColor: '#9d4edd', budget: 100000, spent: 0, roster: [], purchaseHistory: [], captainId: null, viceCaptainId: null }
];

// Sample Initial Registered Players
const INITIAL_PLAYERS = [
  {
    id: 'ply-1',
    name: 'Julian Sterling',
    studentId: 'ST-2024-881',
    session: '2025/2026',
    jerseyName: 'STERLING',
    primaryPosition: 'ST',
    secondaryPositions: ['RW', 'CAM'],
    imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80',
    cloudPublicId: 'cld_ply_sterling_881',
    categoryId: 'cat-plat',
    basePrice: 15000,
    status: 'APPROVED', // PENDING, APPROVED, REJECTED, UNSOLD, SOLD
    soldToTeamId: null,
    soldAmount: 0
  },
  {
    id: 'ply-2',
    name: 'Diego Ramirez',
    studentId: 'ST-2024-342',
    session: '2025/2026',
    jerseyName: 'RAMIREZ',
    primaryPosition: 'CM',
    secondaryPositions: ['CDM', 'CAM'],
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    cloudPublicId: 'cld_ply_ramirez_342',
    categoryId: 'cat-plat',
    basePrice: 15000,
    status: 'APPROVED',
    soldToTeamId: null,
    soldAmount: 0
  },
  {
    id: 'ply-3',
    name: 'Viktor Krum',
    studentId: 'ST-2024-910',
    session: '2025/2026',
    jerseyName: 'KRUM',
    primaryPosition: 'GK',
    secondaryPositions: [],
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    cloudPublicId: 'cld_ply_krum_910',
    categoryId: 'cat-gold',
    basePrice: 10000,
    status: 'APPROVED',
    soldToTeamId: null,
    soldAmount: 0
  },
  {
    id: 'ply-4',
    name: 'Tariq Al-Mansoor',
    studentId: 'ST-2024-114',
    session: '2025/2026',
    jerseyName: 'TARIQ',
    primaryPosition: 'CB',
    secondaryPositions: ['LB'],
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    cloudPublicId: 'cld_ply_tariq_114',
    categoryId: 'cat-gold',
    basePrice: 10000,
    status: 'APPROVED',
    soldToTeamId: null,
    soldAmount: 0
  },
  {
    id: 'ply-5',
    name: 'Lucas Silva',
    studentId: 'ST-2024-556',
    session: '2025/2026',
    jerseyName: 'SILVA',
    primaryPosition: 'LW',
    secondaryPositions: ['ST'],
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    cloudPublicId: 'cld_ply_silva_556',
    categoryId: 'cat-silver',
    basePrice: 6000,
    status: 'APPROVED',
    soldToTeamId: null,
    soldAmount: 0
  },
  {
    id: 'ply-6',
    name: 'Mateo Rossi',
    studentId: 'ST-2024-772',
    session: '2025/2026',
    jerseyName: 'ROSSI',
    primaryPosition: 'RB',
    secondaryPositions: ['CB', 'RM'],
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    cloudPublicId: 'cld_ply_rossi_772',
    categoryId: 'cat-silver',
    basePrice: 6000,
    status: 'APPROVED',
    soldToTeamId: null,
    soldAmount: 0
  },
  {
    id: 'ply-7',
    name: 'Chen Wei',
    studentId: 'ST-2024-209',
    session: '2025/2026',
    jerseyName: 'CHEN',
    primaryPosition: 'CDM',
    secondaryPositions: ['CM'],
    imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    cloudPublicId: 'cld_ply_chen_209',
    categoryId: 'cat-bronze',
    basePrice: 3000,
    status: 'APPROVED',
    soldToTeamId: null,
    soldAmount: 0
  },
  {
    id: 'ply-8',
    name: 'Oliver Hudson',
    studentId: 'ST-2024-411',
    session: '2025/2026',
    jerseyName: 'HUDSON',
    primaryPosition: 'LB',
    secondaryPositions: ['LM'],
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    cloudPublicId: 'cld_ply_hudson_411',
    categoryId: 'cat-bronze',
    basePrice: 3000,
    status: 'APPROVED',
    soldToTeamId: null,
    soldAmount: 0
  }
];

// Initial Tournament Fixtures
const INITIAL_FIXTURES = [
  {
    id: 'fix-1',
    homeTeamId: 'team-1',
    awayTeamId: 'team-2',
    venue: 'University Main Stadium',
    date: '2026-08-10T16:00',
    isLegged: true,
    leg: 1, // Leg 1
    pairedFixtureId: 'fix-2', // Home & Away pair
    homeScore: 2,
    awayScore: 1,
    status: 'COMPLETED',
    events: [
      { id: 'ev-1', type: 'GOAL', playerId: 'ply-1', teamId: 'team-1', minute: 23, assistPlayerId: 'ply-2' },
      { id: 'ev-2', type: 'GOAL', playerId: 'ply-5', teamId: 'team-2', minute: 41, assistPlayerId: null },
      { id: 'ev-3', type: 'GOAL', playerId: 'ply-1', teamId: 'team-1', minute: 78, assistPlayerId: 'ply-3' },
      { id: 'ev-4', type: 'YELLOW_CARD', playerId: 'ply-4', teamId: 'team-1', minute: 60 }
    ]
  },
  {
    id: 'fix-2',
    homeTeamId: 'team-2',
    awayTeamId: 'team-1',
    venue: 'Lions Sports Arena',
    date: '2026-08-17T16:00',
    isLegged: true,
    leg: 2, // Leg 2
    pairedFixtureId: 'fix-1',
    homeScore: 1,
    awayScore: 1,
    status: 'COMPLETED', // Leg 1: 2-1, Leg 2: 1-1 => Aggregate Thunderbolts 3-2 Lions
    events: [
      { id: 'ev-5', type: 'GOAL', playerId: 'ply-5', teamId: 'team-2', minute: 15, assistPlayerId: null },
      { id: 'ev-6', type: 'GOAL', playerId: 'ply-2', teamId: 'team-1', minute: 88, assistPlayerId: 'ply-1' }
    ]
  },
  {
    id: 'fix-3',
    homeTeamId: 'team-3',
    awayTeamId: 'team-4',
    venue: 'University Main Stadium',
    date: '2026-08-11T18:00',
    isLegged: false,
    leg: 1,
    pairedFixtureId: null,
    homeScore: 3,
    awayScore: 0,
    status: 'COMPLETED',
    events: [
      { id: 'ev-7', type: 'GOAL', playerId: 'ply-6', teamId: 'team-3', minute: 10 },
      { id: 'ev-8', type: 'GOAL', playerId: 'ply-7', teamId: 'team-3', minute: 45 },
      { id: 'ev-9', type: 'GOAL', playerId: 'ply-6', teamId: 'team-3', minute: 70 }
    ]
  },
  {
    id: 'fix-4',
    homeTeamId: 'team-1',
    awayTeamId: 'team-3',
    venue: 'University Main Stadium',
    date: '2026-08-20T16:00',
    isLegged: false,
    leg: 1,
    pairedFixtureId: null,
    homeScore: 0,
    awayScore: 0,
    status: 'UPCOMING',
    events: []
  }
];

// News posts
const INITIAL_NEWS = [
  {
    id: 'news-1',
    title: 'Franchise League 2026 Season Kickoff Announced!',
    content: 'The Super Admin has officially opened player registrations. All university athletes are encouraged to submit their profiles before auction phase begins.',
    date: '2026-07-30T10:00',
    author: 'Super Admin'
  },
  {
    id: 'news-2',
    title: 'Record Platinum Base Price Set at $15,000',
    content: 'Tier rules updated! Platinum base prices start at $15,000, offering intense competition for top marquee players during the live auction.',
    date: '2026-07-31T14:30',
    author: 'League Operations'
  }
];

export const SystemProvider = ({ children }) => {
  // Global System Configuration & State Machine
  const [systemState, setSystemState] = useState(() => {
    const saved = localStorage.getItem('ff_system_state');
    if (!saved) return INITIAL_SYSTEM_STATE;

    const parsed = JSON.parse(saved);

    // --- MIGRATION: Ensure 'cat-icon' always exists as the first category
    // with basePrice=0 and red color scheme, regardless of old localStorage state ---
    const ICON_CAT_DEFAULTS = { id: 'cat-icon', name: 'Icon', basePrice: 0, color: '#ef4444' };
    let cats = parsed.categories || [];
    const iconIdx = cats.findIndex(c => c.id === 'cat-icon');
    if (iconIdx === -1) {
      // Not present at all — inject it at position 0
      cats = [ICON_CAT_DEFAULTS, ...cats];
    } else {
      // Present but may have stale color or non-zero basePrice — enforce defaults
      const existing = cats[iconIdx];
      cats = [
        { ...existing, basePrice: 0, color: '#ef4444' },
        ...cats.filter((_, i) => i !== iconIdx)
      ];
    }

    return { ...parsed, categories: cats };
  });

  // Current Active User / Role
  // Roles: 'SUPER_ADMIN', 'PODIUM_ADMIN', 'TEAM_MANAGER', 'PLAYER', 'SPECTATOR'
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ff_current_user');
    return saved ? JSON.parse(saved) : {
      id: 'usr-admin',
      name: 'Super Admin',
      email: 'admin@football.com',
      role: 'SUPER_ADMIN',
      teamId: null
    };
  });

  // Teams & Rosters
  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem('ff_teams');
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });

  // Registered Players
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('ff_players');
    return saved ? JSON.parse(saved) : INITIAL_PLAYERS;
  });

  // Franchise Managers
  const [managers, setManagers] = useState(() => {
    const saved = localStorage.getItem('ff_managers');
    return saved ? JSON.parse(saved) : INITIAL_MANAGERS;
  });

  // Auction State (Live Stage)
  const [auctionState, setAuctionState] = useState(() => {
    const saved = localStorage.getItem('ff_auction_state');
    return saved ? JSON.parse(saved) : {
      activePlayerId: null,
      mode: 'NORMAL', // 'NORMAL' (incremental) or 'BLIND' (sealed bid)
      timer: 30, // seconds
      isTimerRunning: false,
      currentBid: 0,
      highBidderTeamId: null,
      blindBids: [], // [{ teamId, amount }] for sealed envelope bids
      auctionStatus: 'IDLE' // 'IDLE', 'BIDDING', 'SOLD', 'UNSOLD'
    };
  });

  // Auction Ledger (Stream of bid history)
  const [auctionLedger, setAuctionLedger] = useState(() => {
    const saved = localStorage.getItem('ff_auction_ledger');
    return saved ? JSON.parse(saved) : [];
  });

  // Fixtures & Match Management
  const [fixtures, setFixtures] = useState(() => {
    const saved = localStorage.getItem('ff_fixtures');
    return saved ? JSON.parse(saved) : INITIAL_FIXTURES;
  });

  // League News
  const [news, setNews] = useState(() => {
    const saved = localStorage.getItem('ff_news');
    return saved ? JSON.parse(saved) : INITIAL_NEWS;
  });

  // System Notifications
  const [notifications, setNotifications] = useState([]);

  // Save to LocalStorage whenever state updates
  useEffect(() => {
    localStorage.setItem('ff_system_state', JSON.stringify(systemState));
  }, [systemState]);

  useEffect(() => {
    localStorage.setItem('ff_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('ff_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('ff_managers', JSON.stringify(managers));
  }, [managers]);

  useEffect(() => {
    localStorage.setItem('ff_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('ff_auction_state', JSON.stringify(auctionState));
  }, [auctionState]);

  useEffect(() => {
    localStorage.setItem('ff_auction_ledger', JSON.stringify(auctionLedger));
  }, [auctionLedger]);

  useEffect(() => {
    localStorage.setItem('ff_fixtures', JSON.stringify(fixtures));
  }, [fixtures]);

  useEffect(() => {
    localStorage.setItem('ff_news', JSON.stringify(news));
  }, [news]);

  // Toast Notification Helper
  const addNotification = (type, title, message) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  // --- GLOBAL STATE MACHINE CONTROLLER ---
  const changePhase = (newPhase) => {
    setSystemState(prev => ({ ...prev, currentPhase: newPhase }));
    addNotification('info', 'Phase Changed', `System phase transitioned to ${newPhase}`);
  };

  // --- DYNAMIC BIDDING MATH ENGINE ---
  // Returns calculated exact minimum raise based on current bid and total budget
  const calculateMinimumRaise = (currentBidAmount) => {
    const totalBudget = systemState.totalBudget;
    const bidPct = (currentBidAmount / totalBudget) * 100;
    
    // Find matching tier
    const matchingTier = systemState.raiseTiers.find(
      t => bidPct >= t.minBudgetPct && bidPct < t.maxBudgetPct
    ) || systemState.raiseTiers[systemState.raiseTiers.length - 1];
    
    const raisePct = matchingTier ? matchingTier.raisePct : 0.5;
    const calculatedRaise = Math.max(100, Math.round((totalBudget * (raisePct / 100)) / 100) * 100);
    return calculatedRaise;
  };

  // --- BUDGET GUARDRAIL MATHEMATICAL VALIDATION ---
  // Strict backend check: Blocks any bid that prevents team from buying remaining required players at minimum base price
  const validateBudgetGuardrail = (teamId, proposedBidAmount) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return { valid: false, reason: 'Team not found' };

    const remainingBudgetAfterBid = team.budget - proposedBidAmount;
    if (remainingBudgetAfterBid < 0) {
      return { valid: false, reason: `Insufficient team budget ($${team.budget.toLocaleString()} available)` };
    }

    // Remaining spots needed to fulfill min roster after purchasing current player
    const currentRosterCount = team.roster.length;
    const minRosterLimit = systemState.minRoster;
    const remainingSpotsNeeded = minRosterLimit - (currentRosterCount + 1);

    if (remainingSpotsNeeded > 0) {
      // Find lowest base price among unsold players
      const unsoldPlayers = players.filter(p => p.status === 'APPROVED');
      const lowestBasePrice = unsoldPlayers.length > 0 
        ? Math.min(...unsoldPlayers.map(p => p.basePrice))
        : Math.min(...systemState.categories.map(c => c.basePrice));
        
      const requiredReserve = remainingSpotsNeeded * lowestBasePrice;

      if (remainingBudgetAfterBid < requiredReserve) {
        return {
          valid: false,
          reason: `Budget Guardrail Blocked: Bid of $${proposedBidAmount.toLocaleString()} leaves $${remainingBudgetAfterBid.toLocaleString()}, but team requires $${requiredReserve.toLocaleString()} reserve to acquire ${remainingSpotsNeeded} remaining players at min base price ($${lowestBasePrice.toLocaleString()}).`
        };
      }
    }

    return { valid: true };
  };

  // --- REAL-TIME AUCTION CONTROLLER ---
  const pullPlayerToPodium = (playerId) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    setAuctionState({
      activePlayerId: playerId,
      mode: 'NORMAL',
      timer: 30,
      isTimerRunning: false,
      currentBid: player.basePrice,
      highBidderTeamId: null,
      blindBids: [],
      auctionStatus: 'BIDDING'
    });

    addNotification('success', 'Podium Active', `${player.name} (${player.jerseyName}) is now on stage! Base Price: $${player.basePrice.toLocaleString()}`);
  };

  const placeBid = (teamId, bidAmount) => {
    if (systemState.currentPhase !== 'THE_AUCTION') {
      addNotification('error', 'Auction Locked', 'Bidding is strictly disabled outside Phase 3 (THE_AUCTION).');
      return false;
    }

    if (!auctionState.activePlayerId || auctionState.auctionStatus !== 'BIDDING') {
      addNotification('error', 'No Active Stage', 'No player is currently available for bidding.');
      return false;
    }

    // Check guardrails
    const guard = validateBudgetGuardrail(teamId, bidAmount);
    if (!guard.valid) {
      addNotification('error', 'Guardrail Alert', guard.reason);
      return false;
    }

    const team = teams.find(t => t.id === teamId);
    const player = players.find(p => p.id === auctionState.activePlayerId);

    if (auctionState.mode === 'NORMAL') {
      if (bidAmount <= auctionState.currentBid && auctionState.highBidderTeamId !== null) {
        addNotification('error', 'Bid Too Low', `Bid must exceed current highest bid of $${auctionState.currentBid.toLocaleString()}`);
        return false;
      }

      // Update Live Stage
      setAuctionState(prev => ({
        ...prev,
        currentBid: bidAmount,
        highBidderTeamId: teamId,
        timer: 30, // Reset timer on valid normal bid
        isTimerRunning: true
      }));

      // Record in Ledger
      const ledgerEntry = {
        id: 'led-' + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        playerId: player.id,
        playerName: player.name,
        teamId: team.id,
        teamName: team.name,
        teamLogo: team.logo,
        amount: bidAmount,
        mode: 'NORMAL'
      };
      setAuctionLedger(prev => [ledgerEntry, ...prev]);

      addNotification('info', 'New High Bid', `${team.name} bid $${bidAmount.toLocaleString()} for ${player.name}`);
      return true;
    } else {
      // BLIND MODE (Sealed Envelope)
      setAuctionState(prev => {
        const existing = prev.blindBids.filter(b => b.teamId !== teamId);
        return {
          ...prev,
          blindBids: [...existing, { teamId, teamName: team.name, amount: bidAmount }]
        };
      });

      addNotification('success', 'Sealed Envelope Received', `${team.name} submitted a sealed blind bid!`);
      return true;
    }
  };

  // Finalize Sale of Active Player
  const sellActivePlayer = () => {
    if (!auctionState.activePlayerId) return;

    const player = players.find(p => p.id === auctionState.activePlayerId);
    let winningTeamId = auctionState.highBidderTeamId;
    let winningAmount = auctionState.currentBid;

    if (auctionState.mode === 'BLIND' && auctionState.blindBids.length > 0) {
      // Sort blind bids desc
      const sorted = [...auctionState.blindBids].sort((a, b) => b.amount - a.amount);
      winningTeamId = sorted[0].teamId;
      winningAmount = sorted[0].amount;
    }

    if (!winningTeamId) {
      addNotification('warning', 'No Bids Placed', `${player.name} went unsold.`);
      setAuctionState(prev => ({ ...prev, auctionStatus: 'UNSOLD', activePlayerId: null, isTimerRunning: false }));
      return;
    }

    const winningTeam = teams.find(t => t.id === winningTeamId);

    // Update Player Record
    setPlayers(prev => prev.map(p => p.id === player.id ? {
      ...p,
      status: 'SOLD',
      soldToTeamId: winningTeamId,
      soldAmount: winningAmount
    } : p));

    // Update Team Roster & Budget
    setTeams(prev => prev.map(t => t.id === winningTeamId ? {
      ...t,
      spent: t.spent + winningAmount,
      budget: t.budget - winningAmount,
      roster: [...t.roster, player.id]
    } : t));

    setAuctionState({
      activePlayerId: null,
      mode: 'NORMAL',
      timer: 30,
      isTimerRunning: false,
      currentBid: 0,
      highBidderTeamId: null,
      blindBids: [],
      auctionStatus: 'SOLD'
    });

    addNotification('success', '🔨 SOLD!', `${player.name} SOLD to ${winningTeam.name} for $${winningAmount.toLocaleString()}!`);
  };

  const passActivePlayer = () => {
    if (!auctionState.activePlayerId) return;
    const player = players.find(p => p.id === auctionState.activePlayerId);

    setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, status: 'UNSOLD' } : p));

    setAuctionState({
      activePlayerId: null,
      mode: 'NORMAL',
      timer: 30,
      isTimerRunning: false,
      currentBid: 0,
      highBidderTeamId: null,
      blindBids: [],
      auctionStatus: 'UNSOLD'
    });

    addNotification('info', 'Player Passed', `${player.name} marked as Unsold.`);
  };

  // --- AUTOMATED POINTS TABLE CALCULATION ENGINE ---
  // Calculates live standings based on match scores (Single and 2-Legged aggregate)
  const calculatePointsTable = () => {
    const tableMap = {};
    teams.forEach(t => {
      tableMap[t.id] = {
        teamId: t.id,
        teamName: t.name,
        teamLogo: t.logo,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0
      };
    });

    const processedPairs = new Set();

    fixtures.forEach(fix => {
      if (fix.status !== 'COMPLETED') return;

      if (fix.isLegged && fix.pairedFixtureId) {
        if (processedPairs.has(fix.pairedFixtureId)) return;

        const pairedFix = fixtures.find(f => f.id === fix.pairedFixtureId);
        if (!pairedFix || pairedFix.status !== 'COMPLETED') return;

        processedPairs.add(fix.id);

        const home = tableMap[fix.homeTeamId];
        const away = tableMap[fix.awayTeamId];

        if (home && away) {
          home.played += 1;
          away.played += 1;

          let aggHome, aggAway;
          if (fix.leg === 1) {
            aggHome = fix.homeScore + pairedFix.awayScore;
            aggAway = fix.awayScore + pairedFix.homeScore;
          } else {
            aggHome = pairedFix.homeScore + fix.awayScore;
            aggAway = pairedFix.awayScore + fix.homeScore;
          }

          home.gf += aggHome;
          home.ga += aggAway;
          away.gf += aggAway;
          away.ga += aggHome;

          if (aggHome > aggAway) {
            home.won += 1;
            home.points += 3;
            away.lost += 1;
          } else if (aggHome < aggAway) {
            away.won += 1;
            away.points += 3;
            home.lost += 1;
          } else {
            home.drawn += 1;
            home.points += 1;
            away.drawn += 1;
            away.points += 1;
          }
        }
      } else if (!fix.isLegged) {
        const home = tableMap[fix.homeTeamId];
        const away = tableMap[fix.awayTeamId];

        if (home && away) {
          home.played += 1;
          away.played += 1;
          home.gf += fix.homeScore;
          home.ga += fix.awayScore;
          away.gf += fix.awayScore;
          away.ga += fix.homeScore;

          if (fix.homeScore > fix.awayScore) {
            home.won += 1;
            home.points += 3;
            away.lost += 1;
          } else if (fix.homeScore < fix.awayScore) {
            away.won += 1;
            away.points += 3;
            home.lost += 1;
          } else {
            home.drawn += 1;
            home.points += 1;
            away.drawn += 1;
            away.points += 1;
          }
        }
      }
    });

    Object.values(tableMap).forEach(row => {
      row.gd = row.gf - row.ga;
    });

    return Object.values(tableMap).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return b.won - a.won;
    });
  };

  // --- PLAYER STATISTICS AGGREGATION ENGINE ---
  const calculatePlayerLeaderboards = () => {
    const statsMap = {};
    players.forEach(p => {
      statsMap[p.id] = {
        player: p,
        team: teams.find(t => t.id === p.soldToTeamId),
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        cleanSheets: 0
      };
    });

    fixtures.forEach(fix => {
      if (fix.status === 'COMPLETED' && fix.events) {
        fix.events.forEach(ev => {
          if (ev.playerId && statsMap[ev.playerId]) {
            if (ev.type === 'GOAL') statsMap[ev.playerId].goals += 1;
            if (ev.type === 'YELLOW_CARD') statsMap[ev.playerId].yellowCards += 1;
            if (ev.type === 'RED_CARD') statsMap[ev.playerId].redCards += 1;
          }
          if (ev.assistPlayerId && statsMap[ev.assistPlayerId]) {
            statsMap[ev.assistPlayerId].assists += 1;
          }
        });

        // Clean sheets for GKs if team conceded 0
        if (fix.homeScore === 0) {
          const awayTeamPlayers = players.filter(p => p.soldToTeamId === fix.awayTeamId && p.primaryPosition === 'GK');
          awayTeamPlayers.forEach(gk => { if (statsMap[gk.id]) statsMap[gk.id].cleanSheets += 1; });
        }
        if (fix.awayScore === 0) {
          const homeTeamPlayers = players.filter(p => p.soldToTeamId === fix.homeTeamId && p.primaryPosition === 'GK');
          homeTeamPlayers.forEach(gk => { if (statsMap[gk.id]) statsMap[gk.id].cleanSheets += 1; });
        }
      }
    });

    return Object.values(statsMap);
  };

  // --- MODULE 4: THE "LIFECYCLE RESET" (NUKE PROTOCOLS) ---
  const executeNukeProtocol = (level) => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      addNotification('error', 'Unauthorized', 'Only Super Admin can execute Nuke Protocols.');
      return;
    }

    if (level === 1) {
      // LEVEL 1: TOURNAMENT WIPE
      // Deletes matches, scores, points tables, stats, news. Reverts to exact moment auction ended.
      setFixtures([]);
      setNews([]);
      setSystemState(prev => ({ ...prev, currentPhase: 'THE_AUCTION' }));
      addNotification('warning', '💥 Level 1 Nuke Executed', 'Tournament fixtures, scores, and news wiped. Reverted to Post-Auction state.');
    } else if (level === 2) {
      // LEVEL 2: ROSTER WIPE
      // Deletes players, teams, managers, auction ledgers, and player image assets from Cloud storage.
      // Retains rules (Sessions, positions, categories, raise tiers). Reverts to Phase 1 (SETUP).
      
      // Simulate Cloud Storage Asset Cleanup for player cloud public IDs
      const destroyedCloudAssets = players.map(p => p.cloudPublicId).filter(Boolean);
      console.log('CLOUDINARY / CLOUD STORAGE CLEANUP: Destroyed assets:', destroyedCloudAssets);

      setPlayers([]);
      setAuctionLedger([]);
      setFixtures([]);
      setNews([]);
      setAuctionState({
        activePlayerId: null,
        mode: 'NORMAL',
        timer: 30,
        isTimerRunning: false,
        currentBid: 0,
        highBidderTeamId: null,
        blindBids: [],
        auctionStatus: 'IDLE'
      });
      // Reset team budgets & rosters
      setTeams(prev => prev.map(t => ({ ...t, spent: 0, budget: systemState.totalBudget, roster: [] })));
      setSystemState(prev => ({ ...prev, currentPhase: 'SETUP' }));
      
      addNotification('warning', '💥 Level 2 Nuke Executed', `Rosters, players, ledgers, and ${destroyedCloudAssets.length} Cloud Storage images destroyed! Reverted to Phase 1 (SETUP).`);
    } else if (level === 3) {
      // LEVEL 3: FACTORY RESET
      // Drops all custom state, wipes media folders/cloud images except Super Admin credentials.
      localStorage.clear();
      setSystemState(INITIAL_SYSTEM_STATE);
      setTeams(INITIAL_TEAMS);
      setPlayers(INITIAL_PLAYERS);
      setFixtures(INITIAL_FIXTURES);
      setNews(INITIAL_NEWS);
      setAuctionLedger([]);
      setAuctionState({
        activePlayerId: null,
        mode: 'NORMAL',
        timer: 30,
        isTimerRunning: false,
        currentBid: 0,
        highBidderTeamId: null,
        blindBids: [],
        auctionStatus: 'IDLE'
      });
      setCurrentUser({
        id: 'usr-admin',
        name: 'Super Admin',
        email: 'admin@football.com',
        role: 'SUPER_ADMIN',
        teamId: null
      });

      setManagers(INITIAL_MANAGERS);
      addNotification('danger', '☢️ Level 3 FACTORY RESET Executed', 'System completely reset to factory initial state. All database tables and media storage purged.');
    }
  };

  // Manager CRUD Helper Actions
  const addManager = (managerData) => {
    const newMgr = {
      id: 'mgr-' + Date.now(),
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
      ...managerData
    };
    setManagers(prev => [newMgr, ...prev]);
    if (managerData.teamId) {
      setTeams(prev => prev.map(t => t.id === managerData.teamId ? { ...t, managerId: newMgr.id, managerName: newMgr.name } : t));
    }
    addNotification('success', 'Manager Added', `Manager ${newMgr.name} created.`);
    return newMgr;
  };

  const updateManager = (managerId, updatedData) => {
    setManagers(prev => prev.map(m => m.id === managerId ? { ...m, ...updatedData } : m));
    if (updatedData.teamId) {
      setTeams(prev => prev.map(t => t.id === updatedData.teamId ? { ...t, managerId, managerName: updatedData.name || t.managerName } : t));
    }
    addNotification('success', 'Manager Updated', 'Manager details saved.');
  };

  const deleteManager = (managerId) => {
    const mgr = managers.find(m => m.id === managerId);
    if (mgr) {
      setManagers(prev => prev.filter(m => m.id !== managerId));
      setTeams(prev => prev.map(t => t.managerId === managerId ? { ...t, managerId: null, managerName: 'Unassigned' } : t));
      addNotification('danger', 'Manager Deleted', `Manager ${mgr.name} account has been permanently removed.`);
    }
  };

  const toggleBanManager = (managerId) => {
    setManagers(prev => prev.map(m => {
      if (m.id === managerId) {
        const nextStatus = m.status === 'BANNED' ? 'ACTIVE' : 'BANNED';
        addNotification('warning', 'Manager Status Changed', `${m.name} is now ${nextStatus}. Bidding token ${nextStatus === 'BANNED' ? 'LOCKED' : 'ACTIVE'}.`);
        return { ...m, status: nextStatus };
      }
      return m;
    }));
  };

  const resetManagerPassword = (managerId) => {
    const newPass = 'pass_' + Math.random().toString(36).substring(2, 8);
    setManagers(prev => prev.map(m => m.id === managerId ? { ...m, password: newPass } : m));
    const mgr = managers.find(m => m.id === managerId);
    addNotification('success', 'Password Reset', `New credentials for ${mgr?.name || 'Manager'}: ${newPass}`);
    return newPass;
  };

  // Player Actions
  const toggleBanPlayer = (playerId) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        const nextStatus = p.status === 'BANNED' ? 'APPROVED' : 'BANNED';
        addNotification('warning', 'Player Status Updated', `${p.name} status changed to ${nextStatus}. Excluded from auction unsold pool.`);
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  const deletePlayer = (playerId) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      console.log('Cloud API Hook: Destroying asset:', player.cloudPublicId);
      setPlayers(prev => prev.filter(p => p.id !== playerId));
      addNotification('danger', 'Player Deleted', `${player.name} record has been permanently removed & Cloudinary asset wiped.`);
    }
  };

  const bulkImportPlayers = (importedList) => {
    const defaultCat = systemState.categories[0] || { id: 'cat-plat', basePrice: 15000 };
    const formatted = importedList.map((item, idx) => ({
      id: 'ply-' + (Date.now() + idx),
      name: item.name || `Imported Player ${idx + 1}`,
      studentId: item.studentId || `ST-2025-${100 + idx}`,
      session: item.session || systemState.academicSessions[0] || '2025/2026',
      jerseyName: (item.jerseyName || item.name || 'PLAYER').toUpperCase(),
      primaryPosition: item.primaryPosition || 'CM',
      secondaryPositions: item.secondaryPositions || [],
      imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      cloudPublicId: 'cld_imp_' + Date.now() + '_' + idx,
      categoryId: item.categoryId || defaultCat.id,
      basePrice: defaultCat.basePrice,
      status: 'APPROVED',
      soldToTeamId: null,
      soldAmount: 0
    }));
    setPlayers(prev => [...formatted, ...prev]);
    addNotification('success', 'Bulk Import Complete', `Successfully imported ${formatted.length} players into the registry.`);
  };

  return (
    <SystemContext.Provider value={{
      systemState,
      setSystemState,
      currentUser,
      setCurrentUser,
      teams,
      setTeams,
      managers,
      setManagers,
      addManager,
      updateManager,
      deleteManager,
      toggleBanManager,
      resetManagerPassword,
      players,
      setPlayers,
      toggleBanPlayer,
      deletePlayer,
      bulkImportPlayers,
      auctionState,
      setAuctionState,
      auctionLedger,
      fixtures,
      setFixtures,
      news,
      setNews,
      notifications,
      addNotification,
      changePhase,
      calculateMinimumRaise,
      validateBudgetGuardrail,
      pullPlayerToPodium,
      placeBid,
      sellActivePlayer,
      passActivePlayer,
      calculatePointsTable,
      calculatePlayerLeaderboards,
      executeNukeProtocol
    }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => useContext(SystemContext);
