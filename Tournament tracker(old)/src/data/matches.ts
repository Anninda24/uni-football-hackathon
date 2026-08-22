export type MatchStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED';

/** A single match event (goal / yellow / red / assist).
 *  - Assist may be attached to a goal (assistPlayerId) or stored standalone (assists arrays).
 *  - isPenalty marks a penalty-kick goal scored DURING the match (counts toward the score).
 */
export interface MatchEvent {
  playerId: string;
  minute: number;
  assistPlayerId?: string;
  /** Assist minute (defaults to the goal's minute when not set). */
  assistMinute?: number;
  /** True = penalty-kick goal during normal match time → shown as "(P)". */
  isPenalty?: boolean;
}

export interface TeamStats {
  fouls: number;
  corners: number;
  tackles: number;
}

export interface Match {
  id: string;
  homeId: string;
  awayId: string;
  date: string;     // YYYY-MM-DD
  time: string;     // HH:MM
  venue: string;
  status: MatchStatus;
  homeScore: number;
  awayScore: number;
  minute?: number;  // for LIVE
  // Two-legged support
  fixtureGroupId?: string;
  leg?: 1 | 2;
  /** seconds of aggregate for sorting reference only */
  finishedAt?: string;
  // Match events (single source of truth for scores + player stats)
  homeScorers?: MatchEvent[];
  awayScorers?: MatchEvent[];
  homeYellows?: MatchEvent[];
  awayYellows?: MatchEvent[];
  homeRedCards?: MatchEvent[];
  awayRedCards?: MatchEvent[];
  homeStats?: TeamStats;
  awayStats?: TeamStats;
  mvpId?: string;
  // Team Info — ordered player IDs per team for this specific match.
  // First 11 = Starting XI, the rest = Substitutes / Extra players.
  homeLineup?: string[];
  awayLineup?: string[];
  // Penalty shootout (AFTER the match — separate from the normal score).
  penaltyHome?: number;
  penaltyAway?: number;
  // Standalone assist events (not attached to a specific goal).
  homeAssists?: MatchEvent[];
  awayAssists?: MatchEvent[];
}

