import React from 'react';
import { useDashboard } from '../DashboardContext';
import { Lock, Sparkles, AlertCircle } from 'lucide-react';

interface SubscriptionLockProps {
  children: React.ReactNode;
  requiredPlan?: 'basic' | 'standard' | 'premium';
  description?: string;
  onUpgradeClick: () => void;
}

export const SubscriptionLock: React.FC<SubscriptionLockProps> = ({
  children,
  requiredPlan = 'basic',
  description = 'Enjoy premium tools',
  onUpgradeClick,
}) => {
  const { subscription } = useDashboard();
  const { status, packageType } = subscription;

  const isExpired = status === 'expired';

  // Determine if the current plan meets the requirements
  const getPlanWeight = (planLevel: string) => {
    switch (planLevel.toLowerCase()) {
      case 'expired': return 0;
      case 'trial': return 4; // Trial gets access to everything
      case 'basic': return 1;
      case 'standard': return 2;
      case 'premium': return 3;
      default: return 0;
    }
  };

  const currentWeight = getPlanWeight(status);
  const requiredWeight = getPlanWeight(requiredPlan);

  const hasAccess = currentWeight >= requiredWeight;

  if (hasAccess && !isExpired) {
    return <>{children}</>;
  }

  const headingText = isExpired 
    ? "Free Trial Expired" 
    : `${requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} Feature Locked`;

  const bannerDesc = isExpired
    ? "Your 30-day evaluation trial has ended. Simply choose an upgrade plan to instantly reactivate this feature."
    : `This widget requires a ${requiredPlan.toUpperCase()} active mosque subscription package.`;

  return (
    <div className="relative overflow-hidden group rounded-3xl" id="subscription-lock-wrapper">
      {/* Blurred disabled preview of the original component background */}
      <div className="filter blur-md brightness-[0.25] pointer-events-none select-none transition-all duration-300">
        {children}
      </div>

      {/* Lock Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6 bg-black/45 backdrop-blur-sm rounded-3xl border border-white/5 transition-colors duration-300">
        <div className="p-3 bg-stone-900/90 rounded-2xl border border-rose-500/20 text-[#D4AF37] shadow-xl mb-3 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-rose-500/5 rounded-2xl animate-pulse" />
          <Lock className="w-5 h-5 text-[#D4AF37]" />
        </div>

        <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] font-sans">
          {headingText}
        </h3>

        <p className="text-[10px] text-stone-300 leading-normal max-w-[240px] mt-1.5 font-sans">
          {bannerDesc}
        </p>

        <button
          onClick={onUpgradeClick}
          className="mt-4 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-black bg-[#D4AF37] hover:bg-[#D4AF37]/90 rounded-xl transition-all hover:scale-105 active:scale-95 shadow cursor-pointer font-sans"
          id="pricing-lock-upgrade-btn"
        >
          Upgrade Now
        </button>
      </div>
    </div>
  );
};
