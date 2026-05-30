import React, { useState, useEffect } from 'react';
import { DashboardProvider, useDashboard } from './DashboardContext';
import { ClockAndCountdown } from './components/ClockAndCountdown';
import { PrayerRow } from './components/PrayerRow';
import { AnnouncementsSlideshow } from './components/AnnouncementsSlideshow';
import { JummahSection } from './components/JummahSection';
import { PinLockOverlay } from './components/PinLockOverlay';
import { AdminConsole } from './components/AdminConsole';
import { ContactCard } from './components/ContactCard';
import { MosqueMap } from './components/MosqueMap';
import { SubscriptionModal } from './components/SubscriptionModal';
import { SubscriptionStatusBar } from './components/SubscriptionStatusBar';
import { SubscriptionLock } from './components/SubscriptionLock';
import { MultiMosqueSelector } from './components/MultiMosqueSelector';
import { AuthMenu } from './components/AuthMenu';
import { RegisterMosquePage, MosqueAdminLoginPage, SuperAdminDashboardPage } from './components/SaaSPages';
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
  Globe,
  ShieldAlert
} from 'lucide-react';

// Handcrafted responsive Islamic preset SVG vectors
const LogoIcon: React.FC<{ type: string; className?: string }> = ({ type, className = "w-10 h-10" }) => {
  const gradientId = `gold-grad-${type}`;

  if (type === 'crescent') {
    return (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gradientId} x1="15%" y1="15%" x2="85%" y2="85%">
            <stop offset="0%" stopColor="#FFECA1" />
            <stop offset="40%" stopColor="#E9C149" />
            <stop offset="70%" stopColor="#C39A2B" />
            <stop offset="100%" stopColor="#87620F" />
          </linearGradient>
          <filter id="crescent-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Soft background golden orbit */}
        <circle cx="50" cy="50" r="42" stroke={`url(#${gradientId})`} strokeWidth="1" strokeDasharray="3 6" className="opacity-40 animate-[spin_80s_linear_infinite]" />
        
        {/* The Luxury-Crafted Crescent Moon */}
        <path 
          d="M62 18 C41 18 24 35 24 56 C24 77 41 94 62 94 C48 94 36 82 36 56 C36 30 48 18 62 18 Z" 
          fill={`url(#${gradientId})`} 
          filter="url(#crescent-glow)"
          stroke="#5a420b"
          strokeWidth="0.5"
          className="drop-shadow-[0_2px_8px_rgba(212,175,55,0.35)]"
        />

        {/* Small sparkling geometric dot accent */}
        <circle cx="36" cy="24" r="1.5" fill="#FFF" className="animate-ping" style={{ animationDuration: '4s' }} />
        <circle cx="48" cy="84" r="1" fill="#FFECA1" className="animate-pulse" />
      </svg>
    );
  }

  if (type === 'star') {
    return (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gradientId} x1="15%" y1="15%" x2="85%" y2="85%">
            <stop offset="0%" stopColor="#FFECA1" />
            <stop offset="40%" stopColor="#E9C149" />
            <stop offset="70%" stopColor="#C39A2B" />
            <stop offset="100%" stopColor="#87620F" />
          </linearGradient>
          <linearGradient id="emerald-star-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <filter id="crescent-glow-2" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Decorative thin geometry lines */}
        <circle cx="50" cy="50" r="44" stroke={`url(#${gradientId})`} strokeWidth="0.5" strokeDasharray="2 4" className="opacity-30" />
        <circle cx="50" cy="50" r="41" stroke="#D4AF37" strokeWidth="0.5" className="opacity-20" />
        
        {/* Crescent Moon */}
        <path 
          d="M58 22 C39 22 24 37 24 56 C24 75 39 90 58 90 C45 90 34 79 34 56 C34 33 45 22 58 22 Z" 
          fill={`url(#${gradientId})`}
          filter="url(#crescent-glow-2)"
          stroke="#5a420b"
          strokeWidth="0.5"
          className="drop-shadow-[0_2px_6px_rgba(212,175,55,0.3)]"
        />

        {/* Dynamic 8-Point Rub el Hizb Star shining beautifully in the crescent opening */}
        <g transform="translate(64, 56) scale(0.85)">
          {/* Back square */}
          <polygon 
            points="-12,0 0,-12 12,0 0,12" 
            fill="url(#emerald-star-grad)" 
            stroke={`url(#${gradientId})`} 
            strokeWidth="1.5" 
          />
          {/* Rotated square */}
          <polygon 
            points="-8.48,-8.48 8.48,-8.48 8.48,8.48 -8.48,8.48" 
            fill="url(#emerald-star-grad)" 
            stroke={`url(#${gradientId})`} 
            strokeWidth="1.5" 
          />
          {/* Inner gold core */}
          <circle cx="0" cy="0" r="4" fill={`url(#${gradientId})`} />
          <circle cx="0" cy="0" r="1.5" fill="#FFF" className="animate-ping" style={{ animationDuration: '3s' }} />
        </g>
      </svg>
    );
  }

  if (type === 'kaaba') {
    return (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gradientId} x1="15%" y1="15%" x2="85%" y2="85%">
            <stop offset="0%" stopColor="#FFECA1" />
            <stop offset="40%" stopColor="#E9C149" />
            <stop offset="70%" stopColor="#C39A2B" />
            <stop offset="100%" stopColor="#87620F" />
          </linearGradient>
          <linearGradient id="kaaba-wall-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2D2D2D" />
            <stop offset="100%" stopColor="#121212" />
          </linearGradient>
          <linearGradient id="kaaba-wall-light" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A4A4A" />
            <stop offset="100%" stopColor="#1F1F1F" />
          </linearGradient>
        </defs>
        {/* Surrounding Islamic Arched Outer Border */}
        <path d="M50 4 C15 15 15 35 15 80 L85 80 C85 35 85 15 50 4 Z" stroke={`url(#${gradientId})`} strokeWidth="1" strokeDasharray="3 3" className="opacity-30" />

        {/* Isometric Kaaba Building */}
        <g transform="translate(0, 5)">
          {/* Base shadow */}
          <polygon points="50,82 84,65 50,48 16,65" fill="#000" className="opacity-30 blur-[2px]" />
          
          {/* Left Wall (Shadow Side) */}
          <polygon points="50,80 16,63 16,33 50,50" fill="url(#kaaba-wall-dark)" stroke="#1F1F1F" strokeWidth="0.5" />
          
          {/* Right Wall (Direct Light Side) */}
          <polygon points="54,80 84,65 84,35 54,50" fill="url(#kaaba-wall-light)" stroke="#1F1F1F" strokeWidth="0.5" />
          
          {/* Imperial Golden Belt */}
          <polygon points="16,42 50,59 50,62 16,45" fill={`url(#${gradientId})`} className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
          <line x1="16" y1="42.5" x2="50" y2="59.5" stroke="#FFFFFF" strokeWidth="0.5" className="opacity-40" />
          
          <polygon points="54,59 84,44 84,47 54,62" fill={`url(#${gradientId})`} className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
          <line x1="54" y1="59.5" x2="84" y2="44.5" stroke="#FFFFFF" strokeWidth="0.5" className="opacity-40" />
          
          {/* Premium Golden Door detailing on Right Wall */}
          <polygon points="62,70 70,66 70,52 62,56" fill={`url(#${gradientId})`} stroke="#FFF" strokeWidth="0.25" className="drop-shadow-[0_1px_4px_rgba(212,175,55,0.4)]" />
          <path d="M62,56 C62,52 70,48 70,52" stroke="#AA7C11" strokeWidth="0.5" />
        </g>
      </svg>
    );
  }

  // Default 'mosque' dome graphic with a gorgeous crescent finial!
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gradientId} x1="15%" y1="15%" x2="85%" y2="85%">
          <stop offset="0%" stopColor="#FFECA1" />
          <stop offset="40%" stopColor="#E9C149" />
          <stop offset="70%" stopColor="#C39A2B" />
          <stop offset="100%" stopColor="#87620F" />
        </linearGradient>
        <linearGradient id="dome-grad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#0B261A" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id="accent-emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>
      </defs>

      {/* Decorative Outer Arch structure */}
      <path d="M50,11 C15,22 10,48 10,84 L90,84 C90,48 85,22 50,11 Z" stroke={`url(#${gradientId})`} strokeWidth="1" strokeDasharray="2 4" className="opacity-25" />

      {/* Background Soft Glow Aura */}
      <circle cx="50" cy="40" r="24" fill="url(#dome-grad)" className="opacity-20 filter blur-xl" />

      {/* Left and Right Minarets */}
      <g stroke={`url(#${gradientId})`} strokeWidth="1.25">
        <path d="M16,84 V38 L20,32 L24,38 V84" fill="url(#accent-emerald-grad)" fillOpacity="0.1" />
        <path d="M14,32 H26" strokeWidth="1.5" />
        <path d="M20,32 V24" />
        <path d="M19,21 C17,21 17,17 20,17 C21.5,17 22,20 22,21 C22,22.5 20.5,23 19,21" fill={`url(#${gradientId})`} strokeWidth="0.5" />
        
        <path d="M76,84 V38 L80,32 L84,38 V84" fill="url(#accent-emerald-grad)" fillOpacity="0.1" />
        <path d="M74,32 H86" strokeWidth="1.5" />
        <path d="M80,32 V24" />
        <path d="M79,21 C77,21 77,17 80,17 C81.5,17 82,20 82,21 C82,22.5 80.5,23 79,21" fill={`url(#${gradientId})`} strokeWidth="0.5" />
      </g>

      {/* Central Majestic Taj Mahal Dome with 3D gradient */}
      <path 
        d="M50,22 C34,40 34,58 34,70 C34,75 35,84 50,84 C65,84 66,75 66,70 C66,58 66,40 50,22 Z" 
        fill="url(#dome-grad)" 
        stroke={`url(#${gradientId})`} 
        strokeWidth="1.5" 
        className="drop-shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
      />

      {/* Golden Crescent Finial on top of Central Dome */}
      <g transform="translate(50, 15) scale(0.7)">
        <path d="M0,8 V0" stroke={`url(#${gradientId})`} strokeWidth="1.5" />
        <path 
          d="M3 -3 C-1.5 -3 -5 -0.5 -5 4 C-5 8.5 -1.5 11.5 3 11.5 C0 11.5 -2.5 9 -2.5 4 C-2.5 -1 0 -3 3 -3 Z" 
          fill={`url(#${gradientId})`}
          className="drop-shadow-[0_1px_3px_rgba(212,175,55,0.8)]"
        />
      </g>

      {/* Intricate Arched Entrance door */}
      <path 
        d="M44,84 V68 C44,61 56,61 56,68 V84 Z" 
        fill="url(#accent-emerald-grad)" 
        stroke={`url(#${gradientId})`} 
        strokeWidth="1.25" 
      />
      <path d="M50,61 V84" stroke={`url(#${gradientId})`} strokeWidth="0.5" strokeDasharray="1 2" className="opacity-60" />

      {/* Solid ground foundation line */}
      <line x1="8" y1="84" x2="92" y2="84" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

