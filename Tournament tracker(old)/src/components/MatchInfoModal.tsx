import { motion } from 'framer-motion';
import { X, Info } from 'lucide-react';
import { Match } from '../data/matches';
import { getPlayer } from '../data/players';
import { getTeam } from '../data/teams';

const YellowMark = () => <span className="inline-block w-2 h-3 rounded-[2px] bg-[#FFB800] shadow-[0_0_5px_rgba(255,184,0,0.6)] align-middle" />;
const RedMark = () => <span className="inline-block w-2 h-3 rounded-[2px] bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.7)] align-middle" />;

interface InfoRow {
  playerId: string;
  minute: number;
  penalty?: boolean;
  assistPlayerId?: string;
  assistMinute?: number;
  goalPlayerId?: string;
  goalMinute?: number;
}

function SectionList({ rows, emptyText }: { rows: InfoRow[]; emptyText: string }) {
  if (rows.length === 0) {
    return <div className="text-[10px] text-white/25 italic py-1">{emptyText}</div>;
  }
  return (
    <div className="space-y-1">
      {rows.map((r, i) => {
        const pl = getPlayer(r.playerId);
        return (
          <div key={i} className="flex items-center gap-1.5 text-[11px] min-w-0">
            <span className="font-bold truncate text-white/85">{pl?.name ?? r.playerId}</span>
            <span className="font-bold shrink-0 text-white/45">— {r.minute}'</span>
            {r.penalty && <span className="font-black shrink-0 text-[#FFB800] text-[9px]">(P)</span>}
          </div>
        );
      })}
    </div>
  );
}

