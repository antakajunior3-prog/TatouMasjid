import React from 'react';
import { useDashboard } from '../DashboardContext';
import { calculateIqamahTime } from '../utils';
import { Sunrise, Sun, SunMedium, CloudSun, Sunset, Moon, Sparkles } from 'lucide-react';
import { VISUAL_THEMES } from './ThemeStyles';
import { PrayerTime } from '../types';

// Dynamic Lucide icon lookup map safely
const renderPrayerIcon = (name: string, className: string) => {
  switch (name) {
    case 'Sunrise': return <Sunrise className={className} />;
    case 'Sun': return <Sun className={className} />;
    case 'SunMedium': return <SunMedium className={className} />;
    case 'CloudSun': return <CloudSun className={className} />;
    case 'Sunset': return <Sunset className={className} />;
    case 'Moon': return <Moon className={className} />;
    default: return <Moon className={className} />;
  }
};

interface PrayerRowProps {
  isTVMode: boolean;
  nextPrayerId: string;
}

export const PrayerRow: React.FC<PrayerRowProps> = ({ isTVMode, nextPrayerId }) => {
  const { data } = useDashboard();
  const theme = VISUAL_THEMES[data.config.themeId] || VISUAL_THEMES['editorial-aesthetic'];

  return (
    <div className={`grid gap-4 w-full h-full ${
      isTVMode 
        ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6' 
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
    }`}>
      {data.prayers.map((prayer) => {
        const isNext = prayer.id === nextPrayerId;
        const isSunrise = prayer.id === 'sunrise';
        const absoluteIqamah = calculateIqamahTime(prayer);

        const isNextEditorial = isNext && (data.config.themeId === 'editorial-aesthetic');

        return (
          <div
            key={prayer.id}
            className={`p-5 rounded-2xl transition-all duration-500 relative flex flex-col justify-between overflow-hidden ${
              isNext
                ? isNextEditorial
                  ? 'bg-[#D4AF37] text-black shadow-[0_0_30px_rgba(212,175,55,0.35)] font-serif'
                  : 'ring-2 ring-amber-400 bg-amber-500/10 shadow-lg shadow-amber-400/5'
                : `${theme.cardClass}`
            } ${isTVMode ? 'h-full min-h-[140px]' : 'h-full'}`}
          >
            {/* Top Indicator or Pulse for the Next Active Prayer */}
            {isNext && (
              <div className={`absolute top-2 right-2 flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                isNextEditorial
                  ? 'bg-black/10 border border-black/20 text-black font-semibold'
                  : 'bg-amber-400/10 border border-amber-400/20 text-amber-400'
              }`}>
                <Sparkles className="w-3 h-3 animate-spin" />
                <span>Next</span>
              </div>
            )}

            <div>
              <div className="flex justify-between items-start">
                <div className={`p-2.5 rounded-xl border group-hover:bg-amber-400/10 ${
                  isNextEditorial ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/5'
                }`}>
                  {renderPrayerIcon(prayer.icon, isNextEditorial ? "w-5 h-5 text-black" : isNext ? "w-5 h-5 text-amber-400" : "w-5 h-5 text-[#D4AF37]")}
                </div>
                <div className="text-right">
                  <div className={`font-mono text-[10px] uppercase tracking-wider ${
                    isNextEditorial ? 'text-black/80 font-bold' : isNext ? 'text-amber-400 font-bold' : 'text-stone-400'
                  }`}>
                    {prayer.name}
                  </div>
                  <div className={`text-base font-bold ${isNextEditorial ? 'text-black' : 'text-white/90'}`}>
                    {prayer.arabicName}
                  </div>
                </div>
              </div>

              {/* Adhan Time Row */}
              <div className="mt-5">
                <div className={`text-[10px] uppercase tracking-wider font-mono ${isNextEditorial ? 'text-black/70' : 'text-stone-400'}`}>
                  Adhan
                </div>
                <div className={`text-3xl font-mono font-bold tracking-tight mt-0.5 ${isNextEditorial ? 'text-black' : 'text-white'}`}>
                  {prayer.adhan}
                </div>
              </div>
            </div>

            {/* Iqamah Box / Timing footer (Sunrise has no Iqamah) */}
            <div className={`mt-4 pt-3 border-t ${isNextEditorial ? 'border-black/10' : 'border-white/5'}`}>
              {isSunrise ? (
                <div className={`text-[10px] font-sans italic ${isNextEditorial ? 'text-black/70' : 'text-stone-500'}`} id="sunrise-tag">
                  Shuruq (Sunrise)
                </div>
              ) : (
                <div className="flex justify-between items-baseline">
                  <div>
                    <div className={`text-[10px] uppercase tracking-wider font-mono ${isNextEditorial ? 'text-black/70' : 'text-stone-400'}`}>
                      Iqamah
                    </div>
                    <div className={`text-lg font-mono font-bold ${isNextEditorial ? 'text-black' : isNext ? 'text-amber-400' : 'text-white'}`}>
                      {absoluteIqamah}
                    </div>
                  </div>
                  
                  {prayer.iqamahType === 'relative' && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${
                      isNextEditorial ? 'bg-black/5 border border-black/10 text-black/80' : 'bg-white/5 border border-white/10 text-stone-400'
                    }`}>
                      +{prayer.iqamahValue}m
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
