import { create } from 'zustand';
import { INITIAL_MATCHES, Match, MatchStatus } from './data/matches';
import { TEAMS, Team } from './data/teams';
import { ALL_PLAYERS, PlayerStat } from './data/players';

export type ViewMode = 'ADMIN' | 'SPECTATOR';

export interface MatchStanding {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface Toast { id: string; type: 'success' | 'error' | 'info'; message: string; }

interface Store {
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;

  matches: Match[];
  teams: Team[];
  players: PlayerStat[];
  /** per-fixture two-legged toggle (admin can flip before generating) */
  useTwoLegged: boolean;
  setUseTwoLegged: (v: boolean) => void;

  // CRUD
  addMatch: (m: Omit<Match, 'id'>) => string;
  generateFixture: (homeId: string, awayId: string, date: string, time: string, venue: string, twoLegged: boolean) => void;
  updateMatch: (id: string, patch: Partial<Match>) => void;
  deleteMatch: (id: string) => void;
  updateScore: (id: string, homeScore: number, awayScore: number) => void;
  setStatus: (id: string, status: MatchStatus) => void;

  /** toasts */
  toasts: Toast[];
  addToast: (t: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

/** Default lineup = full team roster (player IDs, reused — no duplicate data).
 *  First 11 = Starting XI, remainder = substitutes. Admin can edit per match. */
const defaultLineup = (teamId: string) => ALL_PLAYERS.filter(p => p.teamId === teamId).map(p => p.id);

export const useStore = create<Store>((set, get) => ({
  viewMode: 'ADMIN',
  setViewMode: (v) => set({ viewMode: v }),
  useTwoLegged: false,
  setUseTwoLegged: (v) => set({ useTwoLegged: v }),

  matches: INITIAL_MATCHES.map(m => ({
    ...m,
    homeLineup: m.homeLineup ?? defaultLineup(m.homeId),
    awayLineup: m.awayLineup ?? defaultLineup(m.awayId),
  })),
  teams: TEAMS,
  players: ALL_PLAYERS,
  toasts: [],
  addToast: (t) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => get().removeToast(id), 3500);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  addMatch: (m) => {
    const id = `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((s) => ({ matches: [...s.matches, { ...m, id }] }));
    return id;
  },

  generateFixture: (homeId, awayId, date, time, venue, twoLegged) => {
    if (homeId === awayId) {
      get().addToast({ type: 'error', message: 'Home and Away teams must differ.' });
      return;
    }
    const state = get();
    // next day helper
    const shiftDate = (d: string, days: number) => {
      const dt = new Date(d);
      dt.setDate(dt.getDate() + days);
      return dt.toISOString().slice(0, 10);
    };

    if (!twoLegged) {
      const newMatch: Omit<Match, 'id'> = {
        homeId, awayId, date, time, venue,
        status: 'UPCOMING', homeScore: 0, awayScore: 0,
        homeLineup: defaultLineup(homeId),
        awayLineup: defaultLineup(awayId),
      };
      state.addMatch(newMatch);
      get().addToast({ type: 'success', message: 'Fixture created.' });
    } else {
      const groupId = `g-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newMatches: Omit<Match, 'id'>[] = [
        { homeId, awayId, date, time, venue, status: 'UPCOMING', homeScore: 0, awayScore: 0, fixtureGroupId: groupId, leg: 1, homeLineup: defaultLineup(homeId), awayLineup: defaultLineup(awayId) },
        { homeId: awayId, awayId: homeId, date: shiftDate(date, 7), time, venue, status: 'UPCOMING', homeScore: 0, awayScore: 0, fixtureGroupId: groupId, leg: 2, homeLineup: defaultLineup(awayId), awayLineup: defaultLineup(homeId) },
      ];
      set((s) => ({
        matches: [
          ...s.matches,
          ...newMatches.map((m) => ({ ...m, id: `m-${Math.random().toString(36).slice(2, 8)}` })),
        ],
      }));
      get().addToast({ type: 'success', message: 'Two-legged fixture created (Leg 1 + Leg 2).' });
    }
  },

  updateMatch: (id, patch) => set((s) => ({ matches: s.matches.map(m => m.id === id ? { ...m, ...patch } : m) })),
  deleteMatch: (id) => {
    const m = get().matches.find(x => x.id === id);
    set((s) => ({ matches: s.matches.filter(x => x.id !== id) }));
    if (m) get().addToast({ type: 'info', message: 'Fixture removed.' });
  },
  updateScore: (id, homeScore, awayScore) => {
    set((s) => ({ matches: s.matches.map(m => m.id === id ? { ...m, homeScore, awayScore } : m) }));
  },
  setStatus: (id, status) => {
    set((s) => ({ matches: s.matches.map(m => m.id === id ? { ...m, status } : m) }));
    get().addToast({ type: 'info', message: `Match marked ${status.toLowerCase()}.` });
  },
}));

// ─── DERIVED HELPERS (pure functions; can later be replaced with API responses) ───

/**
 * Group COMPLETED matches into logical results. Two-legged pairs collapse into
 * ONE aggregate result. Single matches stay as one result.
 */
export interface AggregatedResult {
  id: string;        // groupId or match id
  isLegged: boolean;
  legs: Match[];     // always >= 1
  /** Team ids (always home vs away from leg 1 perspective) */
  homeId: string;
  awayId: string;
  homeGoals: number; // aggregate
  awayGoals: number;
  homeGoalsHome: number; // goals scored at home venue for each side
  awayGoalsHome: number;
  /** Optional: 0/1/2 for leg 1 if applicable */
}

export function aggregateMatches(matches: Match[]): AggregatedResult[] {
  const grouped: Record<string, Match[]> = {};
  const singles: Match[] = [];
  for (const m of matches) {
    if (m.status !== 'COMPLETED') continue;
    if (m.fixtureGroupId) {
      grouped[m.fixtureGroupId] = grouped[m.fixtureGroupId] || [];
      grouped[m.fixtureGroupId].push(m);
    } else {
      singles.push(m);
    }
  }
  const out: AggregatedResult[] = [];
  // legged
  Object.entries(grouped).forEach(([gid, legs]) => {
    legs.sort((a, b) => (a.leg || 0) - (b.leg || 0));
    const leg1 = legs[0];
    const homeId = leg1.homeId;
    const awayId = leg1.awayId;
    const homeGoals = legs.reduce((s, l) => s + (l.homeId === homeId ? l.homeScore : l.awayScore), 0);
    const awayGoals = legs.reduce((s, l) => s + (l.awayId === awayId ? l.awayScore : l.homeScore), 0);
    const homeGoalsHome = legs.filter(l => l.homeId === homeId).reduce((s, l) => s + l.homeScore, 0);
    const awayGoalsHome = legs.filter(l => l.homeId === awayId).reduce((s, l) => s + l.homeScore, 0);
    out.push({ id: gid, isLegged: true, legs, homeId, awayId, homeGoals, awayGoals, homeGoalsHome, awayGoalsHome });
  });
  // singles
  for (const m of singles) {
    out.push({
      id: m.id, isLegged: false, legs: [m],
      homeId: m.homeId, awayId: m.awayId,
      homeGoals: m.homeScore, awayGoals: m.awayScore,
      homeGoalsHome: m.homeScore, awayGoalsHome: m.awayScore,
    });
  }
  return out;
}

/**
 * Compute standings from matches. Assumes COMPLETED matches only.
 * For two-legged: aggregate is applied ONCE (so the pair counts as a single result).
 */
export function computeStandings(matches: Match[], teams = TEAMS): MatchStanding[] {
  const results = aggregateMatches(matches);
  const map: Record<string, MatchStanding> = {};
  for (const t of teams) {
    map[t.id] = { teamId: t.id, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 };
  }
  for (const r of results) {
    const home = map[r.homeId];
    const away = map[r.awayId];
    if (!home || !away) continue;
    home.played += 1;
    away.played += 1;
    home.goalsFor += r.homeGoals;
    home.goalsAgainst += r.awayGoals;
    away.goalsFor += r.awayGoals;
    away.goalsAgainst += r.homeGoals;
    if (r.homeGoals > r.awayGoals) {
      home.won += 1; away.lost += 1; home.points += 3;
    } else if (r.homeGoals < r.awayGoals) {
      away.won += 1; home.lost += 1; away.points += 3;
    } else {
      home.drawn += 1; away.drawn += 1; home.points += 1; away.points += 1;
    }
  }
  for (const id in map) {
    map[id].goalDifference = map[id].goalsFor - map[id].goalsAgainst;
  }
  return Object.values(map).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
}

// Re-exports
export { TEAMS, ALL_PLAYERS };
export type { Team, PlayerStat, Match, MatchStatus };