export function MatchInfoModal({ match, onClose }: { match: Match; onClose: () => void }) {
  const home = getTeam(match.homeId)!;
  const away = getTeam(match.awayId)!;

  const homeScorers = (match.homeScorers ?? []).map<InfoRow>(g => ({
    playerId: g.playerId, minute: g.minute, penalty: g.isPenalty,
    assistPlayerId: g.assistPlayerId, assistMinute: g.assistMinute ?? g.minute,
  }));
  const awayScorers = (match.awayScorers ?? []).map<InfoRow>(g => ({
    playerId: g.playerId, minute: g.minute, penalty: g.isPenalty,
    assistPlayerId: g.assistPlayerId, assistMinute: g.assistMinute ?? g.minute,
  }));

  // Assists: goal-linked + standalone
  const linkedAssists = (scorers: InfoRow[]) =>
    scorers.filter(s => s.assistPlayerId).map<InfoRow>(s => ({
      playerId: s.assistPlayerId!, minute: s.assistMinute ?? s.minute, goalPlayerId: s.playerId, goalMinute: s.minute,
    }));
  const homeAssists: InfoRow[] = [
    ...linkedAssists(homeScorers),
    ...(match.homeAssists ?? []).map(a => ({ playerId: a.playerId, minute: a.assistMinute ?? a.minute })),
  ];
  const awayAssists: InfoRow[] = [
    ...linkedAssists(awayScorers),
    ...(match.awayAssists ?? []).map(a => ({ playerId: a.playerId, minute: a.assistMinute ?? a.minute })),
  ];

  const homeYellows = (match.homeYellows ?? []).map<InfoRow>(y => ({ playerId: y.playerId, minute: y.minute }));
  const awayYellows = (match.awayYellows ?? []).map<InfoRow>(y => ({ playerId: y.playerId, minute: y.minute }));
  const homeReds = (match.homeRedCards ?? []).map<InfoRow>(r => ({ playerId: r.playerId, minute: r.minute }));
  const awayReds = (match.awayRedCards ?? []).map<InfoRow>(r => ({ playerId: r.playerId, minute: r.minute }));

  const hs = match.homeStats;
  const as = match.awayStats;
  const statsRows: { k: string; h: number; a: number }[] = [
    { k: 'Fouls', h: hs?.fouls ?? 0, a: as?.fouls ?? 0 },
    { k: 'Corners', h: hs?.corners ?? 0, a: as?.corners ?? 0 },
    { k: 'Tackles', h: hs?.tackles ?? 0, a: as?.tackles ?? 0 },
  ];
  const hasStats = statsRows.some(r => r.h > 0 || r.a > 0);

  const hasGoals = homeScorers.length > 0 || awayScorers.length > 0;
  const hasAssists = homeAssists.length > 0 || awayAssists.length > 0;
  const hasYellows = homeYellows.length > 0 || awayYellows.length > 0;
  const hasReds = homeReds.length > 0 || awayReds.length > 0;
  const hasAnything = hasGoals || hasAssists || hasYellows || hasReds || hasStats;
  const showPen = match.penaltyHome != null && match.penaltyAway != null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[260] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.97, y: 12, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.97, y: 12, opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="w-full max-w-[620px] max-h-[90vh] rounded-2xl bg-[#0A0E1A] border border-white/10 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/[0.07] flex items-center gap-3 shrink-0 bg-[#0C1120]">
          <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/25 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <div className="flex-1 min-w-0 text-center">
            <div className="text-[13px] font-black text-white uppercase tracking-tight truncate">Match Info</div>
            <div className="text-[9px] text-white/40 tracking-widest uppercase truncate">
              {home.short} {match.homeScore}{showPen ? ` (${match.penaltyHome})` : ''} — {match.awayScore}{showPen ? ` (${match.penaltyAway})` : ''} {away.short}
              {match.fixtureGroupId ? ` · Leg ${match.leg}` : ''}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className="ml-1 w-7 h-7 rounded-md bg-white/[0.05] hover:bg-white/[0.12] text-white/60 hover:text-white flex items-center justify-center shrink-0 transition-all duration-150 active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body — read-only */}
        <div className="flex-1 overflow-y-auto custom-scroll overscroll-contain p-4 space-y-4">
          {!hasAnything && (
            <div className="rounded-xl border border-dashed border-white/10 py-10 text-center text-[12px] text-white/30">
              No match information recorded yet.
            </div>
          )}

          {/* Goals */}
          {hasGoals && (
            <div className="rounded-xl border border-white/[0.06] bg-[#0D1322]/90 p-3.5">
              <div className="text-[9px] font-black tracking-widest uppercase text-white/40 mb-2 flex items-center gap-1.5">
                <span className="text-[11px] leading-none">⚽</span> Goals
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[8px] font-black tracking-widest uppercase mb-1" style={{ color: home.color }}>{home.short}</div>
                  <SectionList rows={homeScorers} emptyText="No goals" />
                </div>
                <div>
                  <div className="text-[8px] font-black tracking-widest uppercase mb-1 text-right" style={{ color: away.color }}>{away.short}</div>
                  <SectionList rows={awayScorers} emptyText="No goals" />
                </div>
              </div>
            </div>
          )}

          {/* Assists */}
          {hasAssists && (
            <div className="rounded-xl border border-white/[0.06] bg-[#0D1322]/90 p-3.5">
              <div className="text-[9px] font-black tracking-widest uppercase text-white/40 mb-2 flex items-center gap-1.5">
                <span className="text-[10px] text-[#00E5FF] leading-none">🅰</span> Assists
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[8px] font-black tracking-widest uppercase mb-1" style={{ color: home.color }}>{home.short}</div>
                  <AssistList rows={homeAssists} />
                </div>
                <div>
                  <div className="text-[8px] font-black tracking-widest uppercase mb-1 text-right" style={{ color: away.color }}>{away.short}</div>
                  <AssistList rows={awayAssists} />
                </div>
              </div>
            </div>
          )}

          {/* Yellow cards */}
          {hasYellows && (
            <div className="rounded-xl border border-white/[0.06] bg-[#0D1322]/90 p-3.5">
              <div className="text-[9px] font-black tracking-widest uppercase text-white/40 mb-2 flex items-center gap-1.5">
                <YellowMark /> Yellow Cards
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[8px] font-black tracking-widest uppercase mb-1" style={{ color: home.color }}>{home.short}</div>
                  <SectionList rows={homeYellows} emptyText="No yellow cards" />
                </div>
                <div>
                  <div className="text-[8px] font-black tracking-widest uppercase mb-1 text-right" style={{ color: away.color }}>{away.short}</div>
                  <SectionList rows={awayYellows} emptyText="No yellow cards" />
                </div>
              </div>
            </div>
          )}

          {/* Red cards */}
          {hasReds && (
            <div className="rounded-xl border border-white/[0.06] bg-[#0D1322]/90 p-3.5">
              <div className="text-[9px] font-black tracking-widest uppercase text-white/40 mb-2 flex items-center gap-1.5">
                <RedMark /> Red Cards
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[8px] font-black tracking-widest uppercase mb-1" style={{ color: home.color }}>{home.short}</div>
                  <SectionList rows={homeReds} emptyText="No red cards" />
                </div>
                <div>
                  <div className="text-[8px] font-black tracking-widest uppercase mb-1 text-right" style={{ color: away.color }}>{away.short}</div>
                  <SectionList rows={awayReds} emptyText="No red cards" />
                </div>
              </div>
            </div>
          )}

          {/* Match statistics */}
          {hasStats && (
            <div className="rounded-xl border border-white/[0.06] bg-[#0D1322]/90 p-3.5">
              <div className="text-[9px] font-black tracking-widest uppercase text-white/40 mb-2">Match Statistics</div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="text-center text-[10px] font-black tracking-widest uppercase" style={{ color: home.color }}>{home.short}</div>
                <div />
                <div className="text-center text-[10px] font-black tracking-widest uppercase" style={{ color: away.color }}>{away.short}</div>
                {statsRows.map(r => (
                  <div key={r.k} className="contents">
                    <div className="text-center text-[13px] font-black text-white tabular-nums">{r.h}</div>
                    <div className="text-center text-[9px] font-bold tracking-widest uppercase text-white/40">{r.k}</div>
                    <div className="text-center text-[13px] font-black text-white tabular-nums">{r.a}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/[0.07] shrink-0 bg-[#0C1120]">
          <button
            onClick={onClose}
            className="w-full h-9 rounded-lg bg-white/[0.05] border border-white/10 text-white text-[11px] font-bold tracking-wide hover:bg-white/[0.1] transition-all duration-150 active:scale-[0.98]"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AssistList({ rows }: { rows: InfoRow[] }) {
  if (rows.length === 0) return <div className="text-[10px] text-white/25 italic py-1">No assists</div>;
  return (
    <div className="space-y-1">
      {rows.map((r, i) => {
        const pl = getPlayer(r.playerId);
        const goalPl = getPlayer(r.goalPlayerId);
        return (
          <div key={i} className="flex items-center gap-1.5 text-[11px] min-w-0">
            <span className="text-[10px] text-[#00E5FF] leading-none shrink-0">🅰</span>
            <span className="font-bold truncate text-white/85">{pl?.name ?? r.playerId}</span>
            <span className="font-bold shrink-0 text-white/45">— {r.minute}'</span>
            {r.goalPlayerId && (
              <span className="text-[9px] text-white/35 truncate shrink-0 hidden sm:inline" title={`For ${goalPl?.name}`}>
                (for ⚽ {goalPl?.name.split(' ')[0] ?? ''} {r.goalMinute}'{/* */})
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
