import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowUpDown, Trophy, Target, Shield, X, Calendar, Crown } from 'lucide-react';
import { useStore } from '../store';
import { getTeam } from '../data/teams';
import { getPlayer, PlayerStat } from '../data/players';
import { Match } from '../data/matches';
import { TeamLogo } from '../components/TeamLogo';
import { cn } from '../utils/cn';

type SortKey = 'goals' | 'assists' | 'cleanSheets' | 'yellow' | 'red';
type SortDir = 'asc' | 'desc';

const COLS: { key: SortKey; label: string; icon: typeof Target; color: string }[] = [
  { key: 'goals', label: 'Goals', icon: Target, color: '#CCFF00' },
  { key: 'assists', label: 'Assists', icon: Trophy, color: '#00E5FF' },
  { key: 'cleanSheets', label: 'Clean Sheets', icon: Shield, color: '#7C3AED' },
  { key: 'yellow', label: 'Yellow', icon: Shield, color: '#FFB800' },
  { key: 'red', label: 'Red', icon: Shield, color: '#FF4D5A' },
];

interface ComputedStat {
  goals: number;
  assists: number;
  yellow: number;
  red: number;
  played: number;
  events: { matchId: string; kind: 'goal' | 'assist' | 'yellow' | 'red'; minute: number; leg?: number; isPenalty?: boolean }[];
}

/** Derive every player's stats from the match event data (single source of truth). */
function computePlayerStats(matches: Match[]): Map<string, ComputedStat> {
  const map = new Map<string, ComputedStat>();
  const bump = (id: string, fn: (c: ComputedStat) => void) => {
    if (!id) return;
    const c = map.get(id) ?? { goals: 0, assists: 0, yellow: 0, red: 0, played: 0, events: [] };
    fn(c);
    map.set(id, c);
  };
  for (const m of matches) {
    if (m.status === 'UPCOMING') continue;
    const push = (id: string, kind: ComputedStat['events'][number]['kind'], minute: number, isPenalty?: boolean) =>
      bump(id, c => { c.events.push({ matchId: m.id, kind, minute, leg: m.leg, isPenalty }); });
    for (const e of [...(m.homeScorers ?? []), ...(m.awayScorers ?? [])]) {
      bump(e.playerId, c => { c.goals++; c.played++; });
      push(e.playerId, 'goal', e.minute, e.isPenalty);
      if (e.assistPlayerId) {
        bump(e.assistPlayerId, c => { c.assists++; c.played++; });
        push(e.assistPlayerId, 'assist', e.assistMinute ?? e.minute);
      }
    }
    for (const e of [...(m.homeYellows ?? []), ...(m.awayYellows ?? [])]) {
      bump(e.playerId, c => { c.yellow++; c.played++; });
      push(e.playerId, 'yellow', e.minute);
    }
    for (const e of [...(m.homeRedCards ?? []), ...(m.awayRedCards ?? [])]) {
      bump(e.playerId, c => { c.red++; c.played++; });
      push(e.playerId, 'red', e.minute);
    }
    // Standalone assists (not attached to a goal) — still count for player stats.
    for (const e of [...(m.homeAssists ?? []), ...(m.awayAssists ?? [])]) {
      bump(e.playerId, c => { c.assists++; c.played++; });
      push(e.playerId, 'assist', e.assistMinute ?? e.minute);
    }
  }
  return map;
}

