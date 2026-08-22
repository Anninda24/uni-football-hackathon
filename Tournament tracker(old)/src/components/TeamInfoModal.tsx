import { motion } from 'framer-motion';
import { X, Users } from 'lucide-react';
import { Match } from '../data/matches';
import { getPlayer } from '../data/players';
import { getTeam } from '../data/teams';
import { TeamLogo } from './TeamLogo';
import { cn } from '../utils/cn';

function PlayerRow({ playerId, index }: { playerId: string; index: number }) {
  const p = getPlayer(playerId);
  return (
    <div className="flex items-center gap-2.5 p-1.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
      <span className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/10 text-[10px] font-black text-white/60 flex items-center justify-center shrink-0">
        {index}
      </span>
      {p && <img src={p.image} className="w-7 h-7 rounded-full object-cover border border-white/10 shrink-0" alt={p.name} />}
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-bold text-white truncate">{p?.name ?? playerId}</div>
      </div>
      <span className={cn(
        'text-[9px] font-black tracking-widest shrink-0',
        p?.position === 'GK' ? 'text-[#A78BFA]' : p?.position === 'DEF' ? 'text-[#00E5FF]' : p?.position === 'MID' ? 'text-[#FFB800]' : 'text-[#CCFF00]'
      )}>
        {p?.position ?? ''}
      </span>
    </div>
  );
}

function TeamBlock({ teamId, lineup }: { teamId: string; lineup: string[] }) {
  const team = getTeam(teamId);
  if (!team) return null;
  const xi = lineup.slice(0, 11);
  const subs = lineup.slice(11);
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
      <div className="flex items-center gap-3 mb-5">
        <TeamLogo teamId={teamId} size="md" />
        <div className="min-w-0">
          <div className="text-[14px] font-black text-white leading-tight truncate">{team.name}</div>
          <div className="text-[9px] tracking-widest uppercase text-white/40 font-bold mt-0.5">{team.short}</div>
        </div>
      </div>

      <div className="text-[10px] font-black tracking-widest uppercase text-white/45 mb-2 flex items-center gap-2">
        Starting XI <span className="text-white/25">· Main 11</span>
      </div>
      <div className="space-y-1 mb-5">
        {xi.map((pid, i) => (
          <PlayerRow key={pid} playerId={pid} index={i + 1} />
        ))}
        {xi.length === 0 && <div className="text-[11px] text-white/30 italic">No starting XI set</div>}
      </div>

      <div className="text-[10px] font-black tracking-widest uppercase text-white/45 mb-2">
        Substitutes <span className="text-white/25">· Extra Players</span>
      </div>
      <div className="space-y-1">
        {subs.map((pid, i) => (
          <PlayerRow key={pid} playerId={pid} index={11 + i + 1} />
        ))}
        {subs.length === 0 && <div className="text-[11px] text-white/30 italic">No substitutes listed</div>}
      </div>
    </div>
  );
}

export function TeamInfoModal({ match, onClose }: { match: Match; onClose: () => void }) {
  const home = getTeam(match.homeId);
  const away = getTeam(match.awayId);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[260] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 16 }}
        className="w-full max-w-[860px] max-h-[92vh] rounded-3xl bg-[#0F1424] border border-white/10 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/25 flex items-center justify-center">
            <Users className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-black text-white uppercase tracking-tight">Lineup</div>
            <div className="text-[10px] text-white/40 tracking-widest uppercase truncate">
              {home?.name} vs {away?.name} {match.fixtureGroupId ? `· Leg ${match.leg}` : ''}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center shrink-0">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scroll p-5">
          <div className="grid md:grid-cols-2 gap-4">
            <TeamBlock teamId={match.homeId} lineup={match.homeLineup ?? []} />
            <TeamBlock teamId={match.awayId} lineup={match.awayLineup ?? []} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10 shrink-0">
          <button
            onClick={onClose}
            className="w-full h-11 rounded-full bg-white/[0.06] border border-white/10 text-white text-[12px] font-black tracking-widest uppercase hover:bg-white/[0.1] transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
