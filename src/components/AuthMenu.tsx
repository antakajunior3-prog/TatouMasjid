import React, { useState, useRef, useEffect } from 'react';
import { useDashboard } from '../DashboardContext';
import { 
  LogIn, 
  UserPlus, 
  LogOut, 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  AlertCircle, 
  X, 
  ChevronDown, 
  CheckCircle, 
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AuthMenu: React.FC = () => {
  const { 
    adminUser, 
    isFirebaseActive,
    loginWithGoogle, 
    registerWithEmailAndPass, 
    loginWithEmailAndPass, 
    logout,
    isAdmin
  } = useDashboard();

  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  // Status states
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside clicks
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleTabChange = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    setStatusMsg(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
  };

  const handleGoogleLogin = async () => {
    setStatusMsg(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      setStatusMsg({ type: 'success', text: 'Logged in successfully with Google!' });
      setTimeout(() => {
        setShowModal(false);
        setIsOpen(false);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err.message || 'Failed login' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    // Dynamic field validation
    if (!email || !password) {
      setStatusMsg({ type: 'error', text: 'Please fill in all mandatory fields.' });
      return;
    }

    if (activeTab === 'signup' && password !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    if (password.length < 6) {
      setStatusMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeTab === 'signup') {
        const nameToUse = displayName || email.split('@')[0];
        await registerWithEmailAndPass(email, password, nameToUse);
        setStatusMsg({ type: 'success', text: 'Account registered successfully!' });
      } else {
        await loginWithEmailAndPass(email, password);
        setStatusMsg({ type: 'success', text: 'Logged in successfully!' });
      }
      
      setTimeout(() => {
        setIsSubmitting(false);
        setShowModal(false);
        setIsOpen(false);
        // Clean fields
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setDisplayName('');
      }, 1200);

    } catch (err: any) {
      console.error(err);
      setIsSubmitting(false);
      
      let friendlyError = err.message || 'An authentication error occurred';
      if (err.message?.includes('auth/email-already-in-use')) {
        friendlyError = 'This email is already registered. Try logging in!';
      } else if (err.message?.includes('auth/invalid-credential') || err.message?.includes('auth/wrong-password')) {
        friendlyError = 'Incorrect password or email credentials.';
      } else if (err.message?.includes('auth/user-not-found')) {
        friendlyError = 'No user account exists with this email address.';
      }
      
      setStatusMsg({ type: 'error', text: friendlyError });
    }
  };

  const getInitials = (user: any) => {
    if (user.displayName) {
      return user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user.email ? user.email.slice(0, 2).toUpperCase() : 'M';
  };

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {adminUser ? (
        /* Logged In State Profile Bubble Dropdown Menu trigger */
        <div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 h-10 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 rounded-xl transition-all cursor-pointer text-left focus:outline-none select-none"
            id="auth-profile-trigger"
          >
            {adminUser.photoURL ? (
              <img 
                src={adminUser.photoURL} 
                alt="Display" 
                className="w-6 h-6 rounded-full border border-emerald-500" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-emerald-600 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold text-white uppercase font-mono">
                {getInitials(adminUser)}
              </div>
            )}
            <div className="hidden md:block">
              <div className="text-[10px] font-bold text-white leading-tight max-w-[110px] truncate">
                {adminUser.displayName || adminUser.email?.split('@')[0]}
              </div>
              <div className="text-[8px] text-[#D4AF37] font-mono leading-tight uppercase flex items-center gap-0.5 mt-0.5">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                <span>{isAdmin ? 'System Admin' : 'Logged In'}</span>
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Quick Dropdown Options Panel */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute right-0 mt-2 w-64 rounded-xl bg-stone-900 border border-white/10 shadow-2xl z-50 p-4 divide-y divide-white/5 space-y-3"
                id="auth-profile-dropdown"
              >
                {/* Header User profile card */}
                <div className="flex gap-3 items-center pb-2">
                  {adminUser.photoURL ? (
                    <img 
                      src={adminUser.photoURL} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full border border-emerald-500 shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
                      {getInitials(adminUser)}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate m-0 leading-tight">
                      {adminUser.displayName || 'Authorized User'}
                    </p>
                    <p className="text-[10px] text-stone-400 truncate m-0 mt-0.5 font-mono">
                      {adminUser.email}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[8px] font-mono font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-widest mt-1.5">
                      <Sparkles className="w-2.5 h-2.5" />
                      Verified Owner
                    </span>
                  </div>
                </div>

                {/* Info and helper status */}
                <div className="pt-3 pb-1 text-[10px] text-stone-400 leading-relaxed font-sans">
                  <p className="m-0">
                    You can instantly bypass admin PIN screens and modify prayer timetables or bulletin messages directly from the control console.
                  </p>
                </div>

                {/* Logout Trigger button */}
                <div className="pt-2 flex">
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="w-full h-9 flex items-center justify-center gap-2 bg-rose-950/15 hover:bg-rose-950/30 border border-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-bold rounded-lg transition-colors cursor-pointer select-none"
                    id="auth-logout-btn"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Logged Out State Login Sign Up CTA */
        <button
          onClick={() => setShowModal(true)}
          className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-sans text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all select-none cursor-pointer border border-emerald-500/30"
          id="auth-login-trigger"
        >
          <LogIn className="w-4 h-4 text-emerald-200" />
          <span>Sign In</span>
        </button>
      )}

      {/* Interactive Main Register/Log In Modal Overlay */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark glass backdrop block */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
              onClick={() => {
                if (!isSubmitting) setShowModal(false);
              }}
            />

            {/* Modal Body Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md rounded-2xl bg-stone-900 border border-[#D4AF37]/25 shadow-2xl p-6 md:p-8 z-10 overflow-hidden"
              id="auth-modal-body"
            >
              {/* Top Banner decoration */}
              <div className="absolute right-0 top-0 w-32 h-32 opacity-5 pointer-events-none">
                <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full text-[#D4AF37]">
                  <polygon points="50,0 100,50 50,100 0,50" />
                </svg>
              </div>

              {/* Close Button */}
              <button
                disabled={isSubmitting}
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer select-none border border-white/5 disabled:opacity-30"
                id="auth-modal-close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Title Header */}
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="h-10 w-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#D4AF37] mb-2 animate-pulse">
                  {activeTab === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <h3 className="text-xl font-bold text-white font-serif tracking-tight mt-0">
                  {activeTab === 'login' ? 'Welcome Back!' : 'Create Sanctuary Key'}
                </h3>
                <p className="text-[11px] text-stone-400 mt-1 max-w-xs leading-relaxed">
                  {activeTab === 'login' 
                    ? 'Authenticate to unlock live board administrative updates and settings synchronization.'
                    : 'Register an account to securely govern mosque prayer coordinates, notices, and theme configs.'
                  }
                </p>
                
                {/* Simulated database warning alert banner */}
                {!isFirebaseActive && (
                  <div className="mt-3.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span className="text-[9px] font-mono text-orange-300 font-semibold uppercase tracking-wider">
                      Simulated Dev Offline Credentials Mode
                    </span>
                  </div>
                )}
              </div>

              {/* Dual Tabs selector row */}
              <div className="grid grid-cols-2 p-1.5 bg-black/40 border border-white/5 rounded-xl mb-6">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleTabChange('login')}
                  className={`py-2 text-xs font-bold font-sans rounded-lg transition-all cursor-pointer ${
                    activeTab === 'login' 
                      ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/10' 
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleTabChange('signup')}
                  className={`py-2 text-xs font-bold font-sans rounded-lg transition-all cursor-pointer ${
                    activeTab === 'signup' 
                      ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/10' 
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Error/Notice Alert Banner */}
              {statusMsg && (
                <div className={`p-4 rounded-xl border mb-5 flex gap-2 w-full text-xs items-start ${
                  statusMsg.type === 'error' 
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  {statusMsg.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span className="font-sans leading-relaxed">{statusMsg.text}</span>
                </div>
              )}

              {/* Input Form Elements */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'signup' && (
                  <div>
                    <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-stone-500" />
                      <input
                        type="text"
                        placeholder="e.g. Imam Bilal"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 rounded-lg bg-black/60 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        id="auth-input-name"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-stone-500" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. admin@masjid.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-lg bg-black/60 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      id="auth-input-email"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-stone-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-lg bg-black/60 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      id="auth-input-pass"
                    />
                  </div>
                </div>

                {activeTab === 'signup' && (
                  <div>
                    <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-stone-500" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 rounded-lg bg-black/60 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        id="auth-input-pass-confirm"
                      />
                    </div>
                  </div>
                )}

                {/* Form CTA execute button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-sans text-xs font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 select-none cursor-pointer disabled:opacity-50"
                  id="auth-submit-btn"
                >
                  {activeTab === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>
                    {isSubmitting 
                      ? 'Authenticating...' 
                      : activeTab === 'login' ? 'Sign In' : 'Create Admin Key'}
                  </span>
                </button>
              </form>

              {/* Separators & Google Login Provider Trigger */}
              <div className="relative my-6 flex items-center justify-center uppercase font-mono text-[9px] text-stone-500 select-none">
                <span className="absolute left-0 w-full border-t border-white/5"></span>
                <span className="relative z-10 px-3 bg-stone-900">Or continue with</span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full h-11 bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold rounded-lg flex items-center justify-center gap-2.5 transition-all outline-none select-none active:scale-[0.98] border border-white shrink-0 cursor-pointer disabled:opacity-60"
                id="auth-google-btn"
              >
                {/* Clean Google icon SVG */}
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6c-.28 1.5-.1.1.1 1.07-.64 1.53-1.82 2.83-3.23 3.75h5.18c3.03-2.8 4.79-6.9 4.79-11.65z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-6.18-4.79c-1.71 1.15-3.9 1.83-6.15 1.83-4.74 0-8.75-3.2-10.18-7.52H1.36v4.79C4.12 18.52 7.79 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M1.365 14.79c-.36-1.08-.57-2.22-.57-3.41s.21-2.33.57-3.41V3.18H1.36C.49 4.93 0 6.9 0 9s.49 8.07 1.36 9.82l4.82-3.83z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 7.79 0 4.12 5.48 1.36 10.18l4.82 3.83c1.43-4.32 5.44-7.52 10.18-7.52z"
                  />
                </svg>
                <span>Google Account</span>
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
