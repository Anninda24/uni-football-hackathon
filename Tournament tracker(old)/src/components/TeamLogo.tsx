import { getTeam } from '../data/teams';
import { cn } from '../utils/cn';

export function TeamLogo({
  teamId,
  size = 'md',
  withName = false,
  className,
}: {
  teamId: string | null | undefined;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  withName?: boolean;
  className?: string;
}) {
  const team = getTeam(teamId);
  if (!team) return null;
  const sizeMap = {
    xs: 'w-7 h-7 text-[9px]',
    sm: 'w-9 h-9 text-[11px]',
    md: 'w-12 h-12 text-[14px]',
    lg: 'w-16 h-16 text-[17px]',
    xl: 'w-20 h-20 text-[20px]',
  };
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'rounded-xl flex items-center justify-center font-black text-black bg-gradient-to-br shadow-inner shrink-0',
          team.logoGradient,
          sizeMap[size]
        )}
      >
        {team.short}
      </div>
      {withName && (
        <div className="min-w-0">
          <div className="text-[12px] font-black text-white truncate">{team.name}</div>
          <div className="text-[10px] text-white/40 tracking-widest uppercase">{team.short}</div>
        </div>
      )}
    </div>
  );
}
