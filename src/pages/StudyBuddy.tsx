import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Bot, Sparkles, Coffee, BookOpen, PenLine, Brain, Moon, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

type BuddyState = 'idle' | 'writing' | 'reading' | 'thinking' | 'break' | 'sleeping';

const BUDDY_STATES: Record<BuddyState, { emoji: string; label: string; message: string; color: string }> = {
  idle: { emoji: '😊', label: 'Idle', message: "Ready to study! Let's get started.", color: 'from-cyan-500 to-blue-500' },
  writing: { emoji: '✍️', label: 'Writing', message: 'Taking notes with you...', color: 'from-green-500 to-emerald-500' },
  reading: { emoji: '📖', label: 'Reading', message: 'Absorbing knowledge together!', color: 'from-purple-500 to-violet-500' },
  thinking: { emoji: '🤔', label: 'Thinking', message: 'Processing complex concepts...', color: 'from-amber-500 to-orange-500' },
  break: { emoji: '☕', label: 'Break', message: 'Rest time! Stretch and hydrate.', color: 'from-pink-500 to-rose-500' },
  sleeping: { emoji: '😴', label: 'Sleeping', message: 'Zzz... See you tomorrow!', color: 'from-indigo-500 to-blue-700' },
};

const STUDY_TIPS = [
  "Try the Pomodoro technique: 25 min focus, 5 min break!",
  "Active recall is 3x more effective than re-reading.",
  "Teaching a concept to someone else solidifies your understanding.",
  "Take a 10-min walk to boost creativity by 60%.",
  "Spaced repetition helps long-term memory retention.",
  "Write by hand to improve memory encoding.",
  "Stay hydrated — your brain is 75% water!",
  "Review notes within 24 hours to retain 80% more.",
];

export default function StudyBuddy() {
  const [buddyState, setBuddyState] = useState<BuddyState>('idle');
  const [tip, setTip] = useState(STUDY_TIPS[0]);
  const [xpToday, setXpToday] = useState(120);
  const [sessionsToday, setSessionsToday] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setTip(STUDY_TIPS[Math.floor(Math.random() * STUDY_TIPS.length)]);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const currentState = BUDDY_STATES[buddyState];

  return (
    <div className="min-h-screen p-6 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <Bot className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Study Buddy</h1>
          <p className="text-muted-foreground">Your AI companion that studies alongside you</p>
        </div>
      </div>

      {/* Buddy Avatar */}
      <div className="flex justify-center">
        <motion.div
          className="relative"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className={`w-48 h-48 rounded-full bg-gradient-to-br ${currentState.color} flex items-center justify-center shadow-2xl`}>
            <motion.span
              key={buddyState}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-8xl"
            >
              {currentState.emoji}
            </motion.span>
          </div>
          <motion.div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-background border border-border text-sm font-medium text-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {currentState.label}
          </motion.div>
        </motion.div>
      </div>

      {/* Message Bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={buddyState + tip}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="max-w-md mx-auto holo-card p-5 text-center"
        >
          <p className="text-foreground font-medium">{currentState.message}</p>
          <p className="text-sm text-muted-foreground mt-2">💡 {tip}</p>
        </motion.div>
      </AnimatePresence>

      {/* State Controls */}
      <div className="flex flex-wrap justify-center gap-3">
        {(Object.keys(BUDDY_STATES) as BuddyState[]).map(state => (
          <Button
            key={state}
            variant={buddyState === state ? 'default' : 'outline'}
            size="sm"
            onClick={() => setBuddyState(state)}
          >
            {BUDDY_STATES[state].emoji} {BUDDY_STATES[state].label}
          </Button>
        ))}
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
        <div className="holo-card p-4 text-center">
          <Sparkles className="w-5 h-5 mx-auto mb-1 text-primary" />
          <div className="text-2xl font-bold text-foreground">{xpToday}</div>
          <div className="text-xs text-muted-foreground">XP Today</div>
        </div>
        <div className="holo-card p-4 text-center">
          <BookOpen className="w-5 h-5 mx-auto mb-1 text-primary" />
          <div className="text-2xl font-bold text-foreground">{sessionsToday}</div>
          <div className="text-xs text-muted-foreground">Sessions</div>
        </div>
        <div className="holo-card p-4 text-center">
          <Brain className="w-5 h-5 mx-auto mb-1 text-primary" />
          <div className="text-2xl font-bold text-foreground">87%</div>
          <div className="text-xs text-muted-foreground">Focus Score</div>
        </div>
        <div className="holo-card p-4 text-center">
          <Coffee className="w-5 h-5 mx-auto mb-1 text-primary" />
          <div className="text-2xl font-bold text-foreground">2</div>
          <div className="text-xs text-muted-foreground">Breaks Taken</div>
        </div>
      </div>
    </div>
  );
}
