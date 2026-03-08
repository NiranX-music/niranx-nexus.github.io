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
  Terminal, Cpu, Shield, Activity, Wifi, Database
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
    { label: "Focus Engine", icon: Flame, path: "/niranx/focus-engine", color: "text-primary" },
    { label: "AI Chat", icon: Brain, path: "/niranx/ai-chat", color: "text-accent" },
    { label: "Debate Hub", icon: MessageCircle, path: "/niranx/debates", color: "text-primary" },
    { label: "XFlow", icon: Users, path: "/niranx/xflow", color: "text-accent" },
  ];

  const navCards = [
    { title: "Tasks", icon: CheckSquare, page: "tasks", desc: "TASK_MGMT", locked: !isLoggedIn },
    { title: "Focus", icon: Timer, page: "focus-engine", desc: "POMODORO", locked: false },
    { title: "Music", icon: Music, page: "music", desc: "AUDIO_SYS", locked: !isLoggedIn },
    { title: "Games", icon: Gamepad2, page: "games", desc: "BRAIN_TRAIN", locked: !isLoggedIn },
  ];

  return (
    <div className="min-h-full mobile-padding relative cyber-grid">
      {/* Cyber Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/8 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent" />
        
        {/* Grid Lines */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
              style={{ top: `${20 + i * 15}%`, left: 0, right: 0, animationDelay: `${i * 0.5}s` }} />
          ))}
        </div>
      </div>

      {/* ═══ HERO HEADER ═══ */}
      <motion.div 
        className="mb-8 md:mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-6 relative">
          {/* System Status Bar */}
          <div className="flex items-center justify-center gap-4 mb-4 text-xs font-mono text-muted-foreground">
            <span className="status-indicator">SYS_ONLINE</span>
            <span className="flex items-center gap-1"><Wifi className="w-3 h-3 text-primary" /> CONNECTED</span>
            <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-success" /> SECURE</span>
          </div>

          <div className="inline-flex items-center gap-4 p-6 rounded-xl tech-card hud-corners">
            <Terminal className="w-10 h-10 md:w-12 md:h-12 text-primary animate-pulse-scale" />
            <div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold gradient-text tracking-wider">
                NIRANX
              </h1>
              <p className="text-sm md:text-base font-mono text-muted-foreground tracking-widest mt-1">
                STUDY_VERSE // QUANTUM_NEXUS
              </p>
            </div>
            <Cpu className="w-8 h-8 md:w-10 md:h-10 text-accent animate-float" />
          </div>
        </div>
        
        {/* Search */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <GoogleStyleSearchBar />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {quickActions.map((action, i) => (
            <Button
              key={action.label}
              onClick={() => navigate(action.path)}
              variant={i === 0 ? "default" : "outline"}
              className={cn(
                "glass-button gap-2 font-mono text-xs tracking-wide",
                i === 0 && "bg-primary text-primary-foreground hover:bg-primary/90 border-primary/50"
              )}
              size="sm"
            >
              <action.icon className={cn("w-4 h-4", action.color)} />
              {action.label.toUpperCase()}
            </Button>
          ))}
          
          <Button
            onClick={() => window.open('https://files.appsgeyser.com/NiranX%20StudyVerse_19305310.apk', '_blank')}
            variant="outline"
            className="glass-button gap-2 font-mono text-xs tracking-wide"
            size="sm"
          >
            <GraduationCap className="w-4 h-4 text-success" />
            APK
          </Button>

          {isLoggedIn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="glass-button gap-2 font-mono text-xs tracking-wide" size="sm">
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
        </div>
        
        {/* Tagline */}
        <p className="text-center text-sm font-mono text-muted-foreground tracking-widest mb-6">
          {">"} FOCUS . FLOW . GAMIFY . GROW {"<"}
        </p>
          
        {/* Stats HUD */}
        {isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="tech-card hud-corners mb-6">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="font-mono text-xs text-muted-foreground tracking-wider">SYSTEM_METRICS</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { value: todayStats.totalMinutes, label: "MIN_TODAY", color: "text-primary" },
                    { value: streak, label: "DAY_STREAK", color: "text-success" },
                    { value: `L${level}`, label: "LEVEL", color: "text-accent" },
                    { value: xp, label: "XP_TOTAL", color: "text-warning" },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <p className={cn("text-2xl md:text-3xl font-display font-bold tabular-nums", stat.color)}>
                        {stat.value}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground tracking-widest mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-muted-foreground">
                    <span>LEVEL_PROGRESS</span>
                    <span>{Math.round(xpProgress)}%</span>
                  </div>
                  <Progress value={xpProgress} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Streak */}
        {isLoggedIn && (
          <div className="mb-6 animate-scale-in">
            <StreakDisplay />
          </div>
        )}

        {/* Heatmap */}
        {isLoggedIn && (
          <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.25s' }}>
            <StudyHeatmap compact />
          </div>
        )}

        {/* Mood / Motivation / Challenge */}
        {isLoggedIn && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <MoodSelector />
            <AIMotivation />
            <DailyChallenge />
          </div>
        )}

        {isLoggedIn && (
          <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.35s' }}>
            <StudyBuddyClone />
          </div>
        )}
        
        {/* Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          {navCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <Card 
                className={cn(
                  "tech-card cursor-pointer hover-lift group",
                  card.locked && "opacity-60"
                )}
                onClick={() => handleNavigation(card.page)}
              >
                <CardContent className="p-5 text-center">
                  <div className="flex justify-center items-center mb-3">
                    <card.icon className="w-8 h-8 text-primary group-hover:text-accent transition-colors" />
                    {card.locked && <Lock className="w-3 h-3 text-muted-foreground ml-2" />}
                  </div>
                  <h3 className="font-display font-semibold text-sm tracking-wide">{card.title}</h3>
                  <p className="text-[10px] font-mono text-muted-foreground tracking-widest mt-1">{card.desc}</p>
                  {card.locked && (
                    <Badge variant="outline" className="mt-2 text-[10px] font-mono">AUTH_REQ</Badge>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {isLoggedIn && <ApplyForGuardianCard />}
        </div>
        
        {/* System Controls */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="glass-button font-mono text-xs gap-2 tracking-wide"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            {isDarkMode ? 'LIGHT_MODE' : 'DARK_MODE'}
          </Button>

          <Button
            variant={isLoggedIn ? "default" : "outline"}
            size="sm"
            onClick={() => navigate(isLoggedIn ? '/niranx/profile' : '/niranx/auth')}
            className={cn("font-mono text-xs gap-2 tracking-wide", !isLoggedIn && "glass-button")}
          >
            <User className="w-3.5 h-3.5" />
            {isLoggedIn ? 'PROFILE' : 'AUTH'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/niranx/widget-settings')}
            className="glass-button font-mono text-xs gap-2 tracking-wide"
          >
            <Target className="w-3.5 h-3.5" />
            WIDGETS
          </Button>
        </div>
      </motion.div>

      {/* Widgets */}
      <DraggableWidgetGrid
        widgets={widgets}
        isWidgetEnabled={isWidgetEnabled}
        storageKey="dashboard-widget-order"
      />

      {/* Empty State */}
      {!widgets.some(w => isWidgetEnabled(w.key)) && (
        <div className="text-center py-16 animate-fade-in">
          <Terminal className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-display font-bold mb-2 tracking-wide">NO_WIDGETS_ACTIVE</h3>
          <p className="text-sm font-mono text-muted-foreground mb-6">
            Initialize widgets to customize your dashboard
          </p>
          <Button onClick={() => navigate('/niranx/widget-settings')} size="sm" className="font-mono text-xs gap-2 tracking-wide">
            <Target className="w-4 h-4" /> INIT_WIDGETS
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;
