import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Save, Target, Square, Crown, ChevronRight, ArrowUp, ArrowDown, Users } from 'lucide-react';
import { useStore } from '../store';
import { Match, MatchEvent, TeamStats } from '../data/matches';
import { PlayerStat, getPlayer } from '../data/players';
import { TeamLogo } from './TeamLogo';
import { cn } from '../utils/cn';

const emptyStats = (): TeamStats => ({ fouls: 0, corners: 0, tackles: 0 });

/* ── Shared compact field/button styles (single source of consistency) ── */
const FIELD =
  'h-7 min-w-0 rounded-md bg-[#060910] border border-white/[0.08] text-[11px] font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-[#CCFF00]/40 focus:ring-2 focus:ring-[#CCFF00]/10 transition-all duration-150';
const FIELD_SM =
  'h-7 shrink-0 rounded-md bg-[#060910] border border-white/[0.08] text-[10px] font-bold text-white/80 focus:outline-none focus:border-[#CCFF00]/40 transition-all duration-150';
const ICON_BTN =
  'w-6 h-6 shrink-0 rounded-md flex items-center justify-center transition-all duration-150 active:scale-90 disabled:opacity-30 disabled:pointer-events-none';
const MINUTE_INPUT =
  'w-full h-7 rounded-md bg-[#060910] border border-white/[0.08] px-1.5 pr-4 text-center text-[11px] font-black text-white focus:outline-none focus:border-[#CCFF00]/40 focus:ring-2 focus:ring-[#CCFF00]/10 transition-all duration-150';

const YellowMark = () => <span className="inline-block w-2 h-3 rounded-[2px] bg-[#FFB800] shadow-[0_0_5px_rgba(255,184,0,0.6)] align-middle" />;
const RedMark = () => <span className="inline-block w-2 h-3 rounded-[2px] bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.7)] align-middle" />;

