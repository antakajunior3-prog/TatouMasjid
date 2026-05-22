export interface VisualTheme {
  id: string;
  name: string;
  bgClass: string;
  cardClass: string;
  textPrimary: string;
  textSecondary: string;
  accentGold: string;
  accentGreen: string;
  borderClass: string;
  badgeClass: string;
  inputClass: string;
}

export const VISUAL_THEMES: Record<string, VisualTheme> = {
  'editorial-aesthetic': {
    id: 'editorial-aesthetic',
    name: 'Editorial Onyx & Gold (Premium)',
    bgClass: 'bg-gradient-to-br from-[#12161D] via-[#0A0C10] to-[#0A0C10] text-[#E5E7EB] font-serif',
    cardClass: 'bg-[#12161D] border border-[#D4AF37]/35 shadow-2xl shadow-black/80 rounded-2xl p-6 relative overflow-hidden',
    textPrimary: 'text-white',
    textSecondary: 'text-[#D4AF37]',
    accentGold: '#D4AF37',
    accentGreen: '#104E3B',
    borderClass: 'border-[#D4AF37]/35',
    badgeClass: 'bg-[#104E3B]/40 text-[#D4AF37] border border-[#104E3B]/60 font-sans',
    inputClass: 'bg-[#0A0C10] border border-[#D4AF37]/30 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]'
  },
  'emerald-dark': {
    id: 'emerald-dark',
    name: 'Emerald Velvet (Dark)',
    bgClass: 'bg-gradient-to-br from-emerald-950 via-slate-950 to-emerald-900 text-slate-100',
    cardClass: 'bg-emerald-950/40 backdrop-blur-md border border-emerald-500/20 shadow-xl shadow-black/40',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-emerald-300',
    accentGold: '#D4AF37', // Gold Hex
    accentGreen: '#10B981', // Emerald Hex
    borderClass: 'border-emerald-500/20',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    inputClass: 'bg-emerald-950/60 border border-emerald-500/30 text-slate-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'
  },
  'emerald-light': {
    id: 'emerald-light',
    name: 'Islamic Ivory (Light)',
    bgClass: 'bg-gradient-to-br from-stone-50 via-emerald-50 to-stone-100 text-neutral-800',
    cardClass: 'bg-white/80 backdrop-blur-md border border-emerald-100 shadow-md shadow-emerald-900/5',
    textPrimary: 'text-neutral-800',
    textSecondary: 'text-emerald-700 font-medium',
    accentGold: '#B58900',
    accentGreen: '#059669',
    borderClass: 'border-emerald-100',
    badgeClass: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    inputClass: 'bg-white border border-emerald-200 text-emerald-950 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
  },
  'slate-gold': {
    id: 'slate-gold',
    name: 'Imperial Obsidian & Gold',
    bgClass: 'bg-gradient-to-br from-stone-950 via-slate-950 to-neutral-950 text-amber-50',
    cardClass: 'bg-neutral-900/60 backdrop-blur-lg border border-amber-500/20 shadow-2xl shadow-black/80',
    textPrimary: 'text-stone-100',
    textSecondary: 'text-amber-400 font-medium',
    accentGold: '#F59E0B',
    accentGreen: '#10B981',
    borderClass: 'border-amber-500/20',
    badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    inputClass: 'bg-neutral-900/80 border border-amber-500/20 text-amber-50 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'
  },
  'royal-blue': {
    id: 'royal-blue',
    name: 'Royal Sapphire (Navy)',
    bgClass: 'bg-gradient-to-br from-indigo-950 via-slate-950 to-blue-950 text-slate-100',
    cardClass: 'bg-slate-900/50 backdrop-blur-md border border-sky-500/20 shadow-xl shadow-black/50',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-sky-300',
    accentGold: '#FBBF24',
    accentGreen: '#10B981',
    borderClass: 'border-sky-500/20',
    badgeClass: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
    inputClass: 'bg-slate-900/75 border border-sky-500/30 text-slate-100 focus:border-sky-400 focus:ring-1 focus:ring-sky-400'
  }
};
