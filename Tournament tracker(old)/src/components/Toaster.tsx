import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertTriangle, Bell } from 'lucide-react';
import { useStore } from '../store';

export function Toaster() {
  const { toasts, removeToast } = useStore();
  return (
    <div className="fixed top-4 right-4 z-[300] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = t.type === 'success' ? Check : t.type === 'error' ? AlertTriangle : Bell;
          const color =
            t.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200'
              : t.type === 'error'
                ? 'bg-red-500/20 border-red-500/30 text-red-200'
                : 'bg-white/10 border-white/15 text-white';
          return (
            <motion.div
              key={t.id}
              initial={{ x: 80, opacity: 0, scale: 0.95 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 80, opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-xl border shadow-2xl max-w-[340px] ${color}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-[13px] font-medium flex-1">{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
