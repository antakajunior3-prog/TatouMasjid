import React, { useState, useEffect } from 'react';
import { useDashboard } from '../DashboardContext';
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone, Quote, ChevronRight, ChevronLeft, MapPin } from 'lucide-react';
import { VISUAL_THEMES } from './ThemeStyles';

export const AnnouncementsSlideshow: React.FC = () => {
  const { data } = useDashboard();
  const theme = VISUAL_THEMES[data.config.themeId] || VISUAL_THEMES['editorial-aesthetic'];

  // Keep track of active announcements
  const activeAnnouncements = data.announcements.filter(a => a.active);
  const [annIndex, setAnnIndex] = useState(0);
  
  // Keep track of quotes
  const quotesList = data.quotes;
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Interval rotation for announcements (6 seconds)
  useEffect(() => {
    if (activeAnnouncements.length <= 1) return;
    const interval = setInterval(() => {
      setAnnIndex((prev) => (prev + 1) % activeAnnouncements.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeAnnouncements.length]);

  // Interval rotation for quotes (10 seconds)
  useEffect(() => {
    if (quotesList.length <= 1) return;
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotesList.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [quotesList.length]);

  const currentAnnouncement = activeAnnouncements[annIndex];
  const currentQuote = quotesList[quoteIndex];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      
      {/* Dynamic Announcement Panel */}
      <div className={`p-6 md:p-8 rounded-3xl ${theme.cardClass} relative flex flex-col justify-between overflow-hidden min-h-[220px] transition-all duration-300`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-emerald-500/15 rounded-lg border border-emerald-500/20 text-[#D4AF37]">
            <Megaphone className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">
            Mosque Announcements
          </h3>
          {activeAnnouncements.length > 1 && (
            <div className="ml-auto flex items-center gap-1">
              {activeAnnouncements.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setAnnIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === annIndex ? 'w-4 bg-emerald-400' : 'w-1.5 bg-stone-700 hover:bg-stone-550'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="relative flex-grow flex items-center">
          <AnimatePresence mode="wait">
            {currentAnnouncement ? (
              <motion.div
                key={currentAnnouncement.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full"
              >
                <h4 className="text-lg font-semibold text-[#D4AF37] font-sans tracking-tight">
                  {currentAnnouncement.title}
                </h4>
                <p className="text-slate-300 text-sm md:text-base mt-2 leading-relaxed" id="ann-content">
                  {currentAnnouncement.content}
                </p>
                <span className="text-[10px] text-stone-500 font-mono mt-3 inline-block">
                  Posted: {currentAnnouncement.createdAt}
                </span>
              </motion.div>
            ) : (
              <div className="text-slate-400 text-sm font-sans italic py-4">
                No active announcements at this time. Check back later for masjid events and schedules.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Rotating Spiritual Quote Panel */}
      <div className={`p-6 md:p-8 rounded-3xl ${theme.cardClass} relative flex flex-col justify-between overflow-hidden min-h-[220px] transition-all duration-300`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-[#D4AF37]">
            <Quote className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">
            Word of Wisdom
          </h3>
          {quotesList.length > 1 && (
            <div className="ml-auto flex items-center gap-1">
              {quotesList.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setQuoteIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === quoteIndex ? 'w-4 bg-amber-400' : 'w-1.5 bg-stone-700 hover:bg-stone-550'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="relative flex-grow flex items-center py-2">
          <AnimatePresence mode="wait">
            {currentQuote ? (
              <motion.div
                key={currentQuote.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full flex flex-col justify-center h-full"
              >
                <p className="text-slate-100 text-base md:text-lg italic font-serif leading-relaxed" id="wisdom-quote">
                  "{currentQuote.text}"
                </p>
                <span className="text-xs font-mono font-medium text-[#D4AF37] mt-3 block text-right">
                  — {currentQuote.source}
                </span>
              </motion.div>
            ) : (
              <div className="text-slate-400 text-sm font-sans italic py-4">
                Establish prayer, for it is indeed the key to ultimate success.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
};
