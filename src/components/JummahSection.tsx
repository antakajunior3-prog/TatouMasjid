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
        <div className="grid gap-4 grid-cols-1">
          {data.jummah.slice(0, 1).map((session, index) => (
            <div
              key={session.id || index}
              className="p-5 rounded-2xl bg-black/25 border border-white/5 relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <h4 className="text-base font-bold text-[#D4AF37] font-sans">
                  {session.name || "Friday Jummah Prayer"}
                </h4>
                
                {/* Timings */}
                <div className="grid grid-cols-2 gap-3 mt-3 mb-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-[10px] text-stone-400 uppercase font-mono">Khutbah</div>
                    <div className="text-lg font-mono font-bold text-white mt-0.5">
                      {session.khutbahTime}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-[10px] text-stone-400 uppercase font-mono">Iqamah</div>
                    <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">
                      {session.iqamahTime}
                    </div>
                  </div>
                </div>
              </div>

              {/* Speaker Khateeb info */}
              <div className="flex items-center gap-2.5 pt-3 border-t border-white/5">
                <div className="p-2 rounded-lg bg-white/5">
                  <UserRound className="w-4 h-4 text-stone-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] text-stone-500 uppercase font-mono">Khateeb / Speaker</div>
                  <div className="text-sm font-medium text-slate-200 truncate" id={`khateeb-session-${index}`}>
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
