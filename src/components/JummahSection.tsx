import React from 'react';
import { useDashboard } from '../DashboardContext';
import { Sparkles, CalendarDays, UserRound } from 'lucide-react';
import { VISUAL_THEMES } from './ThemeStyles';

export const JummahSection: React.FC<{ isTVMode: boolean }> = ({ isTVMode }) => {
  const { data } = useDashboard();
  const theme = VISUAL_THEMES[data.config.themeId] || VISUAL_THEMES['editorial-aesthetic'];

  return (
    <div className={`p-6 md:p-8 rounded-3xl ${theme.cardClass} flex flex-col justify-between h-full relative transition-all duration-300`}>
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-[#D4AF37]">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">
              Friday Jummah Prayer
            </h3>
            <p className="text-[10px] text-stone-400 font-mono">Blessed Congregations</p>
          </div>
        </div>

        {/* Jummah Sessions Grid */}
        <div className={`grid gap-4 ${isTVMode ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
          {data.jummah.map((session, index) => (
            <div
              key={session.id || index}
              className="p-4 rounded-2xl bg-black/25 border border-white/5 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#D4AF37]/10 text-amber-300 border border-[#D4AF37]/20 uppercase">
                Session {index + 1}
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#D4AF37] font-sans">
                  {session.name}
                </h4>
                
                {/* Timings */}
                <div className="grid grid-cols-2 gap-2 mt-3 mb-4">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-[9px] text-stone-400 uppercase font-mono">Khutbah</div>
                    <div className="text-base font-mono font-bold text-white mt-0.5">
                      {session.khutbahTime}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-[9px] text-stone-400 uppercase font-mono">Iqamah</div>
                    <div className="text-base font-mono font-bold text-emerald-400 mt-0.5">
                      {session.iqamahTime}
                    </div>
                  </div>
                </div>
              </div>

              {/* Speaker Khateeb info */}
              <div className="flex items-center gap-2.5 pt-2 border-t border-white/5">
                <div className="p-1.5 rounded-lg bg-white/5">
                  <UserRound className="w-3.5 h-3.5 text-stone-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[8px] text-stone-500 uppercase font-mono">Khateeb / Speaker</div>
                  <div className="text-xs font-medium text-slate-200 truncate" id={`khateeb-session-${index}`}>
                    {session.khateeb || "TBD"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 text-[10px] text-stone-400 text-center flex items-center justify-center gap-1.5 font-sans bg-white/5 p-2 rounded-xl border border-white/5">
        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span>Please arrive at least 15 minutes early and perform your Wudu at home.</span>
      </div>
    </div>
  );
};
