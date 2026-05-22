import React, { useState } from 'react';
import { useDashboard } from '../DashboardContext';
import { ShieldCheck, Delete, X, Compass, KeyRound, Lock, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VISUAL_THEMES } from './ThemeStyles';

interface PinLockOverlayProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const PinLockOverlay: React.FC<PinLockOverlayProps> = ({ onClose, onSuccess }) => {
  const { data, authenticatePIN, loginWithGoogle, isFirebaseActive } = useDashboard();
  const [pin, setPin] = useState<string>('');
  const [errorShake, setErrorShake] = useState<boolean>(false);
  const theme = VISUAL_THEMES[data.config.themeId] || VISUAL_THEMES['editorial-aesthetic'];

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      
      // Auto-validate once 4 digits are completed
      if (nextPin.length === 4) {
        const isValid = authenticatePIN(nextPin);
        if (isValid) {
          onSuccess();
        } else {
          // Trigger shake and clear pin
          setErrorShake(true);
          setTimeout(() => {
            setErrorShake(false);
            setPin('');
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-lg flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className={`w-full max-w-sm rounded-3xl p-6 relative ${theme.cardClass} border border-white/10`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
          aria-label="Close portal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Screen Header */}
        <div className="text-center flex flex-col items-center mt-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#D4AF37] mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Admin Authentication
          </h2>
          <p className="text-xs text-stone-400 font-sans mt-1">
            Authorize access to modify prayer timetables
          </p>
        </div>

        {/* PIN Dots indicators */}
        <div className="h-10 flex items-center justify-center my-6">
          <motion.div
            animate={errorShake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="flex gap-4 justify-center items-center"
          >
            {[...Array(4)].map((_, index) => {
              const isActive = index < pin.length;
              return (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full border transition-all duration-300 ${
                    errorShake
                      ? 'bg-rose-500 border-rose-500 shadow-md shadow-rose-500/35'
                      : isActive
                      ? 'bg-amber-400 border-amber-400 shadow-md shadow-amber-400/35 scale-110'
                      : 'border-stone-600 bg-stone-900/40'
                  }`}
                />
              );
            })}
          </motion.div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="h-14 rounded-2xl bg-white/5 hover:bg-amber-500/10 border border-white/5 active:bg-amber-500/20 active:scale-95 text-lg font-semibold text-white font-mono flex items-center justify-center transition-all"
            >
              {num}
            </button>
          ))}
          <div /> {/* spacing offset */}
          <button
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl bg-white/5 hover:bg-amber-500/10 border border-white/5 active:bg-amber-500/20 active:scale-95 text-lg font-semibold text-white font-mono flex items-center justify-center transition-all"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-white/5 hover:bg-rose-500/10 hover:border-rose-500/20 active:scale-95 text-xs font-semibold text-stone-300 hover:text-rose-400 flex items-center justify-center transition-all"
            id="pin-delete-btn"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Local Setup Tips */}
        <div className="text-[10px] text-stone-500 text-center font-mono py-1 border-t border-white/5 mt-4">
          Default administrative PIN code is <strong className="text-[#D4AF37]">1234</strong>.
        </div>

        {/* Unified Firebase Google Login Fallback */}
        {isFirebaseActive && (
          <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2">
            <div className="text-[10px] text-stone-400 text-center uppercase tracking-wide font-mono">
              Or Signed-In Partners
            </div>
            <button
              onClick={loginWithGoogle}
              className="w-full h-11 rounded-xl bg-emerald-700/25 border border-emerald-500/20 hover:bg-emerald-600/30 text-emerald-300 font-sans text-xs font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              id="google-login-btn"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign in with Google Email</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
