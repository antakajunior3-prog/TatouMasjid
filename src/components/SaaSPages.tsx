import React, { useState, useEffect } from 'react';
import { useDashboard } from '../DashboardContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  KeyRound, 
  Plus, 
  ArrowLeft, 
  Check, 
  X, 
  ShieldCheck, 
  Search, 
  Lock, 
  RotateCw, 
  Sparkles, 
  UserCheck, 
  AlertTriangle,
  Settings,
  ShieldAlert,
  ArrowRight,
  LayoutDashboard,
  Clock,
  Users,
  Megaphone,
  Tv,
  CreditCard,
  LogOut,
  Sliders,
  Play,
  RotateCcw,
  Sparkle,
  Compass,
  Edit2,
  Trash2,
  Calendar,
  Volume2,
  VolumeX,
  ExternalLink,
  Crown,
  Layers,
  Heart,
  BookOpen,
  Info,
  ChevronRight,
  Eye,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ==========================================
// 1. REGISTER MOSQUE PAGE
// ==========================================
export const RegisterMosquePage: React.FC = () => {
  const { submitRegistration, selectMosque } = useDashboard();
  const [mosqueName, setMosqueName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const payload = { mosqueName, managerName, email, phone, city, country, address };
      const success = await submitRegistration(payload);
      if (success) {
        setSuccessData(payload);
      } else {
        setErrorMsg('Failed to process registration. Please check your credentials or network and try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="min-h-screen bg-[#050C08] bg-radial-[at_top_right] from-[#0D251A] via-[#050C08] to-[#020503] text-stone-200 flex flex-col justify-center items-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-stone-900/90 border border-emerald-500/30 rounded-3xl p-8 text-center shadow-2xl relative"
        >
          <div className="mx-auto w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-6">
            <ShieldCheck className="w-8 h-8 animate-pulse" />
          </div>

          <h2 className="text-xl font-serif font-bold text-[#D4AF37] tracking-tight mt-0">
            Registration Submitted!
          </h2>
          <p className="text-xs text-stone-300 leading-relaxed mt-3">
            Thank you for applying. We have received the application for <strong className="text-white">{successData.mosqueName}</strong> and marked its status as <strong className="text-amber-400">Pending Approval</strong>.
          </p>

          <div className="my-6 p-4 rounded-2xl bg-black/40 border border-white/5 text-left space-y-2 text-[11px] text-stone-400 font-sans">
            <div>• <strong className="text-stone-300">Manager:</strong> {successData.managerName}</div>
            <div>• <strong className="text-stone-300">Contact Email:</strong> {successData.email}</div>
            <div>• <strong className="text-stone-300">Location:</strong> {successData.city}, {successData.country}</div>
          </div>

          <p className="text-[10px] text-stone-500 leading-normal mb-6">
            Our platform administration team will review your request and authorize access credentials within 24 hours. A temporary code & password will be assigned once approved.
          </p>

          <button
            onClick={() => selectMosque('')}
            className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Directory</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050C08] bg-radial-[at_top_right] from-[#0D251A] via-[#050C08] to-[#020503] text-stone-200 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => selectMosque('')}
          className="mb-6 flex items-center gap-2 text-stone-450 hover:text-white transition-colors border-none bg-transparent cursor-pointer text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-stone-900/80 border border-emerald-500/10 p-6 md:p-8 shadow-2xl relative"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#D4AF37]/10 rounded-xl text-[#D4AF37] border border-[#D4AF37]/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-serif tracking-tight mt-0">
                Register Mosque
              </h2>
              <p className="text-[10px] text-stone-400 font-medium">Add your sanctuary to our synchronized SaaS system</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="text-[10px] uppercase font-mono tracking-wider text-stone-450 block mb-1">Mosque Name *</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 w-4 h-4 text-stone-500" />
                <input
                  type="text"
                  placeholder="e.g. Masjid Al-Farooq"
                  value={mosqueName}
                  onChange={(e) => setMosqueName(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-stone-550 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono tracking-wider text-stone-450 block mb-1">Imam / Manager Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-stone-500" />
                <input
                  type="text"
                  placeholder="e.g. Sheikh Yusuf Haris"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-stone-550 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono tracking-wider text-stone-455 block mb-1">Contact Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-stone-500" />
                <input
                  type="email"
                  placeholder="e.g. manager@masjid.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-stone-550 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono tracking-wider text-stone-450 block mb-1">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-stone-500" />
                <input
                  type="text"
                  placeholder="e.g. +44 20 7946 0122"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-stone-550 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="text-[10px] uppercase font-mono tracking-wider text-stone-450 block mb-1">City *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-stone-500" />
                  <input
                    type="text"
                    placeholder="e.g. London"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-10 pl-10 pr-3 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-stone-550 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-mono tracking-wider text-stone-450 block mb-1">Country *</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 w-4 h-4 text-stone-500" />
                  <input
                    type="text"
                    placeholder="e.g. United Kingdom"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full h-10 pl-10 pr-3 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-stone-550 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono tracking-wider text-stone-450 block mb-1">Street Address *</label>
              <input
                type="text"
                placeholder="e.g. 12 Regent Street, CF10 1BS"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-stone-550 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-sans text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mt-6"
            >
              {isSubmitting ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Submitting request...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

// ==========================================
// 2. MOSQUE ADMIN WEB CONSOLE & LOGIN PAGE
// ==========================================
export const MosqueAdminLoginPage: React.FC<{ onExit?: () => void }> = ({ onExit }) => {
  const { 
    data, 
    mosqueAdmin, 
    requestLoginOTP, 
    verifyLoginOTP, 
    logoutMosqueAdmin, 
    selectMosque,
    updateConfig,
    saveManualPrayerTimes,
    addAnnouncement,
    updateAnnouncement,
    toggleAnnouncement,
    deleteAnnouncement,
    addQuote,
    updateQuote,
    deleteQuote,
    subscription,
    upgradeSubscription
  } = useDashboard();

  // Authentication Fields (Passwordless Email OTP Verification)
  const [loginStep, setLoginStep] = useState<'email' | 'otp'>('email');
  const [emailInput, setEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(600); // 10 minutes (600 seconds)
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Keep verification code countdown timer active
  useEffect(() => {
    let interval: any = null;
    if (loginStep === 'otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    } else if (otpTimer === 0 && loginStep === 'otp') {
      setErrorMsg("The 6-digit verification code has expired. Please request a new code.");
    }
    return () => clearInterval(interval);
  }, [loginStep, otpTimer]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Dashboard Tab selection
  type AdminTab = 'overview' | 'profile' | 'prayers' | 'jummah' | 'announcements' | 'tv' | 'subscription';
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Interactive Form States
  const [successMsg, setSuccessMsg] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  // Mosque identity fields
  const [localName, setLocalName] = useState('');
  const [localAddress, setLocalAddress] = useState('');
  const [localPhone, setLocalPhone] = useState('');
  const [localCity, setLocalCity] = useState('');
  const [localCountry, setLocalCountry] = useState('');
  const [localLogoType, setLocalLogoType] = useState<'preset' | 'url'>('preset');
  const [localLogoPreset, setLocalLogoPreset] = useState('mosque');
  const [localLogoUrl, setLocalLogoUrl] = useState('');
  const [localLatitude, setLocalLatitude] = useState(51.5074);
  const [localLongitude, setLocalLongitude] = useState(-0.1278);

  // Prayers manual schedule edit states
  const [autoPrayers, setAutoPrayers] = useState(true);
  const [prayersList, setPrayersList] = useState<any[]>([]);
  const [jummahSession, setJummahSession] = useState<any | null>(null);

  // New Bulletins form fields
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);

  // New Spiritual verse form fields
  const [newQuoteText, setNewQuoteText] = useState('');
  const [newQuoteSource, setNewQuoteSource] = useState('');
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

  // TV mock board previews
  const [selectedPreviewTheme, setSelectedPreviewTheme] = useState('editorial-aesthetic');
  const [tvMockAnnouncementIndex, setTvMockAnnouncementIndex] = useState(0);

  // Synced local inputs from model update
  useEffect(() => {
    if (data && data.config) {
      setLocalName(data.config.name || '');
      setLocalAddress(data.config.address || '');
      setLocalPhone(data.config.contactPhone || '');
      setLocalCity(data.config.city || '');
      setLocalCountry(data.config.country || '');
      setLocalLogoType(data.config.logoType || 'preset');
      setLocalLogoPreset(data.config.logoPreset || 'mosque');
      setLocalLogoUrl(data.config.logoUrl || '');
      setLocalLatitude(data.config.latitude ?? 51.5074);
      setLocalLongitude(data.config.longitude ?? -0.1278);
      setAutoPrayers(data.config.useCalculatedTimes ?? true);
      setPrayersList(data.prayers || []);
      if (data.jummah && data.jummah.length > 0) {
        setJummahSession(data.jummah[0]);
      } else {
        setJummahSession({ id: 'jummah-1', name: 'Jummah Prayers', khutbahTime: '13:15', iqamahTime: '13:30', khateeb: 'Sheikh Imam' });
      }
    }
  }, [data]);

  // Rotate simulated announcements on TV preview
  useEffect(() => {
    if (data.announcements && data.announcements.length > 1) {
      const timer = setInterval(() => {
        setTvMockAnnouncementIndex(prev => (prev + 1) % data.announcements.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [data.announcements]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoggingIn(true);
    setSuccessMsg('');

    try {
      const result = await requestLoginOTP(emailInput);
      if (result.success && result.code) {
        setSimulatedOtp(result.code);
        setOtpTimer(600);
        setLoginStep('otp');
        triggerToast("Verification code generated and sent successfully!");
      } else {
        setErrorMsg(result.error || "This email address is not an approved Mosque administrator.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to trigger verification code email.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (otpTimer === 0) {
      setErrorMsg("This code has expired. Please request a new code.");
      return;
    }
    setIsLoggingIn(true);

    try {
      const result = await verifyLoginOTP(emailInput, otpInput);
      if (result.success) {
        triggerToast("Authorized successfully! Loading admin console...");
      } else {
        setErrorMsg(result.error || "Invalid or expired verification code.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMsg('');
    setIsLoggingIn(true);
    try {
      const result = await requestLoginOTP(emailInput);
      if (result.success && result.code) {
        setSimulatedOtp(result.code);
        setOtpTimer(600);
        triggerToast("A new 6-digit verification code has been generated.");
      } else {
        setErrorMsg(result.error || "Failed to resend code.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error resending code.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateConfig({
        name: localName,
        address: localAddress,
        contactPhone: localPhone,
        city: localCity,
        country: localCountry,
        logoType: localLogoType,
        logoPreset: localLogoPreset,
        logoUrl: localLogoUrl,
        latitude: Number(localLatitude),
        longitude: Number(localLongitude)
      });
      triggerToast('Mosque identification data saved and synced successfully.');
    } catch (err: any) {
      alert('Error updating profile: ' + err.message);
    }
  };

  const handleSavePrayers = async () => {
    try {
      await saveManualPrayerTimes(autoPrayers, prayersList, jummahSession ? [jummahSession] : []);
      triggerToast('Prayer schedules, offsets and Friday Jummah parameters synced.');
    } catch (e: any) {
      alert('Sync failed: ' + e.message);
    }
  };

  const triggerToast = (msg: string) => {
    setSuccessMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3500);
  };

  // Render Login Panel if not logged in
  if (!mosqueAdmin) {
    return (
      <div className="min-h-screen bg-[#050C08] bg-radial-[at_top_right] from-[#0E2D1F] via-[#050C08] to-[#020503] text-stone-200 flex flex-col justify-center items-center py-16 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-md w-full">
          <button
            onClick={() => selectMosque('')}
            className="mb-6 flex items-center gap-2 text-stone-400 hover:text-white transition-colors border-none bg-transparent cursor-pointer text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Main Directory</span>
          </button>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-stone-900/95 border border-emerald-500/20 p-6 md:p-8 shadow-2xl relative"
          >
            {/* Islamic Elegant header banner */}
            <div className="text-center mb-6 border-b border-white/5 pb-6">
              <span className="text-[#D4AF37] font-serif text-[28px] leading-none mb-2 block font-extrabold tracking-wide">
                TatouMasjid
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-emerald-400 block font-bold">
                Admin SaaS Console
              </span>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                {loginStep === 'email' 
                  ? "Enter your registered administrator email to receive a secure, one-time verification login code."
                  : `Enter the 6-digit secure code sent to ${emailInput.toLowerCase()} to authorize your session.`
                }
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {loginStep === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block mb-1.5 font-bold">Admin Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[#D4AF37]" />
                    <input
                      type="email"
                      placeholder="manager@yourmosque.org"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full h-11 pl-11 pr-3 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-400 py-1 font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    Secure Passwordless Admin Login
                  </span>
                  <span className="text-zinc-500">Ver 2.5</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 text-white font-sans text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mt-4 shadow-lg shadow-emerald-950/20"
                >
                  {isLoggingIn ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin text-white" />
                      <span>Verifying and dispatching...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 text-amber-300" />
                      <span>Send Verification Code</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block font-bold">6-Digit Access Code *</label>
                    <span className={`text-[10px] font-mono font-bold flex items-center gap-1 ${otpTimer < 120 ? 'text-amber-400' : 'text-stone-400'}`}>
                      <Clock className="w-3 h-3 animate-pulse" />
                      Expires: {formatTimer(otpTimer)}
                    </span>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-[#D4AF37]" />
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full h-11 pl-11 pr-3 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono tracking-widest text-center text-sm placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                {/* Visual Copy-pasteable Simulated Email Dispatch System Toast */}
                {simulatedOtp && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-200"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                        Simulated Email Inbox Notification
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(simulatedOtp);
                          triggerToast("Verification Code Copied!");
                        }}
                        className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-[9px] text-amber-300 font-bold transition-all border-none cursor-pointer"
                      >
                        Copy Code
                      </button>
                    </div>
                    <div className="space-y-0.5 text-stone-300 font-sans">
                      <p><strong className="text-white">To:</strong> {emailInput.toLowerCase()}</p>
                      <p><strong className="text-white">Code:</strong> <span className="font-mono text-amber-300 underline font-extrabold">{simulatedOtp}</span></p>
                    </div>
                  </motion.div>
                )}

                <div className="flex items-center justify-between text-[11px] font-sans text-stone-500 py-1">
                  <button
                    type="button"
                    onClick={() => setLoginStep('email')}
                    className="hover:text-[#D4AF37] underline transition-colors border-none bg-transparent cursor-pointer"
                  >
                    Change Email Address
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoggingIn}
                    className="hover:text-[#D4AF37] underline transition-colors border-none bg-transparent cursor-pointer disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn || otpTimer === 0}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-40 text-white font-sans text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 shadow-lg shadow-emerald-950/20"
                >
                  {isLoggingIn ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin text-white" />
                      <span>Authorizing Session...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-amber-300" />
                      <span>Verify and Enter Dashboard</span>
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 pt-5 border-t border-white/5 text-center text-[10px] text-stone-500 leading-relaxed font-sans">
              Only verified and pre-approved mosque administrators are permitted access. To approve a new manager email, complete the public registration page.
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Active Admin Session - Render Beautiful Separate Dashboard Website Portfolio
  return (
    <div className="min-h-screen bg-[#060D09] text-stone-205 flex flex-col md:flex-row font-sans selection:bg-[#D4AF37]/30">
      
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <div className="w-full md:w-64 bg-[#0a1410] border-r border-[#D4AF37]/10 flex flex-col justify-between p-4 flex-shrink-0">
        <div>
          {/* Dashboard Website Header */}
          <div className="pb-4 border-b border-white/5 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold font-serif text-[#D4AF37] tracking-tight">TatouMasjid</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider">PRO</span>
            </div>
            <p className="text-[10px] text-stone-400 mt-1 truncate">
              {data.config.name}
            </p>
          </div>

          {/* Navigation link triggers */}
          <nav className="space-y-1">
            {[
              { id: 'overview', name: 'Dashboard Home', icon: LayoutDashboard },
              { id: 'profile', name: 'Masjid Profile', icon: Building2 },
              { id: 'prayers', name: 'Prayer Timings', icon: Clock },
              { id: 'jummah', name: 'Friday Jummah', icon: Users },
              { id: 'announcements', name: 'Bulletins & Quotes', icon: Megaphone },
              { id: 'tv', name: 'Lobby TV Preview', icon: Tv },
              { id: 'subscription', name: 'SaaS Subscription', icon: CreditCard },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as AdminTab); setEditingAnnId(null); setEditingQuoteId(null); }}
                  className={`w-full h-10 px-3 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-l-2 border-[#D4AF37]' 
                      : 'text-stone-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-stone-450'}`} />
                    <span>{tab.name}</span>
                  </div>
                  <ChevronRight className={`w-3 h-3 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="pt-4 border-t border-white/5 space-y-3">
          <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-[10px]">
            <div className="flex items-center gap-1.5 text-stone-405">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Online - Synced RTDB</span>
            </div>
            <div className="text-zinc-500 mt-1 font-mono text-[9px] truncate">Admin: {mosqueAdmin.email}</div>
          </div>

          <button
            onClick={() => {
              if (onExit) onExit();
              else window.location.href = `/${mosqueAdmin.slug}`;
            }}
            className="w-full py-2 px-3 rounded-lg bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Tv className="w-4 h-4" />
            <span>View TV Display Board</span>
          </button>

          <button
            onClick={() => selectMosque('')}
            className="w-full py-2 px-3 rounded-lg hover:bg-white/5 text-stone-400 hover:text-[#D4AF37] text-left text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Compass className="w-4 h-4 text-stone-500" />
            <span>Go to Directories</span>
          </button>

          <button
            onClick={() => logoutMosqueAdmin()}
            className="w-full py-2 px-3 rounded-lg bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/15 text-rose-400 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Lock Console</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 min-h-screen overflow-y-auto bg-[#040906] p-4 md:p-8">
        
        {/* Dynamic global Action Success Toast notifications */}
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setShowNotification(false)} className="text-stone-400 hover:text-white font-bold cursor-pointer">✕</button>
          </motion.div>
        )}

        {/* Global Page heading & Current Plan visual badge */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-5 mb-8">
          <div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-tight mt-0 mb-1 flex items-center gap-2">
              <span>Masjid Administration Board</span>
              <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 font-bold uppercase leading-none tracking-widest">
                Admin Secure
              </span>
            </h1>
            <p className="text-xs text-stone-400">
              Operational administration portal of <strong className="text-white">{data.config.name}</strong> • Realtime Database is synchronized.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="px-3.5 py-1.5 rounded-xl bg-stone-900 border border-white/5 flex items-center gap-2">
              <span className="text-[10px] text-stone-400 uppercase font-mono tracking-wider font-semibold">Active Plan</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-bold text-white uppercase">{subscription.status}</span>
            </div>
          </div>
        </div>

        {/* TAB CONTENTS PANELS */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            
            {/* OVERVIEW DASHBOARD */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* Stats cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-stone-900/60 border border-white/5 space-y-2">
                    <span className="text-[10px] text-stone-450 uppercase font-mono tracking-wider">Subscription Validity</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white font-mono">{subscription.daysLeft}</span>
                      <span className="text-stone-400 text-xs">Days Left</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-1">
                      <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, (subscription.daysLeft / 30) * 100)}%` }}></div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-stone-900/60 border border-white/5 space-y-2">
                    <span className="text-[10px] text-stone-450 uppercase font-mono tracking-wider">Active Bulletins</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white font-mono">{data.announcements.filter(a => a.active).length}</span>
                      <span className="text-stone-400 text-xs">Publishing</span>
                    </div>
                    <p className="text-[10px] text-emerald-400">Synchronized on primary TV sliders</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-stone-900/60 border border-white/5 space-y-2">
                    <span className="text-[10px] text-stone-455 uppercase font-mono tracking-wider">Prayer Computation</span>
                    <div className="flex items-center gap-2 mt-1">
                      {autoPrayers ? (
                        <div className="font-sans text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/15">
                          GPS Coordinates Active
                        </div>
                      ) : (
                        <div className="font-sans text-amber-400 text-xs font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/15">
                          Manual Times Overridden
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-stone-400">Coordinate: {localLatitude.toFixed(3)}, {localLongitude.toFixed(3)}</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-stone-900/60 border border-white/5 space-y-2">
                    <span className="text-[10px] text-stone-450 uppercase font-mono tracking-wider">Spiritual Verses</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white font-mono">{data.quotes.length}</span>
                      <span className="text-stone-400 text-xs">In Rotation</span>
                    </div>
                    <p className="text-[10px] text-stone-400">Assisting Friday Khutbah and slides</p>
                  </div>
                </div>

                {/* Sub banner highlighting Islamic architecture of TatouMasjid system */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/20 to-black border border-emerald-500/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-serif font-bold text-emerald-400 mt-0 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      Islamic Board synchronization live
                    </h3>
                    <p className="text-xs text-stone-300 max-w-xl">
                      Updates to adhan timings, fixed or relative Iqamah configurations, Friday speaker notifications, or announcement lists synchronize immediately inside local directories and secondary lobby screens worldwide.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('tv')}
                    className="h-10 px-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/35 text-[#D4AF37] font-sans text-xs font-bold hover:bg-[#D4AF37]/20 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>Open Lobby Screen Preview</span>
                  </button>
                </div>

                {/* Quick times recap overview */}
                <div className="p-5 rounded-2xl bg-stone-900/40 border border-white/5">
                  <h3 className="text-xs uppercase font-mono tracking-wider text-stone-400 mb-4 font-bold">Current Synchronized Timings Recap</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                    {prayersList.map(p => (
                      <div key={p.id} className="p-4 rounded-xl bg-black/45 border border-white/5 space-y-2 text-center relative">
                        <span className="text-[10px] text-stone-450 block truncate font-bold font-serif">{p.name}</span>
                        <div className="text-white text-base font-bold font-mono">{p.adhan}</div>
                        {p.id !== 'sunrise' && (
                          <div className="text-[9px] text-[#D4AF37] font-mono px-1 py-0.5 rounded bg-amber-450/5 border border-[#D4AF37]/10 inline-block">
                            Iqamah: {p.iqamahType === 'relative' ? `${p.iqamahValue}m` : p.iqamahValue}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* MOSQUE PROFILE INFORMATION */}
            {activeTab === 'profile' && (
              <div className="max-w-2xl mx-auto rounded-3xl bg-stone-900/40 border border-white/5 p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                    <Building2 className="w-5 h-5 flex-shrink-0" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-serif mt-0">Mosque Information Settings</h3>
                    <p className="text-[10px] text-stone-400">Configure public credentials, digital identity, geometry, and logo styles</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block mb-1">Mosque Name *</label>
                    <input
                      type="text"
                      value={localName}
                      onChange={(e) => setLocalName(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                      placeholder="e.g. Al-Noor Grand Sanctuary"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block mb-1">Street Address *</label>
                    <input
                      type="text"
                      value={localAddress}
                      onChange={(e) => setLocalAddress(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                      placeholder="e.g. 786 Mercy Way, Suite B"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block mb-1">City *</label>
                      <input
                        type="text"
                        value={localCity}
                        onChange={(e) => setLocalCity(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                        placeholder="e.g. London"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block mb-1">Country *</label>
                      <input
                        type="text"
                        value={localCountry}
                        onChange={(e) => setLocalCountry(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                        placeholder="e.g. United Kingdom"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-mono tracking-wider text-stone-450 block mb-1">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={localLatitude}
                        onChange={(e) => setLocalLatitude(Number(e.target.value))}
                        className="w-full h-11 px-3.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono placeholder-stone-550 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="51.5074"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-mono tracking-wider text-stone-450 block mb-1">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={localLongitude}
                        onChange={(e) => setLocalLongitude(Number(e.target.value))}
                        className="w-full h-11 px-3.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono placeholder-stone-550 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="-0.1278"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block mb-1">Contact Phone Number</label>
                    <input
                      type="text"
                      value={localPhone}
                      onChange={(e) => setLocalPhone(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-stone-550 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                      placeholder="e.g. +44 20 7946 0192"
                    />
                  </div>

                  {/* Mosque Logo styles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/5">
                    <div>
                      <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block mb-1">Logo Type Provider</label>
                      <select
                        value={localLogoType}
                        onChange={(e) => setLocalLogoType(e.target.value as 'preset' | 'url')}
                        className="w-full h-11 px-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none"
                      >
                        <option value="preset">Masjid Presets</option>
                        <option value="url">External Image Link (URL)</option>
                      </select>
                    </div>

                    {localLogoType === 'preset' ? (
                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block mb-1">Preset Vector Icon</label>
                        <select
                          value={localLogoPreset}
                          onChange={(e) => setLocalLogoPreset(e.target.value)}
                          className="w-full h-11 px-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none"
                        >
                          <option value="mosque">Mosque Arch Dome</option>
                          <option value="crescent">Crescent Moon</option>
                          <option value="star">Star Crescent</option>
                          <option value="kaaba">Al-Kaaba Graphic</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block mb-1">Image URL Address</label>
                        <input
                          type="url"
                          value={localLogoUrl}
                          onChange={(e) => setLocalLogoUrl(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-5 border-t border-white/5 gap-3">
                  <button
                    onClick={handleSaveProfile}
                    className="h-11 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 text-white font-sans text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
                    id="save-mosque-profile-btn"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save & Sync Profile</span>
                  </button>
                </div>
              </div>
            )}

            {/* PRAYER TIMINGS MANAGEMENT */}
            {activeTab === 'prayers' && (
              <div className="space-y-6">
                
                {/* Computation switch block */}
                <div className="p-5 rounded-2xl bg-stone-900/60 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <span className="font-bold text-white text-sm font-serif flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#D4AF37]" />
                      Adhan Daily Computational Toggle
                    </span>
                    <p className="text-xs text-stone-400 max-w-xl">
                      {autoPrayers 
                        ? "Currently computed dynamically using GPS coordinates. Custom manual timings are disabled." 
                        : "Astronomical mathematical computations are OFF. Manual timetable entries are active below."}
                    </p>
                  </div>

                  <button
                    onClick={() => setAutoPrayers(!autoPrayers)}
                    className={`h-10 px-5 rounded-xl font-bold text-xs pointer-events-auto cursor-pointer transition-colors ${
                      autoPrayers 
                        ? 'bg-[#D4AF37] text-yellow-950 font-sans hover:bg-[#c49f2f]' 
                        : 'bg-stone-800 text-stone-300 border border-white/10 hover:bg-white/5'
                    }`}
                  >
                    {autoPrayers ? "Manual: calculations ON" : "Manual: calculations OFF"}
                  </button>
                </div>

                {autoPrayers && (
                  <div className="p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-start gap-3">
                    <Globe className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5 animate-pulse" />
                    <div className="text-xs text-stone-200 leading-relaxed font-sans">
                      <strong className="text-[#D4AF37]">Astronomical GPS computations are ACTIVE:</strong> Today's Adhan timers compute dynamically based on coordinates (<span className="text-white bg-black/45 px-1 py-0.5 rounded font-mono font-bold">{localLatitude}°N</span>, <span className="text-white bg-black/45 px-1 py-0.5 rounded font-mono font-bold">{localLongitude}°E</span>). To input exact custom schedules, disable calculations above.
                    </div>
                  </div>
                )}

                {/* Edit Form grid of 6 prayers */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {prayersList.map((prayer, pIdx) => {
                    const isSunrise = prayer.id === 'sunrise';
                    return (
                      <div key={prayer.id} className="p-4 rounded-2xl bg-stone-900/40 border border-white/5 space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                          <span className="font-bold text-white text-xs font-serif flex items-center gap-1.5">
                            <span>{prayer.name}</span>
                            <span className="text-[10px] text-[#D4AF37] font-normal">({prayer.arabicName})</span>
                          </span>
                          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-stone-400">
                            {prayer.id}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5">
                          {/* Adhan Timer */}
                          <div>
                            <label className="text-[9px] uppercase font-mono text-stone-450 block mb-1 font-semibold">Adhan Call</label>
                            <input
                              type="time"
                              value={prayer.adhan}
                              disabled={autoPrayers}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPrayersList(prev => prev.map(p => p.id === prayer.id ? { ...p, adhan: val } : p));
                              }}
                              className={`w-full h-10 px-2 rounded-lg font-mono text-xs bg-black text-white border border-white/10 ${
                                autoPrayers ? 'opacity-40 cursor-not-allowed bg-stone-950 border-stone-900' : ''
                              }`}
                            />
                          </div>

                          {/* Iqamah Type */}
                          {!isSunrise ? (
                            <div>
                              <label className="text-[9px] uppercase font-mono text-stone-450 block mb-1 font-semibold">Iqamah Type</label>
                              <select
                                value={prayer.iqamahType || 'relative'}
                                disabled={autoPrayers}
                                onChange={(e) => {
                                  const val = e.target.value as 'fixed' | 'relative';
                                  setPrayersList(prev => prev.map(p => p.id === prayer.id ? { ...p, iqamahType: val } : p));
                                }}
                                className={`w-full h-10 px-1 rounded-lg text-xs bg-black text-white border border-white/10 ${
                                  autoPrayers ? 'opacity-40 cursor-not-allowed bg-stone-950 border-stone-900' : ''
                                }`}
                              >
                                <option value="relative">Relative Offset</option>
                                <option value="fixed">Fixed Hour</option>
                              </select>
                            </div>
                          ) : (
                            <div className="text-[10px] text-stone-500 italic flex items-center pt-5">No Iqamah service</div>
                          )}
                        </div>

                        {/* Iqamah Values */}
                        {!isSunrise && (
                          <div className="pt-1">
                            {prayer.iqamahType === 'relative' ? (
                              <div>
                                <label className="text-[9px] uppercase font-mono text-stone-400 block mb-1">
                                  Offset span (minutes after Adhan)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="60"
                                  value={prayer.iqamahValue}
                                  disabled={autoPrayers}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setPrayersList(prev => prev.map(p => p.id === prayer.id ? { ...p, iqamahValue: val } : p));
                                  }}
                                  className={`w-full h-10 px-3 rounded-lg font-mono text-xs bg-black text-white border border-white/10 ${
                                    autoPrayers ? 'opacity-45 cursor-not-allowed text-stone-400 border-white/5' : ''
                                  }`}
                                  placeholder="e.g. 15"
                                />
                              </div>
                            ) : (
                              <div>
                                <label className="text-[9px] uppercase font-mono text-stone-400 block mb-1">
                                  Fixed Clock hours
                                </label>
                                <input
                                  type="time"
                                  value={prayer.iqamahValue}
                                  disabled={autoPrayers}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setPrayersList(prev => prev.map(p => p.id === prayer.id ? { ...p, iqamahValue: val } : p));
                                  }}
                                  className={`w-full h-10 px-3 rounded-lg font-mono text-xs bg-black text-white border border-white/10 ${
                                    autoPrayers ? 'opacity-45 cursor-not-allowed text-stone-400 border-white/5' : ''
                                  }`}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-5 border-t border-white/5">
                  <button
                    onClick={handleSavePrayers}
                    className="h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-550 text-white font-sans text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg active:scale-95"
                    id="save-timetable-btn"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Synchronize adhan & iqamah clock values</span>
                  </button>
                </div>

              </div>
            )}

            {/* FRIDAY JUMMAH MANAGEMENT */}
            {activeTab === 'jummah' && jummahSession && (
              <div className="max-w-xl mx-auto rounded-3xl bg-stone-900/40 border border-white/5 p-6 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <div className="p-2.5 bg-[#D4AF37]/10 rounded-xl text-[#D4AF37] border border-[#D4AF37]/20">
                    <Users className="w-5 h-5 flex-shrink-0" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-serif mt-0">Friday Jummah Management</h3>
                    <p className="text-[10px] text-stone-400">Manage your single Friday service, Khutbah timing, and authorized speaker</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block mb-1">Session Service Label</label>
                    <input
                      type="text"
                      value={jummahSession.name}
                      onChange={(e) => setJummahSession({ ...jummahSession, name: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block mb-1">Khutbah Commences</label>
                      <input
                        type="time"
                        value={jummahSession.khutbahTime}
                        onChange={(e) => setJummahSession({ ...jummahSession, khutbahTime: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block mb-1">Salah Begins</label>
                      <input
                        type="time"
                        value={jummahSession.iqamahTime}
                        onChange={(e) => setJummahSession({ ...jummahSession, iqamahTime: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-stone-450 block mb-1">Khateeb (Speaker / Imam)</label>
                    <input
                      type="text"
                      placeholder="Sheikh Yusuf Al-Sabah"
                      value={jummahSession.khateeb}
                      onChange={(e) => setJummahSession({ ...jummahSession, khateeb: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-5 border-t border-white/5">
                  <button
                    onClick={handleSavePrayers}
                    className="h-11 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 text-white font-sans text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
                    id="save-jummah-btn"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Friday Assembly Schedule</span>
                  </button>
                </div>
              </div>
            )}

            {/* ANNOUNCEMENTS BULLETINS & QUOTES */}
            {activeTab === 'announcements' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* announcements Column */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white font-serif mt-0 flex items-center gap-2">
                      <span>Lobby Bulletins</span>
                      <span className="text-[10px] font-sans font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-stone-300">
                        {data.announcements.length} Total
                      </span>
                    </h3>
                  </div>

                  {/* Add/Edit Announcement Form */}
                  <div className="p-4 rounded-2xl bg-stone-900/40 border border-[#D4AF37]/10 space-y-3.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mt-0">
                      {editingAnnId ? 'Modify Selected Bulletin' : 'Draft New Announcement'}
                    </h4>
                    
                    <div>
                      <input
                        type="text"
                        placeholder="Bulletin Title (e.g. Weekly Arabic Grammar class)"
                        value={newAnnTitle}
                        onChange={(e) => setNewAnnTitle(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <textarea
                        placeholder="Detailed bulletin context description..."
                        value={newAnnContent}
                        onChange={(e) => setNewAnnContent(e.target.value)}
                        rows={3}
                        className="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none resize-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          if (newAnnTitle && newAnnContent) {
                            if (editingAnnId) {
                              await updateAnnouncement(editingAnnId, newAnnTitle, newAnnContent);
                              setEditingAnnId(null);
                              triggerToast('Bulletin modified successfully.');
                            } else {
                              await addAnnouncement(newAnnTitle, newAnnContent);
                              triggerToast('Bulletin initialized and published.');
                            }
                            setNewAnnTitle('');
                            setNewAnnContent('');
                          } else {
                            alert('Please provide a title and context description.');
                          }
                        }}
                        className="h-9 px-4 rounded-lg bg-[#D4AF37] hover:bg-[#c49f2f] text-yellow-950 font-sans text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer flex-1"
                      >
                        {editingAnnId ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{editingAnnId ? 'Save Changes' : 'Publish to Lobby TV'}</span>
                      </button>

                      {editingAnnId && (
                        <button
                          onClick={() => {
                            setEditingAnnId(null);
                            setNewAnnTitle('');
                            setNewAnnContent('');
                          }}
                          className="h-9 px-3 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-300 font-sans text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bulletins listing */}
                  <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                    {data.announcements.map(ann => {
                      return (
                        <div key={ann.id} className="p-3.5 rounded-xl bg-stone-900/60 border border-white/5 flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-serif font-bold text-white truncate mt-0 mb-0">{ann.title}</h5>
                              <button
                                onClick={() => toggleAnnouncement(ann.id)}
                                className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border cursor-pointer transition-colors ${
                                  ann.active 
                                    ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20' 
                                    : 'bg-zinc-800 text-stone-400 border-white/5'
                                }`}
                              >
                                {ann.active ? 'On screen' : 'Draft'}
                              </button>
                            </div>
                            <p className="text-[10px] text-stone-300 mt-1.5 leading-relaxed font-sans">{ann.content}</p>
                            <span className="text-[9px] font-mono text-stone-500 block mt-2">published: {ann.createdAt}</span>
                          </div>

                          <div className="flex gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                setEditingAnnId(ann.id);
                                setNewAnnTitle(ann.title);
                                setNewAnnContent(ann.content);
                              }}
                              className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-indigo-400 border border-white/5 cursor-pointer"
                              title="Edit Bulletin content"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm('Delete this bulletin? It will clear from TV monitors.')) {
                                  await deleteAnnouncement(ann.id);
                                  triggerToast('Bulletin deleted representation cleared.');
                                }
                              }}
                              className="p-1.5 rounded bg-zinc-850 hover:bg-rose-950/20 text-rose-450 hover:text-rose-400 border border-white/5 cursor-pointer"
                              title="Delete announcement"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Islamic spiritual Quotes column */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white font-serif mt-0 flex items-center gap-2">
                    <span>Hadiths & Verses</span>
                    <span className="text-[10px] font-sans font-bold bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full text-stone-300">
                      {data.quotes.length} Total
                    </span>
                  </h3>

                  {/* Add / Edit spiritual Quote form */}
                  <div className="p-4 rounded-2xl bg-stone-900/40 border border-[#D4AF37]/10 space-y-3.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mt-0">
                      {editingQuoteId ? 'Modify Selected Verse' : 'Include Spiritual Verse / Citation'}
                    </h4>

                    <div>
                      <textarea
                        placeholder="e.g. Verily, in the remembrance of Allah do hearts find rest."
                        value={newQuoteText}
                        onChange={(e) => setNewQuoteText(e.target.value)}
                        rows={2}
                        className="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none resize-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Citations / Chapter (e.g. Surah Al-Rad 13:28 or Bukhari)"
                        value={newQuoteSource}
                        onChange={(e) => setNewQuoteSource(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          if (newQuoteText && newQuoteSource) {
                            if (editingQuoteId) {
                              await updateQuote(editingQuoteId, newQuoteText, newQuoteSource);
                              setEditingQuoteId(null);
                              triggerToast('Verse citations modified.');
                            } else {
                              await addQuote(newQuoteText, newQuoteSource);
                              triggerToast('New Spiritual verse added in slideshow queue.');
                            }
                            setNewQuoteText('');
                            setNewQuoteSource('');
                          } else {
                            alert('Verse body and citation source are required.');
                          }
                        }}
                        className="h-9 px-4 rounded-lg bg-[#D4AF37] hover:bg-[#c49f2f] text-yellow-950 font-sans text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer flex-1"
                      >
                        {editingQuoteId ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{editingQuoteId ? 'Save Changes' : 'Add Spiritual Citation'}</span>
                      </button>

                      {editingQuoteId && (
                        <button
                          onClick={() => {
                            setEditingQuoteId(null);
                            setNewQuoteText('');
                            setNewQuoteSource('');
                          }}
                          className="h-9 px-3 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-300 font-sans text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quotes listing */}
                  <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                    {data.quotes.map(item => (
                      <div key={item.id} className="p-3.5 rounded-xl bg-stone-900/60 border border-white/5 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] text-stone-200 italic font-sans leading-normal">"{item.text}"</p>
                          <span className="text-[10px] text-[#D4AF37] block mt-1 font-mono font-medium">— {item.source}</span>
                        </div>

                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setEditingQuoteId(item.id);
                              setNewQuoteText(item.text);
                              setNewQuoteSource(item.source);
                            }}
                            className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-indigo-400 border border-white/5 cursor-pointer"
                            title="Edit Quote"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm('Delete spiritual citation?')) {
                                  await deleteQuote(item.id);
                                  triggerToast('Spiritual verse cleared from TV rotate index.');
                              }
                            }}
                            className="p-1.5 rounded bg-zinc-850 hover:bg-rose-950/20 text-rose-450 hover:text-rose-400 border border-white/5 cursor-pointer"
                            title="Delete quote"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            )}

            {/* TV DASHBOARD LOBBY PREVIEWS */}
            {activeTab === 'tv' && (
              <div className="space-y-8">
                
                {/* Visual Settings and launch Controls */}
                <div className="p-5 rounded-2xl bg-stone-900/60 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                  <div className="space-y-1">
                    <h3 className="text-sm font-serif font-bold text-white mt-0 flex items-center gap-2">
                      <Tv className="w-4 h-4 text-[#D4AF37]" />
                      Lobby TV Screen Setup Panel
                    </h3>
                    <p className="text-xs text-stone-400">Select simulated display templates and launch fullscreen TV board displays inside secondary lobby TVs worldwide.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    {/* Theme selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-stone-450 uppercase whitespace-nowrap">Board Theme:</span>
                      <select
                        value={selectedPreviewTheme}
                        onChange={(e) => setSelectedPreviewTheme(e.target.value)}
                        className="text-xs bg-black text-stone-200 border border-white/10 rounded-lg p-1.5 focus:outline-none"
                      >
                        <option value="editorial-aesthetic">Editorial (Onyx & Gold)</option>
                        <option value="emerald-dark">Emerald (Classic Dark)</option>
                        <option value="emerald-light">Islamic Ivory (Light)</option>
                        <option value="slate-gold">Obsidian & Gold</option>
                        <option value="royal-blue">Sapphire Navy</option>
                      </select>
                    </div>

                    {/* Launch Public Screen Fullscreen Link */}
                    <a
                      href={`/${data.config.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-450 text-yellow-950 text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-md active:scale-95 whitespace-nowrap"
                    >
                      <span>Launch TV Fullscreen ↗</span>
                    </a>
                  </div>
                </div>

                {/* TV SCREEN INTERACTIVE MOCK FRAME */}
                <div className="rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-black max-w-4xl mx-auto relative group">
                  
                  {/* Outer design bezel */}
                  <div className="bg-zinc-900/90 py-1.5 px-4 text-[9px] font-mono text-zinc-500 flex justify-between border-b border-white/5">
                    <span>LOBBY PREVIEW SIMULATOR (TV Secondary Monitor)</span>
                    <span className="text-[#D4AF37] font-bold animate-pulse">● RECEIVING RE-SYNC EVENTS</span>
                  </div>

                  {/* Inner screen content styled matching the selected preview theme */}
                  <div className={`p-6 md:p-10 font-sans aspect-[16/9] flex flex-col justify-between transition-colors duration-500 relative ${
                    selectedPreviewTheme === 'editorial-aesthetic' ? 'bg-[#0A0C10] text-[#D4AF37]' :
                    selectedPreviewTheme === 'emerald-dark' ? 'bg-[#03150C] text-emerald-100' :
                    selectedPreviewTheme === 'emerald-light' ? 'bg-stone-50 text-emerald-950 border border-stone-200' :
                    selectedPreviewTheme === 'slate-gold' ? 'bg-neutral-900 text-amber-300' :
                    'bg-[#0a0f2b] text-sky-200'
                  }`}>
                    
                    {/* Screen Header */}
                    <div className="flex justify-between items-start border-b border-current/20 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-current flex items-center justify-center text-xl">
                          🕌
                        </div>
                        <div>
                          <h1 className="text-lg md:text-xl font-serif font-bold tracking-tight mt-0 mb-0">
                            {data.config.name}
                          </h1>
                          <p className={`text-[10px] opacity-75 mt-0.5 ${selectedPreviewTheme === 'emerald-light' ? 'text-stone-700' : 'text-stone-400'}`}>
                            {data.config.address}, {data.config.city}
                          </p>
                        </div>
                      </div>

                      {/* Giant Clock simulation inside monitor frame */}
                      <div className="text-right">
                        <div className="text-2xl md:text-3xl font-bold font-mono tracking-wide">
                          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div className="text-[9px] uppercase tracking-widest font-mono opacity-80 mt-0.5">
                          {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    {/* Mid content block: Prayer Grid of 6 */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 py-6">
                      {prayersList.map(pr => {
                        return (
                          <div key={pr.id} className="p-3 rounded-xl bg-white/5 border border-current/15 text-center flex flex-col justify-between h-24 relative">
                            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold opacity-85 block truncate">
                              {pr.name}
                            </span>
                            <div className="text-base font-extrabold font-mono my-1 tracking-tight">
                              {pr.adhan}
                            </div>
                            {pr.id !== 'sunrise' ? (
                              <span className="text-[8px] bg-black/40 text-[#D4AF37] px-1 py-0.5 rounded border border-current/10 truncate font-mono">
                                Iqamah: {pr.iqamahType === 'relative' ? `+${pr.iqamahValue}m` : pr.iqamahValue}
                              </span>
                            ) : (
                              <span className="text-[8px] italic opacity-60">No Salah</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom slider and quotes rotation */}
                    <div className="border-t border-current/20 pt-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-serif italic text-center md:text-left">
                      <div className="flex-1 max-w-lg">
                        <div className={`p-3.5 rounded-xl ${selectedPreviewTheme === 'emerald-light' ? 'bg-emerald-950/5' : 'bg-white/5'} border border-current/10 min-h-[50px] flex items-center justify-center`}>
                          {data.announcements && data.announcements.filter(a => a.active).length > 0 ? (
                            <div className="animate-fadeIn">
                              <strong className="font-sans not-italic text-[10px] uppercase tracking-wider text-[#D4AF37] bg-current/5 px-2 py-0.5 rounded block mb-1">
                                Bulletin Announcement: {data.announcements.filter(a => a.active)[tvMockAnnouncementIndex % data.announcements.filter(a => a.active).length]?.title}
                              </strong>
                              "{data.announcements.filter(a => a.active)[tvMockAnnouncementIndex % data.announcements.filter(a => a.active).length]?.content}"
                            </div>
                          ) : (
                            <div className="text-[10px] tracking-wide opacity-70">
                              No bulletins currently published. Rotation fallback to local spiritual verses and verses.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Friday Khateeb mini block */}
                      <div className="p-3.5 rounded-xl bg-black/30 border border-current/10 w-full md:w-56 text-center shrink-0">
                        <span className="text-[9px] uppercase font-mono tracking-wider text-[#D4AF37] block font-bold">Friday Jummah Service</span>
                        {jummahSession ? (
                          <div className="mt-1">
                            <div className="text-xs font-bold leading-none mt-0.5">{jummahSession.khutbahTime} • Khutbah</div>
                            <div className="text-[9px] opacity-75 mt-1 font-sans">khateeb: {jummahSession.khateeb || 'Sheikh Imam'}</div>
                          </div>
                        ) : (
                          <div className="text-[10px] mt-1 italic">Single session active</div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                <p className="text-xs text-stone-450 leading-relaxed max-w-lg mx-auto text-center font-sans">
                  The TV simulator previews live database feeds. Plug secondary televisions to your admin computer browser on <strong className="text-white font-mono bg-stone-900 border border-white/10 px-1 py-0.5 rounded">/{data.config.slug}</strong> to launch lobby boards.
                </p>

              </div>
            )}

            {/* BILLING & UPGRADES SUBSCRIPTION */}
            {activeTab === 'subscription' && (
              <div className="space-y-6">
                
                {/* Countdown ring card banner */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-stone-900/90 to-emerald-950/20 border border-white/5 flex flex-col md:flex-row items-center gap-6 justify-between select-none">
                  <div className="space-y-3 text-center md:text-left">
                    <span className="text-[10px] uppercase font-mono bg-amber-500/10 border border-amber-500/20 text-[#D4AF37] py-1 px-3.5 rounded-full font-bold">
                      Current: {subscription.packageType === 'None' ? '30-Day Free Trial' : subscription.packageType + ' Premium'}
                    </span>
                    <h3 className="text-xl md:text-2xl font-serif font-bold text-white tracking-tight mt-0">
                      Synchronized Cloud Node Subscription
                    </h3>
                    <p className="text-xs text-stone-300 max-w-md leading-relaxed">
                      Your current plan is configured on Firestore database nodes. Trial features are completely authenticated with full database synchronization capabilities active.
                    </p>
                  </div>

                  {/* Countdown indicator */}
                  <div className="p-4 rounded-full border-4 border-emerald-500/35 bg-black/45 w-28 h-28 flex flex-col justify-center items-center text-center shrink-0">
                    <span className="text-2xl font-bold font-mono text-emerald-400">{subscription.daysLeft}</span>
                    <span className="text-[9px] tracking-wide uppercase text-stone-400">Days Left</span>
                  </div>
                </div>

                {/* Sub Benefits Pricing level options */}
                <div className="space-y-4 pt-4">
                  <div className="text-center font-serif text-lg font-bold text-[#D4AF37] mb-2">Upgrade or Renew Adhan Nodes</div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { 
                        id: 'Basic', 
                        price: '$10/mo', 
                        desc: 'Perfect for local community masjids managing a single secondary TV board.',
                        benefits: ['Core daily prayer computations', 'Single TV monitor sync', 'Local offline database fallback', 'Custom Islamic Ivory theme']
                      },
                      { 
                        id: 'Standard', 
                        price: '$25/mo', 
                        desc: 'Excellent for growing urban masjids synchronizing multiple display panels.',
                        benefits: ['Instant RTDB Live updates', 'Unlimited lobby connected screens', 'Relative iqamah computation schedules', 'Onyx, sapphire, emerald templates']
                      },
                      { 
                        id: 'Premium', 
                        price: '$50/mo', 
                        desc: 'Full priority enterprise tier with access to bespoke features and developer priority integrations.',
                        benefits: ['Multi-administrator account controls', 'Premium Islamic Onyx Gold board theme', 'Dedicated priority setup hotline', 'API access endpoints']
                      }
                    ].map(tier => {
                      const isCurrent = subscription.packageType === tier.id;
                      return (
                        <div key={tier.id} className={`p-5 rounded-3xl bg-stone-900/40 border flex flex-col justify-between space-y-4 ${
                          isCurrent ? 'border-[#D4AF37] bg-stone-905 ring-1 ring-[#D4AF37]/50' : 'border-white/5'
                        }`}>
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-serif font-bold text-white mt-0">{tier.id} Plan</h4>
                              {isCurrent && (
                                <span className="text-[9px] uppercase font-mono px-2 py-0.5 bg-[#D4AF37]/15 text-[#D4AF37] rounded-full border border-[#D4AF37]/30 font-bold">
                                  Current Active
                                </span>
                              )}
                            </div>
                            <div className="text-2xl font-bold font-mono text-emerald-400">{tier.price}</div>
                            <p className="text-[10px] text-stone-400 leading-relaxed">{tier.desc}</p>
                          </div>

                          <ul className="text-[10px] text-stone-300 space-y-2.5 list-none pl-0">
                            {tier.benefits.map((b, bIdx) => (
                              <li key={bIdx} className="flex gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>

                          <button
                            onClick={async () => {
                              try {
                                await upgradeSubscription(tier.id as any);
                                triggerToast(`Sanctuary upgraded/renewed to ${tier.id} package successfully!`);
                              } catch (err: any) {
                                alert('Upgrade request failed: ' + err.message);
                              }
                            }}
                            disabled={isCurrent}
                            className={`w-full h-10 rounded-xl text-xs font-bold font-sans cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5 ${
                              isCurrent 
                                ? 'bg-stone-800 text-[#D4AF37] border border-[#D4AF37]/20 cursor-not-allowed opacity-80' 
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                            }`}
                          >
                            <Crown className="w-4 h-4" />
                            <span>{isCurrent ? 'Active Subscription' : `Select ${tier.id} Tier`}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
};

// ==========================================
// 3. SUPER ADMIN DASHBOARD PAGE (Platform Owner)
// ==========================================
export const SuperAdminDashboardPage: React.FC = () => {
  const { getRegistrations, updateRegistrationStatus, allMosques, updateConfig, selectMosque } = useDashboard();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'mosques'>('requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<Record<string, string>>({});
  const [approvalResults, setApprovalResults] = useState<Record<string, { code: string; pass: string }>>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [sucMsg, setSucMsg] = useState('');

  // Subscription Edit state block for SuperAdmin plan updates
  const [changingSubSlug, setChangingSubSlug] = useState<string | null>(null);
  const [overridePlanSelect, setOverridePlanSelect] = useState<'trial' | 'basic' | 'standard' | 'premium' | 'expired'>('trial');
  const [targetExpDate, setTargetExpDate] = useState('');

  const loadRegistrations = async () => {
    setIsLoading(true);
    try {
      const list = await getRegistrations();
      setRegistrations(list);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to load registrations from secure node.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const handleApprove = async (reg: any) => {
    const plan = selectedPlan[reg.id] || 'trial';
    try {
      const credentials = await updateRegistrationStatus(reg.id, 'Approved', plan);
      if (credentials) {
        setApprovalResults(prev => ({
          ...prev,
          [reg.id]: credentials
        }));
        setSucMsg(`Sanctuary '${reg.mosqueName}' approved successfully! Code & Password generated.`);
        loadRegistrations();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Approval process failed.');
    }
  };

  const handleReject = async (regId: string) => {
    if (!window.confirm("Are you sure you want to REJECT this mosque registration request?")) return;
    try {
      await updateRegistrationStatus(regId, 'Rejected');
      setSucMsg('Registration request has been rejected.');
      loadRegistrations();
    } catch (err: any) {
      setErrorMsg(err.message || 'Rejection failed.');
    }
  };

  const handleResetPassword = async (mosque: any) => {
    const newPass = Math.floor(100000 + Math.random() * 899999).toString();
    const cleanSlug = mosque.slug;
    if (!window.confirm(`Are you sure you want to reset the administrator password for '${mosque.name}'?`)) return;

    try {
      if (db) {
        const docRef = doc(db, 'mosqueData', cleanSlug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const docData = docSnap.data();
          if (docData && docData.config) {
            docData.config.adminPassword = newPass;
            docData.lastUpdated = new Date().toISOString();
            await setDoc(docRef, docData);
          }
        }
      }
      
      // Update local offline dictionary as well
      const offlineDict = JSON.parse(localStorage.getItem('mosque_offline_dict') || '{}');
      if (offlineDict[cleanSlug]) {
        offlineDict[cleanSlug].config.adminPassword = newPass;
        localStorage.setItem('mosque_offline_dict', JSON.stringify(offlineDict));
      }

      alert(`Password successfully reset! New temporary credentials: ${newPass}`);
      setSucMsg(`Password reset for ${mosque.name}: ${newPass}`);
      await loadRegistrations();
    } catch (err: any) {
      console.error(err);
      alert("Error resetting credentials: " + (err.message || 'database error'));
    }
  };

  const handleToggleStatus = async (mosque: any) => {
    const currentStatus = mosque.approvalStatus || 'Approved';
    const nextStatus = currentStatus === 'Disabled' ? 'Approved' : 'Disabled';
    if (!window.confirm(`Change approval state of '${mosque.name}' to ${nextStatus}?`)) return;

    try {
      if (db) {
        const docRef = doc(db, 'mosqueData', mosque.slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const docData = docSnap.data();
          if (docData && docData.config) {
            docData.config.approvalStatus = nextStatus;
            docData.lastUpdated = new Date().toISOString();
            await setDoc(docRef, docData);
          }
        }
      }

      // Update local offline dictionary as well
      const offlineDict = JSON.parse(localStorage.getItem('mosque_offline_dict') || '{}');
      if (offlineDict[mosque.slug]) {
        offlineDict[mosque.slug].config.approvalStatus = nextStatus;
        localStorage.setItem('mosque_offline_dict', JSON.stringify(offlineDict));
      }

      alert(`Account state successfully updated to: ${nextStatus}`);
      setSucMsg(`Status updated for ${mosque.name}: ${nextStatus}`);
      await loadRegistrations();
    } catch (err: any) {
      console.error(err);
      alert("Error changing status: " + (err.message || 'database error'));
    }
  };

  // Modify subscription manual override trigger function
  const handleUpdateSubscriptionOverride = async (slug: string) => {
    try {
      if (db) {
        const docRef = doc(db, 'mosqueData', slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const docData = docSnap.data();
          if (docData && docData.config) {
            docData.config.subscriptionPlan = overridePlanSelect;
            docData.config.subscriptionStatus = overridePlanSelect;
            docData.lastUpdated = new Date().toISOString();
            await setDoc(docRef, docData);
          }
        }
      }

      const offlineDict = JSON.parse(localStorage.getItem('mosque_offline_dict') || '{}');
      if (offlineDict[slug]) {
        offlineDict[slug].config.subscriptionPlan = overridePlanSelect;
        localStorage.setItem('mosque_offline_dict', JSON.stringify(offlineDict));
      }

      // Update RTDB info simulated as well
      const localKey = `sub_info_${slug.replace(/[^a-zA-Z0-9]/g, '')}`;
      localStorage.setItem(localKey, JSON.stringify({
        status: overridePlanSelect,
        trialStartDate: new Date().toISOString(),
        expirationDate: targetExpDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        packageType: overridePlanSelect === 'trial' ? 'None' : overridePlanSelect.charAt(0).toUpperCase() + overridePlanSelect.slice(1)
      }));

      alert(`Subscription plan overridden successfully to: ${overridePlanSelect}`);
      setSucMsg(`Subscription updated for ${slug}: ${overridePlanSelect}`);
      setChangingSubSlug(null);
      await loadRegistrations();
    } catch (e: any) {
      alert("Failed to override: " + e.message);
    }
  };

  const filteredMosques = allMosques.filter(m => {
    const q = searchQuery.toLowerCase();
    return m.name.toLowerCase().includes(q) || 
      m.city.toLowerCase().includes(q) || 
      m.phone?.toLowerCase().includes(q) || 
      m.slug.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#050B08] bg-radial-[at_top_right] from-[#121B16] via-[#050B08] to-[#010201] text-stone-200 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-[10px] text-purple-400 font-mono uppercase tracking-widest font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Platform Owner Super Console</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight mt-1 mb-0">
              SaaS platform Manager
            </h1>
          </div>
          <button
            onClick={() => selectMosque('')}
            className="px-4 py-2 bg-stone-900 border border-white/10 hover:bg-white/5 text-stone-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Directory</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs rounded-2xl mb-6 flex items-center justify-between">
            <div className="flex gap-2">
              <ShieldAlert className="w-4 h-4 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="p-1 text-rose-450 hover:text-white bg-transparent border-none cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
        )}

        {sucMsg && (
          <div className="p-4 bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-xs rounded-2xl mb-6 flex items-center justify-between">
            <div className="flex gap-2">
              <Check className="w-4 h-4 mt-0.5" />
              <span>{sucMsg}</span>
            </div>
            <button onClick={() => setSucMsg('')} className="p-1 text-emerald-300 hover:text-white bg-transparent border-none cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex gap-2 border-b border-white/5 mb-6">
          <button
            onClick={() => { setActiveTab('requests'); setChangingSubSlug(null); }}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${activeTab === 'requests' ? 'border-amber-400 text-amber-350' : 'border-transparent text-stone-400 hover:text-white'}`}
          >
            Registration Requests
            {registrations.filter(r => r.status === 'Pending Approval').length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-[9px] font-mono bg-amber-500 text-black rounded-full font-bold">
                {registrations.filter(r => r.status === 'Pending Approval').length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setActiveTab('mosques'); setChangingSubSlug(null); }}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${activeTab === 'mosques' ? 'border-amber-400 text-amber-350' : 'border-transparent text-stone-400 hover:text-white'}`}
          >
            Registered Mosques Directory
          </button>
        </div>

        {/* TAB WORKSPACES */}
        <div>
          {activeTab === 'requests' ? (
            <div className="space-y-4">
              {isLoading ? (
                <div className="p-20 text-center text-stone-400 flex flex-col items-center justify-center">
                  <RotateCw className="w-8 h-8 animate-spin text-amber-400 mb-3" />
                  <span className="text-xs">Loading pending validations...</span>
                </div>
              ) : registrations.length === 0 ? (
                <div className="p-16 text-center text-stone-450 border border-white/5 rounded-3xl bg-stone-900/40">
                  <span className="text-sm font-medium">No mosque registration applications currently found in directory registry.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {registrations.map(reg => (
                    <motion.div 
                      key={reg.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-3xl border border-white/5 bg-stone-905/70 p-6 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-sm font-serif font-bold text-white mt-0">{reg.mosqueName}</h3>
                          <span className={`px-2.5 py-0.5 text-[9px] font-mono rounded-full ${reg.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : reg.status === 'Rejected' ? 'bg-rose-500/10 text-rose-450 border border-rose-500/10' : 'bg-amber-500/10 text-amber-350 border border-[#D4AF37]/20 animate-pulse'}`}>
                            {reg.status}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs text-stone-400 font-sans">
                          <div>• <strong className="text-stone-300">Manager:</strong> {reg.imamName}</div>
                          <div>• <strong className="text-stone-300">Email:</strong> {reg.email}</div>
                          <div>• <strong className="text-stone-300">Phone:</strong> {reg.phone}</div>
                          <div>• <strong className="text-stone-300">Location:</strong> {reg.city}, {reg.country}</div>
                          <div className="text-[10px] text-stone-500 mt-1">Submitted: {new Date(reg.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>

                      {reg.status === 'Pending Approval' && (
                        <div className="mt-6 pt-4 border-t border-white/5">
                          {/* Choose subscription plan first */}
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] text-stone-405 uppercase font-mono font-semibold">Subscription Plan *</span>
                            <select
                              value={selectedPlan[reg.id] || 'trial'}
                              onChange={(e) => setSelectedPlan(prev => ({ ...prev, [reg.id]: e.target.value }))}
                              className="text-xs bg-black text-stone-200 border border-white/10 rounded-lg p-1.5 focus:outline-none"
                            >
                              <option value="trial">30-day Free Trial</option>
                              <option value="basic">Basic Plan ($10/mo)</option>
                              <option value="standard">Standard Plan ($25/mo)</option>
                              <option value="premium">Premium Plan ($50/mo)</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-35">
                            <button
                              onClick={() => handleReject(reg.id)}
                              className="h-9 rounded-xl border border-rose-500/25 hover:bg-rose-500/10 text-rose-400 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <X className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                            <button
                              onClick={() => handleApprove(reg)}
                              className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Check className="w-4 h-4" />
                              <span>Approve</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Print approval credentials once generated */}
                      {approvalResults[reg.id] && (
                        <div className="mt-5 p-3 rounded-2xl bg-black/60 border border-emerald-500/25 text-[11px] font-mono select-all">
                          <div className="text-[#D4AF37] text-xs font-bold mb-2">ACCESS CREDENTIALS GENERATED:</div>
                          <div>• <strong className="text-zinc-300">Mosque Code:</strong> {approvalResults[reg.id].code}</div>
                          <div>• <strong className="text-zinc-300">Password:</strong> {approvalResults[reg.id].pass}</div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // REGISTRY LIST
            <div className="space-y-4">
              <div className="relative max-w-sm mb-6">
                <Search className="absolute left-3 top-3 w-4 h-4 text-stone-500" />
                <input
                  type="text"
                  placeholder="Search registered mosques..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Display sub editor popup overlay under SuperAdmin list */}
              {changingSubSlug && (
                <div className="p-5 rounded-2xl bg-[#0e1c12] border border-[#D4AF37]/20 space-y-4 max-w-md">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-[#D4AF37] mt-0">Update subscription: {changingSubSlug}</h4>
                    <button onClick={() => setChangingSubSlug(null)} className="text-stone-400 hover:text-white">✕</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Select Status Plan</label>
                      <select
                        value={overridePlanSelect}
                        onChange={(e: any) => setOverridePlanSelect(e.target.value)}
                        className="w-full text-xs bg-black text-stone-200 border border-white/10 rounded-lg p-2"
                      >
                        <option value="trial">Free 30-Day Trial</option>
                        <option value="basic">Basic Tier</option>
                        <option value="standard">Standard Tier</option>
                        <option value="premium">Premium Tier</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Set Expiry Date</label>
                      <input
                        type="date"
                        value={targetExpDate}
                        onChange={(e) => setTargetExpDate(e.target.value)}
                        className="w-full text-xs bg-black text-stone-250 border border-white/10 rounded-lg p-2 font-mono"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpdateSubscriptionOverride(changingSubSlug)}
                    className="w-full py-1.5 rounded bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
                  >
                    Apply New Subscription Plan Values
                  </button>
                </div>
              )}

              <div className="border border-white/5 rounded-3xl bg-stone-900/40 overflow-hidden">
                <table className="w-full text-left text-xs text-stone-400 font-sans">
                  <thead className="bg-[#050e0a] text-[10px] text-[#D4AF37] uppercase font-mono tracking-wider border-b border-white/5">
                    <tr>
                      <th className="py-3 px-4">Mosque Name / Slug</th>
                      <th className="py-3 px-4">City / Country</th>
                      <th className="py-3 px-4">Active Plan / Status</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMosques.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-10 text-center">No active libraries saved in sandbox directories.</td>
                      </tr>
                    ) : (
                      filteredMosques.map(m => (
                        <tr key={m.slug} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white">{m.name}</div>
                            <div className="text-[10px] text-[#D4AF37] mt-0.5 font-mono">Slug: /{m.slug}</div>
                          </td>
                          <td className="py-3.5 px-4 text-stone-300">
                            <div>{m.city}</div>
                            <div className="text-[10px] text-stone-500 font-mono">{m.country}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono capitalize tracking-wide font-bold ${
                                m.approvalStatus === 'Disabled' 
                                  ? 'bg-rose-500/10 text-rose-450 border border-rose-550/20' 
                                  : m.subscriptionPlan === 'expired' 
                                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/10' 
                                  : 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/10'
                              }`}>
                                {m.approvalStatus === 'Disabled' ? 'Disabled Account' : m.subscriptionPlan || 'trial'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => handleResetPassword(m)}
                                className="px-2.5 py-1.5 rounded-lg bg-stone-900 border border-white/5 hover:bg-white/10 text-stone-350 text-[10px] cursor-pointer"
                              >
                                Reset Pass
                              </button>
                              <button
                                onClick={() => {
                                  setChangingSubSlug(m.slug);
                                  setOverridePlanSelect(m.subscriptionPlan || 'trial');
                                  setTargetExpDate(new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-550 hover:bg-indigo-500 text-stone-200 text-[10px] cursor-pointer"
                              >
                                Sub Plan
                              </button>
                              <button
                                onClick={() => handleToggleStatus(m)}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] border cursor-pointer font-bold ${
                                  m.approvalStatus === 'Disabled' 
                                    ? 'bg-emerald-600/10 hover:bg-emerald-500/20 text-emerald-450 border-emerald-500/10' 
                                    : 'bg-rose-600/10 hover:bg-rose-600/20 text-rose-455 border-rose-500/10'
                                }`}
                              >
                                {m.approvalStatus === 'Disabled' ? 'Enable Account' : 'Deactivate'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
