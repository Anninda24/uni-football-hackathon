import { MatchStatus } from '../data/matches';
import { cn } from '../utils/cn';

const STYLES: Record<MatchStatus, string> = {
  LIVE: 'bg-red-500/15 border-red-500/30 text-red-400',
  UPCOMING: 'bg-[#00E5FF]/10 border-[#00E5FF]/25 text-[#00E5FF]',
  COMPLETED: 'bg-white/[0.06] border-white/15 text-white/55',
};

const LABELS: Record<MatchStatus, string> = {
  LIVE: 'LIVE',
  UPCOMING: 'Upcoming',
  COMPLETED: 'Full Time',
};

export function StatusBadge({
  status,
  minute,
  penalty,
}: {
  status: MatchStatus;
  minute?: number;
  /** True = match was decided by a penalty shootout → "Full Time (P)". */
  penalty?: boolean;
}) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black tracking-widest uppercase whitespace-nowrap',
      STYLES[status]
    )}>
      {status === 'LIVE' && <span className="relative flex w-2 h-2">
        <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-60" />
        <span className="relative w-2 h-2 rounded-full bg-red-500" />
      </span>}
      {LABELS[status]}
      {status === 'COMPLETED' && penalty && <span className="text-[#FFB800]">(P)</span>}
      {status === 'LIVE' && minute != null && <span className="text-white/60">· {minute}'</span>}
    </span>
  );
}
