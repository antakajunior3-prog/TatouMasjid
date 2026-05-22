import React, { useState, useEffect } from 'react';
import { DashboardProvider, useDashboard } from './DashboardContext';
import { ClockAndCountdown } from './components/ClockAndCountdown';
import { PrayerRow } from './components/PrayerRow';
import { AnnouncementsSlideshow } from './components/AnnouncementsSlideshow';
import { JummahSection } from './components/JummahSection';
import { PinLockOverlay } from './components/PinLockOverlay';
import { AdminConsole } from './components/AdminConsole';
import { ContactCard } from './components/ContactCard';
import { MultiMosqueSelector } from './components/MultiMosqueSelector';
import { AuthMenu } from './components/AuthMenu';
import { getNextPrayer } from './utils';
import { VISUAL_THEMES } from './components/ThemeStyles';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tv, 
  Settings, 
  MoonStar, 
  Home, 
  RotateCw,
  Lock,
  Info,
  MapPin,
  Globe
} from 'lucide-react';

// Handcrafted responsive Islamic preset SVG vectors
const LogoIcon: React.FC<{ type: string; className?: string }> = ({ type, className = "w-10 h-10" }) => {
  if (type === 'crescent') {
    return (
      <svg viewBox="0 0 100 100" className={`${className} text-[#D4AF37] fill-none stroke-current`}>
        <path d="M30 50 A 22 22 0 1 0 73 35 A 19 19 0 1 1 45 68" fill="currentColor" fillOpacity="0.1" strokeWidth="2.5" />
      </svg>
    );
  }
  if (type === 'star') {
    return (
      <svg viewBox="0 0 100 100" className={`${className} text-[#D4AF37] fill-none stroke-current`}>
        <path d="M28 50 A 22 22 0 1 0 70 36 A 18 18 0 1 1 42 66" fill="currentColor" fillOpacity="0.1" strokeWidth="2.5" />
         <polygon points="68,22 71,29 78,29 73,34 75,41 68,36 61,41 63,34 58,29 65,29" fill="currentColor" strokeWidth="0" />
      </svg>
    );
  }
  if (type === 'kaaba') {
    return (
      <svg viewBox="0 0 100 100" className={`${className} text-[#D4AF37] fill-none stroke-current`} strokeWidth="2">
        <polygon points="50,15 85,28 85,68 50,85 15,68 15,28" fill="currentColor" fillOpacity="0.05" />
        <polygon points="50,30 15,18 15,58 50,70" fill="currentColor" fillOpacity="0.15" />
        <polygon points="54,30 85,18 85,58 50,70" fill="currentColor" fillOpacity="0.25" />
        <polygon points="15,24 50,36 85,24 85,28 50,40 15,28" fill="currentColor" />
        <path d="M50,70 V30" />
      </svg>
    );
  }
  
  // Default 'mosque' dome graphic
  return (
    <svg viewBox="0 0 100 100" className={`${className} text-[#D4AF37] fill-none stroke-current`} strokeWidth="2">
      <path d="M50 20 C35 38 40 55 50 55 C60 55 65 38 50 20 Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M50 14 v6" />
      <path d="M25 80 V55 L50 40 L75 55 V80 Z" />
      <path d="M42 80 V68 C42 62 58 62 58 68 V80 Z" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 80 V40 L16 34 L20 40 V80 Z" />
      <path d="M16 28 v6" />
      <path d="M80 80 V40 L84 34 L88 40 V80 Z" />
      <path d="M84 28 v6" />
      <path d="M5 80 h90" strokeLinecap="round" />
    </svg>
  );
};

