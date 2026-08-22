import { useMemo, useState } from 'react';
import { Crown, TrendingUp, TrendingDown, Minus, Repeat } from 'lucide-react';
import { useStore, computeStandings } from '../store';
import { getTeam } from '../data/teams';
import { TeamLogo } from '../components/TeamLogo';
import { cn } from '../utils/cn';

type TableMode = 'ALL' | 'SINGLE' | 'TWOLEG';

export function PointsTableView() {
  const matches = useStore((s) => s.matches);
  const teams = useStore((s) => s.teams);
  const [mode, setMode] = useState<TableMode>('ALL');

  // Assumption: only COMPLETED matches count toward the standings.
  // SINGLE = matches without a fixtureGroupId; TWOLEG = two-legged ties only
  // (aggregated once per pair — handled inside computeStandings).
  const standings = useMemo(() => {
    const filtered = mode === 'ALL' ? matches : matches.filter(m => (mode === 'SINGLE') === !m.fixtureGroupId);
    return computeStandings(filtered, teams);
  }, [matches, teams, mode]);
  const leader = standings[0];

  // Top 3 teams
  const podium = standings.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Podium / leader strip */}
      {leader && (
        <div className="rounded-3xl border border-[#CCFF00]/20 bg-gradient-to-br from-[#CCFF00]/10 via-[#0F1424] to-[#7C3AED]/10 p-6 md:p-8 overflow-hidden relative">
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#CCFF00]/10 blur-3xl" />
          <div className="relative grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <div className="text-[10px] font-black tracking-[0.3em] uppercase text-[#CCFF00]">League Leader</div>
              <div className="mt-2 flex items-center gap-4">
                <TeamLogo teamId={leader.teamId} size="xl" />
                <div>
                  <div className="text-[28px] md:text-[36px] font-black text-white tracking-tight leading-none">{getTeam(leader.teamId)?.name}</div>
                  <div className="mt-2 flex items-center gap-3 text-[12px] text-white/60 font-bold">
                    <span className="flex items-center gap-1"><Crown className="w-3.5 h-3.5 text-[#FFB800]" /> 1st Place</span>
                    <span>·</span>
                    <span>{leader.played} MP</span>
                    <span>·</span>
                    <span className="text-emerald-400">+{leader.goalDifference} GD</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 min-w-[260px]">
              {podium.map((s, i) => {
                const t = getTeam(s.teamId);
                if (!t) return null;
                return (
                  <div key={s.teamId} className={cn(
                    'rounded-2xl p-3 text-center border',
                    i === 0 ? 'bg-[#FFB800]/10 border-[#FFB800]/30' :
                    i === 1 ? 'bg-white/[0.06] border-white/15' :
                    'bg-[#CD7F32]/10 border-[#CD7F32]/30'
                  )}>
                    <div className="text-[9px] font-black tracking-widest uppercase text-white/50">
                      {i === 0 ? '1st' : i === 1 ? '2nd' : '3rd'}
                    </div>
                    <TeamLogo teamId={s.teamId} size="sm" className="justify-center mt-2" />
                    <div className="text-[11px] font-black text-white mt-1.5">{t.short}</div>
                    <div className="text-[16px] font-black text-white mt-1">{s.points} pts</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl bg-white/[0.04] border border-white/8 overflow-hidden backdrop-blur">
        <div className="p-5 border-b border-white/8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[14px] font-black text-white uppercase tracking-wide">Standings</div>
            <div className="text-[11px] text-white/40">Auto-calculated from completed matches · Two-legged ties count once on aggregate</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10">
              {([
                { id: 'ALL', l: 'All' },
                { id: 'SINGLE', l: 'Single' },
                { id: 'TWOLEG', l: <span className="inline-flex items-center gap-1"><Repeat className="w-3 h-3" /> Two-Leg</span> },
              ] as { id: TableMode; l: React.ReactNode }[]).map(t => (
                <button
                  key={t.id}
                  onClick={() => setMode(t.id)}
                  className={cn(
                    'h-7 px-3 rounded-full text-[10px] font-black tracking-widest uppercase transition-colors',
                    mode === t.id ? 'bg-white text-black' : 'text-white/45 hover:text-white'
                  )}
                >
                  {t.l}
                </button>
              ))}
            </div>
            <div className="text-[10px] font-black tracking-widest uppercase text-white/30">Tiebreaker: GD → GF</div>
          </div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-left min-w-[760px]">
            <thead className="text-[10px] tracking-widest uppercase text-white/30 border-b border-white/5 bg-white/[0.02]">
              <tr>
                <th className="p-4 font-bold text-center w-14">#</th>
                <th className="p-4 font-bold">Team</th>
                <th className="p-4 font-bold text-center" title="Matches Played">MP</th>
                <th className="p-4 font-bold text-center" title="Won">W</th>
                <th className="p-4 font-bold text-center" title="Drawn">D</th>
                <th className="p-4 font-bold text-center" title="Lost">L</th>
                <th className="p-4 font-bold text-center" title="Goals For">GF</th>
                <th className="p-4 font-bold text-center" title="Goals Against">GA</th>
                <th className="p-4 font-bold text-center" title="Goal Difference">GD</th>
                <th className="p-4 font-bold text-center">Pts</th>
                <th className="p-4 font-bold text-center w-20">Form</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, idx) => {
                const t = getTeam(s.teamId);
                if (!t) return null;
                const isLeader = idx === 0;
                const isTop4 = idx < 4;
                return (
                  <tr
                    key={s.teamId}
                    className={cn(
                      'border-b border-white/[0.04] hover:bg-white/[0.04] transition-colors',
                      isLeader && 'bg-[#CCFF00]/[0.06]',
                      isTop4 && !isLeader && 'bg-[#CCFF00]/[0.02]'
                    )}
                  >
                    <td className="p-4 text-center">
                      <span className={cn(
                        'inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-black',
                        isLeader ? 'bg-[#FFB800] text-black' : 'text-white/40'
                      )}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <TeamLogo teamId={s.teamId} size="sm" />
                        <div>
                          <div className="text-[13px] font-black text-white leading-tight">{t.name}</div>
                          <div className="text-[10px] text-white/40 tracking-widest uppercase">{t.short}</div>
                        </div>
                        {isLeader && <Crown className="w-4 h-4 text-[#FFB800]" />}
                      </div>
                    </td>
                    <td className="p-4 text-center text-[13px] font-bold text-white/60">{s.played}</td>
                    <td className="p-4 text-center text-[13px] font-bold text-emerald-400">{s.won}</td>
                    <td className="p-4 text-center text-[13px] font-bold text-white/50">{s.drawn}</td>
                    <td className="p-4 text-center text-[13px] font-bold text-red-400/80">{s.lost}</td>
                    <td className="p-4 text-center text-[13px] font-bold text-white">{s.goalsFor}</td>
                    <td className="p-4 text-center text-[13px] font-bold text-white/50">{s.goalsAgainst}</td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        'inline-flex items-center gap-0.5 text-[13px] font-black',
                        s.goalDifference > 0 ? 'text-emerald-400' : s.goalDifference < 0 ? 'text-red-400' : 'text-white/40'
                      )}>
                        {s.goalDifference > 0 ? <TrendingUp className="w-3 h-3" /> : s.goalDifference < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        {s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        'inline-flex items-center justify-center min-w-[36px] h-8 px-2.5 rounded-full text-[12px] font-black',
                        isLeader ? 'bg-[#FFB800] text-black' : 'bg-white/[0.08] text-white'
                      )}>{s.points}</span>
                    </td>
                    <td className="p-4 text-center">
                      <FormBadges teamId={s.teamId} matches={matches} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 flex items-start gap-2 text-[11px] text-white/45">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
        <div>
          <span className="font-black text-white/60">Auto-calculated:</span> Standings are derived in real-time from the same <code className="px-1.5 py-0.5 rounded bg-white/10 text-[#CCFF00] font-mono text-[10px]">matches</code> state. Two-legged ties collapse into a single W/D/L entry. <span className="text-white/40">Sort: Pts → GD → GF.</span>
        </div>
      </div>
    </div>
  );
}

function FormBadges({ teamId, matches }: { teamId: string; matches: any[] }) {
  // derive last 5 results for this team (COMPLETED only) in chronological order
  const results: ('W' | 'D' | 'L')[] = [];
  const sorted = matches
    .filter(m => m.status === 'COMPLETED' && (m.homeId === teamId || m.awayId === teamId))
    .slice()
    .sort((a, b) => (a.finishedAt || a.date).localeCompare(b.finishedAt || b.date));

  for (const m of sorted) {
    const isHome = m.homeId === teamId;
    const gf = isHome ? m.homeScore : m.awayScore;
    const ga = isHome ? m.awayScore : m.homeScore;
    results.push(gf > ga ? 'W' : gf < ga ? 'L' : 'D');
  }
  const last5 = results.slice(-5);
  return (
    <div className="inline-flex gap-0.5">
      {last5.map((r, i) => (
        <span
          key={i}
          className={cn(
            'w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center',
            r === 'W' ? 'bg-emerald-500 text-black' : r === 'D' ? 'bg-white/15 text-white' : 'bg-red-500/25 text-red-300'
          )}
        >
          {r}
        </span>
      ))}
    </div>
  );
}
