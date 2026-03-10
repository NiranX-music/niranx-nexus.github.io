import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Delete, ShieldCheck } from 'lucide-react';

interface LockScreenProps {
  isLocked: boolean;
  onUnlock: () => void;
}

export function LockScreen({ isLocked, onUnlock }: LockScreenProps) {
  const [passcode, setPasscode] = useState('');
  const [storedPasscode, setStoredPasscode] = useState<string | null>(null);
  const [isSettingPasscode, setIsSettingPasscode] = useState(false);
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [step, setStep] = useState<'set' | 'confirm' | 'unlock'>('unlock');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isLocked) {
      const saved = localStorage.getItem('niranx_lock_passcode');
      if (saved) {
        setStoredPasscode(saved);
        setStep('unlock');
      } else {
        setStep('set');
        setIsSettingPasscode(true);
      }
      setPasscode('');
      setConfirmPasscode('');
      setError('');
      setSuccess(false);
    }
  }, [isLocked]);

  const handleDigit = useCallback((digit: string) => {
    setError('');
    if (step === 'set') {
      if (passcode.length < 4) {
        const newCode = passcode + digit;
        setPasscode(newCode);
        if (newCode.length === 4) {
          setTimeout(() => {
            setStep('confirm');
            setConfirmPasscode('');
          }, 200);
        }
      }
    } else if (step === 'confirm') {
      if (confirmPasscode.length < 4) {
        const newCode = confirmPasscode + digit;
        setConfirmPasscode(newCode);
        if (newCode.length === 4) {
          if (newCode === passcode) {
            localStorage.setItem('niranx_lock_passcode', newCode);
            setStoredPasscode(newCode);
            setSuccess(true);
            setTimeout(() => {
              setStep('unlock');
              setPasscode('');
              setConfirmPasscode('');
              setSuccess(false);
            }, 800);
          } else {
            setError('Passcodes do not match');
            setConfirmPasscode('');
            setTimeout(() => setStep('set'), 500);
            setPasscode('');
          }
        }
      }
    } else {
      if (passcode.length < 4) {
        const newCode = passcode + digit;
        setPasscode(newCode);
        if (newCode.length === 4) {
          if (newCode === storedPasscode) {
            setSuccess(true);
            setTimeout(() => {
              onUnlock();
              setPasscode('');
              setSuccess(false);
            }, 500);
          } else {
            setError('Wrong passcode');
            setTimeout(() => setPasscode(''), 300);
          }
        }
      }
    }
  }, [step, passcode, confirmPasscode, storedPasscode, onUnlock]);

  const handleDelete = () => {
    if (step === 'confirm') {
      setConfirmPasscode(prev => prev.slice(0, -1));
    } else {
      setPasscode(prev => prev.slice(0, -1));
    }
  };

  // Block all keyboard shortcuts and navigation
  useEffect(() => {
    if (!isLocked) return;
    const blockNav = (e: KeyboardEvent) => {
      // Allow digit keys for passcode entry
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
        e.preventDefault();
        return;
      }
      if (e.key === 'Backspace') {
        handleDelete();
        e.preventDefault();
        return;
      }
      e.preventDefault();
      e.stopPropagation();
    };
    const blockPop = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.href);
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('keydown', blockNav, true);
    window.addEventListener('popstate', blockPop);
    return () => {
      window.removeEventListener('keydown', blockNav, true);
      window.removeEventListener('popstate', blockPop);
    };
  }, [isLocked, handleDigit]);

  const currentCode = step === 'confirm' ? confirmPasscode : passcode;
  const dots = Array.from({ length: 4 }, (_, i) => i < currentCode.length);

  const title = step === 'set' ? 'Set Passcode' : step === 'confirm' ? 'Confirm Passcode' : 'Enter Passcode';

  if (!isLocked) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />

        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="relative z-10 flex flex-col items-center gap-8"
        >
          <motion.div
            animate={error ? { x: [-10, 10, -10, 10, 0] } : success ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center ${success ? 'bg-green-500/20' : 'bg-primary/10 border border-primary/20'}`}
          >
            {success ? (
              <ShieldCheck className="w-8 h-8 text-green-500" />
            ) : (
              <Lock className="w-8 h-8 text-primary" />
            )}
          </motion.div>

          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            {error && <p className="text-destructive text-sm mt-1">{error}</p>}
            {step === 'set' && !error && <p className="text-muted-foreground text-sm mt-1">Choose a 4-digit passcode</p>}
          </div>

          {/* Dots */}
          <div className="flex gap-4">
            {dots.map((filled, i) => (
              <motion.div
                key={i}
                animate={filled ? { scale: [0.8, 1.2, 1] } : {}}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  filled ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                }`}
              />
            ))}
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((key, i) => {
              if (key === null) return <div key={i} />;
              if (key === 'del') {
                return (
                  <button
                    key="del"
                    onClick={handleDelete}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-muted-foreground hover:bg-muted/30 transition-colors"
                  >
                    <Delete className="w-5 h-5" />
                  </button>
                );
              }
              return (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDigit(String(key))}
                  className="w-16 h-16 rounded-2xl bg-muted/20 border border-border/30 flex items-center justify-center text-xl font-medium text-foreground hover:bg-muted/40 transition-colors"
                >
                  {key}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
