import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Flame, Lock, Unlock } from 'lucide-react';
import { useFocus } from '@/contexts/FocusContext';
import { useMood } from '@/contexts/MoodContext';
import { toast } from 'sonner';

interface HavocModeProps {
  isOpen: boolean;
  onClose: () => void;
  duration: number;
  subject: string;
}

export default function HavocMode({ isOpen, onClose, duration, subject }: HavocModeProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isLocked, setIsLocked] = useState(false);
  const { startSession, endSession } = useFocus();
  const { mood } = useMood();
  const intervalRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement>();

  useEffect(() => {
    if (isOpen && isLocked) {
      startSession(subject, duration, mood);
      
      // Start countdown
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Disable keyboard shortcuts
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'Tab' || (e.ctrlKey && e.key === 'w')) {
          e.preventDefault();
          toast.warning('⚠️ Havoc Mode is locked. Complete your session.');
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, isLocked]);

  const handleLock = () => {
    setIsLocked(true);
    toast.success('🔒 Havoc Mode activated. No distractions allowed!');
  };

  const handleComplete = () => {
    endSession(0); // No interruptions in Havoc Mode
    toast.success(`🔥 HAVOC MODE COMPLETE! +${Math.floor(duration / 3)} XP BONUS`);
    setIsLocked(false);
    onClose();
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={!isLocked ? onClose : undefined}>
      <DialogContent 
        className="max-w-4xl h-[90vh] bg-gradient-to-br from-background via-primary/5 to-accent/5 border-2 border-primary/30"
        onPointerDownOutside={(e) => isLocked && e.preventDefault()}
        onEscapeKeyDown={(e) => isLocked && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
            HAVOC MODE
            {isLocked && <Lock className="w-5 h-5 text-destructive" />}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Particle Field Background */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 3}s`,
                }}
              />
            ))}
          </div>

          {/* Timer */}
          <div className="relative z-10 text-center">
            <div className="mb-8">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                Subject
              </p>
              <h2 className="text-3xl font-bold gradient-text">{subject}</h2>
            </div>

            {/* Pulsing Timer Ring */}
            <div className="relative w-80 h-80 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse" />
              <div 
                className="absolute inset-4 rounded-full border-4 border-primary animate-glow-pulse"
                style={{
                  animation: 'glow-pulse 2s ease-in-out infinite',
                }}
              />
              
              <div className="text-center">
                <div className="text-8xl font-bold gradient-text drop-shadow-lg">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
                <p className="text-lg text-muted-foreground mt-4">
                  {isLocked ? 'Deep Focus Mode' : 'Ready to lock in?'}
                </p>
              </div>
            </div>

            {/* Breathing Rings */}
            <div className="mt-8 flex justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-primary/50"
                  style={{
                    animation: `pulse 2s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {!isLocked ? (
            <>
              <Button
                onClick={handleLock}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-neon text-lg px-8 py-6"
              >
                <Lock className="w-5 h-5 mr-2" />
                Enter Havoc Mode
              </Button>
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
            </>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                🔒 Session locked. Complete to unlock.
              </p>
              <p className="text-xs text-destructive">
                No escapes. No distractions. Pure focus.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
