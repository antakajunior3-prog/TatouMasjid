import React, { useState } from 'react';
import { useDashboard } from '../DashboardContext';
import { 
  Plus, 
  Search, 
  MapPin, 
  Phone, 
  MoonStar, 
  ArrowRight, 
  Sparkles, 
  PlusCircle, 
  ShieldAlert,
  Globe,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthMenu } from './AuthMenu';

export const MultiMosqueSelector: React.FC = () => {
  const { allMosques, createMosque, selectMosque } = useDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('1234');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate slug helper
  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // remove special chars
      .replace(/\s+/g, '-')          // replace spaces with hyphens
      .replace(/-+/g, '-');         // remove multiple consecutive hyphens
    setSlug(generatedSlug);
  };

  const handleSlugChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setSlug(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !slug || !city || !country || !address) {
      setErrorMsg("All fields with an asterisk (*) are required.");
      return;
    }

    if (slug.length < 3) {
      setErrorMsg("URL Slug must be at least 3 characters.");
      return;
    }

    setIsSubmitting(true);
    const success = await createMosque(slug, name, city, country, phone, address, pin);
    setIsSubmitting(false);

    if (success) {
      // Form fields reset
      setName('');
      setSlug('');
      setCity('');
      setCountry('');
      setAddress('');
      setPhone('');
      setPin('1234');
      setIsFormOpen(false);
    } else {
      setErrorMsg("Failed to create the mosque. The URL slug may already be taken.");
    }
  };

  // Filter list of mosques
  const filteredMosques = allMosques.filter(m => {
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.city.toLowerCase().includes(q) ||
      m.country.toLowerCase().includes(q) ||
      m.slug.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#06140E] bg-radial-[at_top_right] from-[#0E2E1F] via-[#06140E] to-[#030A07] text-stone-200 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Block with elegant Islamic geometric mood */}
        <div className="text-center relative py-8 mb-12">
          {/* Subtle Arch decorative layout in bg */}
          <div className="absolute inset-0 flex justify-center opacity-5 pointer-events-none -top-6">
            <svg viewBox="0 0 100 100" fill="currentColor" className="w-48 h-48 text-emerald-400">
              <path d="M50,0 C75,25 100,50 100,100 L0,100 C0,50 25,25 50,0 Z" />
            </svg>
          </div>

          <div className="flex justify-center mb-3">
            <div className="p-3 bg-amber-500/10 rounded-full border border-amber-500/35 text-[#D4AF37] animate-pulse">
              <MoonStar className="w-8 h-8" />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold font-serif text-[#D4AF37] tracking-tight mt-0">
            Islamic Sanctuary Boards
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mx-auto mt-2 leading-relaxed">
            Beautifully synchronizing adhan time calculations, manual overrides, and scrolling bulletin announcements on secondary lobby TVs worldwide.
          </p>
        </div>

        {/* Dynamic directory panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Directory Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search and Top Row */}
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative flex-grow w-full">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-500" />
                <input
                  type="text"
                  placeholder="Search by name, city, or country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-black/40 border border-white/10 text-xs font-medium text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
                  id="search-mosques-input"
                />
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <AuthMenu />
                <button
                  onClick={() => setIsFormOpen(!isFormOpen)}
                  className="h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md active:bg-emerald-700 select-none cursor-pointer whitespace-nowrap"
                  id="toggle-create-form-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Mosque</span>
                </button>
              </div>
            </div>

            {/* Grid of Mosques */}
            {filteredMosques.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredMosques.map((mosque) => (
                  <div
                    key={mosque.slug}
                    onClick={() => selectMosque(mosque.slug)}
                    className="p-5 rounded-2xl bg-stone-900/40 border border-white/5 hover:border-[#D4AF37]/35 hover:bg-black/40 transition-all duration-300 cursor-pointer flex flex-col justify-between group shadow-lg group-hover:shadow-[#D4AF37]/5"
                    id={`mosque-card-${mosque.slug}`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 lowercase tracking-wider">
                          /{mosque.slug}
                        </span>
                        <div className="text-stone-500 group-hover:text-[#D4AF37] transition-colors">
                          <Compass className="w-4 h-4 animate-spin-slow" />
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white font-serif tracking-tight leading-snug group-hover:text-[#D4AF37] transition-colors mt-0">
                        {mosque.name}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-2 font-sans">
                        <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                        <span>{mosque.city || "Various"}, {mosque.country || "Global"}</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-[#D4AF37]">
                      <span>Connect Monitor</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-black/20 border border-white/5">
                <p className="text-stone-400 text-sm">No synchronized mosques match your search query.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs font-semibold text-[#D4AF37] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* Form & Sidebar Column */}
          <div className="space-y-6">
            
            {/* Direct dynamic form render */}
            <AnimatePresence mode="wait">
              {isFormOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="p-6 rounded-2xl bg-stone-900/60 border border-[#D4AF37]/20 shadow-2xl relative"
                >
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-1.5 font-serif mt-0">
                    <PlusCircle className="w-4 h-4 text-[#D4AF37]" />
                    Register Your Sanctuary
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    {errorMsg && (
                      <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-1.5">
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>{errorMsg}</div>
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Mosque Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Al-Noor Islamic Center"
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-black/60 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                        id="form-mosque-name"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-mono text-[#D4AF37] block mb-1">URL Address path Slug *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-mono text-stone-500 select-none">/</span>
                        <input
                          type="text"
                          placeholder="e.g. al-noor-center"
                          value={slug}
                          onChange={(e) => handleSlugChange(e.target.value)}
                          className="w-full h-10 pl-6 pr-3 rounded-lg bg-black/60 border border-white/15 text-xs text-amber-300 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          required
                          id="form-mosque-slug"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">City *</label>
                        <input
                          type="text"
                          placeholder="e.g. Cardiff"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg bg-black/60 border border-white/10 text-xs text-white"
                          required
                          id="form-mosque-city"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Country *</label>
                        <input
                          type="text"
                          placeholder="e.g. Wales"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg bg-black/60 border border-white/10 text-xs text-white"
                          required
                          id="form-mosque-country"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Street Address *</label>
                      <input
                        type="text"
                        placeholder="e.g. 52 Castle Way, CF10 1BS"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-black/60 border border-white/10 text-xs text-white"
                        required
                        id="form-mosque-address"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Inquiries Phone Number</label>
                      <input
                        type="text"
                        placeholder="e.g. +44 29 2048 0122"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-black/60 border border-white/10 text-xs text-white font-mono"
                        id="form-mosque-phone"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Admin console passcode PIN</label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="e.g. 1234"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full h-10 px-3 rounded-lg bg-black/60 border border-[#D4AF37]/15 text-xs text-[#D4AF37] font-mono tracking-widest font-semibold"
                        id="form-mosque-pin"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-bold active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 select-none cursor-pointer mt-5"
                      id="submit-register-btn"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      <span>{isSubmitting ? "Provisioning..." : "Launch Board Terminal"}</span>
                    </button>
                  </form>
                </motion.div>
              ) : (
                <div className="p-6 rounded-2xl bg-stone-900/30 border border-white/5 space-y-4">
                  <h3 className="text-base font-bold text-white font-serif mt-0">
                    Administrator QuickStart
                  </h3>
                  <p className="text-[11px] text-stone-400 leading-relaxed font-sans">
                    Setting up a synchronized TV screen in your masjid lobby takes less than two minutes. Click the <strong>Register Mosque</strong> button at the top to configure coordinates for automated prayer computations and broadcast live instantly.
                  </p>
                  
                  <div className="p-3.5 bg-black/20 rounded-xl border border-white/5 flex gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0 animate-ping"></div>
                    <p className="text-[10px] text-stone-300 leading-relaxed">
                      All dashboards fully support **real-time cloud synchronization**. Any adjustment saved in the administrative console synchronizes loaded lobby screens on physical monitors within milliseconds.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>
    </div>
  );
};
