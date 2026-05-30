import React from 'react';
import { useDashboard } from '../DashboardContext';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, CreditCard, Sparkles, HelpCircle, Flame, Shield, Zap, Lock } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { subscription, upgradeSubscription, simulateExpiration, simulateResetTrial } = useDashboard();

  if (!isOpen) return null;

  const packages = [
    {
      id: 'Basic' as const,
      name: 'Basic',
      price: '199',
      period: 'month',
      color: 'from-blue-600/20 to-indigo-600/20 shadow-blue-500/10',
      borderColor: 'border-blue-500/30',
      badgeColor: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      icon: Shield,
      desc: 'Ideal for standard neighborhood prayer display screens.',
      features: [
        { name: 'Daily Prayers Timetable', included: true },
        { name: 'Scrolling Announcements Slot (1)', included: true },
        { name: 'Masjid Office Contacts Card', included: true },
        { name: 'Interactive Google Map', included: false },
        { name: 'TV Screen Broadcast View', included: false },
        { name: 'Full Admin Console Pass', included: false },
      ],
    },
    {
      id: 'Standard' as const,
      name: 'Standard',
      price: '399',
      period: 'month',
      color: 'from-amber-500/20 to-orange-600/20 shadow-amber-500/10',
      borderColor: 'border-[#D4AF37]/40',
      badgeColor: 'bg-amber-500/10 text-amber-400 border border-[#D4AF37]/30',
      icon: Flame,
      desc: 'Popular package for active mosque lobbies & broadcast displays.',
      popular: true,
      features: [
        { name: 'Daily Prayers Timetable', included: true },
        { name: 'Scrolling Announcements & Quotes (5)', included: true },
        { name: 'Masjid Office Contacts Card', included: true },
        { name: 'Interactive Google Map', included: true },
        { name: 'TV Screen Broadcast View', included: true },
        { name: 'Full Admin Console Pass', included: false },
      ],
    },
    {
      id: 'Premium' as const,
      name: 'Premium',
      price: '699',
      period: 'month',
      color: 'from-emerald-600/20 to-teal-600/20 shadow-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      icon: Zap,
      desc: 'Complete control console with real-time dynamic configurations.',
      features: [
        { name: 'Daily Prayers Timetable', included: true },
        { name: 'Unlimited Timetable Adjustments', included: true },
        { name: 'Unlimited Grid Announcements Slots', included: true },
        { name: 'Interactive Google Map', included: true },
        { name: 'TV Screen Broadcast View', included: true },
        { name: 'Full Admin Console Settings Access', included: true },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto" id="subscription-modal-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl bg-stone-900 border border-white/10 rounded-3xl shadow-2xl p-6 md:p-8 overflow-hidden max-h-[92vh] overflow-y-auto scrollbar-none"
        id="subscription-modal-container"
      >
        {/* Glow effect backgrounds */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />

        {/* Head */}
        <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-amber-400 tracking-widest uppercase flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Imperial Timetable Suite
            </span>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-100 flex items-center gap-2 mt-1">
              Elevate Your Masjid Broadcast Displays
            </h2>
            <p className="text-xs text-stone-400 font-sans max-w-xl">
              Equip your local community lobby with a professional prayers board, slideshows, auto-timetable coordinates, and premium multi-screen broadcast grids.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer border border-white/5"
            aria-label="Close billing plans"
            id="close-subscription-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Developer Sandbox Panel */}
        <div className="p-3 bg-stone-950 border border-white/5 rounded-2xl mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-stone-400 font-mono text-[10px] tracking-wide uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Developer sandbox simulator:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={async () => {
                await simulateExpiration();
                onClose();
              }}
              className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[10px] font-mono transition-all active:scale-95"
              id="simulate-exp-btn"
            >
              Simulate Expired
            </button>
            <button
              onClick={async () => {
                await simulateResetTrial();
                onClose();
              }}
              className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono transition-all active:scale-95"
              id="simulate-reset-trial-btn"
            >
              Reset 30-Day Trial
            </button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {packages.map((pkg) => {
            const isCurrentPlan = subscription.packageType === pkg.id;
            const Icon = pkg.icon;
            return (
              <div
                key={pkg.id}
                className={`relative rounded-2xl p-5 border flex flex-col justify-between overflow-hidden bg-gradient-to-b ${pkg.color} ${pkg.borderColor} transition-all duration-300 ${pkg.popular ? 'md:scale-[1.03] shadow-md' : 'shadow'}`}
                id={`plan-card-${pkg.id.toLowerCase()}`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 right-0">
                    <span className="text-[9px] font-bold text-black uppercase tracking-widest bg-[#D4AF37] px-3.5 py-1 rounded-bl-xl shadow flex items-center gap-1 font-sans">
                      Popular
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Icon & Badge */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-[#D4AF37]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${pkg.badgeColor}`}>
                        {pkg.name}
                      </span>
                      {isCurrentPlan && (
                        <span className="text-[9px] block text-emerald-400 font-semibold uppercase tracking-wider mt-0.5 animate-pulse">
                          Active Plan
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div>
                    <span className="text-3xl font-bold font-serif text-white">
                      {pkg.price}
                    </span>
                    <span className="text-xs font-mono text-stone-400 ml-1">
                      THB / {pkg.period}
                    </span>
                  </div>

                  <p className="text-xs text-stone-400 font-sans leading-relaxed">
                    {pkg.desc}
                  </p>

                  {/* Divider */}
                  <div className="border-t border-white/5 py-1" />

                  {/* Features */}
                  <ul className="space-y-2.5 text-xs text-stone-300 font-sans">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        {feat.included ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-stone-600 shrink-0 mt-0.5" />
                        )}
                        <span className={feat.included ? 'text-stone-200' : 'text-stone-500 line-through'}>
                          {feat.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={async () => {
                    await upgradeSubscription(pkg.id);
                    onClose();
                  }}
                  disabled={isCurrentPlan}
                  className={`w-full mt-6 py-2.5 rounded-xl text-center text-xs font-bold transition-all hover:scale-[1.01] active:scale-95 border ${
                    isCurrentPlan
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 cursor-not-allowed'
                      : pkg.popular
                      ? 'bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-stone-950 border-[#D4AF37] font-bold shadow-stone-900/50'
                      : 'bg-white/5 hover:bg-white/10 border-white/15 text-slate-100 hover:text-white'
                  }`}
                  id={`upgrade-plan-button-${pkg.id.toLowerCase()}`}
                >
                  {isCurrentPlan ? 'Current Active Package' : `Choose ${pkg.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Guarantee */}
        <div className="p-4 bg-stone-950/40 border border-white/5 rounded-2xl flex items-center gap-3 text-xs leading-relaxed text-stone-400">
          <CreditCard className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="font-sans">
            <strong className="text-stone-300">Free 30-Day Evaluation Trial Included</strong>: Every new dynamic mosque selected starts instantly with a full 30-day premium features evaluation trial. Upgrades are computed instantly and stored inside secure Realtime synchronize nodes. No physical card is required for sandbox tests. Cancel or change plans dynamically.
          </div>
        </div>
      </motion.div>
    </div>
  );
};
