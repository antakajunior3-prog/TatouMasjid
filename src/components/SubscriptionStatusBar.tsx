import React from 'react';
import { useDashboard } from '../DashboardContext';
import { Flame, Sparkles, AlertCircle, RefreshCw, Crown } from 'lucide-react';

interface SubscriptionStatusBarProps {
  onUpgradeClick: () => void;
}

export const SubscriptionStatusBar: React.FC<SubscriptionStatusBarProps> = ({ onUpgradeClick }) => {
  const { subscription } = useDashboard();
  const { status, daysLeft, packageType, expirationDate } = subscription;

  const expDateStr = expirationDate ? new Date(expirationDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : '';

  if (status === 'trial') {
    return (
      <div className="bg-amber-500/10 border-b border-amber-500/25 py-2.5 px-4" id="trial-countdown-sub-bar">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-200 font-sans">
            <div className="p-1 bg-amber-500/20 text-amber-400 rounded-lg animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-amber-400">Evaluation Phase</span> — Only{' '}
              <strong className="text-white text-xs font-mono bg-white/5 py-0.5 px-2 rounded-md border border-white/10">{daysLeft} days remaining</strong> on your{' '}
              <span className="text-amber-400 font-semibold uppercase text-[10px] tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">30-Day Free Trial</span>.
            </div>
          </div>
          <button
            onClick={onUpgradeClick}
            className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-stone-950 rounded-lg transition-all active:scale-95 cursor-pointer shadow font-sans shrink-0"
            id="bar-upgrade-btn"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="bg-rose-500/10 border-b border-rose-500/25 py-2.5 px-4" id="expired-sub-bar">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-200 font-sans">
            <div className="p-1 bg-rose-500/20 text-rose-400 rounded-lg animate-bounce">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-rose-400">Trial Expired</span> — Premium slideshow tickers, contacts, maps, and TV screens are locked. Your custom daily prayer times details stay visible.
            </div>
          </div>
          <button
            onClick={onUpgradeClick}
            className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-rose-500 text-white hover:bg-rose-600 rounded-lg transition-all active:scale-95 cursor-pointer shadow font-sans shrink-0"
            id="bar-reactive-btn"
          >
            Upgrade & Reactivate
          </button>
        </div>
      </div>
    );
  }

  // Active basic, standard, or premium plan
  return (
    <div className="bg-emerald-500/10 border-b border-emerald-500/25 py-2 px-4" id="active-sub-bar">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-stone-250 font-sans">
          <div className="p-1 bg-emerald-500/25 text-emerald-400 rounded-lg">
            <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          <div>
            Active Mosque Board: Sync Node with the{' '}
            <strong className="text-white uppercase font-sans tracking-wide font-bold">{packageType} Plan</strong>. Complete subscription credentials secured. Next automatic cycle: <strong className="text-white font-mono">{expDateStr}</strong>.
          </div>
        </div>
        <button
          onClick={onUpgradeClick}
          className="px-3 py-0.5 text-[10px] font-semibold text-stone-300 hover:text-white hover:bg-white/10 border border-white/15 rounded transition-all active:scale-95 cursor-pointer font-sans shrink-0"
          id="bar-manage-btn"
        >
          Change Plan
        </button>
      </div>
    </div>
  );
};