function MainDashboard() {
  const { data, isLoading, isAdmin, mosqueSlug, selectMosque, subscription } = useDashboard();
  const [isTVMode, setIsTVMode] = useState(false);
  const [isAdminConsoleOpen, setIsAdminConsoleOpen] = useState(false);
  const [isPinOverlayOpen, setIsPinOverlayOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
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

  // If specific SaaS paths are visited, render the corresponding views
  if (mosqueSlug === 'register-mosque') {
    return <RegisterMosquePage />;
  }
  if (mosqueSlug === 'admin-login') {
    return <MosqueAdminLoginPage />;
  }
  if (mosqueSlug === 'super-admin') {
    return <SuperAdminDashboardPage />;
  }

  // If no mosque is selected, show the central directory Selector Page
  if (!mosqueSlug) {
    return <MultiMosqueSelector />;
  }

  // deactivation check if mosque is disabled
  if (data.config && data.config.approvalStatus === 'Disabled') {
    return (
      <div className="fixed inset-0 bg-[#06140E] flex flex-col justify-center items-center text-center p-8 select-none">
        <div className="max-w-md p-8 bg-stone-900/95 rounded-3xl border border-rose-500/35 text-stone-200 shadow-2xl">
          <div className="mx-auto w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-400 mb-5 border border-rose-500/20">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#D4AF37] font-sans mt-0">
            Sanctuary Suspended
          </h3>
          <p className="text-xs text-stone-300 leading-relaxed mt-3 font-sans">
            This display terminal board has been deactivated by the platform owner. Please contact platform administration or customer support for assistance.
          </p>
          <button
            onClick={() => selectMosque('')}
            className="mt-6 px-5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white rounded-xl text-xs font-semibold cursor-pointer border border-white/5 active:scale-95 transition-all"
          >
            Go back to Directory
          </button>
        </div>
      </div>
    );
  }

  const theme = VISUAL_THEMES[data.config.themeId] || VISUAL_THEMES['editorial-aesthetic'];
  const { prayer: nextP } = getNextPrayer(data.prayers, currentTime);

  // Quick auth verification login
  const handleAdminClick = () => {
    if (subscription.status === 'expired') {
      setIsPricingOpen(true);
      return;
    }
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
    if (subscription.status === 'expired' || subscription.status === 'basic') {
      return (
        <div className={`fixed inset-0 w-screen h-screen ${theme.bgClass} flex flex-col justify-center items-center text-center p-8 overflow-hidden`}>
          <div className="p-5 bg-stone-900/90 rounded-3xl border border-rose-500/25 text-[#D4AF37] shadow-2xl mb-4 max-w-md">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] font-sans">
              {subscription.status === 'expired' ? "Evaluation Period Expired" : "Standard Plan Required"}
            </h3>
            <p className="text-[11px] text-stone-300 leading-relaxed mt-2 font-sans">
              {subscription.status === 'expired' 
                ? "Your 30-day evaluation trial has ended. Upgrade to a Standard or Premium package to reactivate this TV screen broadcast view."
                : "The widescreen TV screen broadcast view requires an active Standard or Premium subscriber package."}
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setIsTVMode(false);
                  setIsPricingOpen(true);
                }}
                className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black bg-[#D4AF37] rounded-xl font-sans hover:scale-105 active:scale-95 transition-all cursor-pointer"
                id="tv-lock-upgrade"
              >
                Upgrade Plan
              </button>
              <button
                onClick={() => setIsTVMode(false)}
                className="px-4 py-1.5 text-[10px] font-semibold text-stone-300 hover:text-white hover:bg-white/10 border border-white/10 rounded-xl font-sans transition-all active:scale-95 cursor-pointer"
                id="tv-lock-exit"
              >
                Exit Layout
              </button>
            </div>
          </div>
        </div>
      );
    }

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
            {isAdmin && (
              <button
                onClick={handleAdminClick}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-amber-400/10 text-stone-400 hover:text-[#D4AF37] border border-white/5 transition-colors cursor-pointer"
                title="Admin console lock"
                aria-label="Admin settings lock"
                id="tv-lock-btn"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}
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

  // Render Dedicated Mosque Admin Dashboard Website viewport
  if (isAdminConsoleOpen) {
    return <MosqueAdminLoginPage onExit={() => setIsAdminConsoleOpen(false)} />;
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
            {isAdmin && (
              <button
                onClick={handleAdminClick}
                className="h-10 px-3 md:px-4 rounded-xl font-sans text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer bg-emerald-600/10 border border-emerald-500/30 text-emerald-300"
                id="standard-admin-btn"
              >
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Admin Active</span>
              </button>
            )}
            <AuthMenu 
              onSelectAllMosques={() => selectMosque('')}
              onEnterTVMode={() => setIsTVMode(true)}
              onEnterAdminConsole={handleAdminClick}
            />
          </div>
        </div>
      </header>

      <SubscriptionStatusBar onUpgradeClick={() => setIsPricingOpen(true)} />

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
          <div className="flex flex-col gap-6">
            <SubscriptionLock requiredPlan="standard" onUpgradeClick={() => setIsPricingOpen(true)}>
              <JummahSection isTVMode={false} />
            </SubscriptionLock>
            <SubscriptionLock requiredPlan="basic" onUpgradeClick={() => setIsPricingOpen(true)}>
              <ContactCard isTVMode={false} />
            </SubscriptionLock>
            <SubscriptionLock requiredPlan="standard" onUpgradeClick={() => setIsPricingOpen(true)}>
              <MosqueMap />
            </SubscriptionLock>
          </div>
        </div>

        {/* Row 2: Announcements Slideshow bulletins */}
        <SubscriptionLock requiredPlan="standard" onUpgradeClick={() => setIsPricingOpen(true)}>
          <AnnouncementsSlideshow />
        </SubscriptionLock>

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
        {isPricingOpen && (
          <SubscriptionModal 
            isOpen={isPricingOpen} 
            onClose={() => setIsPricingOpen(false)} 
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
