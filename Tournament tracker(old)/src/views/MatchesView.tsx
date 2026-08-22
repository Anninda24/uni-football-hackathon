import { useMemo, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MapPin, Calendar as CalIcon, Clock, Trash2, Check, X, Play, Flag, ChevronRight, Repeat, Crown, Minus, Edit3, Users, Info } from 'lucide-react';
import { useStore } from '../store';
import { Match, MatchEvent, MatchStatus } from '../data/matches';
import { TEAMS, getTeam } from '../data/teams';
import { VENUES } from '../data/teams';
import { getPlayer } from '../data/players';
import { TeamLogo } from '../components/TeamLogo';
import { StatusBadge } from '../components/StatusBadge';
import { MatchEditorModal } from '../components/MatchEditorModal';
import { TeamInfoModal } from '../components/TeamInfoModal';
import { MatchInfoModal } from '../components/MatchInfoModal';
import { cn } from '../utils/cn';

type StatusFilter = 'ALL' | MatchStatus;

const STATUS_ORDER: MatchStatus[] = ['LIVE', 'UPCOMING', 'COMPLETED'];

/** e.g. "15 Mar 2026" */
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const YellowMark = () => <span className="inline-block w-2.5 h-3.5 rounded-[2px] bg-[#FFB800] shadow-[0_0_5px_rgba(255,184,0,0.6)] align-middle" />;
const RedMark = () => <span className="inline-block w-2.5 h-3.5 rounded-[2px] bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.7)] align-middle" />;

interface RowProps {
  scorers: MatchEvent[];
  yellows: MatchEvent[];
  reds: MatchEvent[];
  teamShort: string;
  accent: string;
  /** LEFT = home team events (aligned left) · RIGHT = away team events (aligned right) */
  align: 'left' | 'right';
}

/** Fixed-width icon container — every event icon occupies the SAME box. */
function EventIcon({ children }: { children: ReactNode }) {
  return (
    <span className="w-4 h-4 shrink-0 inline-flex items-center justify-center">
      {children}
    </span>
  );
}

/** Single event row with correct content order.
 *  LEFT side:  [icon] Player Name — Minute
 *  RIGHT side: Player Name — Minute [icon]   (row right-aligned, icon at the far right) */
function EventRow({
  right, icon, name, minute, penalty, nameClass,
}: {
  right: boolean;
  icon: ReactNode;
  name: string;
  minute: number;
  penalty?: boolean;
  nameClass?: string;
}) {
  return (
    <div className={cn('flex items-center gap-1.5 min-w-0', right && 'justify-end')}>
      {!right && <EventIcon>{icon}</EventIcon>}
      <span className={cn('font-bold truncate', nameClass ?? 'text-white/85')}>{name}</span>
      <span className="font-bold shrink-0 text-white/45">— {minute}'</span>
      {penalty && <span className="font-black shrink-0 text-[#FFB800] text-[10px]">(P)</span>}
      {right && <EventIcon>{icon}</EventIcon>}
    </div>
  );
}

/** Team-aligned event column — goals + yellow + red cards only (public match card).
 *  Assists are deliberately NOT shown here (they live in the "+" admin panel). */
function TeamEvents({ scorers, yellows, reds, teamShort, accent, align }: RowProps) {
  const has = (scorers.length + yellows.length + reds.length) > 0;
  if (!has) return null;
  const right = align === 'right';
  return (
    <div className={cn('space-y-[3px] text-[11px] min-w-0', right ? 'text-right' : 'text-left')}>
      <div className={cn('flex items-center gap-1.5 mb-0.5', right && 'justify-end')}>
        <span className="text-[9px] font-black tracking-widest uppercase" style={{ color: accent }}>{teamShort}</span>
      </div>
      {scorers.map((g, i) => {
        const pl = getPlayer(g.playerId);
        return (
          <EventRow
            key={i}
            right={right}
            icon={<span className="text-[12px] leading-none">⚽</span>}
            name={pl?.name ?? g.playerId}
            minute={g.minute}
            penalty={g.isPenalty}
          />
        );
      })}
      {yellows.map((y, i) => {
        const pl = getPlayer(y.playerId);
        return (
          <EventRow
            key={i}
            right={right}
            icon={<YellowMark />}
            name={pl?.name ?? y.playerId}
            minute={y.minute}
            nameClass="text-white/75"
          />
        );
      })}
      {reds.map((r, i) => {
        const pl = getPlayer(r.playerId);
        return (
          <EventRow
            key={i}
            right={right}
            icon={<RedMark />}
            name={pl?.name ?? r.playerId}
            minute={r.minute}
            nameClass="text-red-300"
          />
        );
      })}
    </div>
  );
}