export function StatisticsView() {
  const { players, matches, teams } = useStore();
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState<string>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('goals');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const computed = useMemo(() => computePlayerStats(matches), [matches]);

  const rows = useMemo(() => {
    const list = players.map(p => {
      const c = computed.get(p.id);
      // fallback: matches their team played (only when player never appears in events)
      const teamPlayed = matches.filter(m => m.status !== 'UPCOMING' && (m.homeId === p.teamId || m.awayId === p.teamId)).length;
      return {
        ...p,
        goals: c ? c.goals : p.goals,
        assists: c ? c.assists : p.assists,
        cleanSheets: p.cleanSheets,
        yellow: c ? c.yellow : p.yellow,
        red: c ? c.red : p.red,
        played: c ? c.played : teamPlayed,
        computed: c,
      };
    });
    const filtered = list.filter(p => {
      const q = search.trim().toLowerCase();
      const okSearch = !q || p.name.toLowerCase().includes(q);
      const okTeam = teamFilter === 'ALL' || p.teamId === teamFilter;
      return okSearch && okTeam;
    });
    return filtered.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      return sortDir === 'desc' ? vb - va : va - vb;
    });
  }, [players, matches, computed, search, teamFilter, sortKey, sortDir]);

  const onSort = (k: SortKey) => {
    if (k === sortKey) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('desc'); }
  };

  const selected = selectedId ? players.find(p => p.id === selectedId) ?? null : null;

  return (
    <div className="space-y-6">
      {/* Top 5 leaderboards */}
      <div className="grid md:grid-cols-2 gap-5">
        <LeaderboardCard title="Top Scorers" icon={Target} accent="#CCFF00" statKey="goals" players={rows} onSelect={setSelectedId} />
        <LeaderboardCard title="Top Assists" icon={Trophy} accent="#00E5FF" statKey="assists" players={rows} onSelect={setSelectedId} />
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white/[0.04] border border-white/8 p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by player name…"
            className="w-full h-10 rounded-xl bg-[#070A14] border border-white/10 pl-10 pr-4 text-[12px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
          />
        </div>
        <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} className="h-10 rounded-xl bg-[#070A14] border border-white/10 px-3 text-[12px] font-bold text-white focus:outline-none">
          <option value="ALL">All Teams</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.short} — {t.name}</option>)}
        </select>
        <div className="text-[10px] text-white/40 font-bold tracking-widest uppercase">
          {rows.length} players
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white/[0.04] border border-white/8 overflow-hidden backdrop-blur">
        <div className="overflow-auto">
          <table className="w-full text-left min-w-[820px]">
            <thead className="text-[10px] tracking-widest uppercase text-white/30 border-b border-white/5 bg-white/[0.02]">
              <tr>
                <th className="p-4 font-bold w-12 text-center">#</th>
                <th className="p-4 font-bold">Player</th>
                <th className="p-4 font-bold">Team</th>
                <th className="p-4 font-bold text-center">Pos</th>
                <th className="p-4 font-bold text-center">MP</th>
                {COLS.map(c => (
                  <th
                    key={c.key}
                    onClick={() => onSort(c.key)}
                    className={cn(
                      'p-4 font-bold text-center cursor-pointer hover:text-white transition-colors select-none',
                      sortKey === c.key ? 'text-white' : 'text-white/30'
                    )}
                  >
                    <div className="inline-flex items-center gap-1.5">
                      {sortKey === c.key && <ArrowUpDown className={cn('w-3 h-3 transition-transform', sortDir === 'asc' && 'rotate-180')} />}
                      <span>{c.label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((p, idx) => (
                <tr
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className="border-b border-white/[0.04] hover:bg-white/[0.04] hover:border-white/10 transition-colors cursor-pointer"
                >
                  <td className="p-4 text-center text-[12px] text-white/30 font-bold">{idx + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={p.image} className="w-9 h-9 rounded-full object-cover border border-white/10" alt={p.name} />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#CCFF00] text-black text-[9px] font-black flex items-center justify-center border-2 border-[#0F1424]">{p.jersey}</div>
                      </div>
                      <div>
                        <div className="text-[12px] font-bold text-white leading-tight">{p.name}</div>
                        <div className="text-[10px] text-white/40">OVR {p.rating}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><TeamLogo teamId={p.teamId} size="xs" withName /></td>
                  <td className="p-4 text-center">
                    <span className={cn(
                      'inline-block px-2 py-0.5 rounded text-[10px] font-black tracking-widest',
                      p.position === 'GK' ? 'bg-[#7C3AED]/20 text-[#A78BFA]' :
                      p.position === 'DEF' ? 'bg-[#00E5FF]/15 text-[#00E5FF]' :
                      p.position === 'MID' ? 'bg-[#FFB800]/15 text-[#FFB800]' :
                      'bg-[#CCFF00]/15 text-[#CCFF00]'
                    )}>{p.position}</span>
                  </td>
                  <td className="p-4 text-center text-[13px] font-bold text-white/70">{p.played}</td>
                  {COLS.map(c => (
                    <td key={c.key} className="p-4 text-center">
                      <span className={cn(
                        'inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-md text-[12px] font-black',
                        sortKey === c.key ? 'bg-white text-black' : 'bg-white/[0.05] text-white/70'
                      )}>
                        {p[c.key]}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4 + COLS.length} className="p-10 text-center text-white/30">
                    <div className="text-[13px] font-bold">No players found</div>
                    <div className="text-[11px] text-white/20 mt-1">Try adjusting your filters</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 flex items-start gap-2 text-[11px] text-white/45">
        <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] mt-1.5 shrink-0" />
        <div>
          <span className="font-black text-white/60">Auto-calculated:</span> Goals, assists, cards and matches played are derived live from match events. <span className="text-white/40">Click a player row for full detail.</span>
        </div>
      </div>

      {/* Player detail modal */}
      <AnimatePresence>
        {selected && <PlayerDetailModal playerId={selected.id} computed={computed.get(selected.id)} matches={matches} onClose={() => setSelectedId(null)} />}
      </AnimatePresence>
    </div>
  );
}

function LeaderboardCard({
  title, icon: Icon, accent, statKey, players, onSelect,
}: {
  title: string;
  icon: typeof Target;
  accent: string;
  statKey: SortKey;
  players: (PlayerStat & { goals: number; assists: number; yellow: number; red: number; played: number })[];
  onSelect: (id: string) => void;
}) {
  const top = players.slice().sort((a, b) => b[statKey] - a[statKey]).slice(0, 5);
  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/8 backdrop-blur p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-black uppercase tracking-wide text-white flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: accent }} /> {title}
        </h3>
        <span className="text-[10px] font-black tracking-widest uppercase text-white/30">Top 5</span>
      </div>
      <div className="space-y-2">
        {top.map((p, i) => {
          const t = getTeam(p.teamId);
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/15 transition-colors text-left"
            >
              <span className={cn(
                'w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center shrink-0',
                i === 0 ? 'bg-[#FFB800] text-black' : i === 1 ? 'bg-white/15 text-white' : i === 2 ? 'bg-[#CD7F32] text-black' : 'bg-white/5 text-white/40'
              )}>{i + 1}</span>
              <img src={p.image} className="w-8 h-8 rounded-full object-cover border border-white/10" alt={p.name} />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-white truncate">{p.name}</div>
                <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                  {t && <span>{t.short}</span>}
                  <span>·</span>
                  <span>{p.position}</span>
                </div>
              </div>
              <div className="text-[18px] font-black tabular-nums" style={{ color: accent }}>{p[statKey]}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PlayerDetailModal({
  playerId, computed, matches, onClose,
}: {
  playerId: string;
  computed: ComputedStat | undefined;
  matches: Match[];
  onClose: () => void;
}) {
  const p = getPlayer(playerId);
  if (!p) return null;
  const t = getTeam(p.teamId);
  const stats = computed ?? { goals: p.goals, assists: p.assists, yellow: p.yellow, red: p.red, played: matches.filter(m => m.status !== 'UPCOMING' && (m.homeId === p.teamId || m.awayId === p.teamId)).length, events: [] };

  const eventLabel = (kind: ComputedStat['events'][number]['kind'], isPenalty?: boolean) =>
    kind === 'goal' ? `⚽ Goal${isPenalty ? ' (P)' : ''}` : kind === 'assist' ? '🅰 Assist' : kind === 'yellow' ? '🟨 Yellow' : '🟥 Red';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[260] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
        className="w-full max-w-[560px] max-h-[90vh] rounded-3xl bg-[#0F1424] border border-white/10 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center gap-4">
          <div className="relative shrink-0">
            <img src={p.image} className="w-16 h-16 rounded-2xl object-cover border border-white/10" alt={p.name} />
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#CCFF00] text-black text-[10px] font-black flex items-center justify-center border-2 border-[#0F1424]">{p.jersey}</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[18px] font-black text-white leading-tight truncate">{p.name}</div>
            <div className="mt-1 flex items-center gap-2">
              {t && <TeamLogo teamId={t.id} size="xs" />}
              <span className={cn(
                'px-2 py-0.5 rounded text-[10px] font-black tracking-widest',
                p.position === 'GK' ? 'bg-[#7C3AED]/20 text-[#A78BFA]' :
                p.position === 'DEF' ? 'bg-[#00E5FF]/15 text-[#00E5FF]' :
                p.position === 'MID' ? 'bg-[#FFB800]/15 text-[#FFB800]' :
                'bg-[#CCFF00]/15 text-[#CCFF00]'
              )}>{p.position}</span>
              <span className="text-[10px] text-white/40 font-bold">OVR {p.rating}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center shrink-0">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-5">
          {/* Stat tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { l: 'Matches Played', v: stats.played, c: '#FFFFFF' },
              { l: 'Goals', v: stats.goals, c: '#CCFF00' },
              { l: 'Assists', v: stats.assists, c: '#00E5FF' },
              { l: 'Yellow Cards', v: stats.yellow, c: '#FFB800' },
              { l: 'Red Cards', v: stats.red, c: '#FF4D5A' },
              { l: 'Clean Sheets', v: p.cleanSheets, c: '#7C3AED' },
            ].map(s => (
              <div key={s.l} className="rounded-2xl bg-white/[0.03] border border-white/8 p-3.5 text-center">
                <div className="text-[22px] font-black leading-none" style={{ color: s.c }}>{s.v}</div>
                <div className="text-[9px] font-black tracking-widest uppercase text-white/40 mt-1.5">{s.l}</div>
              </div>
            ))}
          </div>

          {/* Match-by-match breakdown */}
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-white/45 mb-3">
              <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" /> Match Events
            </div>
            {stats.events.length === 0 ? (
              <div className="text-[11px] text-white/30 italic">No events recorded in matches so far.</div>
            ) : (
              <div className="space-y-1.5">
                {stats.events.slice().reverse().map((e, i) => {
                  const m = matches.find(x => x.id === e.matchId);
                  if (!m) return null;
                  const h = getTeam(m.homeId);
                  const a = getTeam(m.awayId);
                  return (
                    <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-[13px] leading-none">{eventLabel(e.kind, e.isPenalty)}</span>
                      <span className="text-[10px] text-white/40 font-bold tracking-widest uppercase">
                        {e.minute}'
                      </span>
                      <span className="flex-1 text-[11px] font-bold text-white/80 truncate">
                        {h?.short} {m.homeScore}–{m.awayScore} {a?.short}
                        {m.leg != null && <span className="text-white/35"> (Leg {m.leg})</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* MVP badge */}
          {matches.some(m => m.mvpId === p.id) && (
            <div className="rounded-2xl bg-[#FFB800]/10 border border-[#FFB800]/25 p-3.5 flex items-center gap-3">
              <Crown className="w-5 h-5 text-[#FFB800]" />
              <span className="text-[12px] font-black text-[#FFB800] uppercase tracking-wide">Player of the Match</span>
              <span className="text-[11px] text-white/60">{matches.filter(m => m.mvpId === p.id).length}× awarded</span>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-white/10">
          <button onClick={onClose} className="w-full h-11 rounded-full bg-white/[0.06] border border-white/10 text-white text-[12px] font-black tracking-widest uppercase hover:bg-white/[0.1] transition-colors">
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
