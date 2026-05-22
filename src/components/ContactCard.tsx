import React from 'react';
import { useDashboard } from '../DashboardContext';
import { Phone, ShieldAlert, MapPin, Globe } from 'lucide-react';
import { VISUAL_THEMES } from './ThemeStyles';

export const ContactCard: React.FC<{ isTVMode: boolean }> = ({ isTVMode }) => {
  const { data } = useDashboard();
  const theme = VISUAL_THEMES[data.config.themeId] || VISUAL_THEMES['editorial-aesthetic'];

  return (
    <div className={`p-6 rounded-3xl ${theme.cardClass} border border-white/5 shadow-xl flex flex-col justify-between relative overflow-hidden transition-all duration-300`}>
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-[#D4AF37]">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-sans">
              Mosque Contacts & Info
            </h4>
            <p className="text-[10px] text-stone-400 font-mono">{data.config.city}, {data.config.country}</p>
          </div>
        </div>

        {/* Location Display */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2.5 rounded-xl bg-black/25 border border-white/5">
            <span className="text-[9px] text-stone-500 uppercase block font-mono">Location</span>
            <span className="text-xs font-semibold text-slate-100 flex items-center gap-1 mt-0.5" id="display-mosque-city">
              <MapPin className="w-3 h-3 text-[#D4AF37]" />
              {data.config.city || "London"}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/25 border border-white/5">
            <span className="text-[9px] text-stone-500 uppercase block font-mono">Country</span>
            <span className="text-xs font-semibold text-slate-100 flex items-center gap-1 mt-0.5" id="display-mosque-country">
              <Globe className="w-3 h-3 text-emerald-400" />
              {data.config.country || "United Kingdom"}
            </span>
          </div>
        </div>

        {/* Contact Hotline Row */}
        <div className="p-3 bg-black/25 border border-white/5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[9px] text-stone-500 uppercase block font-mono">Support Hotline</span>
            <span className="text-xs font-bold font-mono text-[#D4AF37] mt-0.5 block" id="contact-hotline-display">
              {data.config.contactPhone || "+44 20 7946 0192"}
            </span>
          </div>
          <a
            href={`tel:${data.config.contactPhone || "+442079460192"}`}
            className="h-8 px-3 rounded-lg bg-[#D4AF37]/10 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/20 flex items-center gap-1.5 text-[#D4AF37] text-xs font-bold active:scale-95 transition-all"
            id="call-now-btn"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </a>
        </div>

        {/* Call For Updates Administrative guidelines */}
        <div className="p-3 bg-emerald-950/20 border border-emerald-500/15 rounded-xl flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-0.5">
            <h5 className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
              Call For Updates
            </h5>
            <p className="text-[10px] text-stone-300 leading-relaxed font-sans">
              Administrators: Contact technical ops or masjid support at <span className="text-emerald-300 font-semibold">{data.config.contactPhone || "+44 20 7946 0192"}</span> to request instant schedule corrections or server manual modifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
