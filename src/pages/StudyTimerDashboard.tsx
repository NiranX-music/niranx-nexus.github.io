import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Timer, Play, Pause, RotateCcw, Coffee, Brain, Flame, Clock, Target, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SessionRecord {
  id: string;
  mode: string;
  duration: number;
  completedAt: string;
  subject: string;
}

const MODES = {
  pomodoro: { label: "Pomodoro", work: 25 * 60, break: 5 * 60, icon: Timer, color: "text-red-500" },
  deep: { label: "Deep Focus", work: 50 * 60, break: 10 * 60, icon: Brain, color: "text-purple-500" },
  sprint: { label: "Sprint", work: 15 * 60, break: 3 * 60, icon: Flame, color: "text-orange-500" },
  custom: { label: "Custom", work: 30 * 60, break: 5 * 60, icon: Clock, color: "text-blue-500" },
};

export default function StudyTimerDashboard() {
  const [mode, setMode] = useState<keyof typeof MODES>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(MODES.pomodoro.work);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCompleted, setSessions] = useState(0);
  const [subject, setSubject] = useState("General");
  const [history, setHistory] = useState<SessionRecord[]>(() => {
    try { return JSON.parse(localStorage.getItem("study-timer-history") || "[]"); } catch { return []; }
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalTime = isBreak ? MODES[mode].break : MODES[mode].work;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      if (!isBreak) {
        const record: SessionRecord = {
          id: crypto.randomUUID(),
          mode: MODES[mode].label,
          duration: MODES[mode].work,
          completedAt: new Date().toISOString(),
          subject,
        };
        const updated = [record, ...history].slice(0, 50);
        setHistory(updated);
        localStorage.setItem("study-timer-history", JSON.stringify(updated));
        setSessions(s => s + 1);
        toast.success("Session complete! Time for a break.");
      } else {
        toast.info("Break over — let's get back to work!");
      }
      setIsBreak(b => !b);
      setTimeLeft(isBreak ? MODES[mode].work : MODES[mode].break);
      setIsRunning(false);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft]);

  const switchMode = (m: keyof typeof MODES) => {
    setMode(m);
    setTimeLeft(MODES[m].work);
    setIsRunning(false);
    setIsBreak(false);
  };

  const reset = () => { setTimeLeft(isBreak ? MODES[mode].break : MODES[mode].work); setIsRunning(false); };
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const todaySessions = history.filter(h => new Date(h.completedAt).toDateString() === new Date().toDateString());
  const todayMinutes = todaySessions.reduce((a, s) => a + s.duration / 60, 0);

  const ModeIcon = MODES[mode].icon;

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Timer className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-3xl font-bold">Study Timer Dashboard</h1>
          <p className="text-muted-foreground text-sm">Track focus sessions and build consistency</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Sessions", value: todaySessions.length, icon: Target, color: "text-green-500" },
          { label: "Today's Minutes", value: Math.round(todayMinutes), icon: Clock, color: "text-blue-500" },
          { label: "This Session", value: sessionsCompleted, icon: Flame, color: "text-orange-500" },
          { label: "Total Sessions", value: history.length, icon: TrendingUp, color: "text-purple-500" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={cn("h-8 w-8", stat.color)} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Timer */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ModeIcon className={cn("h-5 w-5", MODES[mode].color)} />
                {isBreak ? "Break Time" : MODES[mode].label}
              </CardTitle>
              <Badge variant={isBreak ? "secondary" : "default"}>{isBreak ? "Break" : "Focus"}</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            {/* Mode Selector */}
            <div className="flex gap-2 flex-wrap justify-center">
              {Object.entries(MODES).map(([key, val]) => (
                <Button key={key} variant={mode === key ? "default" : "outline"} size="sm" onClick={() => switchMode(key as keyof typeof MODES)}>
                  <val.icon className="h-4 w-4 mr-1" /> {val.label}
                </Button>
              ))}
            </div>

            {/* Timer Display */}
            <motion.div
              className="relative w-56 h-56 rounded-full border-4 border-muted flex items-center justify-center"
              animate={{ borderColor: isRunning ? (isBreak ? "hsl(var(--accent))" : "hsl(var(--primary))") : "hsl(var(--muted))" }}
            >
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="50%" cy="50%" r="46%" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                <motion.circle
                  cx="50%" cy="50%" r="46%"
                  fill="none"
                  stroke={isBreak ? "hsl(var(--accent))" : "hsl(var(--primary))"}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 46}`}
                  animate={{ strokeDashoffset: `${2 * Math.PI * 46 * (1 - progress / 100)}` }}
                  transition={{ duration: 0.5 }}
                  style={{ strokeDasharray: `${2 * Math.PI * 46}%` }}
                />
              </svg>
              <div className="text-center z-10">
                <p className="text-5xl font-mono font-bold tabular-nums">
                  {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{isBreak ? "Relax" : "Stay focused"}</p>
              </div>
            </motion.div>

            <Progress value={progress} className="w-full max-w-xs" />

            {/* Controls */}
            <div className="flex gap-3">
              <Button size="lg" onClick={() => setIsRunning(!isRunning)} className="gap-2">
                {isRunning ? <><Pause className="h-5 w-5" /> Pause</> : <><Play className="h-5 w-5" /> Start</>}
              </Button>
              <Button size="lg" variant="outline" onClick={reset}><RotateCcw className="h-5 w-5" /></Button>
            </div>

            {/* Subject Selector */}
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["General", "Math", "Science", "English", "History", "Coding", "Art"].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Session History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Coffee className="h-4 w-4" /> Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
            <AnimatePresence>
              {history.slice(0, 15).map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm"
                >
                  <div>
                    <p className="font-medium">{s.subject}</p>
                    <p className="text-xs text-muted-foreground">{s.mode} · {Math.round(s.duration / 60)}min</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(s.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
            {history.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">No sessions yet. Start your first timer!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
