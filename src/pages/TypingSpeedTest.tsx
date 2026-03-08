import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Keyboard, RotateCcw, Zap, Timer, Target, Trophy, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const paragraphs = [
  "The quick brown fox jumps over the lazy dog near the river bank.",
  "Programming is the art of telling a computer what to do step by step.",
  "Science is organized knowledge and wisdom is organized life itself.",
  "Education is not the filling of a pail but the lighting of a fire.",
  "The only way to do great work is to love what you do every single day.",
  "In the middle of every difficulty lies hidden a great opportunity.",
  "Knowledge speaks but wisdom listens to the silence between the words.",
  "A journey of a thousand miles must begin with a single small step forward.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Success is not final and failure is not fatal only courage counts in the end.",
];

const TypingSpeedTest = () => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [typed, setTyped] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(60);
  const [bestWPM, setBestWPM] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const initTest = useCallback(() => {
    const selected = paragraphs[Math.floor(Math.random() * paragraphs.length)];
    setText(selected);
    setTyped('');
    setIsRunning(false);
    setIsFinished(false);
    setStartTime(null);
    setElapsed(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => { initTest(); }, [initTest]);

  useEffect(() => {
    if (!isRunning || isFinished) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.floor((now - (startTime || now)) / 1000);
      setElapsed(diff);
      if (diff >= duration) {
        setIsFinished(true);
        setIsRunning(false);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [isRunning, isFinished, startTime, duration]);

  const handleTyping = (value: string) => {
    if (isFinished) return;
    if (!isRunning) {
      setIsRunning(true);
      setStartTime(Date.now());
    }
    setTyped(value);
    if (value.length >= text.length) {
      setIsFinished(true);
      setIsRunning(false);
    }
  };

  const correctChars = typed.split('').filter((c, i) => c === text[i]).length;
  const totalTyped = typed.length;
  const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;
  const timeInMinutes = Math.max(elapsed / 60, 0.01);
  const wpm = Math.round((correctChars / 5) / timeInMinutes);
  const cpm = Math.round(correctChars / timeInMinutes);
  const timeLeft = Math.max(duration - elapsed, 0);

  useEffect(() => {
    if (isFinished && wpm > bestWPM) {
      setBestWPM(wpm);
      localStorage.setItem('typing-best-wpm', wpm.toString());
    }
  }, [isFinished, wpm, bestWPM]);

  return (
    <div className="min-h-full p-4 md:p-6 space-y-6 cyber-grid">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Keyboard className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-display font-bold gradient-text tracking-wider">
              TYPING_TEST
            </h1>
          </div>
          <div className="flex gap-2">
            {[30, 60, 120].map(d => (
              <Button key={d} size="sm" variant={duration === d ? 'default' : 'outline'}
                onClick={() => { setDuration(d); initTest(); }}
                className="font-mono text-xs">
                {d}s
              </Button>
            ))}
          </div>
        </div>
        <p className="font-mono text-xs text-muted-foreground tracking-widest">
          {">"} SPEED_METRICS // ACCURACY_ANALYSIS
        </p>
      </motion.div>

      {/* Live Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'WPM', value: isRunning || isFinished ? wpm : '—', icon: Gauge, color: 'text-primary' },
          { label: 'CPM', value: isRunning || isFinished ? cpm : '—', icon: Zap, color: 'text-accent' },
          { label: 'ACCURACY', value: isRunning || isFinished ? `${accuracy}%` : '—', icon: Target, color: 'text-success' },
          { label: 'TIME_LEFT', value: `${timeLeft}s`, icon: Timer, color: 'text-warning' },
          { label: 'BEST_WPM', value: bestWPM || '—', icon: Trophy, color: 'text-primary' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="tech-card">
              <CardContent className="p-3 text-center">
                <s.icon className={cn("w-5 h-5 mx-auto mb-1", s.color)} />
                <p className={cn("text-xl font-display font-bold tabular-nums", s.color)}>{s.value}</p>
                <p className="text-[9px] font-mono text-muted-foreground tracking-widest">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Timer Progress */}
      <div className="space-y-1">
        <Progress value={((duration - timeLeft) / duration) * 100} className="h-1.5" />
        <p className="text-right font-mono text-[10px] text-muted-foreground">{elapsed}/{duration}s</p>
      </div>

      {/* Text Display */}
      <Card className="tech-card">
        <CardContent className="p-6">
          <div className="font-mono text-base md:text-lg leading-loose select-none">
            {text.split('').map((char, i) => {
              let color = 'text-muted-foreground/50';
              if (i < typed.length) {
                color = typed[i] === char ? 'text-success' : 'text-destructive bg-destructive/10';
              } else if (i === typed.length) {
                color = 'text-foreground bg-primary/20 border-b-2 border-primary';
              }
              return (
                <span key={i} className={cn("transition-colors", color)}>
                  {char}
                </span>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={typed}
          onChange={e => handleTyping(e.target.value)}
          disabled={isFinished}
          className={cn(
            "w-full p-4 rounded-lg border bg-background font-mono text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-primary",
            isFinished && "opacity-50 cursor-not-allowed"
          )}
          placeholder={isFinished ? "TEST_COMPLETE" : "Start typing here..."}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {/* Results */}
      {isFinished && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="tech-card border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="font-mono text-sm tracking-wider flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" /> RESULTS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-display font-bold text-primary tabular-nums">{wpm}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">WORDS/MIN</p>
                </div>
                <div>
                  <p className="text-3xl font-display font-bold text-accent tabular-nums">{accuracy}%</p>
                  <p className="text-[10px] font-mono text-muted-foreground">ACCURACY</p>
                </div>
                <div>
                  <p className="text-3xl font-display font-bold text-success tabular-nums">{correctChars}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">CORRECT_CHARS</p>
                </div>
              </div>
              <Button onClick={initTest} className="w-full mt-4 font-mono text-xs gap-2">
                <RotateCcw className="w-4 h-4" /> RETRY
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default TypingSpeedTest;
