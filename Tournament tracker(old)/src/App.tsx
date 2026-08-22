import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hexagon, Calendar, BarChart3, Trophy, Shield, Eye, Edit3 } from 'lucide-react';
import { useStore } from './store';
import { MatchesView } from './views/MatchesView';
import { PointsTableView } from './views/PointsTableView';
import { StatisticsView } from './views/StatisticsView';
import { Toaster } from './components/Toaster';
import { cn } from './utils/cn';

type Tab = 'MATCHES' | 'TABLE' | 'STATS';

const TABS: { id: Tab; label: string; icon: typeof Calendar }[] = [
  { id: 'MATCHES', label: 'Matches', icon: Calendar },
  { id: 'TABLE', label: 'Points Table', icon: BarChart3 },
  { id: 'STATS', label: 'Statistics', icon: Trophy },
];

export default function App() {
  const { viewMode, setViewMode } = useStore();
  const [tab, setTab] = useState<Tab>('MATCHES');

  return (
    <div className="min-h-screen bg-[#070A14] text-white selection:bg-[#CCFF00] selection:text-black">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        body { background: #070A14; }
      `}</style>

      <Header tab={tab} setTab={setTab} viewMode={viewMode} setViewMode={setViewMode} />

      <AnimatePresence mode="wait">
        <motion.main
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="mx-auto max-w-[1600px] px-4 md:px-6 py-6"
        >
          {tab === 'MATCHES' && <MatchesView />}
          {tab === 'TABLE' && <PointsTableView />}
          {tab === 'STATS' && <StatisticsView />}
        </motion.main>
      </AnimatePresence>

      <footer className="border-t border-white/8 bg-[#0A0E1A] py-8 mt-12">
        <div className="mx-auto max-w-[1600px] px-6 flex flex-wrap items-center justify-between gap-4 text-[11px] text-white/25">
          <div className="flex items-center gap-4">
            <span className="font-black tracking-widest uppercase text-white/50">UFL 2026 · Module 3 · Tournament</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline-flex items-center gap-1.5"><Shield className="w-3 h-3" /> Frontend Prototype · Mock Data</span>
          </div>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" /> Demo Ready</span>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}

function Header({
  tab, setTab, viewMode, setViewMode,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  viewMode: 'ADMIN' | 'SPECTATOR';
  setViewMode: (v: 'ADMIN' | 'SPECTATOR') => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#070A14]/85 backdrop-blur-2xl">
      <div className="mx-auto max-w-[1600px] px-4 md:px-6">
        {/* Top brand row */}
        <div className="h-[64px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#CCFF00] flex items-center justify-center shadow-[0_0_15px_rgba(204,255,0,0.3)]">
              <Hexagon className="w-6 h-6 text-black fill-black/10" />
            </div>
            <div>
              <div className="text-[15px] font-black tracking-tight text-white leading-none">UFL Tournament</div>
              <div className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mt-0.5">Module 3 · Season 2026</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10">
              <button
                onClick={() => setViewMode('ADMIN')}
                className={cn(
                  'h-8 px-3 rounded-full text-[11px] font-black tracking-widest uppercase flex items-center gap-1.5 transition-colors',
                  viewMode === 'ADMIN' ? 'bg-[#CCFF00] text-black' : 'text-white/55 hover:text-white'
                )}
              >
                <Edit3 className="w-3 h-3" /> Super Admin
              </button>
              <button
                onClick={() => setViewMode('SPECTATOR')}
                className={cn(
                  'h-8 px-3 rounded-full text-[11px] font-black tracking-widest uppercase flex items-center gap-1.5 transition-colors',
                  viewMode === 'SPECTATOR' ? 'bg-white text-black' : 'text-white/55 hover:text-white'
                )}
              >
                <Eye className="w-3 h-3" /> Spectator
              </button>
            </div>

            {/* Mobile toggle */}
            <div className="sm:hidden flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10">
              <button
                onClick={() => setViewMode('ADMIN')}
                className={cn('h-8 w-8 rounded-full flex items-center justify-center', viewMode === 'ADMIN' ? 'bg-[#CCFF00] text-black' : 'text-white/55')}
                title="Admin"
              ><Edit3 className="w-3.5 h-3.5" /></button>
              <button
                onClick={() => setViewMode('SPECTATOR')}
                className={cn('h-8 w-8 rounded-full flex items-center justify-center', viewMode === 'SPECTATOR' ? 'bg-white text-black' : 'text-white/55')}
                title="Spectator"
              ><Eye className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex items-center gap-1 overflow-x-auto custom-scroll -mb-px">
          {TABS.map(t => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'relative h-12 px-5 text-[12px] font-black tracking-widest uppercase flex items-center gap-2 transition-colors whitespace-nowrap',
                  isActive ? 'text-white' : 'text-white/40 hover:text-white/70'
                )}
              >
                <t.icon className="w-4 h-4" /> {t.label}
                {isActive && <motion.span layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#CCFF00]" />}
              </button>
            );
          })}
          <div className="ml-auto hidden md:flex items-center gap-2 text-[10px] text-white/30 font-black tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {viewMode === 'ADMIN' ? 'Admin controls enabled' : 'Spectator view · read-only'}
          </div>
        </div>
      </div>
    </header>
  );
}
