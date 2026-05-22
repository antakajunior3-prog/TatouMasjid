import React, { useState, useEffect } from 'react';
import { useDashboard } from '../DashboardContext';
import { getHijriDate, getNextPrayer, getCountdown } from '../utils';
import { Clock, Calendar, Globe, Compass } from 'lucide-react';
import { VISUAL_THEMES } from './ThemeStyles';

export const ClockAndCountdown: React.FC<{ isTVMode: boolean }> = ({ isTVMode }) => {
  const { data } = useDashboard();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const theme = VISUAL_THEMES[data.config.themeId] || VISUAL_THEMES['editorial-aesthetic'];

  // Calculate current date details
  const timeString = time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const gregorianDateString = time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  const hijri = getHijriDate(time, data.config.hijriAdjustment);
  const hijriDateString = `${hijri.day} ${hijri.month} ${hijri.year} AH`;
  const hijriArabicString = `${hijri.day} ${hijri.monthArabic} ${hijri.year} هـ`;

  const { prayer: nextP, isTomorrow } = getNextPrayer(data.prayers, time);
  const countdownStr = getCountdown(nextP.adhan, isTomorrow, time);

  return (
    <div className={`p-6 md:p-8 rounded-3xl ${theme.cardClass} flex flex-col justify-between h-full relative overflow-hidden transition-all duration-500`}>
      {/* Decorative Islamic Arch in background */}
      <div className="absolute right-0 top-0 w-64 h-64 opacity-5 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full text-white">
          <path d="M50,0 C75,25 100,50 100,100 L0,100 C0,50 25,25 50,0 Z" />
        </svg>
      </div>

      <div className="flex justify-between items-start z-10">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#D4AF37] font-sans flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            Live Sanctuary Mode
          </h2>
          <h1 className="text-3xl md:text-4xl font-sans font-bold tracking-tight text-white mt-1 break-words">
            {data.config.name}
          </h1>
          <p className="text-xs text-stone-400 font-sans mt-0.5">{data.config.address}</p>
        </div>
        
        {/* Simple display computation calculation mode indicator */}
        <div className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-2 font-mono ${theme.badgeClass}`}>
          {data.config.useCalculatedTimes ? (
            <>
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Calculated</span>
            </>
          ) : (
            <>
              <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Manual Timings</span>
            </>
          )}
        </div>
      </div>

      {/* HUGE Digital Clock */}
      <div className="my-8 md:my-10 text-center z-10 flex flex-col items-center">
        <div className={`font-mono leading-none tracking-tighter text-white font-bold transition-all duration-300 ${
          isTVMode ? 'text-7xl md:text-8xl' : 'text-5xl md:text-7xl'
        }`}>
          {timeString}
        </div>
        
        {/* Gregorian + Hijri Dates display */}
        <div className="mt-4 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 text-stone-300 font-sans font-medium text-sm md:text-base">
            <Calendar className="w-4 h-4 text-[#D4AF37]" id="calendar-icon" />
            <span>{gregorianDateString}</span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-0.5 text-xs text-stone-400 font-mono mt-1">
            <span>{hijriDateString}</span>
            <span className="text-emerald-500">•</span>
            <span className="font-sans text-[#D4AF37]">{hijriArabicString}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Next Prayer Countdown banner block */}
      <div className="p-4 md:p-5 rounded-2xl bg-black/30 border border-white/5 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/20 flex items-center justify-center">
            <Clock className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <div className="text-xs text-stone-400 font-mono">Next Adhan</div>
            <div className="text-base font-semibold text-white font-sans flex items-center gap-1.5 mt-0.5">
              <span>{nextP.name} ({nextP.arabicName})</span>
              <span className="text-[#D4AF37] font-mono text-sm">at {nextP.adhan}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-[10px] text-amber-400 uppercase tracking-widest font-mono animate-pulse">
            Upcoming In
          </div>
          <div className="text-xl md:text-2xl font-mono font-bold text-white tracking-tight mt-0.5" id="prayer-countdown">
            {countdownStr}
          </div>
        </div>
      </div>
    </div>
  );
};
