import React, { useState } from 'react';
import { useDashboard } from '../DashboardContext';
import { 
  Save, 
  Trash2, 
  Plus, 
  MapPin, 
  Lock, 
  BellRing, 
  Clock, 
  Users, 
  FileText, 
  Sliders, 
  Layout, 
  Check, 
  Volume2, 
  VolumeX, 
  Compass, 
  Home, 
  LogOut,
  Sparkles,
  Info,
  Globe
} from 'lucide-react';
import { VISUAL_THEMES } from './ThemeStyles';
import { PrayerTime, JummahSession } from '../types';

interface AdminConsoleProps {
  onExit: () => void;
}

type AdminTab = 'prayers' | 'jummah' | 'announcements' | 'settings';

export const AdminConsole: React.FC<AdminConsoleProps> = ({ onExit }) => {
  const { 
    data, 
    isFirebaseActive, 
    updatePrayerTime, 
    updateJummah, 
    updateConfig, 
    addAnnouncement, 
    toggleAnnouncement, 
    deleteAnnouncement,
    addQuote,
    deleteQuote,
    logout
  } = useDashboard();

  const [activeTab, setActiveTab] = useState<AdminTab>('prayers');
  const theme = VISUAL_THEMES[data.config.themeId] || VISUAL_THEMES['editorial-aesthetic'];

  // Form states
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newQuoteText, setNewQuoteText] = useState('');
  const [newQuoteSource, setNewQuoteSource] = useState('');

  // Local config edits (saved instantly, but tracked locally to support simple form states)
  const handleConfigChange = (field: string, value: any) => {
    updateConfig({ [field]: value });
  };

  // Safe handler to exit dashboard console
  const handleLogout = () => {
    logout();
    onExit();
  };

  return (
    <div className={`p-4 md:p-8 rounded-3xl min-h-[550px] ${theme.cardClass} border border-white/5 shadow-2xl transition-all duration-300`}>
      {/* Admin Panel Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/10 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl mt-0 font-extrabold text-white font-sans tracking-tight">
              Masjid Administration Console
            </h1>
            <span className="text-[10px] px-2 py-0.5 font-bold uppercase rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
              Admin
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            {isFirebaseActive ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Firestore Connection Live (Synchronizing all connected TV screens)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                Unprovisioned Cloud Mode (Auto-preserving updates in Local Storage caches)
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onExit}
            className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-[#D4AF37] font-sans text-xs font-semibold flex items-center justify-center gap-2 border border-white/5 transition-all"
            id="back-to-tv-btn"
          >
            <Layout className="w-4 h-4" />
            <span>Show Board</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-400 font-sans text-xs font-semibold flex items-center justify-center gap-2 border border-rose-500/20 transition-all"
            id="logout-admin-btn"
          >
            <LogOut className="w-4 h-4" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs bar */}
      <div className="flex border-b border-white/5 gap-2 overflow-x-auto pb-px mb-6 scrollbar-none">
        {[
          { id: 'prayers', name: 'Prayer Timings', icon: Clock },
          { id: 'jummah', name: 'Friday Jummah', icon: Users },
          { id: 'announcements', name: 'Bulletins & Quotes', icon: FileText },
          { id: 'settings', name: 'Masjid Preferences', icon: Sliders }
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`h-11 px-4 rounded-t-xl font-sans text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 whitespace-nowrap border-b-2 -mb-px ${
                isSelected
                  ? 'border-[#D4AF37] text-white bg-white/5'
                  : 'border-transparent text-stone-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels content */}
      <div className="min-h-[350px]">
        
        {/* PRAYER TIMINGS TAB */}
        {activeTab === 'prayers' && (
          <div className="space-y-4">
            {data.config.useCalculatedTimes ? (
              <div className="p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-start gap-3">
                <Globe className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5 animate-pulse" />
                <p className="text-xs text-stone-300 leading-relaxed font-sans">
                  <strong className="text-[#D4AF37]">Automatic Calculations Active:</strong> The Adhan times are calculated dynamically for <strong className="text-white">today</strong> based on latitude <span className="font-mono text-white bg-black/40 px-1 py-0.5 rounded">{data.config.latitude ?? 0}°</span> and longitude <span className="font-mono text-white bg-black/40 px-1 py-0.5 rounded">{data.config.longitude ?? 0}°</span>. Manual timing overrides are currently locked. If you wish to set custom manual times, please toggle off automatic calculations in the <strong className="text-white">Settings</strong> tab.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/15 flex items-start gap-3">
                <Info className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <p className="text-xs text-stone-300 leading-relaxed font-sans">
                  Below are the daily timings. Tap on the time boxes to edit them. 
                  Configure if Iqamah starts as a <strong className="text-white font-semibold">fixed time</strong> (e.g., 19:30) or <strong className="text-white font-semibold">relative offset</strong> (e.g., 10 minutes) after the Adhan call.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.prayers.map((prayer) => {
                const isSunrise = prayer.id === 'sunrise';
                return (
                  <div key={prayer.id} className="p-4 rounded-2xl bg-black/20 border border-white/5 flex flex-col justify-between">
                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                      <span className="font-bold text-white text-sm font-sans flex items-center gap-1.5">
                        {prayer.name}
                        <span className="text-[10px] text-stone-400 font-normal">({prayer.arabicName})</span>
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/15 text-stone-200">
                        {prayer.id}
                      </span>
                    </div>

                    <div className="mt-4 gap-4 grid grid-cols-2">
                      {/* Adhan Timer Box */}
                      <div>
                        <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Adhan Calls</label>
                        <input
                          type="time"
                          value={prayer.adhan}
                          disabled={data.config.useCalculatedTimes}
                          onChange={(e) => updatePrayerTime(prayer.id, { adhan: e.target.value })}
                          className={`w-full h-10 px-2 rounded-lg font-mono text-sm ${theme.inputClass} ${
                            data.config.useCalculatedTimes ? 'opacity-50 cursor-not-allowed bg-stone-900/40 border-stone-800' : ''
                          }`}
                          id={`input-adhan-${prayer.id}`}
                        />
                      </div>

                      {/* Iqamah Display Toggle */}
                      {!isSunrise ? (
                        <div>
                          <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Iqamah Type</label>
                          <select
                            value={prayer.iqamahType}
                            onChange={(e) => updatePrayerTime(prayer.id, { iqamahType: e.target.value as 'fixed' | 'relative' })}
                            className={`w-full h-10 px-2 rounded-lg text-xs ${theme.inputClass}`}
                            id={`input-iqamah-type-${prayer.id}`}
                          >
                            <option value="relative">Mins After</option>
                            <option value="fixed">Fixed Time</option>
                          </select>
                        </div>
                      ) : (
                        <div className="flex items-center text-[10px] text-stone-500 italic pt-6">No Iqamah</div>
                      )}
                    </div>

                    {/* Conditional Iqamah inputs */}
                    {!isSunrise && (
                      <div className="mt-4">
                        {prayer.iqamahType === 'relative' ? (
                          <div>
                            <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">
                              Relative offset (minutes after Adhan)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="60"
                              value={prayer.iqamahValue}
                              onChange={(e) => updatePrayerTime(prayer.id, { iqamahValue: e.target.value })}
                              className={`w-full h-10 px-3 rounded-lg font-mono text-sm ${theme.inputClass}`}
                              placeholder="e.g. 15"
                              id={`input-iqamah-val-rel-${prayer.id}`}
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">
                              Fixed Clock Time
                            </label>
                            <input
                              type="time"
                              value={prayer.iqamahValue}
                              onChange={(e) => updatePrayerTime(prayer.id, { iqamahValue: e.target.value })}
                              className={`w-full h-10 px-3 rounded-lg font-mono text-sm ${theme.inputClass}`}
                              id={`input-iqamah-val-fixed-${prayer.id}`}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FRIDAY JUMMAH TAB */}
        {activeTab === 'jummah' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/15">
              <p className="text-xs text-stone-300 leading-relaxed font-sans">
                Adjust the timings for the Friday (Jummah) assemblies. Adding speaker names (Khateebs) helps congregation members plan accordingly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
              {data.jummah.map((session, sIdx) => (
                <div key={session.id} className="p-5 rounded-2xl bg-black/20 border border-white/5 space-y-4 relative">
                  <div className="absolute top-4 right-4 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Session {sIdx + 1}
                  </div>

                  <h3 className="text-base font-bold text-white font-sans mt-0">
                    Service Settings
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Session Label</label>
                      <input
                        type="text"
                        value={session.name}
                        onChange={(e) => updateJummah(session.id, { name: e.target.value })}
                        className={`w-full h-10 px-3 rounded-lg text-sm ${theme.inputClass}`}
                        placeholder="e.g. First Jummah"
                        id={`input-jummah-name-${sIdx}`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Khutbah Starts</label>
                        <input
                          type="time"
                          value={session.khutbahTime}
                          onChange={(e) => updateJummah(session.id, { khutbahTime: e.target.value })}
                          className={`w-full h-10 px-3 rounded-lg font-mono text-sm ${theme.inputClass}`}
                          id={`input-jummah-khutbah-${sIdx}`}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Iqamah Begins</label>
                        <input
                          type="time"
                          value={session.iqamahTime}
                          onChange={(e) => updateJummah(session.id, { iqamahTime: e.target.value })}
                          className={`w-full h-10 px-3 rounded-lg font-mono text-sm ${theme.inputClass}`}
                          id={`input-jummah-iqamah-${sIdx}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Khateeb (Speaker)</label>
                      <input
                        type="text"
                        value={session.khateeb}
                        onChange={(e) => updateJummah(session.id, { khateeb: e.target.value })}
                        className={`w-full h-10 px-3 rounded-lg text-sm ${theme.inputClass}`}
                        placeholder="e.g. Sheikh Ahmed"
                        id={`input-jummah-khateeb-${sIdx}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BULLETINS & QUOTES TAB */}
        {activeTab === 'announcements' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Announcements Panel */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2 mt-0">
                <span>Active Bulletin Announcements</span>
                <span className="text-xs px-2.5 py-0.5 font-bold rounded-full bg-white/5 border border-white/10 text-stone-300">
                  {data.announcements.length} Total
                </span>
              </h3>

              {/* Add Announcement Form */}
              <div className="p-4 rounded-xl bg-black/15 border border-white/5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Add New Announcement Bulletin</h4>
                <div>
                  <input
                    type="text"
                    value={newAnnTitle}
                    onChange={(e) => setNewAnnTitle(e.target.value)}
                    placeholder="Announcement Title (e.g. Weekly Quran Tajweed Halaqa)"
                    className={`w-full h-10 px-3 rounded-lg text-xs ${theme.inputClass}`}
                    id="add-ann-title"
                  />
                </div>
                <div>
                  <textarea
                    value={newAnnContent}
                    onChange={(e) => setNewAnnContent(e.target.value)}
                    placeholder="Provide full description. It rolls over on screens..."
                    rows={3}
                    className={`w-full p-3 rounded-lg text-xs ${theme.inputClass}`}
                    id="add-ann-content"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (newAnnTitle && newAnnContent) {
                      addAnnouncement(newAnnTitle, newAnnContent);
                      setNewAnnTitle('');
                      setNewAnnContent('');
                    }
                  }}
                  className="h-10 px-4 rounded-lg bg-[#D4AF37] hover:bg-amber-500 active:scale-95 text-yellow-950 font-sans text-xs font-bold flex items-center justify-center gap-1.5 transition-all w-full"
                  id="submit-ann-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Bulletin</span>
                </button>
              </div>

              {/* List of existing Announcements */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                {data.announcements.map((ann) => (
                  <div key={ann.id} className="p-3 rounded-xl bg-[#c5e6d6]/5 border border-white/5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-white truncate">{ann.title}</h5>
                        <button
                          onClick={() => toggleAnnouncement(ann.id)}
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full border transition-colors ${
                            ann.active 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-stone-500/10 text-stone-400 border-white/5'
                          }`}
                        >
                          {ann.active ? 'Active' : 'Draft'}
                        </button>
                      </div>
                      <p className="text-[10px] text-stone-300 mt-1 line-clamp-2">{ann.content}</p>
                    </div>
                    <button
                      onClick={() => deleteAnnouncement(ann.id)}
                      className="p-1 rounded bg-stone-900 hover:bg-rose-950 text-stone-400 hover:text-rose-400 border border-white/5 transition-colors"
                      id={`delete-ann-${ann.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quotes Panel */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2 mt-0">
                <span>Rotating Spiritual Quotes</span>
                <span className="text-xs px-2.5 py-0.5 font-bold rounded-full bg-white/5 border border-white/10 text-stone-300">
                  {data.quotes.length} Total
                </span>
              </h3>

              {/* Add Quote Form */}
              <div className="p-4 rounded-xl bg-black/15 border border-white/5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Add New Verse/Hadith Quote</h4>
                <div>
                  <textarea
                    value={newQuoteText}
                    onChange={(e) => setNewQuoteText(e.target.value)}
                    placeholder="Quote text (e.g. Verily, in the remembrance of Allah do hearts find rest.)"
                    rows={2}
                    className={`w-full p-3 rounded-lg text-xs ${theme.inputClass}`}
                    id="add-quote-text"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={newQuoteSource}
                    onChange={(e) => setNewQuoteSource(e.target.value)}
                    placeholder="Reference source (e.g. Quran 13:28 or Surah Al-Baqarah)"
                    className={`w-full h-10 px-3 rounded-lg text-xs ${theme.inputClass}`}
                    id="add-quote-source"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (newQuoteText && newQuoteSource) {
                      addQuote(newQuoteText, newQuoteSource);
                      setNewQuoteText('');
                      setNewQuoteSource('');
                    }
                  }}
                  className="h-10 px-4 rounded-lg bg-[#D4AF37] hover:bg-amber-500 active:scale-95 text-yellow-950 font-sans text-xs font-bold flex items-center justify-center gap-1.5 transition-all w-full"
                  id="submit-quote-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Quote</span>
                </button>
              </div>

              {/* List of existing Quotes */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                {data.quotes.map((quote) => (
                  <div key={quote.id} className="p-3 rounded-xl bg-[#c5e6d6]/5 border border-white/5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] text-stone-200 italic line-clamp-2">"{quote.text}"</p>
                      <span className="text-[9px] font-bold text-[#D4AF37] block mt-1 font-monoReference">— {quote.source}</span>
                    </div>
                    <button
                      onClick={() => deleteQuote(quote.id)}
                      className="p-1 rounded bg-stone-900 hover:bg-rose-950 text-stone-400 hover:text-rose-400 border border-white/5 transition-colors"
                      id={`delete-quote-${quote.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* MASJID SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Identity Column */}
            <div className="p-5 rounded-2xl bg-black/20 border border-white/5 space-y-4">
              <h3 className="text-base font-bold text-white mt-0 border-b border-white/5 pb-2">
                Sanctuary Identity Settings
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Masjid Board Name</label>
                  <input
                    type="text"
                    value={data.config.name}
                    onChange={(e) => handleConfigChange('name', e.target.value)}
                    className={`w-full h-11 px-3 rounded-lg text-sm ${theme.inputClass}`}
                    placeholder="Al-Noor Grand Mosque"
                    id="input-cfg-name"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Masjid Address</label>
                  <input
                    type="text"
                    value={data.config.address}
                    onChange={(e) => handleConfigChange('address', e.target.value)}
                    className={`w-full h-11 px-3 rounded-lg text-sm ${theme.inputClass}`}
                    placeholder="786 Mercy Way"
                    id="input-cfg-address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">City</label>
                    <input
                      type="text"
                      value={data.config.city || ''}
                      onChange={(e) => handleConfigChange('city', e.target.value)}
                      className={`w-full h-11 px-3 rounded-lg text-sm ${theme.inputClass}`}
                      placeholder="e.g. London"
                      id="input-cfg-city"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Country</label>
                    <input
                      type="text"
                      value={data.config.country || ''}
                      onChange={(e) => handleConfigChange('country', e.target.value)}
                      className={`w-full h-11 px-3 rounded-lg text-sm ${theme.inputClass}`}
                      placeholder="e.g. United Kingdom"
                      id="input-cfg-country"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Contact Phone Number</label>
                  <input
                    type="text"
                    value={data.config.contactPhone || ''}
                    onChange={(e) => handleConfigChange('contactPhone', e.target.value)}
                    className={`w-full h-11 px-3 rounded-lg text-sm ${theme.inputClass}`}
                    placeholder="e.g. +44 20 7946 0192"
                    id="input-cfg-contactphone"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Pass PIN Code rotate</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={data.config.pinCode}
                      onChange={(e) => handleConfigChange('pinCode', e.target.value.replace(/\D/g, ''))}
                      className={`w-full h-11 px-3 rounded-lg font-mono text-sm tracking-widest text-[#D4AF37] ${theme.inputClass}`}
                      id="input-cfg-pin"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Hijri Moon Drift</label>
                    <select
                      value={data.config.hijriAdjustment}
                      onChange={(e) => handleConfigChange('hijriAdjustment', parseInt(e.target.value, 10))}
                      className={`w-full h-11 px-2 rounded-lg text-xs ${theme.inputClass}`}
                      id="input-cfg-hijri"
                    >
                      <option value="-3">-3 days</option>
                      <option value="-2">-2 days</option>
                      <option value="-1">-1 day</option>
                      <option value="0">On Target (0)</option>
                      <option value="1">+1 day</option>
                      <option value="2">+2 days</option>
                      <option value="3">+3 days</option>
                    </select>
                  </div>
                </div>

                {/* Mosque Logo Provider Options */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Logo Provider</label>
                    <select
                      value={data.config.logoType}
                      onChange={(e) => handleConfigChange('logoType', e.target.value as 'preset' | 'url')}
                      className={`w-full h-11 px-2 rounded-lg text-xs ${theme.inputClass}`}
                      id="input-cfg-logotype"
                    >
                      <option value="preset">Masjid Presets</option>
                      <option value="url">External Image Link</option>
                    </select>
                  </div>

                  {data.config.logoType === 'preset' ? (
                    <div>
                      <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Icon Preset</label>
                      <select
                        value={data.config.logoPreset}
                        onChange={(e) => handleConfigChange('logoPreset', e.target.value)}
                        className={`w-full h-11 px-2 rounded-lg text-xs ${theme.inputClass}`}
                        id="input-cfg-logopreset"
                      >
                        <option value="mosque">Mosque Arch Dome</option>
                        <option value="crescent">Crescent Moon</option>
                        <option value="star">Star Crescent</option>
                        <option value="kaaba">Al-Kaaba Graphic</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Image URL Address</label>
                      <input
                        type="url"
                        value={data.config.logoUrl || ''}
                        onChange={(e) => handleConfigChange('logoUrl', e.target.value)}
                        className={`w-full h-11 px-3 rounded-lg text-xs ${theme.inputClass}`}
                        placeholder="https://example.com/logo.png"
                        id="input-cfg-logourl"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Display preferences Column */}
            <div className="p-5 rounded-2xl bg-black/20 border border-white/5 space-y-4">
              <h3 className="text-base font-bold text-white mt-0 border-b border-white/5 pb-2">
                Board Configuration Preferences
              </h3>

              <div className="space-y-4">
                {/* Theme Selections */}
                <div>
                  <label className="text-[10px] uppercase font-mono text-stone-400 block mb-2">Display Visual Themes</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'editorial-aesthetic', name: 'Editorial (Onyx & Gold)', bg: 'bg-[#0A0C10] text-[#D4AF37] border border-[#D4AF37]/35 font-serif' },
                      { id: 'emerald-dark', name: 'Emerald (Dark)', bg: 'bg-emerald-950 text-emerald-200' },
                      { id: 'emerald-light', name: 'Islamic Ivory', bg: 'bg-stone-100 text-emerald-900 border border-emerald-900/10' },
                      { id: 'slate-gold', name: 'Obsidian & Gold', bg: 'bg-neutral-900 text-amber-300 border border-amber-300/10' },
                      { id: 'royal-blue', name: 'Sapphire Navy', bg: 'bg-indigo-950 text-sky-200' },
                    ].map(themeOpt => {
                      const isActive = data.config.themeId === themeOpt.id;
                      return (
                        <button
                          key={themeOpt.id}
                          onClick={() => handleConfigChange('themeId', themeOpt.id)}
                          className={`p-3 rounded-xl text-left cursor-pointer transition-all flex flex-col justify-between h-20 ${themeOpt.bg} ${
                            isActive ? 'ring-2 ring-amber-400 scale-[1.02]' : 'opacity-65 hover:opacity-100'
                          }`}
                          id={`theme-btn-${themeOpt.id}`}
                        >
                          <span className="text-xs font-bold">{themeOpt.name}</span>
                          <span className="text-[9px] font-mono self-end flex items-center gap-1">
                            {isActive && <Check className="w-3 h-3 text-emerald-300" />}
                            {isActive ? 'Active' : 'Select'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Astronomical Calculations Column */}
            <div className="p-5 rounded-2xl bg-black/20 border border-white/5 space-y-4">
              <h3 className="text-base font-bold text-white mt-0 border-b border-white/5 pb-2 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#D4AF37]" />
                Prayer Times Calculation Module
              </h3>

              <div className="space-y-4">
                {/* Active Toggle */}
                <div className="p-4 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white text-xs font-sans">
                      Automatic Calculations
                    </span>
                    <p className="text-[10px] text-stone-400 leading-snug">
                      Computes live daily times using GPS coordinates.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleConfigChange('useCalculatedTimes', !data.config.useCalculatedTimes)}
                    className={`h-9 px-3 rounded-lg font-sans text-xs font-bold flex items-center gap-1.5 transition-all ${
                      data.config.useCalculatedTimes
                        ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]'
                        : 'bg-stone-800 border border-stone-700 text-stone-400'
                    }`}
                    id="toggle-calculations-btn"
                  >
                    <span>{data.config.useCalculatedTimes ? "Active" : "Manual"}</span>
                  </button>
                </div>

                {data.config.useCalculatedTimes && (
                  <div className="space-y-3">
                    {/* Location Presets */}
                    <div>
                      <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Preset Locations</label>
                      <div className="grid grid-cols-3 gap-1.5 text-center">
                        {[
                          { name: 'London', lat: 51.5074, lng: -0.1278 },
                          { name: 'Makkah', lat: 21.4225, lng: 39.8262 },
                          { name: 'New York', lat: 40.7128, lng: -74.0060 },
                          { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
                          { name: 'Karachi', lat: 24.8607, lng: 67.0011 },
                          { name: 'Sydney', lat: -33.8688, lng: 151.2093 }
                        ].map((loc) => {
                          const isCurrent = 
                            Math.abs((data.config.latitude || 0) - loc.lat) < 0.01 && 
                            Math.abs((data.config.longitude || 0) - loc.lng) < 0.01;
                          return (
                            <button
                              key={loc.name}
                              type="button"
                              onClick={() => {
                                handleConfigChange('latitude', loc.lat);
                                handleConfigChange('longitude', loc.lng);
                              }}
                              className={`py-1 px-1.5 rounded text-[10px] truncate border font-sans font-medium transition-all cursor-pointer ${
                                isCurrent 
                                  ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white' 
                                  : 'bg-neutral-950 hover:bg-stone-900 border-white/5 text-stone-300'
                              }`}
                            >
                              {loc.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Coordinates Inputs */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={data.config.latitude ?? ''}
                          onChange={(e) => handleConfigChange('latitude', parseFloat(e.target.value) || 0)}
                          className={`w-full h-11 px-3 rounded-lg text-xs font-mono text-white ${theme.inputClass}`}
                          placeholder="e.g. 51.5074"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={data.config.longitude ?? ''}
                          onChange={(e) => handleConfigChange('longitude', parseFloat(e.target.value) || 0)}
                          className={`w-full h-11 px-3 rounded-lg text-xs font-mono text-white ${theme.inputClass}`}
                          placeholder="e.g. -0.1278"
                        />
                      </div>
                    </div>

                    {/* Method & Madhab */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Calculation Method</label>
                        <select
                          value={data.config.calculationMethod || 'MuslimWorldLeague'}
                          onChange={(e) => handleConfigChange('calculationMethod', e.target.value)}
                          className={`w-full h-11 px-2 rounded-lg text-xs text-white ${theme.inputClass}`}
                        >
                          <option value="MuslimWorldLeague">Muslim World League (MWL)</option>
                          <option value="NorthAmerica">ISNA (North America)</option>
                          <option value="Egyptian">Egyptian General Authority</option>
                          <option value="Karachi">University of Islamic Sciences, Karachi</option>
                          <option value="UmmAlQura">Umm Al-Qura (Makkah)</option>
                          <option value="Kuwait">Kuwait Civil Authority</option>
                          <option value="Qatar">Qatar Calendar House</option>
                          <option value="Singapore">MUIS Singapore</option>
                          <option value="Turkey">Turkey Diyanet</option>
                          <option value="Dubai">Dubai Awqaf</option>
                          <option value="Tehran">Institute of Geophysics, Tehran</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Asr Madhab Calculation</label>
                        <select
                          value={data.config.madhab || 'Shafi'}
                          onChange={(e) => handleConfigChange('madhab', e.target.value)}
                          className={`w-full h-11 px-2 rounded-lg text-xs text-white ${theme.inputClass}`}
                        >
                          <option value="Shafi">Standard (Shafi'i, Maliki, Hanbali)</option>
                          <option value="Hanafi">Hanafi (Later Asr shadow ratio)</option>
                        </select>
                      </div>
                    </div>

                    {/* Help Note */}
                    <div className="p-3 bg-[#104E3B]/10 rounded-xl border border-[#104E3B]/30 text-[10px] text-stone-300 leading-normal">
                      <span className="font-bold text-[#D4AF37] block mb-0.5 font-sans uppercase tracking-wider">ASTRONOMICAL ALIGNED</span>
                      The dashboard automatically handles solar declination changes based on your exact coordinates. Dynamic values roll over daily.
                    </div>
                  </div>
                )}

                {!data.config.useCalculatedTimes && (
                  <div className="p-4 bg-stone-900/40 border border-stone-800 rounded-xl text-center">
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Manual override mode is active. You can edit the Adhan times individually inside the "Prayers" tab above.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