/* ── Section header: title + count on left, "+" add button on right ── */
function SectionHead({
  icon, label, count, addLabel, open, onToggle, accent = '#CCFF00',
}: {
  icon: ReactNode;
  label: string;
  count: number;
  addLabel: string;
  open: boolean;
  onToggle: () => void;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-1.5 min-w-0">
      <span className="flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase text-white/40 min-w-0 truncate">
        {icon}
        <span className="truncate">{label}</span>
      </span>
      <span className="text-[9px] font-black text-white/25 shrink-0">({count})</span>
      <button
        onClick={onToggle}
        aria-label={`Add ${addLabel}`}
        title={`Add ${addLabel}`}
        className={cn(
          ICON_BTN,
          'ml-auto border',
          open
            ? 'text-black hover:brightness-95'
            : 'bg-white/[0.05] border-white/10 text-white/45 hover:text-white hover:bg-white/[0.1] hover:border-white/20'
        )}
        style={open ? { background: accent, borderColor: accent } : undefined}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ── Collapsible adder wrapper (opacity + transform only — GPU friendly) ── */
function AdderReveal({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="pt-1.5"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface RowProps {
  rows: MatchEvent[];
  players: PlayerStat[];
  allowAssist?: boolean;
  rowLabel: string;
  onUpdate: (index: number, patch: Partial<MatchEvent>) => void;
  onRemove: (index: number) => void;
}

/* ── Compact event row: [Player] [Min] [Type] [Assist] [🗑] — wraps on narrow screens ── */
function EventRows({ rows, players, allowAssist, rowLabel, onUpdate, onRemove }: RowProps) {
  if (rows.length === 0) return <div className="text-[10px] text-white/25 italic py-0.5">None added yet</div>;
  return (
    <div className="space-y-1">
      {rows.map((r, i) => (
        <div key={i} className="row-in flex flex-wrap items-center gap-1.5 min-w-0">
          <select
            value={r.playerId}
            onChange={(e) => onUpdate(i, { playerId: e.target.value })}
            aria-label={`${rowLabel} player`}
            className={cn(FIELD, 'flex-1 basis-[110px]')}
          >
            {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.jersey})</option>)}
          </select>
          <div className="relative w-11 shrink-0">
            <input
              type="number" min={0} max={120}
              value={r.minute}
              onChange={(e) => onUpdate(i, { minute: Math.max(0, Number(e.target.value) || 0) })}
              aria-label={`${rowLabel} minute`}
              className={MINUTE_INPUT}
            />
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-white/30 font-bold pointer-events-none">'</span>
          </div>
          {allowAssist && (
            <select
              value={r.isPenalty ? 'pen' : 'norm'}
              onChange={(e) => onUpdate(i, { isPenalty: e.target.value === 'pen' })}
              aria-label="Goal type"
              title="Goal type"
              className={cn(FIELD_SM, 'w-[76px]')}
            >
              <option value="norm">Normal</option>
              <option value="pen">Penalty (P)</option>
            </select>
          )}
          {allowAssist && (
            <>
              <select
                value={r.assistPlayerId ?? ''}
                onChange={(e) => onUpdate(i, { assistPlayerId: e.target.value || undefined })}
                aria-label="Assist player"
                className={cn(FIELD_SM, 'w-[88px] basis-[64px]')}
              >
                <option value="">No assist</option>
                {players.filter(p => p.id !== r.playerId).map(p => <option key={p.id} value={p.id}>🅰 {p.name.split(' ')[0]}</option>)}
              </select>
              <div className="relative w-10 shrink-0">
                <input
                  type="number" min={0} max={120}
                  value={r.assistMinute ?? r.minute}
                  disabled={!r.assistPlayerId}
                  onChange={(e) => onUpdate(i, { assistMinute: Math.max(0, Number(e.target.value) || 0) })}
                  aria-label="Assist minute"
                  title="Assist minute"
                  className={cn(MINUTE_INPUT, 'pr-3.5 text-[10px] disabled:opacity-30')}
                />
                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] text-white/30 font-bold pointer-events-none">'</span>
              </div>
            </>
          )}
          <button
            onClick={() => onRemove(i)}
            aria-label={`Delete ${rowLabel}`}
            title={`Delete ${rowLabel}`}
            className={cn(ICON_BTN, 'ml-auto bg-white/[0.04] hover:bg-red-500/15 text-white/35 hover:text-red-400')}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

interface AdderProps {
  players: PlayerStat[];
  addLabel: string;
  onAdd: (playerId: string, minute: number, assistId?: string, assistMinute?: number, isPenalty?: boolean) => void;
  allowAssist?: boolean;
}

/* ── Compact "add" row with inline form controls ── */
function EventAdder({ players, addLabel, onAdd, allowAssist }: AdderProps) {
  const [playerId, setPlayerId] = useState(players[0]?.id ?? '');
  const [minute, setMinute] = useState(1);
  const [assistId, setAssistId] = useState('');
  const [assistMinute, setAssistMinute] = useState(1);
  const [isPenalty, setIsPenalty] = useState(false);
  const canAdd = !!playerId && players.length > 0;
  return (
    <div className="row-in flex flex-wrap items-center gap-1.5 min-w-0">
      <select
        value={playerId}
        onChange={(e) => setPlayerId(e.target.value)}
        aria-label={`Select ${addLabel} player`}
        className={cn(FIELD, 'flex-1 basis-[110px]')}
      >
        {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.jersey})</option>)}
      </select>
      <div className="relative w-11 shrink-0">
        <input
          type="number" min={0} max={120} value={minute}
          onChange={(e) => setMinute(Math.max(0, Number(e.target.value) || 0))}
          aria-label={`${addLabel} minute`}
          className={MINUTE_INPUT}
        />
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-white/30 font-bold pointer-events-none">'</span>
      </div>
      {allowAssist && (
        <>
          <select
            value={isPenalty ? 'pen' : 'norm'}
            onChange={(e) => setIsPenalty(e.target.value === 'pen')}
            aria-label="Goal type"
            title="Goal type"
            className={cn(FIELD_SM, 'w-[76px]')}
          >
            <option value="norm">Normal</option>
            <option value="pen">Penalty (P)</option>
          </select>
          <select
            value={assistId}
            onChange={(e) => setAssistId(e.target.value)}
            aria-label="Assist player"
            className={cn(FIELD_SM, 'w-[88px] basis-[64px]')}
          >
            <option value="">No assist</option>
            {players.filter(p => p.id !== playerId).map(p => <option key={p.id} value={p.id}>🅰 {p.name.split(' ')[0]}</option>)}
          </select>
          <div className="relative w-10 shrink-0">
            <input
              type="number" min={0} max={120} value={assistMinute}
              disabled={!assistId}
              onChange={(e) => setAssistMinute(Math.max(0, Number(e.target.value) || 0))}
              aria-label="Assist minute"
              title="Assist minute"
              className={cn(MINUTE_INPUT, 'pr-3.5 text-[10px] disabled:opacity-30')}
            />
            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] text-white/30 font-bold pointer-events-none">'</span>
          </div>
        </>
      )}
      <button
        onClick={() => { if (canAdd) { onAdd(playerId, minute, allowAssist ? (assistId || undefined) : undefined, allowAssist ? (assistId ? assistMinute : undefined) : undefined, allowAssist ? isPenalty : undefined); setMinute(1); setAssistId(''); setAssistMinute(1); setIsPenalty(false); } }}
        disabled={!canAdd}
        aria-label={`Add ${addLabel}`}
        title={`Add ${addLabel}`}
        className={cn(ICON_BTN, 'ml-auto bg-[#CCFF00] text-black hover:bg-[#B8E000]')}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ── Dedicated assist adder — player + minute + optional related goal ── */
function AssistAdder({
  players, goals, onAdd,
}: {
  players: PlayerStat[];
  goals: MatchEvent[];
  onAdd: (playerId: string, minute: number, goalIdx: number) => void;
}) {
  const [playerId, setPlayerId] = useState(players[0]?.id ?? '');
  const [minute, setMinute] = useState(1);
  const [goalIdx, setGoalIdx] = useState(-1);
  const canAdd = !!playerId && players.length > 0;
  return (
    <div className="row-in flex flex-wrap items-center gap-1.5 min-w-0">
      <select
        value={playerId}
        onChange={(e) => setPlayerId(e.target.value)}
        aria-label="Select assist player"
        className={cn(FIELD, 'flex-1 basis-[110px]')}
      >
        {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.jersey})</option>)}
      </select>
      <div className="relative w-11 shrink-0">
        <input
          type="number" min={0} max={120} value={minute}
          onChange={(e) => setMinute(Math.max(0, Number(e.target.value) || 0))}
          aria-label="Assist minute"
          className={MINUTE_INPUT}
        />
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-white/30 font-bold pointer-events-none">'</span>
      </div>
      <select
        value={goalIdx}
        onChange={(e) => setGoalIdx(Number(e.target.value))}
        aria-label="Related goal"
        className={cn(FIELD_SM, 'w-[104px] basis-[80px]')}
      >
        <option value={-1}>No goal link</option>
        {goals.map((g, gi) => {
          const pl = getPlayer(g.playerId);
          return <option key={gi} value={gi}>⚽ {pl?.name.split(' ')[0] ?? ''} {g.minute}'</option>;
        })}
      </select>
      <button
        onClick={() => { if (canAdd) { onAdd(playerId, minute, goalIdx); setMinute(1); setGoalIdx(-1); } }}
        disabled={!canAdd}
        aria-label="Add assist"
        title="Add assist"
        className={cn(ICON_BTN, 'ml-auto bg-[#00E5FF] text-black hover:bg-[#00CCE0]')}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

type TeamState = { scorers: MatchEvent[]; yellows: MatchEvent[]; reds: MatchEvent[] };

/* ── One team block: compact sections for goals / assists / yellows / reds ── */
function TeamSection({
  match, side, players, state, setState, assists, setAssists,
}: {
  match: Match;
  side: 'home' | 'away';
  players: PlayerStat[];
  state: TeamState;
  setState: React.Dispatch<React.SetStateAction<TeamState>>;
  assists: MatchEvent[];
  setAssists: React.Dispatch<React.SetStateAction<MatchEvent[]>>;
}) {
  const team = useStore(s => s.teams.find(t => t.id === (side === 'home' ? match.homeId : match.awayId)))!;
  const teamName = side === 'home' ? 'Home' : 'Away';
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (k: string) => setOpen(open === k ? null : k);

  // Combined assist rows: goal-linked assists + standalone assists
  const goalAssists = state.scorers
    .map((s, gi) => s.assistPlayerId ? { key: `g${gi}`, goalIdx: gi, playerId: s.assistPlayerId!, minute: s.assistMinute ?? s.minute, goalPlayerId: s.playerId, goalMinute: s.minute } : null)
    .filter((x): x is NonNullable<typeof x> => x !== null);
  const standalone = assists.map((a, ai) => ({ key: `a${ai}`, goalIdx: -1, playerId: a.playerId, minute: a.assistMinute ?? a.minute, goalPlayerId: undefined, goalMinute: undefined }));
  const assistRows = [...goalAssists, ...standalone];

  const updateAssist = (key: string, patch: Partial<MatchEvent>) => {
    const linked = goalAssists.find(x => x.key === key);
    if (linked) {
      setState(prev => ({ ...prev, scorers: prev.scorers.map((r, j) => j === linked.goalIdx ? { ...r, assistPlayerId: patch.playerId, assistMinute: patch.minute } : r) }));
    } else {
      setAssists(prev => prev.map((a, ai) => `a${ai}` === key ? { ...a, ...patch } : a));
    }
  };
  const removeAssist = (key: string) => {
    const linked = goalAssists.find(x => x.key === key);
    if (linked) {
      setState(prev => ({ ...prev, scorers: prev.scorers.map((r, j) => j === linked.goalIdx ? { ...r, assistPlayerId: undefined, assistMinute: undefined } : r) }));
    } else {
      setAssists(prev => prev.filter((_, ai) => `a${ai}` !== key));
    }
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0D1322]/90 p-3.5 space-y-3.5 min-w-0">
      <div className="flex items-center gap-2 min-w-0">
        <TeamLogo teamId={team.id} size="xs" />
        <span className="text-[11px] font-black text-white uppercase tracking-wide truncate">{team.short}</span>
        <span className="text-[8px] text-white/30 font-black tracking-widest uppercase ml-auto shrink-0">{teamName}</span>
      </div>

      {/* Goals */}
      <div className="min-w-0">
        <SectionHead
          icon={<Target className="w-3 h-3 text-[#CCFF00]" />}
          label="Goals"
          count={state.scorers.length}
          addLabel="goal"
          open={open === 'goals'}
          onToggle={() => toggle('goals')}
        />
        <EventRows
          rows={state.scorers}
          players={players}
          allowAssist
          rowLabel="goal"
          onUpdate={(i, patch) => setState(prev => ({ ...prev, scorers: prev.scorers.map((r, j) => j === i ? { ...r, ...patch } : r) }))}
          onRemove={(i) => setState(prev => ({ ...prev, scorers: prev.scorers.filter((_, j) => j !== i) }))}
        />
        <AdderReveal open={open === 'goals'}>
          <EventAdder
            players={players}
            addLabel="goal"
            allowAssist
            onAdd={(playerId, minute, assistId, assistMinute, isPenalty) => setState(prev => ({ ...prev, scorers: [...prev.scorers, { playerId, minute, assistPlayerId: assistId, assistMinute, isPenalty }] }))}
          />
        </AdderReveal>
      </div>

      {/* Assists */}
      <div className="min-w-0">
        <SectionHead
          icon={<span className="text-[10px] text-[#00E5FF] font-black leading-none">🅰</span>}
          label="Assists"
          count={assistRows.length}
          addLabel="assist"
          open={open === 'assists'}
          onToggle={() => toggle('assists')}
          accent="#00E5FF"
        />
        {assistRows.length === 0 && <div className="text-[10px] text-white/25 italic py-0.5">None added yet</div>}
        <div className="space-y-1">
          {assistRows.map(row => (
            <div key={row.key} className="row-in flex flex-wrap items-center gap-1.5 min-w-0">
              <span className="text-[10px] text-[#00E5FF] shrink-0">🅰</span>
              <select
                value={row.playerId}
                onChange={(e) => updateAssist(row.key, { playerId: e.target.value })}
                aria-label="Assist player"
                className={cn(FIELD, 'flex-1 basis-[100px]')}
              >
                {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.jersey})</option>)}
              </select>
              <div className="relative w-11 shrink-0">
                <input
                  type="number" min={0} max={120} value={row.minute}
                  onChange={(e) => updateAssist(row.key, { minute: Math.max(0, Number(e.target.value) || 0) })}
                  aria-label="Assist minute"
                  className={MINUTE_INPUT}
                />
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-white/30 font-bold pointer-events-none">'</span>
              </div>
              {row.goalIdx >= 0 && (
                <span className="text-[9px] text-white/35 shrink-0 max-w-[76px] truncate hidden sm:inline" title={`For ${row.goalPlayerId}`}>
                  for ⚽ {getPlayer(row.goalPlayerId)?.name.split(' ')[0] ?? ''}
                </span>
              )}
              <button
                onClick={() => removeAssist(row.key)}
                aria-label="Delete assist"
                title="Delete assist"
                className={cn(ICON_BTN, 'ml-auto bg-white/[0.04] hover:bg-red-500/15 text-white/35 hover:text-red-400')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <AdderReveal open={open === 'assists'}>
          <AssistAdder
            players={players}
            goals={state.scorers}
            onAdd={(playerId, minute, goalIdx) => {
              if (goalIdx >= 0) {
                setState(prev => ({ ...prev, scorers: prev.scorers.map((s, j) => j === goalIdx ? { ...s, assistPlayerId: playerId, assistMinute: minute } : s) }));
              } else {
                setAssists(prev => [...prev, { playerId, minute }]);
              }
            }}
          />
        </AdderReveal>
      </div>

      {/* Yellows */}
      <div className="min-w-0">
        <SectionHead
          icon={<YellowMark />}
          label="Yellow Cards"
          count={state.yellows.length}
          addLabel="yellow card"
          open={open === 'yellows'}
          onToggle={() => toggle('yellows')}
          accent="#FFB800"
        />
        <EventRows
          rows={state.yellows}
          players={players}
          rowLabel="yellow card"
          onUpdate={(i, patch) => setState(prev => ({ ...prev, yellows: prev.yellows.map((r, j) => j === i ? { ...r, ...patch } : r) }))}
          onRemove={(i) => setState(prev => ({ ...prev, yellows: prev.yellows.filter((_, j) => j !== i) }))}
        />
        <AdderReveal open={open === 'yellows'}>
          <EventAdder
            players={players}
            addLabel="yellow card"
            onAdd={(playerId, minute) => setState(prev => ({ ...prev, yellows: [...prev.yellows, { playerId, minute }] }))}
          />
        </AdderReveal>
      </div>

      {/* Reds */}
      <div className="min-w-0">
        <SectionHead
          icon={<RedMark />}
          label="Red Cards"
          count={state.reds.length}
          addLabel="red card"
          open={open === 'reds'}
          onToggle={() => toggle('reds')}
          accent="#FF4D5A"
        />
        <EventRows
          rows={state.reds}
          players={players}
          rowLabel="red card"
          onUpdate={(i, patch) => setState(prev => ({ ...prev, reds: prev.reds.map((r, j) => j === i ? { ...r, ...patch } : r) }))}
          onRemove={(i) => setState(prev => ({ ...prev, reds: prev.reds.filter((_, j) => j !== i) }))}
        />
        <AdderReveal open={open === 'reds'}>
          <EventAdder
            players={players}
            addLabel="red card"
            onAdd={(playerId, minute) => setState(prev => ({ ...prev, reds: [...prev.reds, { playerId, minute }] }))}
          />
        </AdderReveal>
      </div>
    </div>
  );
}

/* ── Admin lineup manager — Starting XI (exactly 11) + Substitutes (5–6) ── */
function LineupManager({
  teamShort, lineup, setLineup, roster,
}: {
  teamShort: string;
  lineup: string[];
  setLineup: (l: string[]) => void;
  roster: PlayerStat[];
}) {
  const [pickXi, setPickXi] = useState('');
  const [pickSub, setPickSub] = useState('');
  const xi = lineup.slice(0, 11);
  const subs = lineup.slice(11);
  const inLineup = new Set(lineup);
  const available = roster.filter(p => !inLineup.has(p.id));

  const changeAt = (idx: number, pid: string) => {
    if (!pid) return;
    const next = [...lineup];
    next[idx] = pid;
    setLineup(next);
  };
  const removeAt = (idx: number) => setLineup(lineup.filter((_, i) => i !== idx));
  const swapSlots = (a: number, b: number) => {
    const next = [...lineup];
    [next[a], next[b]] = [next[b], next[a]];
    setLineup(next);
  };
  const addToXi = () => {
    if (!pickXi) return;
    const next = [...lineup];
    next.splice(Math.min(10, next.length), 0, pickXi);
    setLineup(next);
    setPickXi('');
  };
  const addToSubs = () => {
    if (!pickSub) return;
    setLineup([...lineup, pickSub]);
    setPickSub('');
  };

  const slot = (idx: number) => {
    const pid = lineup[idx];
    return roster.find(x => x.id === pid) ?? getPlayer(pid);
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0D1322]/90 p-3.5 min-w-0">
      <div className="flex items-center gap-2 mb-2.5 min-w-0">
        <span className="text-[11px] font-black tracking-widest uppercase text-white/80 truncate">{teamShort}</span>
        <span className="text-[8px] text-white/30 font-bold uppercase tracking-widest ml-auto shrink-0">
          {xi.length}/11 XI · {subs.length}/6 SUB
        </span>
      </div>

      <div className="text-[8px] font-black tracking-widest uppercase text-[#CCFF00] mb-1.5">Starting XI · Main 11</div>
      <div className="space-y-1 mb-2.5">
        {Array.from({ length: 11 }).map((_, i) => {
          const p = slot(i);
          return (
            <div key={i} className="flex items-center gap-1.5 min-w-0">
              <span className={cn(
                'w-5 h-5 rounded text-[9px] font-black flex items-center justify-center shrink-0',
                p ? 'bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/25' : 'bg-white/[0.04] text-white/25 border border-dashed border-white/15'
              )}>{i + 1}</span>
              <select
                value={p?.id ?? ''}
                onChange={(e) => changeAt(i, e.target.value)}
                aria-label={`Starting XI player ${i + 1}`}
                className={cn(
                  'h-6 min-w-0 flex-1 basis-[90px] rounded-md bg-[#060910] border px-1.5 text-[10px] font-bold focus:outline-none transition-all duration-150',
                  p ? 'border-white/[0.08] text-white focus:border-[#CCFF00]/40' : 'border-dashed border-white/15 text-white/30'
                )}
              >
                <option value="">— Player {i + 1} —</option>
                {roster.map(pl => <option key={pl.id} value={pl.id}>{pl.name} ({pl.jersey})</option>)}
              </select>
              <button
                onClick={() => swapSlots(i, 10)}
                disabled={!p || i === 10}
                aria-label="Send to substitutes"
                title="Send to substitutes"
                className={cn(ICON_BTN, 'bg-white/[0.04] hover:bg-white/[0.12] text-white/40 hover:text-white')}
              >
                <ArrowDown className="w-3 h-3" />
              </button>
              {p && (
                <button
                  onClick={() => removeAt(i)}
                  aria-label={`Remove starting player ${i + 1}`}
                  title="Remove"
                  className={cn(ICON_BTN, 'bg-white/[0.04] hover:bg-red-500/15 text-white/40 hover:text-red-400')}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 mb-2.5">
        <select
          value={pickXi}
          onChange={(e) => setPickXi(e.target.value)}
          aria-label="Add to Starting XI"
          className={cn(FIELD, 'flex-1 basis-[90px]')}
        >
          <option value="">Add to Starting XI…</option>
          {available.map(p => <option key={p.id} value={p.id}>{p.name} ({p.jersey})</option>)}
        </select>
        <button
          onClick={addToXi}
          disabled={!pickXi}
          aria-label="Add to Starting XI"
          title="Add to Starting XI"
          className={cn(ICON_BTN, 'bg-[#CCFF00] text-black hover:bg-[#B8E000]')}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="text-[8px] font-black tracking-widest uppercase text-white/45 mb-1.5">Substitutes · Extra Players</div>
      <div className="space-y-1 mb-2.5">
        {subs.map((pid, idx) => {
          const p = roster.find(x => x.id === pid) ?? getPlayer(pid);
          const globalIdx = 11 + idx;
          return (
            <div key={pid} className="flex items-center gap-1.5 min-w-0">
              <span className="w-5 h-5 rounded text-[9px] font-black bg-white/[0.06] text-white/40 border border-white/10 flex items-center justify-center shrink-0">
                {globalIdx + 1}
              </span>
              <select
                value={pid}
                onChange={(e) => changeAt(globalIdx, e.target.value)}
                aria-label={`Substitute ${idx + 1}`}
                className={cn(FIELD, 'flex-1 basis-[90px]')}
              >
                <option value="">— Select substitute —</option>
                {roster.map(pl => <option key={pl.id} value={pl.id}>{pl.name} ({pl.jersey})</option>)}
              </select>
              <button
                onClick={() => swapSlots(globalIdx, 10)}
                disabled={!p}
                aria-label="Promote to starting XI"
                title="Promote to starting XI"
                className={cn(ICON_BTN, 'bg-white/[0.04] hover:bg-white/[0.12] text-white/40 hover:text-white')}
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => removeAt(globalIdx)}
                aria-label={`Remove substitute ${idx + 1}`}
                title="Remove"
                className={cn(ICON_BTN, 'bg-white/[0.04] hover:bg-red-500/15 text-white/40 hover:text-red-400')}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          );
        })}
        {subs.length === 0 && <div className="text-[10px] text-white/25 italic py-0.5">No substitutes yet</div>}
      </div>

      <div className="flex items-center gap-1.5">
        <select
          value={pickSub}
          onChange={(e) => setPickSub(e.target.value)}
          aria-label="Add substitute"
          className={cn(FIELD, 'flex-1 basis-[90px]')}
        >
          <option value="">Add substitute…</option>
          {available.map(p => <option key={p.id} value={p.id}>{p.name} ({p.jersey})</option>)}
        </select>
        <button
          onClick={addToSubs}
          disabled={!pickSub}
          aria-label="Add substitute"
          title="Add substitute"
          className={cn(ICON_BTN, 'bg-white/10 hover:bg-white/20 text-white')}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="mt-2.5 text-[8px] text-white/25">Save requires: Starting XI = exactly 11 · Substitutes = 5–6 · No duplicates</div>
    </div>
  );
}

/* ── Main modal ── */
export function MatchEditorModal({ match, onClose }: { match: Match; onClose: () => void }) {
  const { teams, players, updateMatch, addToast } = useStore();
  const home = teams.find(t => t.id === match.homeId)!;
  const away = teams.find(t => t.id === match.awayId)!;
  const homePlayers = players.filter(p => p.teamId === match.homeId);
  const awayPlayers = players.filter(p => p.teamId === match.awayId);

  const [homeScore, setHomeScore] = useState(match.homeScore);
  const [awayScore, setAwayScore] = useState(match.awayScore);
  const [status, setStatus] = useState(match.status);
  const [minute, setMinute] = useState(match.minute ?? 1);

  const [homeState, setHomeState] = useState({
    scorers: match.homeScorers ?? [],
    yellows: match.homeYellows ?? [],
    reds: match.homeRedCards ?? [],
  });
  const [awayState, setAwayState] = useState({
    scorers: match.awayScorers ?? [],
    yellows: match.awayYellows ?? [],
    reds: match.awayRedCards ?? [],
  });

  const [homeStats, setHomeStats] = useState<TeamStats>(match.homeStats ?? emptyStats());
  const [awayStats, setAwayStats] = useState<TeamStats>(match.awayStats ?? emptyStats());
  const [mvpId, setMvpId] = useState(match.mvpId ?? '');
  const [homeLineup, setHomeLineup] = useState<string[]>(match.homeLineup ?? []);
  const [awayLineup, setAwayLineup] = useState<string[]>(match.awayLineup ?? []);
  const [homeAssists, setHomeAssists] = useState<MatchEvent[]>(match.homeAssists ?? []);
  const [awayAssists, setAwayAssists] = useState<MatchEvent[]>(match.awayAssists ?? []);
  const [penEnabled, setPenEnabled] = useState(match.penaltyHome != null);
  const [penHome, setPenHome] = useState(match.penaltyHome ?? 0);
  const [penAway, setPenAway] = useState(match.penaltyAway ?? 0);

  /** Validate a team's lineup: XI = exactly 11, subs = 5–6, no duplicates, all from the correct team. */
  const validateLineup = (lineup: string[], teamName: string, roster: PlayerStat[]): string[] => {
    const issues: string[] = [];
    if (lineup.length < 11) issues.push(`${teamName}: Starting XI must be exactly 11 players (${lineup.length} selected).`);
    const subsCount = Math.max(0, lineup.length - 11);
    if (lineup.length >= 11 && (subsCount < 5 || subsCount > 6)) issues.push(`${teamName}: Substitutes must be 5–6 players (${subsCount} selected).`);
    if (new Set(lineup).size !== lineup.length) issues.push(`${teamName}: A player cannot appear twice in the same lineup.`);
    const rosterIds = new Set(roster.map(p => p.id));
    const wrong = lineup.find(pid => !rosterIds.has(pid));
    if (wrong) issues.push(`${teamName}: Selected player is not in this team's roster.`);
    return issues;
  };

  const handleSave = () => {
    const issues = [
      ...validateLineup(homeLineup, home.short, homePlayers),
      ...validateLineup(awayLineup, away.short, awayPlayers),
    ];
    if (issues.length > 0) {
      addToast({ type: 'error', message: issues[0] });
      return;
    }
    updateMatch(match.id, {
      homeScore,
      awayScore,
      status,
      minute: status === 'LIVE' ? minute : undefined,
      homeScorers: homeState.scorers,
      awayScorers: awayState.scorers,
      homeYellows: homeState.yellows,
      awayYellows: awayState.yellows,
      homeRedCards: homeState.reds,
      awayRedCards: awayState.reds,
      homeStats,
      awayStats,
      mvpId: mvpId || undefined,
      homeLineup,
      awayLineup,
      homeAssists,
      awayAssists,
      penaltyHome: penEnabled ? penHome : undefined,
      penaltyAway: penEnabled ? penAway : undefined,
    });
    addToast({ type: 'success', message: `${home.short} ${homeScore}-${awayScore} ${away.short} saved` });
    onClose();
  };

  const StatInput = ({ label, stats, setStats }: { label: string; stats: TeamStats; setStats: (s: TeamStats) => void }) => (
    <label className="flex items-center justify-between gap-2 px-2.5 h-8 rounded-md bg-[#060910] border border-white/[0.08] focus-within:border-[#CCFF00]/40 transition-all duration-150">
      <span className="text-[9px] font-black tracking-widest uppercase text-white/40">{label}</span>
      <input
        type="number" min={0} value={stats[label as keyof TeamStats]}
        onChange={(e) => setStats({ ...stats, [label]: Math.max(0, Number(e.target.value) || 0) })}
        aria-label={label}
        className="w-12 bg-transparent text-right text-[12px] font-black text-white focus:outline-none"
      />
    </label>
  );

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
        className="w-full max-w-[720px] max-h-[92vh] rounded-2xl bg-[#0A0E1A] border border-white/10 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — compact */}
        <div className="px-4 py-3 border-b border-white/[0.07] flex items-center gap-3 shrink-0 bg-[#0C1120]">
          <TeamLogo teamId={match.homeId} size="xs" />
          <div className="flex-1 min-w-0 text-center">
            <div className="text-[13px] font-black text-white uppercase tracking-tight truncate">{home.name} vs {away.name}</div>
            <div className="text-[9px] text-white/35 tracking-widest uppercase">
              {match.fixtureGroupId ? `Two-Legged · Leg ${match.leg}` : 'Single Match'}
            </div>
          </div>
          <TeamLogo teamId={match.awayId} size="xs" />
          <button
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className="ml-1 w-7 h-7 rounded-md bg-white/[0.05] hover:bg-white/[0.12] text-white/60 hover:text-white flex items-center justify-center shrink-0 transition-all duration-150 active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body — compact sections */}
        <div className="flex-1 overflow-y-auto custom-scroll overscroll-contain p-4 space-y-4">
          {/* Status + score */}
          <div className="rounded-xl border border-white/[0.06] bg-[#0D1322]/90 p-3.5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black tracking-widest uppercase text-white/40">Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Match['status'])}
                  aria-label="Match status"
                  className={cn(FIELD_SM, 'w-[104px]')}
                >
                  <option value="UPCOMING">Upcoming</option>
                  <option value="LIVE">Live</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              {status === 'LIVE' && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black tracking-widest uppercase text-white/40">Min</span>
                  <div className="relative w-14">
                    <input
                      type="number" min={0} max={120} value={minute}
                      onChange={(e) => setMinute(Math.max(0, Number(e.target.value) || 0))}
                      aria-label="Match minute"
                      className={MINUTE_INPUT}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-white/30 font-bold pointer-events-none">'</span>
                  </div>
                </div>
              )}
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[9px] font-black tracking-widest uppercase text-white/40">Score</span>
                <input
                  type="number" min={0} value={homeScore}
                  onChange={(e) => setHomeScore(Math.max(0, Number(e.target.value) || 0))}
                  aria-label="Home score"
                  className="w-12 h-9 rounded-lg bg-[#060910] border border-white/[0.08] text-center text-[18px] font-black text-white focus:outline-none focus:border-[#CCFF00]/40 focus:ring-2 focus:ring-[#CCFF00]/10 transition-all duration-150"
                />
                <span className="text-white/25 text-[14px] font-black">:</span>
                <input
                  type="number" min={0} value={awayScore}
                  onChange={(e) => setAwayScore(Math.max(0, Number(e.target.value) || 0))}
                  aria-label="Away score"
                  className="w-12 h-9 rounded-lg bg-[#060910] border border-white/[0.08] text-center text-[18px] font-black text-white focus:outline-none focus:border-[#CCFF00]/40 focus:ring-2 focus:ring-[#CCFF00]/10 transition-all duration-150"
                />
              </div>
            </div>
          </div>

          {/* Events: two team columns */}
          <div className="grid md:grid-cols-2 gap-3">
            <TeamSection match={match} side="home" players={homePlayers} state={homeState} setState={setHomeState} assists={homeAssists} setAssists={setHomeAssists} />
            <TeamSection match={match} side="away" players={awayPlayers} state={awayState} setState={setAwayState} assists={awayAssists} setAssists={setAwayAssists} />
          </div>

          {/* Team stats */}
          <div className="rounded-xl border border-white/[0.06] bg-[#0D1322]/90 p-3.5">
            <div className="flex items-center gap-1.5 text-[9px] font-black tracking-widest uppercase text-white/40 mb-2.5">
              <Square className="w-3 h-3 text-[#00E5FF]" /> Match Statistics
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="space-y-1.5">
                <div className="text-[8px] font-black tracking-widest uppercase text-white/30 text-center">{home.short}</div>
                <StatInput label="fouls" stats={homeStats} setStats={setHomeStats} />
                <StatInput label="corners" stats={homeStats} setStats={setHomeStats} />
                <StatInput label="tackles" stats={homeStats} setStats={setHomeStats} />
              </div>
              <div className="flex items-center justify-center text-[9px] font-black tracking-widest uppercase text-white/25">vs</div>
              <div className="space-y-1.5">
                <div className="text-[8px] font-black tracking-widest uppercase text-white/30 text-center">{away.short}</div>
                <StatInput label="fouls" stats={awayStats} setStats={setAwayStats} />
                <StatInput label="corners" stats={awayStats} setStats={setAwayStats} />
                <StatInput label="tackles" stats={awayStats} setStats={setAwayStats} />
              </div>
            </div>
          </div>

          {/* Penalty shootout */}
          <div className="rounded-xl border border-white/[0.06] bg-[#0D1322]/90 p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-[9px] font-black tracking-widest uppercase text-white/40">
                <Target className="w-3 h-3 text-[#FF4D5A]" /> Penalty Shootout
              </div>
              <div className="flex items-center gap-0.5 p-0.5 rounded-md bg-white/[0.04] border border-white/10">
                <button
                  onClick={() => setPenEnabled(false)}
                  aria-label="Disable penalty shootout"
                  className={cn('h-5 px-2.5 rounded text-[9px] font-black tracking-widest uppercase transition-all duration-150', !penEnabled ? 'bg-white text-black' : 'text-white/45 hover:text-white')}
                >No</button>
                <button
                  onClick={() => setPenEnabled(true)}
                  aria-label="Enable penalty shootout"
                  className={cn('h-5 px-2.5 rounded text-[9px] font-black tracking-widest uppercase transition-all duration-150', penEnabled ? 'bg-[#FF4D5A] text-black' : 'text-white/45 hover:text-white')}
                >Yes</button>
              </div>
            </div>
            {penEnabled && (
              <div className="grid grid-cols-2 gap-2.5 row-in">
                <div>
                  <label className="text-[9px] font-bold tracking-widest uppercase text-white/40 mb-1 block">{home.short} Penalty Score</label>
                  <input
                    type="number" min={0} max={20} value={penHome}
                    onChange={(e) => setPenHome(Math.max(0, Number(e.target.value) || 0))}
                    aria-label="Home penalty score"
                    className="w-full h-8 rounded-md bg-[#060910] border border-white/[0.08] text-center text-[15px] font-black text-white focus:outline-none focus:border-[#FF4D5A]/40 transition-all duration-150"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold tracking-widest uppercase text-white/40 mb-1 block">{away.short} Penalty Score</label>
                  <input
                    type="number" min={0} max={20} value={penAway}
                    onChange={(e) => setPenAway(Math.max(0, Number(e.target.value) || 0))}
                    aria-label="Away penalty score"
                    className="w-full h-8 rounded-md bg-[#060910] border border-white/[0.08] text-center text-[15px] font-black text-white focus:outline-none focus:border-[#FF4D5A]/40 transition-all duration-150"
                  />
                </div>
              </div>
            )}
            <div className="mt-2 text-[9px] text-white/30 flex items-center gap-1">
              <ChevronRight className="w-2.5 h-2.5" /> Shootout score is separate from the normal score — never added to it
            </div>
          </div>

          {/* MVP */}
          <div className="rounded-xl border border-white/[0.06] bg-[#0D1322]/90 p-3.5">
            <div className="flex items-center gap-1.5 text-[9px] font-black tracking-widest uppercase text-white/40 mb-2">
              <Crown className="w-3 h-3 text-[#FFB800]" /> Player of the Match
            </div>
            <select
              value={mvpId}
              onChange={(e) => setMvpId(e.target.value)}
              aria-label="MVP player"
              className={cn(FIELD, 'w-full')}
            >
              <option value="">— Not selected —</option>
              <optgroup label={home.short}>
                {homePlayers.map(p => <option key={p.id} value={p.id}>{p.name} ({p.jersey})</option>)}
              </optgroup>
              <optgroup label={away.short}>
                {awayPlayers.map(p => <option key={p.id} value={p.id}>{p.name} ({p.jersey})</option>)}
              </optgroup>
            </select>
            <div className="mt-1.5 text-[9px] text-white/30 flex items-center gap-1">
              <ChevronRight className="w-2.5 h-2.5" /> MVP is only shown publicly for completed matches
            </div>
          </div>

          {/* Lineup */}
          <div>
            <div className="flex items-center gap-1.5 text-[9px] font-black tracking-widest uppercase text-white/40 mb-2">
              <Users className="w-3 h-3 text-[#00E5FF]" /> Lineup
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <LineupManager teamShort={`${home.short} · Home`} lineup={homeLineup} setLineup={setHomeLineup} roster={homePlayers} />
              <LineupManager teamShort={`${away.short} · Away`} lineup={awayLineup} setLineup={setAwayLineup} roster={awayPlayers} />
            </div>
          </div>
        </div>

        {/* Footer — compact, always visible */}
        <div className="px-4 py-3 border-t border-white/[0.07] flex items-center gap-2 shrink-0 bg-[#0C1120]">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg bg-white/[0.05] border border-white/10 text-white text-[11px] font-bold tracking-wide hover:bg-white/[0.1] transition-all duration-150 active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 h-9 rounded-lg bg-[#CCFF00] text-black text-[11px] font-black tracking-widest uppercase flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(204,255,0,0.25)] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] hover:brightness-95 transition-all duration-150 active:scale-[0.98]"
          >
            <Save className="w-3.5 h-3.5" /> Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