export const INITIAL_MATCHES: Match[] = [
  // ---- Two-legged Pair A: ENG vs BIZ ----
  // Leg 1: ENG 2-1 BIZ
  {
    id: 'm1', homeId: 't1', awayId: 't2', date: '2026-03-15', time: '15:00', venue: 'Main Stadium',
    status: 'COMPLETED', homeScore: 2, awayScore: 1, finishedAt: '2026-03-15T17:00:00Z', fixtureGroupId: 'g1', leg: 1,
    homeScorers: [{ playerId: 'p1', minute: 23, assistPlayerId: 'p5' }, { playerId: 'p3', minute: 78, assistPlayerId: 'p1' }],
    awayScorers: [{ playerId: 'p6', minute: 55, assistPlayerId: 'p8' }],
    homeYellows: [{ playerId: 'p2', minute: 40 }],
    awayYellows: [{ playerId: 'p7', minute: 61 }],
    homeRedCards: [], awayRedCards: [{ playerId: 'p7', minute: 88 }],
    homeStats: { fouls: 12, corners: 6, tackles: 18 },
    awayStats: { fouls: 15, corners: 4, tackles: 22 },
    mvpId: 'p1',
  },
  // Leg 2: BIZ 0-1 ENG
  {
    id: 'm2', homeId: 't2', awayId: 't1', date: '2026-03-22', time: '15:00', venue: 'Arena B',
    status: 'COMPLETED', homeScore: 0, awayScore: 1, finishedAt: '2026-03-22T17:00:00Z', fixtureGroupId: 'g1', leg: 2,
    homeScorers: [], awayScorers: [{ playerId: 'p5', minute: 64, assistPlayerId: 'p1' }],
    homeYellows: [{ playerId: 'p9', minute: 30 }], awayYellows: [],
    homeRedCards: [], awayRedCards: [],
    homeStats: { fouls: 10, corners: 3, tackles: 16 },
    awayStats: { fouls: 8, corners: 7, tackles: 19 },
    mvpId: 'p5',
  },

  // ---- Two-legged Pair B: CSE vs LAW ----
  // Leg 1: CSE 3-1 LAW
  {
    id: 'm3', homeId: 't4', awayId: 't3', date: '2026-03-16', time: '17:00', venue: 'Tech Pitch',
    status: 'COMPLETED', homeScore: 3, awayScore: 1, finishedAt: '2026-03-16T19:00:00Z', fixtureGroupId: 'g2', leg: 1,
    homeScorers: [{ playerId: 'p15', minute: 12, assistPlayerId: 'p16' }, { playerId: 'p16', minute: 44 }, { playerId: 'p16', minute: 67, assistPlayerId: 'p15' }],
    awayScorers: [{ playerId: 'p14', minute: 81 }],
    homeYellows: [{ playerId: 'p18', minute: 55 }],
    awayYellows: [{ playerId: 'p13', minute: 70 }],
    homeRedCards: [], awayRedCards: [],
    homeStats: { fouls: 9, corners: 8, tackles: 21 },
    awayStats: { fouls: 13, corners: 3, tackles: 14 },
    mvpId: 'p16',
  },
  // Leg 2: LAW 1-2 CSE
  {
    id: 'm4', homeId: 't3', awayId: 't4', date: '2026-03-23', time: '17:00', venue: 'Court Yard',
    status: 'COMPLETED', homeScore: 1, awayScore: 2, finishedAt: '2026-03-23T19:00:00Z', fixtureGroupId: 'g2', leg: 2,
    homeScorers: [{ playerId: 'p11', minute: 58, assistPlayerId: 'p14' }],
    awayScorers: [{ playerId: 'p15', minute: 33, assistPlayerId: 'p16' }, { playerId: 'p15', minute: 90 }],
    homeYellows: [{ playerId: 'p12', minute: 25 }],
    awayYellows: [{ playerId: 'p17', minute: 44 }],
    homeRedCards: [], awayRedCards: [{ playerId: 'p17', minute: 70 }],
    homeStats: { fouls: 14, corners: 5, tackles: 15 },
    awayStats: { fouls: 11, corners: 8, tackles: 20 },
    mvpId: 'p15',
  },

  // ---- High-scoring single: ENG 5-1 MED ----
  {
    id: 'm5', homeId: 't1', awayId: 't5', date: '2026-03-18', time: '15:00', venue: 'Stadium East',
    status: 'COMPLETED', homeScore: 5, awayScore: 1, finishedAt: '2026-03-18T17:00:00Z',
    homeScorers: [
      { playerId: 'p1', minute: 9, assistPlayerId: 'p5' }, { playerId: 'p1', minute: 42 },
      { playerId: 'p3', minute: 51, assistPlayerId: 'p1' }, { playerId: 'p5', minute: 66, assistPlayerId: 'p3' },
      { playerId: 'p2', minute: 88 },
    ],
    awayScorers: [{ playerId: 'p21', minute: 74, assistPlayerId: 'p19' }],
    homeYellows: [{ playerId: 'p4', minute: 33 }],
    awayYellows: [{ playerId: 'p19', minute: 50 }],
    homeRedCards: [], awayRedCards: [],
    homeStats: { fouls: 9, corners: 9, tackles: 20 },
    awayStats: { fouls: 13, corners: 2, tackles: 14 },
    mvpId: 'p1',
  },

  // ---- Draw: LAW 2-2 ART — decided on penalties (4-3) ----
  {
    id: 'm6', homeId: 't3', awayId: 't6', date: '2026-03-19', time: '15:00', venue: 'Studio Park',
    status: 'COMPLETED', homeScore: 2, awayScore: 2, finishedAt: '2026-03-19T17:00:00Z',
    homeScorers: [{ playerId: 'p11', minute: 20, assistPlayerId: 'p12' }, { playerId: 'p14', minute: 77, isPenalty: true }],
    awayScorers: [{ playerId: 'p22', minute: 15 }, { playerId: 'p24', minute: 90, assistPlayerId: 'p23' }],
    homeYellows: [{ playerId: 'p13', minute: 60 }],
    awayYellows: [{ playerId: 'p23', minute: 35 }],
    homeRedCards: [], awayRedCards: [],
    homeStats: { fouls: 11, corners: 6, tackles: 17 },
    awayStats: { fouls: 9, corners: 4, tackles: 15 },
    penaltyHome: 4, penaltyAway: 3,
    mvpId: 'p11',
  },

  // ---- Singles completed ----
  // SCI 0-2 ARC
  {
    id: 'm7', homeId: 't7', awayId: 't8', date: '2026-03-20', time: '15:00', venue: 'Plaza Field',
    status: 'COMPLETED', homeScore: 0, awayScore: 2, finishedAt: '2026-03-20T17:00:00Z',
    homeScorers: [], awayScorers: [{ playerId: 'p30', minute: 34, assistPlayerId: 'p29' }, { playerId: 'p28', minute: 89 }],
    homeYellows: [{ playerId: 'p25', minute: 40 }],
    awayYellows: [{ playerId: 'p28', minute: 55 }],
    homeRedCards: [{ playerId: 'p26', minute: 62 }], awayRedCards: [],
    homeStats: { fouls: 16, corners: 3, tackles: 18 },
    awayStats: { fouls: 10, corners: 5, tackles: 16 },
    mvpId: 'p30',
  },
  // CSE 4-0 ART
  {
    id: 'm8', homeId: 't4', awayId: 't6', date: '2026-03-20', time: '17:00', venue: 'Studio Park',
    status: 'COMPLETED', homeScore: 4, awayScore: 0, finishedAt: '2026-03-20T19:00:00Z',
    homeScorers: [
      { playerId: 'p15', minute: 7, assistPlayerId: 'p16' }, { playerId: 'p16', minute: 30, assistPlayerId: 'p15' },
      { playerId: 'p15', minute: 55 }, { playerId: 'p18', minute: 90 },
    ],
    awayScorers: [],
    homeYellows: [{ playerId: 'p17', minute: 42 }],
    awayYellows: [{ playerId: 'p22', minute: 67 }],
    homeRedCards: [], awayRedCards: [],
    homeStats: { fouls: 7, corners: 10, tackles: 21 },
    awayStats: { fouls: 12, corners: 1, tackles: 11 },
    mvpId: 'p15',
  },
  // BIZ 2-0 MED
  {
    id: 'm9', homeId: 't2', awayId: 't5', date: '2026-03-21', time: '15:00', venue: 'Stadium East',
    status: 'COMPLETED', homeScore: 2, awayScore: 0, finishedAt: '2026-03-21T17:00:00Z',
    homeScorers: [{ playerId: 'p6', minute: 18, assistPlayerId: 'p8' }, { playerId: 'p8', minute: 72, assistPlayerId: 'p9' }],
    awayScorers: [],
    homeYellows: [{ playerId: 'p7', minute: 48 }],
    awayYellows: [{ playerId: 'p20', minute: 39 }],
    homeRedCards: [], awayRedCards: [],
    homeStats: { fouls: 8, corners: 5, tackles: 16 },
    awayStats: { fouls: 10, corners: 3, tackles: 13 },
    mvpId: 'p6',
  },
  // ENG 3-1 SCI
  {
    id: 'm10', homeId: 't1', awayId: 't7', date: '2026-03-21', time: '17:00', venue: 'Lab Turf',
    status: 'COMPLETED', homeScore: 3, awayScore: 1, finishedAt: '2026-03-21T19:00:00Z',
    homeScorers: [
      { playerId: 'p1', minute: 25, assistPlayerId: 'p5' }, { playerId: 'p3', minute: 60, assistPlayerId: 'p1' },
      { playerId: 'p5', minute: 85 },
    ],
    awayScorers: [{ playerId: 'p25', minute: 40, assistPlayerId: 'p26' }],
    homeYellows: [{ playerId: 'p2', minute: 70 }],
    awayYellows: [{ playerId: 'p26', minute: 58 }],
    homeRedCards: [], awayRedCards: [],
    homeStats: { fouls: 10, corners: 7, tackles: 19 },
    awayStats: { fouls: 13, corners: 4, tackles: 17 },
    mvpId: 'p3',
  },

  // ---- LIVE matches ----
  // BIZ 1-1 LAW (67')
  {
    id: 'm11', homeId: 't2', awayId: 't3', date: '2026-03-28', time: '15:00', venue: 'Main Stadium',
    status: 'LIVE', homeScore: 1, awayScore: 1, minute: 67,
    homeScorers: [{ playerId: 'p6', minute: 34 }],
    awayScorers: [{ playerId: 'p11', minute: 52, assistPlayerId: 'p14' }],
    homeYellows: [{ playerId: 'p9', minute: 60 }],
    awayYellows: [], homeRedCards: [], awayRedCards: [],
    homeStats: { fouls: 6, corners: 3, tackles: 10 },
    awayStats: { fouls: 7, corners: 2, tackles: 11 },
  },
  // MED 0-0 ARC (23')
  {
    id: 'm12', homeId: 't5', awayId: 't8', date: '2026-03-28', time: '17:00', venue: 'Plaza Field',
    status: 'LIVE', homeScore: 0, awayScore: 0, minute: 23,
    homeScorers: [], awayScorers: [],
    homeYellows: [], awayYellows: [], homeRedCards: [], awayRedCards: [],
    homeStats: { fouls: 3, corners: 1, tackles: 6 },
    awayStats: { fouls: 2, corners: 0, tackles: 5 },
  },

  // ---- UPCOMING ----
  { id: 'm13', homeId: 't1', awayId: 't4', date: '2026-04-02', time: '15:00', venue: 'Tech Pitch',  status: 'UPCOMING', homeScore: 0, awayScore: 0 },
  { id: 'm14', homeId: 't6', awayId: 't7', date: '2026-04-02', time: '17:00', venue: 'Lab Turf',     status: 'UPCOMING', homeScore: 0, awayScore: 0 },
  { id: 'm15', homeId: 't3', awayId: 't5', date: '2026-04-05', time: '15:00', venue: 'Stadium East', status: 'UPCOMING', homeScore: 0, awayScore: 0 },
  { id: 'm16', homeId: 't8', awayId: 't1', date: '2026-04-05', time: '17:00', venue: 'North Field',  status: 'UPCOMING', homeScore: 0, awayScore: 0 },
];
