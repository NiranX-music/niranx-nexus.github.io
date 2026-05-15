import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from '@/contexts/AuthContext';
import { useXP } from '@/contexts/XPContext';
import { useFocus } from '@/contexts/FocusContext';
import { useXPReward } from '@/hooks/useXPReward';
import { 
  Music, FolderOpen, Calendar, CheckSquare, BarChart3, Timer, 
  StickyNote, MessageCircle, Moon, Sun, Sparkles, Zap, Brain,
  User, GraduationCap, Gamepad2, Lock, Target, Flame, Layers, Users,
  Terminal, Cpu, Shield, Activity, Wifi, Database, ArrowRight, 
  Hexagon, CircuitBoard, Radio
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useSpaces } from '@/hooks/useSpaces';
import { CreateSpaceDialog } from '@/components/CreateSpaceDialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MoodSelector from '@/components/MoodSelector';
import AIMotivation from '@/components/AIMotivation';
import DailyChallenge from '@/components/DailyChallenge';
import MusicPlayer from "@/components/widgets/MusicPlayer";
import FileExplorer from "@/components/widgets/FileExplorer";
import ClassScheduler from "@/components/widgets/ClassScheduler";
import UpcomingScheduleWidget from "@/components/widgets/UpcomingScheduleWidget";
import TaskManager from "@/components/widgets/TaskManager";
import PomodoroTimer from "@/components/widgets/PomodoroTimer";
import Analytics from "@/components/widgets/Analytics";
import ChillCorner from "@/components/widgets/ChillCorner";
import NotesWidget from "@/components/widgets/NotesWidget";
import StudyMaterialHub from "@/components/widgets/StudyMaterialHub";
import AIStudyBuddy from "@/components/widgets/AIStudyBuddy";
import StudyBuddyClone from "@/components/StudyBuddyClone";
import { StudyHeatmap } from "@/components/StudyHeatmap";
import { useWidgets } from "@/hooks/useWidgets";
import { StreakDisplay } from "@/components/StreakDisplay";
import { ApplyForGuardianCard } from "@/components/ApplyForGuardianCard";
import { GoogleStyleSearchBar } from "@/components/dashboard/GoogleStyleSearchBar";
import { DraggableWidgetGrid } from "@/components/DraggableWidgetGrid";
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { user } = useAuth();
  const { xp, level, getXPProgress } = useXP();
  const { getTodayStats, getStreak } = useFocus();
  const { awardXP } = useXPReward();
  const { isWidgetEnabled } = useWidgets();
  const { spaces, activeSpace, spaceLimit } = useSpaces();
  const isLoggedIn = !!user;
  const navigate = useNavigate();

  const todayStats = getTodayStats();
  const streak = getStreak();
  const xpProgress = getXPProgress();

  useEffect(() => {
    const saved = localStorage.getItem('studyverse-dark-mode');
    if (saved) setIsDarkMode(JSON.parse(saved));
    window.scrollTo(0, 0);
    if (isLoggedIn) {
      const lastLoginDate = localStorage.getItem('lastLoginDate');
      const today = new Date().toDateString();
      if (lastLoginDate !== today) {
        awardXP('DAILY_LOGIN');
        localStorage.setItem('lastLoginDate', today);
      }
    }
  }, [isLoggedIn, awardXP]);

  useEffect(() => {
    localStorage.setItem('studyverse-dark-mode', JSON.stringify(isDarkMode));
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const handleNavigation = (page: string) => {
    if (page === 'dashboard') return;
    if (page !== 'pomodoro' && !isLoggedIn) {
      navigate('/niranx/auth');
      return;
    }
    navigate(`/niranx/${page}`);
  };

  const widgets = [
    { key: 'music_player', component: MusicPlayer },
    { key: 'file_explorer', component: FileExplorer },
    { key: 'class_schedule', component: ClassScheduler },
    { key: 'task_manager', component: TaskManager },
    { key: 'pomodoro_timer', component: PomodoroTimer },
    { key: 'analytics', component: Analytics },
    { key: 'chill_corner', component: ChillCorner },
    { key: 'notes', component: NotesWidget },
    { key: 'study_materials', component: StudyMaterialHub },
    { key: 'ai_buddy', component: AIStudyBuddy },
  ];

  const quickActions = [
    { label: "Focus Engine", icon: Flame, path: "/niranx/focus-engine", accent: true },
    { label: "AI Chat", icon: Brain, path: "/niranx/ai-chat" },
    { label: "Debate Hub", icon: MessageCircle, path: "/niranx/debates" },
    { label: "XFlow", icon: Users, path: "/niranx/xflow" },
  ];

  const navCards = [
    { title: "Tasks", icon: CheckSquare, page: "tasks", desc: "TASK_MGMT", locked: !isLoggedIn, gradient: "from-primary/20 to-primary/5" },
    { title: "Focus", icon: Timer, page: "focus-engine", desc: "POMODORO", locked: false, gradient: "from-accent/20 to-accent/5" },
    { title: "Music", icon: Music, page: "music", desc: "AUDIO_SYS", locked: !isLoggedIn, gradient: "from-success/20 to-success/5" },
    { title: "Games", icon: Gamepad2, page: "games", desc: "BRAIN_TRAIN", locked: !isLoggedIn, gradient: "from-warning/20 to-warning/5" },
  ];

  return (
    <div className="min-h-full mobile-padding relative">
      {/* ═══ IMMERSIVE BACKGROUND ═══ */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        {/* Radial glows */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] orb-glow opacity-30" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, hsl(315 100% 60% / 0.2), transparent 70%)', filter: 'blur(60px)' }} />
        {/* Grid */}
        <div className="absolute inset-0 cyber-grid opacity-60" />
        {/* Floating lines */}
        {[...Array(4)].map((_, i) => (
          <motion.div key={i} className="absolute h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent"
            style={{ top: `${15 + i * 20}%`, left: 0, right: 0 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.8 }} />
        ))}
      </div>

      {/* ═══ HERO SECTION ═══ */}
      <motion.div 
        className="mb-8 md:mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* System Status */}
        <motion.div 
          className="flex items-center justify-center gap-5 mb-5 text-xs font-mono text-muted-foreground"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="status-indicator">SYS_ONLINE</span>
          <span className="flex items-center gap-1.5"><Wifi className="w-3 h-3 text-primary" /> CONNECTED</span>
          <span className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-success" /> ENCRYPTED</span>
        </motion.div>

        {/* Hero Card */}
        <motion.div
          className="text-center mb-7"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-5 p-7 rounded-2xl holo-card neon-border relative">
            {/* Corner decoration */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-primary/40" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-primary/40" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-accent/40" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-accent/40" />
            
            <CircuitBoard className="w-10 h-10 md:w-12 md:h-12 text-primary animate-pulse-scale" />
            <div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold gradient-text tracking-wider">
                NiranX Dashboard — Your AI Study Command Center
              </h1>
              <p className="text-xs md:text-sm font-mono text-muted-foreground tracking-[0.3em] mt-1.5">
                NEXUS // QUANTUM_ENGINE
              </p>
            </div>
            <Hexagon className="w-8 h-8 md:w-10 md:h-10 text-accent animate-float" />
          </div>
        </motion.div>
        
        {/* Search */}
        <motion.div 
          className="mb-6" 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GoogleStyleSearchBar />
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="flex flex-wrap justify-center gap-2.5 mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {quickActions.map((action, i) => (
            <Button
              key={action.label}
              onClick={() => navigate(action.path)}
              variant={action.accent ? "default" : "outline"}
              className={cn(
                "gap-2 font-mono text-xs tracking-widest transition-all duration-300",
                action.accent 
                  ? "shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)]"
                  : "glass-button"
              )}
              size="sm"
            >
              <action.icon className="w-4 h-4" />
              {action.label.toUpperCase()}
            </Button>
          ))}
          
          <Button
            onClick={() => window.open('https://files.appsgeyser.com/NiranX%20StudyVerse_19305310.apk', '_blank')}
            variant="outline"
            className="glass-button gap-2 font-mono text-xs tracking-widest"
            size="sm"
          >
            <GraduationCap className="w-4 h-4 text-success" />
            APK
          </Button>

          {isLoggedIn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="glass-button gap-2 font-mono text-xs tracking-widest" size="sm">
                  <Database className="w-4 h-4 text-primary" />
                  {activeSpace ? activeSpace.name.toUpperCase() : "SPACES"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-64">
                <div className="px-2 py-1.5 text-xs text-muted-foreground font-mono">
                  SPACES ({spaces.length}/{spaceLimit})
                </div>
                <DropdownMenuSeparator />
                {spaces.length === 0 ? (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground font-mono">NO_SPACES</div>
                ) : (
                  <div className="max-h-48 overflow-y-auto">
                    {spaces.map((space) => (
                      <DropdownMenuItem key={space.id} className="cursor-pointer font-mono text-xs"
                        onClick={() => navigate('/niranx/explore-spaces')}>
                        <Layers className="h-4 w-4 text-primary mr-2" />
                        <span className="truncate max-w-[150px]">{space.name}</span>
                        {space.is_active && <Badge variant="secondary" className="ml-auto text-[10px]">ACTIVE</Badge>}
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
                <DropdownMenuSeparator />
                <CreateSpaceDialog
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer font-mono text-xs">
                      <Sparkles className="h-4 w-4 mr-2 text-accent" /> NEW_SPACE
                    </DropdownMenuItem>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </motion.div>
        
        {/* Tagline */}
        <motion.p 
          className="text-center text-xs font-mono text-muted-foreground tracking-[0.4em] mb-7"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {">"} FOCUS . FLOW . GAMIFY . GROW {"<"}
        </motion.p>
          
        {/* ═══ STATS HUD ═══ */}
        {isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="holo-card neon-border mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="font-mono text-xs text-muted-foreground tracking-[0.2em]">SYSTEM_METRICS</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-primary/20 to-transparent ml-2" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {[
                    { value: todayStats.totalMinutes, label: "MIN_TODAY", color: "text-primary", glow: "shadow-[0_0_12px_hsl(var(--primary)/0.3)]" },
                    { value: streak, label: "DAY_STREAK", color: "text-success", glow: "shadow-[0_0_12px_hsl(var(--success)/0.3)]" },
                    { value: `L${level}`, label: "LEVEL", color: "text-accent", glow: "shadow-[0_0_12px_hsl(var(--accent)/0.3)]" },
                    { value: xp, label: "XP_TOTAL", color: "text-warning", glow: "shadow-[0_0_12px_hsl(var(--warning)/0.3)]" },
                  ].map((stat, i) => (
                    <motion.div 
                      key={i} 
                      className={cn("text-center p-3 rounded-lg bg-muted/30 border border-border/30", stat.glow)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      <p className={cn("text-2xl md:text-3xl font-display font-bold tabular-nums", stat.color)}>
                        {stat.value}
                      </p>
                      <p className="text-[9px] font-mono text-muted-foreground tracking-[0.2em] mt-1">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-xs font-mono text-muted-foreground">
                    <span className="tracking-wider">LEVEL_PROGRESS</span>
                    <span className="text-primary tabular-nums">{Math.round(xpProgress)}%</span>
                  </div>
                  <div className="relative">
                    <Progress value={xpProgress} className="h-2" />
                    <div className="absolute inset-0 rounded-full opacity-50"
                      style={{ 
                        background: `linear-gradient(90deg, hsl(168 100% 48% / 0.1), hsl(168 100% 48% / 0.05))`,
                        width: `${xpProgress}%` 
                      }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Widget Banner - shown after auth */}
        {isLoggedIn && !widgets.some(w => isWidgetEnabled(w.key)) && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.48 }}
          >
            <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,hsl(var(--primary)/0.1)_0%,transparent_60%)]" />
              <CardContent className="p-5 flex items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                    <Layers className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm tracking-wider">ADD_WIDGETS</h3>
                    <p className="text-xs font-mono text-muted-foreground tracking-wide mt-0.5">
                      Customize your dashboard with widgets for tasks, music, notes & more
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate('/niranx/widget-settings')}
                  className="font-mono text-xs tracking-widest gap-2 shrink-0"
                >
                  <Target className="w-4 h-4" /> CONFIGURE
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Streak */}
        {isLoggedIn && (
          <motion.div className="mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <StreakDisplay />
          </motion.div>
        )}

        {/* Upcoming Schedule */}
        {isLoggedIn && (
          <motion.div className="mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.52 }}>
            <UpcomingScheduleWidget />
          </motion.div>
        )}

        {/* Heatmap */}
        {isLoggedIn && (
          <motion.div className="mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
            <StudyHeatmap compact />
          </motion.div>
        )}

        {/* Mood / Motivation / Challenge */}
        {isLoggedIn && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <MoodSelector />
            <AIMotivation />
            <DailyChallenge />
          </motion.div>
        )}

        {isLoggedIn && (
          <motion.div className="mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
            <StudyBuddyClone />
          </motion.div>
        )}
        
        {/* ═══ NAV CARDS ═══ */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {navCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              <Card 
                className={cn(
                  "holo-card cursor-pointer group border-border/50",
                  card.locked && "opacity-50"
                )}
                onClick={() => handleNavigation(card.page)}
              >
                <CardContent className={cn("p-5 text-center relative overflow-hidden")}>
                  {/* Background gradient */}
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", card.gradient)} />
                  
                  <div className="relative z-10">
                    <div className="flex justify-center items-center mb-3">
                      <div className="p-2.5 rounded-lg bg-muted/40 group-hover:bg-primary/10 transition-colors duration-300">
                        <card.icon className="w-7 h-7 text-primary group-hover:text-primary-glow transition-colors" />
                      </div>
                      {card.locked && <Lock className="w-3 h-3 text-muted-foreground ml-2" />}
                    </div>
                    <h3 className="font-display font-semibold text-sm tracking-wider">{card.title}</h3>
                    <p className="text-[9px] font-mono text-muted-foreground tracking-[0.2em] mt-1">{card.desc}</p>
                    {card.locked && (
                      <Badge variant="outline" className="mt-2 text-[9px] font-mono tracking-wider">AUTH_REQ</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {isLoggedIn && <ApplyForGuardianCard />}
        </div>
        
        {/* System Controls */}
        <motion.div 
          className="flex flex-wrap justify-center gap-3 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="glass-button font-mono text-xs gap-2 tracking-widest"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            {isDarkMode ? 'LIGHT' : 'DARK'}
          </Button>

          <Button
            variant={isLoggedIn ? "default" : "outline"}
            size="sm"
            onClick={() => navigate(isLoggedIn ? '/niranx/profile' : '/niranx/auth')}
            className={cn("font-mono text-xs gap-2 tracking-widest", !isLoggedIn && "glass-button")}
          >
            <User className="w-3.5 h-3.5" />
            {isLoggedIn ? 'PROFILE' : 'AUTH'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/niranx/widget-settings')}
            className="glass-button font-mono text-xs gap-2 tracking-widest"
          >
            <Target className="w-3.5 h-3.5" />
            WIDGETS
          </Button>
        </motion.div>
      </motion.div>

      {/* ═══ WIDGETS ═══ */}
      <DraggableWidgetGrid
        widgets={widgets}
        isWidgetEnabled={isWidgetEnabled}
        storageKey="dashboard-widget-order"
      />

      {/* Empty State */}
      {!widgets.some(w => isWidgetEnabled(w.key)) && (
        <motion.div 
          className="text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="inline-flex p-6 rounded-full bg-muted/20 mb-5">
            <Terminal className="w-12 h-12 text-muted-foreground/30" />
          </div>
          <h3 className="text-xl font-display font-bold mb-2 tracking-wider">NO_WIDGETS_ACTIVE</h3>
          <p className="text-sm font-mono text-muted-foreground mb-6 tracking-wide">
            Initialize widgets to customize your dashboard
          </p>
          <Button onClick={() => navigate('/niranx/widget-settings')} size="sm" className="font-mono text-xs gap-2 tracking-widest">
            <Target className="w-4 h-4" /> INIT_WIDGETS
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default Index;