function MainDashboard() {
  const { data, isLoading, isAdmin, mosqueSlug, selectMosque } = useDashboard();
  const [isTVMode, setIsTVMode] = useState(false);
  const [isAdminConsoleOpen, setIsAdminConsoleOpen] = useState(false);
  const [isPinOverlayOpen, setIsPinOverlayOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Countdowns anchor timing updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#06140E] flex flex-col justify-center items-center p-4">
        <RotateCw className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
        <h2 className="text-white font-sans text-lg font-bold tracking-wide animate-pulse">
          Connecting to Masjid Sync Node...
        </h2>
        <p className="text-xs text-emerald-400 font-mono mt-1">Downloading timetable parameters</p>
      </div>
    );
  }

  // If no mosque is selected, show the central directory Selector Page
  if (!mosqueSlug) {
    return <MultiMosqueSelector />;
  }

  const theme = VISUAL_THEMES[data.config.themeId] || VISUAL_THEMES['editorial-aesthetic'];
  const { prayer: nextP } = getNextPrayer(data.prayers, currentTime);

  // Quick auth verification login
  const handleAdminClick = () => {
    if (isAdmin) {
      setIsAdminConsoleOpen(true);
    } else {
      setIsPinOverlayOpen(true);
    }
  };

  const handleAdminSuccess = () => {
    setIsPinOverlayOpen(false);
    setIsAdminConsoleOpen(true);
  };

  // Render landscape dynamic Large TV Mode
  if (isTVMode) {
    return (
      <div className={`fixed inset-0 w-screen h-screen ${theme.bgClass} p-6 flex flex-col justify-between overflow-hidden transition-colors duration-500`}>
        {/* TV Header row */}
        <div className="flex justify-between items-center pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            {data.config.logoType === 'url' && data.config.logoUrl ? (
              <img 
                src={data.config.logoUrl} 
                alt="Masjid Logo" 
                className="w-11 h-11 object-contain rounded-xl bg-white/5 p-1 border border-white/10" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="p-1 rounded-xl bg-white/5 border border-white/10">
                <LogoIcon type={data.config.logoPreset} className="w-10 h-10" />
              </div>
            )}
            <div>
              <h1 className="text-2xl mt-0 font-bold font-serif uppercase tracking-wide text-[#D4AF37] leading-none flex items-center gap-2">
                <span>{data.config.name}</span>
              </h1>
              <div className="flex items-center gap-2 text-[10px] text-stone-400 font-sans mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#D4AF37]" />
                  {data.config.city}, {data.config.country}
                </span>
                <span>•</span>
                <span>{data.config.address}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#D4AF37] font-sans flex items-center gap-1.5 px-3 py-1 bg-[#D4AF37]/5 border border-[#D4AF37]/15 rounded-full animate-pulse">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              Masjid Sanctuary Broadcast
            </span>
          </div>
        </div>

        {/* TV Columns: Left grid has clock, right has jummah & contacts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-4 flex-grow overflow-hidden">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex-grow">
              <ClockAndCountdown isTVMode={true} />
            </div>
          </div>
          <div className="flex flex-col gap-6 overflow-y-auto scrollbar-none justify-between">
            <div className="flex-grow">
              <JummahSection isTVMode={true} />
            </div>
            <ContactCard isTVMode={true} />
          </div>
        </div>

        {/* TV prayers timing row */}
        <div className="py-2">
          <PrayerRow isTVMode={true} nextPrayerId={nextP.id} />
        </div>

        {/* TV footer and admin gate actions */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex-grow pr-16">
            <AnnouncementsSlideshow />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => selectMosque('')}
              className="h-9 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[#D4AF37] text-xs font-semibold flex items-center gap-2 active:scale-95 transition-all select-none cursor-pointer"
              id="tv-back-directory"
            >
              <Home className="w-4 h-4" />
              <span>Back to Directory</span>
            </button>
            <button
              onClick={() => setIsTVMode(false)}
              className="h-9 px-4 rounded-xl bg-white/5 border border-white/10 text-stone-300 hover:text-white text-xs font-semibold flex items-center gap-2 active:scale-95 transition-all select-none cursor-pointer"
              id="tv-exit-btn"
            >
              <span>Exit TV Mode</span>
            </button>
            <button
              onClick={handleAdminClick}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-amber-400/10 text-stone-400 hover:text-[#D4AF37] border border-white/5 transition-colors cursor-pointer"
              title="Admin console lock"
              aria-label="Admin settings lock"
              id="tv-lock-btn"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isPinOverlayOpen && (
            <PinLockOverlay 
              onClose={() => setIsPinOverlayOpen(false)} 
              onSuccess={handleAdminSuccess}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Render Admin Console viewport
  if (isAdminConsoleOpen) {
    return (
      <div className={`min-h-screen w-full ${theme.bgClass} flex flex-col transition-colors duration-500`}>
        <header className="border-b border-white/15 py-4 px-6 flex justify-between items-center bg-black/10">
          <div className="flex items-center gap-2">
            <MoonStar className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-sans font-bold text-slate-100 flex items-center gap-2">
              <span>{data.config.name}</span>
              <span className="text-xs text-stone-400 font-normal">({data.config.city}, {data.config.country})</span>
            </span>
          </div>
          <button
            onClick={() => setIsAdminConsoleOpen(false)}
            className="text-xs text-stone-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            id="nav-exit-admin"
          >
            Go To Dashboard
          </button>
        </header>
        <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">
          <AdminConsole onExit={() => setIsAdminConsoleOpen(false)} />
        </main>
      </div>
    );
  }

  // Render Standard mobile friendly layout
  return (
    <div className={`min-h-screen w-full ${theme.bgClass} pb-12 transition-colors duration-500`}>
      {/* Upper Navigation Navbar */}
      <header className="border-b border-white/15 py-4 px-4 md:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            {data.config.logoType === 'url' && data.config.logoUrl ? (
              <img 
                src={data.config.logoUrl} 
                alt="Masjid" 
                className="w-10 h-10 object-contain rounded-xl bg-white/5 p-1 border border-white/10" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="p-1.5 rounded-xl bg-white/5 border border-white/10">
                <LogoIcon type={data.config.logoPreset} className="w-8 h-8" />
              </div>
            )}
            <div>
              <h1 className="text-xl md:text-2xl mt-0 font-bold font-serif uppercase tracking-wide text-[#D4AF37] leading-tight">
                {data.config.name}
              </h1>
              <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-sans mt-0.5">
                <MapPin className="w-3 h-3 text-[#D4AF37]" />
                <span>{data.config.city}, {data.config.country}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => selectMosque('')}
              className="h-10 px-3 md:px-4 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 font-sans text-xs font-semibold flex items-center justify-center gap-2 border border-white/10 active:scale-95 transition-all cursor-pointer"
              id="standard-back-directory-btn"
            >
              <Home className="w-4 h-4 text-emerald-400" />
              <span>All Mosques</span>
            </button>
            <button
              onClick={() => setIsTVMode(true)}
              className="h-10 px-3 md:px-4 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] font-sans text-xs font-semibold flex items-center justify-center gap-2 border border-[#D4AF37]/20 active:scale-95 transition-all cursor-pointer"
              id="standard-tv-mode-btn"
            >
              <Tv className="w-4 h-4" />
              <span>TV screen</span>
            </button>
            <button
              onClick={handleAdminClick}
              className={`h-10 px-3 md:px-4 rounded-xl font-sans text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer ${
                isAdmin 
                  ? 'bg-emerald-600/10 border border-emerald-500/30 text-emerald-300' 
                  : 'bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300'
              }`}
              id="standard-admin-btn"
            >
              {isAdmin ? <Lock className="w-4 h-4 text-emerald-400" /> : <Settings className="w-4 h-4" />}
              <span>{isAdmin ? "Admin Active" : "Configure"}</span>
            </button>
            <AuthMenu 
              onSelectAllMosques={() => selectMosque('')}
              onEnterTVMode={() => setIsTVMode(true)}
              onEnterAdminConsole={handleAdminClick}
            />
          </div>
        </div>
      </header>

      {/* Main viewport panels */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Administrator guidance notice */}
        <div className="p-4 rounded-2xl bg-black/15 border border-white/5 flex gap-3 items-start">
          <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-stone-300 leading-relaxed font-sans">
            <strong className="text-white font-medium text-xs">Lobby Display Guide</strong>: 
            Initialize standard flatscreens or landscape lobby displays using our custom <strong className="text-[#D4AF37]">TV screen</strong> mode layout button at the top-right. Modify scheduled timings, contact numbers, scrolling announcements, or Friday khateeb lists in the <strong className="text-[#D4AF37]">Configure</strong> console. (The active login passcode PIN is <strong className="text-[#D4AF37] font-mono">1234</strong>). If you wish to switch or add another mosque, tap the <strong className="text-[#D4AF37]">All Mosques</strong> index locator.
          </div>
        </div>

        {/* Row 1: Clock module, Friday assemblies, Contacts details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ClockAndCountdown isTVMode={false} />
          </div>
          <div className="flex flex-col gap-6 justify-between">
            <JummahSection isTVMode={false} />
            <ContactCard isTVMode={false} />
          </div>
        </div>

        {/* Row 2: Announcements Slideshow bulletins */}
        <AnnouncementsSlideshow />

        {/* Row 3: Standard prayers block */}
        <div className="space-y-4">
          <div className="flex justify-between items-baseline">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#D4AF37] font-sans mt-0">
              Daily Prayer Timetable
            </h3>
            <span className="text-[10px] text-stone-500 font-mono">
              Last Synchronized: {new Date(data.lastUpdated).toLocaleTimeString()}
            </span>
          </div>
          <PrayerRow isTVMode={false} nextPrayerId={nextP.id} />
        </div>

      </main>

      <AnimatePresence>
        {isPinOverlayOpen && (
          <PinLockOverlay 
            onClose={() => setIsPinOverlayOpen(false)} 
            onSuccess={handleAdminSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <DashboardProvider>
      <MainDashboard />
    </DashboardProvider>
  );
}