function ScoreInput({ value, onChange, onIncrement }: { value: number; onChange: (v: number) => void; onIncrement: (d: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      <button onClick={() => onIncrement(-1)} className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 text-white text-[14px] font-black leading-none">−</button>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="w-10 h-9 bg-black/40 border border-white/10 rounded-md text-center text-[24px] font-black text-white focus:outline-none focus:border-[#CCFF00]/40"
      />
      <button onClick={() => onIncrement(1)} className="w-6 h-6 rounded-md bg-[#CCFF00] hover:bg-[#B8E000] text-black text-[14px] font-black leading-none">+</button>
    </div>
  );
}

/** Full-width single match row — one match per line */
function MatchRow({
  match,
  viewMode,
  onUpdate,
  onDelete,
  onEdit,
  onTeamInfo,
  onMatchInfo,
}: {
  match: Match;
  viewMode: 'ADMIN' | 'SPECTATOR';
  onUpdate: (patch: Partial<Match>) => void;
  onDelete: () => void;
  onEdit: () => void;
  onTeamInfo: () => void;
  onMatchInfo: () => void;
}) {
  const home = getTeam(match.homeId)!;
  const away = getTeam(match.awayId)!;
  const isAdmin = viewMode === 'ADMIN';
  const isLive = match.status === 'LIVE';
  const isUpcoming = match.status === 'UPCOMING';
  const isCompleted = match.status === 'COMPLETED';
  const showEvents = isLive || isCompleted;
  const mvp = isCompleted ? getPlayer(match.mvpId) : null;
  const showPen = match.penaltyHome != null && match.penaltyAway != null && !isUpcoming;

  return (
    <div className={cn(
      'rounded-xl border overflow-hidden transition-colors',
      isLive ? 'border-red-500/30 bg-gradient-to-r from-red-500/[0.07] via-[#0F1424]/60 to-transparent' : 'bg-white/[0.03] border-white/8 hover:border-white/15'
    )}>
      {/* Top strip — compact: date + time (left), admin actions (right) */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 border-b border-white/5 bg-white/[0.02]">
        <span className="text-[11px] text-white/45 flex items-center gap-1.5 min-w-0">
          <CalIcon className="w-3 h-3 text-white/25 shrink-0" /> {formatDate(match.date)}
          <Clock className="w-3 h-3 text-white/25 ml-0.5 shrink-0" /> {match.time}
        </span>
        {match.fixtureGroupId && (
          <span className="px-1.5 py-0.5 rounded-full bg-[#7C3AED]/15 border border-[#7C3AED]/25 text-[9px] font-black tracking-widest uppercase text-[#A78BFA] shrink-0">
            Leg {match.leg}
          </span>
        )}
        <button
          onClick={onTeamInfo}
          title="Lineup"
          className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black tracking-widest uppercase text-white/50 hover:text-white hover:border-white/25 transition-colors shrink-0"
        >
          <Users className="w-3 h-3" /> Lineup
        </button>
        <button
          onClick={onMatchInfo}
          title="Match Info"
          className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black tracking-widest uppercase text-white/50 hover:text-white hover:border-white/25 transition-colors shrink-0"
        >
          <Info className="w-3 h-3" /> Match Info
        </button>
        {isAdmin && (
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={onEdit}
              title="Manage match"
              className="w-6 h-6 rounded-md bg-[#CCFF00] hover:bg-[#B8E000] text-black flex items-center justify-center transition-all active:scale-90"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            {!isLive && !isCompleted && (
              <button
                onClick={() => onUpdate({ status: 'LIVE', minute: match.minute ?? 1 })}
                title="Start live"
                className="w-6 h-6 rounded-md bg-white/5 hover:bg-emerald-500/20 text-white/40 hover:text-emerald-400 flex items-center justify-center transition-colors"
              ><Play className="w-3 h-3" /></button>
            )}
            {isLive && (
              <button
                onClick={() => onUpdate({ status: 'COMPLETED' })}
                title="Finish match"
                className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/20 text-white/40 hover:text-white flex items-center justify-center transition-colors"
              ><Flag className="w-3 h-3" /></button>
            )}
            <button
              onClick={onDelete}
              title="Delete"
              className="w-6 h-6 rounded-md bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 flex items-center justify-center transition-colors"
            ><Trash2 className="w-3 h-3" /></button>
          </div>
        )}
      </div>

      {/* Main line — scoreboard: status above score, teams + score in one tight row */}
      <div className="px-3.5 pt-3 pb-2">
        <div className="flex items-start gap-3">
          {/* Home */}
          <div className="flex-1 min-w-0 flex items-center gap-2.5">
            <TeamLogo teamId={match.homeId} size="sm" />
            <div className="min-w-0">
              <div className="text-[14px] md:text-[15px] font-black text-white truncate leading-tight">{home.name}</div>
              <div className="text-[8px] text-white/35 tracking-widest uppercase font-bold mt-0.5">{home.short} · Home</div>
            </div>
          </div>

          {/* Scoreboard */}
          <div className="text-center shrink-0 px-1">
            {/* Status directly belongs to the scoreboard */}
            {!isUpcoming && (
              <div className="mb-1 flex justify-center">
                <StatusBadge status={match.status} minute={match.minute} penalty={showPen} />
              </div>
            )}
            {isUpcoming ? (
              <div className="text-[22px] font-black text-white/15 tracking-tight leading-none">VS</div>
            ) : (
              <div className="flex items-center justify-center gap-1.5 md:gap-2">
                {isAdmin && isLive ? (
                  <ScoreInput value={match.homeScore} onChange={(v) => onUpdate({ homeScore: v })} onIncrement={(d) => onUpdate({ homeScore: Math.max(0, match.homeScore + d) })} />
                ) : (
                  <span className="text-[26px] md:text-[30px] font-black text-white leading-none tabular-nums">{match.homeScore}</span>
                )}
                {showPen && <span className="text-[13px] md:text-[14px] font-black text-white/60 leading-none tabular-nums">({match.penaltyHome})</span>}
                <span className="text-white/15 text-[16px]">:</span>
                {showPen && <span className="text-[13px] md:text-[14px] font-black text-white/60 leading-none tabular-nums">({match.penaltyAway})</span>}
                {isAdmin && isLive ? (
                  <ScoreInput value={match.awayScore} onChange={(v) => onUpdate({ awayScore: v })} onIncrement={(d) => onUpdate({ awayScore: Math.max(0, match.awayScore + d) })} />
                ) : (
                  <span className="text-[26px] md:text-[30px] font-black text-white leading-none tabular-nums">{match.awayScore}</span>
                )}
              </div>
            )}
            {isLive && <div className="text-[9px] text-red-400 font-black tracking-widest uppercase mt-0.5 animate-pulse">{match.minute}'</div>}
          </div>

          {/* Away */}
          <div className="flex-1 min-w-0 flex items-center gap-2.5 justify-end text-right">
            <div className="min-w-0">
              <div className="text-[14px] md:text-[15px] font-black text-white truncate leading-tight">{away.name}</div>
              <div className="text-[8px] text-white/35 tracking-widest uppercase font-bold mt-0.5">{away.short} · Away</div>
            </div>
            <TeamLogo teamId={match.awayId} size="sm" />
          </div>
        </div>

        {/* Venue — single compact line */}
        <div className="text-[10px] text-white/30 flex items-center gap-1.5 mt-1.5">
          <MapPin className="w-3 h-3" /> {match.venue}
        </div>
      </div>

      {/* Events + MVP + Lineup */}
      {showEvents && (
        <div className="px-3.5 pb-3 pt-2 border-t border-white/5 space-y-2.5">
          {/* Two-column team-aligned events: goals + yellow/red cards.
              LEFT = home (left-aligned) · RIGHT = away (right-aligned, fixed position) */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 items-start">
            <TeamEvents
              scorers={match.homeScorers ?? []}
              yellows={match.homeYellows ?? []}
              reds={match.homeRedCards ?? []}
              teamShort={home.short}
              accent={home.color}
              align="left"
            />
            <TeamEvents
              scorers={match.awayScorers ?? []}
              yellows={match.awayYellows ?? []}
              reds={match.awayRedCards ?? []}
              teamShort={away.short}
              accent={away.color}
              align="right"
            />
          </div>

          {/* MVP centered — team abbreviation always shown, derived from the player's team */}
          {isCompleted && mvp && (
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB800]/10 border border-[#FFB800]/25">
                <Crown className="w-3 h-3 text-[#FFB800]" />
                <span className="text-[8px] font-black tracking-widest uppercase text-[#FFB800]">MVP</span>
                <span className="text-[11px] font-black text-white">{mvp.name}</span>
                <span className="text-[9px] font-bold text-white/60">({getTeam(mvp.teamId)?.short ?? '—'})</span>
              </span>
            </div>
          )}
          {isLive && (
            <div className="text-center text-[9px] text-white/30 italic">MVP decided at full time…</div>
          )}
        </div>
      )}
    </div>
  );
}

/** Aggregate result row for a completed two-legged tie */
function AggregateRow({ legs, viewMode, onEditLeg, onTeamInfo, onMatchInfo }: { legs: Match[]; viewMode: 'ADMIN' | 'SPECTATOR'; onEditLeg: (m: Match) => void; onTeamInfo: () => void; onMatchInfo: () => void }) {
  const sorted = legs.slice().sort((a, b) => (a.leg || 0) - (b.leg || 0));
  const homeId = sorted[0].homeId;
  const awayId = sorted[0].awayId;
  const home = getTeam(homeId)!;
  const away = getTeam(awayId)!;

  const homeGoals = sorted.reduce((s, l) => s + (l.homeId === homeId ? l.homeScore : l.awayScore), 0);
  const awayGoals = sorted.reduce((s, l) => s + (l.awayId === awayId ? l.awayScore : l.homeScore), 0);

  const mergeEvents = (side: 'home' | 'away'): MatchEvent[] => {
    const out: MatchEvent[] = [];
    for (const l of sorted) {
      const list = side === 'home' ? l.homeScorers : l.awayScorers;
      for (const e of list || []) out.push({ ...e, playerId: e.playerId, minute: e.minute, assistPlayerId: e.assistPlayerId });
    }
    return out;
  };
  const homeScorers = mergeEvents('home');
  const awayScorers = mergeEvents('away');
  const homeYellows = sorted.flatMap(l => (l.homeYellows || []).map(e => ({ ...e })));
  const awayYellows = sorted.flatMap(l => (l.awayYellows || []).map(e => ({ ...e })));
  const homeReds = sorted.flatMap(l => (l.homeRedCards || []).map(e => ({ ...e })));
  const awayReds = sorted.flatMap(l => (l.awayRedCards || []).map(e => ({ ...e })));
  const mvp = getPlayer(sorted.find(l => l.mvpId)?.mvpId);
  const dates = sorted.map(l => l.date).sort();
  const isAdmin = viewMode === 'ADMIN';
  const anyPen = sorted.some(l => l.penaltyHome != null);

  return (
    <div className="rounded-xl border border-[#7C3AED]/25 bg-gradient-to-r from-[#7C3AED]/[0.08] via-[#0F1424]/70 to-[#00E5FF]/[0.06] overflow-hidden">
      {/* Strip — compact: two-legged badge + dates + lineup + admin */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 border-b border-white/5 bg-white/[0.02]">
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/30 text-[9px] font-black tracking-widest uppercase text-[#A78BFA] shrink-0">
          <Repeat className="w-3 h-3" /> Two-Legged
        </span>
        <span className="text-[9px] font-black tracking-widest uppercase text-white/35 shrink-0">Aggregate Result</span>
        <span className="text-[10px] text-white/40 hidden sm:block">
          {formatDate(dates[0])} – {formatDate(dates[dates.length - 1])}
        </span>
        <button
          onClick={onTeamInfo}
          title="Lineup"
          className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black tracking-widest uppercase text-white/50 hover:text-white hover:border-white/25 transition-colors shrink-0"
        >
          <Users className="w-3 h-3" /> Lineup
        </button>
        <button
          onClick={onMatchInfo}
          title="Match Info"
          className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black tracking-widest uppercase text-white/50 hover:text-white hover:border-white/25 transition-colors shrink-0"
        >
          <Info className="w-3 h-3" /> Match Info
        </button>
        {isAdmin && (
          <div className="ml-auto flex items-center gap-1">
            {sorted.map(l => (
              <button
                key={l.id}
                onClick={() => onEditLeg(l)}
                title={`Edit Leg ${l.leg}`}
                className="h-6 px-2 rounded-md bg-[#CCFF00] hover:bg-[#B8E000] text-black text-[9px] font-black tracking-widest uppercase flex items-center gap-1 transition-all active:scale-95"
              >
                <Edit3 className="w-3 h-3" /> Leg {l.leg}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main line — scoreboard: status above aggregate score */}
      <div className="px-3.5 pt-3 pb-2">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0 flex items-center gap-2.5">
            <TeamLogo teamId={homeId} size="sm" />
            <div className="min-w-0">
              <div className="text-[14px] md:text-[15px] font-black text-white truncate leading-tight">{home.name}</div>
              <div className="text-[8px] text-white/35 tracking-widest uppercase font-bold mt-0.5">{home.short} · Home</div>
            </div>
          </div>

          <div className="text-center shrink-0 px-1">
            <div className="mb-1 flex justify-center">
              <StatusBadge status="COMPLETED" penalty={anyPen} />
            </div>
            <div className="text-[28px] md:text-[32px] font-black text-white leading-none tabular-nums">
              {homeGoals} <span className="text-white/20">—</span> {awayGoals}
            </div>
            <div className="text-[8px] text-[#CCFF00] font-black tracking-widest uppercase mt-0.5">on aggregate</div>
            <div className="mt-1.5 flex gap-1.5 justify-center">
              {sorted.map(l => (
                <span key={l.id} className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-black text-white/60 tabular-nums">
                  L{l.leg}: {l.homeScore}{l.penaltyHome != null ? ` (${l.penaltyHome})` : ''}-{l.awayScore}{l.penaltyAway != null ? ` (${l.penaltyAway})` : ''}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-0 flex items-center gap-2.5 justify-end text-right">
            <div className="min-w-0">
              <div className="text-[14px] md:text-[15px] font-black text-white truncate leading-tight">{away.name}</div>
              <div className="text-[8px] text-white/35 tracking-widest uppercase font-bold mt-0.5">{away.short} · Away</div>
            </div>
            <TeamLogo teamId={awayId} size="sm" />
          </div>
        </div>
      </div>

      {/* Events + MVP */}
      <div className="px-3.5 pb-3 pt-2 border-t border-white/5 space-y-2.5">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 items-start">
          <TeamEvents
            scorers={homeScorers}
            yellows={homeYellows}
            reds={homeReds}
            teamShort={`${home.short} (agg)`}
            accent={home.color}
            align="left"
          />
          <TeamEvents
            scorers={awayScorers}
            yellows={awayYellows}
            reds={awayReds}
            teamShort={`${away.short} (agg)`}
            accent={away.color}
            align="right"
          />
        </div>

        {mvp && (
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB800]/10 border border-[#FFB800]/25">
              <Crown className="w-3 h-3 text-[#FFB800]" />
              <span className="text-[8px] font-black tracking-widest uppercase text-[#FFB800]">MVP</span>
              <span className="text-[11px] font-black text-white">{mvp.name}</span>
              <span className="text-[9px] font-bold text-white/60">({getTeam(mvp.teamId)?.short ?? '—'})</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Generate Fixture Modal ───────────────────────────────
function GenerateFixtureModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { generateFixture, useTwoLegged, setUseTwoLegged } = useStore();
  const [homeId, setHomeId] = useState('t1');
  const [awayId, setAwayId] = useState('t2');
  const [date, setDate] = useState('2026-04-10');
  const [time, setTime] = useState('15:00');
  const [venue, setVenue] = useState(VENUES[0]);

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[250] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-[520px] rounded-3xl bg-[#0F1424] border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[18px] font-black text-white uppercase tracking-tight">Generate Fixture</div>
            <div className="text-[11px] text-white/40 mt-0.5">Add a new match to the schedule</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black tracking-widest uppercase text-white/40 mb-2 block">Home Team</label>
              <select value={homeId} onChange={(e) => setHomeId(e.target.value)} className="w-full h-11 rounded-xl bg-[#070A14] border border-white/10 px-3 text-[13px] text-white focus:outline-none focus:border-[#CCFF00]/40">
                {TEAMS.map(t => <option key={t.id} value={t.id}>{t.short} — {t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black tracking-widest uppercase text-white/40 mb-2 block">Away Team</label>
              <select value={awayId} onChange={(e) => setAwayId(e.target.value)} className="w-full h-11 rounded-xl bg-[#070A14] border border-white/10 px-3 text-[13px] text-white focus:outline-none focus:border-[#CCFF00]/40">
                {TEAMS.map(t => <option key={t.id} value={t.id}>{t.short} — {t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black tracking-widest uppercase text-white/40 mb-2 block">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-11 rounded-xl bg-[#070A14] border border-white/10 px-3 text-[13px] text-white focus:outline-none focus:border-[#CCFF00]/40 [color-scheme:dark]" />
            </div>
            <div>
              <label className="text-[10px] font-black tracking-widest uppercase text-white/40 mb-2 block">Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full h-11 rounded-xl bg-[#070A14] border border-white/10 px-3 text-[13px] text-white focus:outline-none focus:border-[#CCFF00]/40 [color-scheme:dark]" />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-black tracking-widest uppercase text-white/40 mb-2 block">Venue</label>
              <select value={venue} onChange={(e) => setVenue(e.target.value)} className="w-full h-11 rounded-xl bg-[#070A14] border border-white/10 px-3 text-[13px] text-white focus:outline-none focus:border-[#CCFF00]/40">
                {VENUES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-black text-white flex items-center gap-2"><Repeat className="w-4 h-4 text-[#7C3AED]" /> Two-Legged Tie</div>
                <div className="text-[11px] text-white/40 mt-0.5">Auto-creates Leg 1 & Leg 2 with reverse fixture</div>
              </div>
              <button
                onClick={() => setUseTwoLegged(!useTwoLegged)}
                role="switch"
                aria-checked={useTwoLegged}
                aria-label="Two-legged toggle"
                className={cn('relative w-12 h-7 rounded-full transition-colors duration-200 border shrink-0', useTwoLegged ? 'bg-[#7C3AED] border-[#7C3AED]' : 'bg-white/10 border-white/15')}
              >
                <span
                  className={cn(
                    'absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ease-in-out',
                    useTwoLegged ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>
            {useTwoLegged && (
              <div className="mt-3 text-[10px] text-[#A78BFA] flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3" /> Will create Leg 1 + Leg 2 (one week apart)
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => { generateFixture(homeId, awayId, date, time, venue, useTwoLegged); onClose(); }}
              className="flex-1 h-12 rounded-full bg-[#CCFF00] text-black text-[13px] font-black tracking-widest uppercase flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(204,255,0,0.3)] hover:shadow-[0_0_40px_rgba(204,255,0,0.5)] transition-shadow"
            >
              <Check className="w-4 h-4" /> {useTwoLegged ? 'Generate 2-Leg Tie' : 'Generate Fixture'}
            </button>
            <button onClick={onClose} className="h-12 px-6 rounded-full bg-white/5 border border-white/10 text-white text-[12px] font-bold tracking-wide hover:bg-white/10">Cancel</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main View ────────────────────────────────────────────
export function MatchesView() {
  const { matches, viewMode, useTwoLegged, setUseTwoLegged } = useStore();
  const [openGen, setOpenGen] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [editing, setEditing] = useState<Match | null>(null);
  const [teamInfoMatch, setTeamInfoMatch] = useState<Match | null>(null);
  const [matchInfoMatch, setMatchInfoMatch] = useState<Match | null>(null);

  const filtered = useMemo(() => {
    const list = filter === 'ALL' ? matches : matches.filter(m => m.status === filter);
    return list.slice().sort((a, b) => {
      const sa = STATUS_ORDER.indexOf(a.status);
      const sb = STATUS_ORDER.indexOf(b.status);
      if (sa !== sb) return sa - sb;
      return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
    });
  }, [matches, filter]);

  // Build one-row-per-result list, keeping chronological order.
  const rows = useMemo(() => {
    const consumed = new Set<string>();
    const out: ReactNode[] = [];
    for (const m of filtered) {
      if (consumed.has(m.id)) continue;
      if (m.fixtureGroupId) {
        const legs = filtered.filter(x => x.fixtureGroupId === m.fixtureGroupId);
        legs.forEach(l => consumed.add(l.id));
        if (legs.length >= 2 && legs.every(l => l.status === 'COMPLETED')) {
          out.push(<AggregateRow key={m.fixtureGroupId} legs={legs} viewMode={viewMode} onEditLeg={(lm) => setEditing(lm)} onTeamInfo={() => setTeamInfoMatch(legs[0])} onMatchInfo={() => setMatchInfoMatch(legs[0])} />);
        } else {
          legs.forEach(l => out.push(
            <MatchRow
              key={l.id}
              match={l}
              viewMode={viewMode}
              onUpdate={(patch) => useStore.getState().updateMatch(l.id, patch)}
              onDelete={() => useStore.getState().deleteMatch(l.id)}
              onEdit={() => setEditing(l)}
              onTeamInfo={() => setTeamInfoMatch(l)}
              onMatchInfo={() => setMatchInfoMatch(l)}
            />
          ));
        }
      } else {
        out.push(
          <MatchRow
            key={m.id}
            match={m}
            viewMode={viewMode}
            onUpdate={(patch) => useStore.getState().updateMatch(m.id, patch)}
            onDelete={() => useStore.getState().deleteMatch(m.id)}
            onEdit={() => setEditing(m)}
            onTeamInfo={() => setTeamInfoMatch(m)}
            onMatchInfo={() => setMatchInfoMatch(m)}
          />
        );
      }
    }
    return out;
  }, [filtered, viewMode]);

  const totals = useMemo(() => ({
    total: matches.length,
    live: matches.filter(m => m.status === 'LIVE').length,
    upcoming: matches.filter(m => m.status === 'UPCOMING').length,
    completed: matches.filter(m => m.status === 'COMPLETED').length,
  }), [matches]);

  return (
    <div className="space-y-5">
      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: 'Total', v: totals.total, c: '#FFFFFF' },
          { l: 'Live', v: totals.live, c: '#FF4D5A' },
          { l: 'Upcoming', v: totals.upcoming, c: '#00E5FF' },
          { l: 'Completed', v: totals.completed, c: '#CCFF00' },
        ].map(s => (
          <div key={s.l} className="rounded-2xl bg-white/[0.04] border border-white/8 p-4">
            <div className="text-[10px] tracking-widest uppercase text-white/40 font-bold">{s.l}</div>
            <div className="text-[28px] font-black mt-1.5 tracking-tight" style={{ color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Admin panel */}
      {viewMode === 'ADMIN' && (
        <div className="rounded-2xl bg-gradient-to-br from-[#CCFF00]/10 to-[#00E5FF]/5 border border-[#CCFF00]/20 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#CCFF00] flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-black" />
              </div>
              <div>
                <div className="text-[14px] font-black text-white uppercase tracking-wide">Admin Panel</div>
                <div className="text-[11px] text-white/40">Generate fixtures, edit events & scores, manage matches</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 px-3 h-10 rounded-full bg-white/5 border border-white/10">
                <Repeat className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span className="text-[11px] font-black tracking-widest uppercase text-white/70">Two-Legged</span>
                <button
                  onClick={() => setUseTwoLegged(!useTwoLegged)}
                  role="switch"
                  aria-checked={useTwoLegged}
                  aria-label="Two-legged toggle"
                  className={cn('relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0', useTwoLegged ? 'bg-[#7C3AED]' : 'bg-white/15')}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ease-in-out',
                      useTwoLegged ? 'translate-x-4' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
              <button
                onClick={() => setOpenGen(true)}
                className="h-10 px-4 rounded-full bg-[#CCFF00] text-black text-[12px] font-black tracking-widest uppercase flex items-center gap-2 hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-shadow"
              >
                <Plus className="w-4 h-4" /> Generate Fixture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {(['ALL', 'LIVE', 'UPCOMING', 'COMPLETED'] as StatusFilter[]).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              'h-9 px-4 rounded-full text-[11px] font-black tracking-widest uppercase border transition-colors',
              filter === s
                ? 'bg-white text-black border-white'
                : 'bg-white/[0.04] border-white/8 text-white/50 hover:text-white hover:border-white/15'
            )}
          >
            {s} {s !== 'ALL' && `(${matches.filter(m => m.status === s).length})`}
          </button>
        ))}
      </div>

      {/* One result per line */}
      <div className="space-y-3">
        {rows}
        {rows.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
            <Minus className="w-10 h-10 mx-auto mb-3 text-white/15" />
            <div className="text-[13px] font-bold text-white/50">No matches found</div>
            <div className="text-[11px] text-white/30 mt-1">Try a different filter or generate a new fixture</div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {openGen && <GenerateFixtureModal open={openGen} onClose={() => setOpenGen(false)} />}
        {editing && <MatchEditorModal match={editing} onClose={() => setEditing(null)} />}
        {teamInfoMatch && <TeamInfoModal match={teamInfoMatch} onClose={() => setTeamInfoMatch(null)} />}
        {matchInfoMatch && <MatchInfoModal match={matchInfoMatch} onClose={() => setMatchInfoMatch(null)} />}
      </AnimatePresence>
    </div>
  );
}
