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
  Music, 
  FolderOpen, 
  Calendar, 
  CheckSquare, 
  BarChart3, 
  Timer, 
  StickyNote, 
  MessageCircle, 
  Moon, 
  Sun,
  Sparkles,
  Zap,
  Heart,
  Brain,
  User,
  GraduationCap,
  Gamepad2,
  Lock,
  Target,
  Flame,
  Layers,
  Users
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useSpaces } from '@/hooks/useSpaces';
import { CreateSpaceDialog } from '@/components/CreateSpaceDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
    if (saved) {
      setIsDarkMode(JSON.parse(saved));
    }
    
    // Prevent auto-scroll on mount
    window.scrollTo(0, 0);
    
    // Award 1000 XP for app visit after login
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
    if (page === 'dashboard') {
      // Stay on current dashboard page
      return;
    } else if (page === 'profile') {
      // Handle profile page (could be a modal or separate page)
      console.log('Navigate to profile');
    } else {
      // Check if requires auth and redirect if needed
      if (page !== 'pomodoro' && !isLoggedIn) {
        navigate('/niranx/auth');
        return;
      }
      // Navigate to other pages using proper routing
      navigate(`/niranx/${page}`);
    }
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

  return (
    <div className="min-h-full mobile-padding perspective-3d relative">
      {/* Enhanced Cosmic Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/10 to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
        
        {/* Animated Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-primary/20 rounded-full blur-3xl animate-float opacity-50" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-accent/20 rounded-full blur-3xl animate-float opacity-50" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-float opacity-30" style={{ animationDelay: '4s' }} />
        
        {/* Floating Stars */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              background: i % 3 === 0 ? 'hsl(var(--primary))' : i % 3 === 1 ? 'hsl(var(--accent))' : 'hsl(var(--purple-400))',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
              opacity: 0.3 + Math.random() * 0.4,
            }}
          />
        ))}
      </div>

      {/* Hero Header */}
      <div className="mb-8 md:mb-12 animate-fade-in">
        {/* Main Title Section */}
        <div className="text-center mb-6 relative">
          <div className="inline-flex items-center gap-3 card-3d hover-lift p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-accent/10 backdrop-blur-sm border border-primary/20">
            <Zap className="w-10 h-10 md:w-14 md:h-14 text-primary animate-pulse-scale drop-shadow-[0_0_15px_rgba(124,58,237,0.5)]" />
            <div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold gradient-text drop-shadow-2xl mb-2">
                NiranX StudyVerse
              </h1>
              <p className="text-sm md:text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Your Quantum Study Universe 🚀✨
              </p>
            </div>
            <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-accent animate-float drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
          </div>
        </div>
        
        {/* Google Style Search Bar */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <GoogleStyleSearchBar />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Button
            onClick={() => navigate('/niranx/focus-engine')}
            className="glass-button flex items-center gap-2 transform-3d hover:scale-110 transition-all shadow-lg"
            size="lg"
          >
            <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
            Focus Engine
          </Button>
          <Button
            onClick={() => navigate('/niranx/ai-chat')}
            variant="outline"
            className="glass-button flex items-center gap-2 transform-3d hover:scale-110 transition-all"
            size="lg"
          >
            <Brain className="w-5 h-5 text-primary" />
            AI Study Buddy
          </Button>
          <Button
            onClick={() => navigate('/niranx/debates')}
            variant="outline"
            className="glass-button flex items-center gap-2 transform-3d hover:scale-110 transition-all"
            size="lg"
          >
            <MessageCircle className="w-5 h-5 text-accent" />
            Debate Hub
          </Button>
          <Button
            onClick={() => navigate('/niranx/xflow')}
            variant="outline"
            className="glass-button flex items-center gap-2 transform-3d hover:scale-110 transition-all bg-gradient-to-r from-pink-500/20 to-purple-500/20"
            size="lg"
          >
            <Users className="w-5 h-5 text-pink-500" />
            Login to XFlow
          </Button>
          <Button
            onClick={() => window.open('https://files.appsgeyser.com/NiranX%20StudyVerse_19305310.apk?_gl=1*l3gq1g*_ga*MTkwMDEyODM3Mi4xNzY0NDI5NTA1*_ga_WRFFFBGC4Z*czE3NjQ0Mjk1MDQkbzEkZzEkdDE3NjQ0MzAwNjQkajQkbDAkaDAkZE5XT196WFNMNk1iQzF5UFNRNFNGbFdIVG8wajU5RThTYVE', '_blank')}
            variant="outline"
            className="glass-button flex items-center gap-2 transform-3d hover:scale-110 transition-all"
            size="lg"
          >
            <GraduationCap className="w-5 h-5 text-success" />
            Download APK
          </Button>
          
          {isLoggedIn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="glass-button flex items-center gap-2 transform-3d hover:scale-110 transition-all"
                  size="lg"
                >
                  <Layers className="w-5 h-5 text-blue-500" />
                  {activeSpace ? activeSpace.name : "Select Space"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-64">
                <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">
                  Your Spaces ({spaces.length}/{spaceLimit})
                </div>
                <DropdownMenuSeparator />
                
                {spaces.length === 0 ? (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    No spaces yet
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto">
                    {spaces.map((space) => (
                      <DropdownMenuItem
                        key={space.id}
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => navigate('/niranx/explore-spaces')}
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-primary" />
                          <span className="truncate max-w-[150px]">{space.name}</span>
                        </div>
                        {space.is_active && (
                          <Badge variant="secondary" className="text-xs">Active</Badge>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
                
                <DropdownMenuSeparator />
                <CreateSpaceDialog
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                      <Sparkles className="h-4 w-4 mr-2 text-accent" />
                      Create New Space
                    </DropdownMenuItem>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="text-center animate-slide-up">
          <p className="text-lg text-muted-foreground mb-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            "Focus. Flow. Gamify. Grow." 🚀
          </p>
          
          {/* Welcome & Stats Banner */}
          {isLoggedIn && (
            <Card className="glass-card border-primary/20 mb-6 md:mb-8 animate-scale-in bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
              <CardContent className="p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold gradient-text mb-4">
                  Welcome back, Legend!
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-primary">{todayStats.totalMinutes}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Minutes Today</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-success">{streak}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Day Streak</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-accent">L{level}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Level</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-warning">{xp}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">XP</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span>Level Progress</span>
                    <span>{Math.round(xpProgress)}%</span>
                  </div>
                  <Progress value={xpProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Streak Display */}
          {isLoggedIn && (
            <div className="mb-6 md:mb-8 animate-scale-in">
              <StreakDisplay />
            </div>
          )}

          {/* Study Heatmap */}
          {isLoggedIn && (
            <div className="mb-6 md:mb-8 animate-fade-in" style={{ animationDelay: '0.25s' }}>
              <StudyHeatmap compact />
            </div>
          )}

          {/* Mood & Challenges Grid */}
          {isLoggedIn && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <MoodSelector />
              <AIMotivation />
              <DailyChallenge />
            </div>
          )}

          {/* AI Study Buddy Clone */}
          {isLoggedIn && (
            <div className="mb-6 md:mb-8 animate-fade-in" style={{ animationDelay: '0.35s' }}>
              <StudyBuddyClone />
            </div>
          )}
        
        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-8 md:mb-10 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Card 
            className={`glass-card cursor-pointer card-3d hover-lift animate-scale-in transform-3d group ${
              !isLoggedIn ? 'opacity-60' : ''
            }`}
            style={{ animationDelay: '0.1s' }}
            onClick={() => handleNavigation('tasks')}
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-center items-center mb-3">
                <CheckSquare className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                {!isLoggedIn && <Lock className="w-4 h-4 text-muted-foreground ml-2" />}
              </div>
              <h3 className="font-semibold text-lg">Tasks</h3>
              <p className="text-sm text-muted-foreground">Manage your work</p>
              {!isLoggedIn && (
                <Badge variant="outline" className="mt-2 text-xs">Login Required</Badge>
              )}
            </CardContent>
          </Card>
          
          <Card 
            className="glass-card cursor-pointer card-3d hover-lift animate-scale-in transform-3d group"
            style={{ animationDelay: '0.2s' }}
            onClick={() => handleNavigation('focus-engine')}
          >
            <CardContent className="p-6 text-center">
              <Timer className="w-10 h-10 text-primary mx-auto mb-3 group-hover:rotate-12 transition-transform" />
              <h3 className="font-semibold text-lg">Focus</h3>
              <p className="text-sm text-muted-foreground">Pomodoro timer</p>
              <Badge variant="secondary" className="mt-2 text-xs">Always Available</Badge>
            </CardContent>
          </Card>
          
          <Card 
            className={`glass-card cursor-pointer card-3d hover-lift animate-scale-in transform-3d group ${
              !isLoggedIn ? 'opacity-60' : ''
            }`}
            style={{ animationDelay: '0.3s' }}
            onClick={() => handleNavigation('music')}
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-center items-center mb-3">
                <Music className="w-10 h-10 text-primary group-hover:scale-125 transition-transform" />
                {!isLoggedIn && <Lock className="w-4 h-4 text-muted-foreground ml-2" />}
              </div>
              <h3 className="font-semibold text-lg">Music</h3>
              <p className="text-sm text-muted-foreground">Study vibes</p>
              {!isLoggedIn && (
                <Badge variant="outline" className="mt-2 text-xs">Login Required</Badge>
              )}
            </CardContent>
          </Card>
          
          <Card 
            className={`glass-card cursor-pointer card-3d hover-lift animate-scale-in transform-3d group ${
              !isLoggedIn ? 'opacity-60' : ''
            }`}
            style={{ animationDelay: '0.4s' }}
            onClick={() => handleNavigation('games')}
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-center items-center mb-3">
                <Gamepad2 className="w-10 h-10 text-primary group-hover:rotate-6 transition-transform" />
                {!isLoggedIn && <Lock className="w-4 h-4 text-muted-foreground ml-2" />}
              </div>
              <h3 className="font-semibold text-lg">Games</h3>
              <p className="text-sm text-muted-foreground">Brain training</p>
              {!isLoggedIn && (
                <Badge variant="outline" className="mt-2 text-xs">Login Required</Badge>
              )}
            </CardContent>
          </Card>

          {/* Apply for Guardian Card */}
          {isLoggedIn && <ApplyForGuardianCard />}
        </div>
        
        {/* Theme Toggle & Quick Actions */}
        <div className="flex flex-wrap justify-center gap-6 mb-10 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <Button
            variant="outline"
            size="default"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="glass-button transform-3d hover:scale-110 hover:rotate-6 transition-all duration-300"
          >
            {isDarkMode ? <Sun className="w-4 h-4 mr-2 animate-rotate-slow" /> : <Moon className="w-4 h-4 mr-2 animate-pulse-scale" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>

          <Button
            variant={isLoggedIn ? "default" : "outline"}
            size="default"
            onClick={() => navigate(isLoggedIn ? '/niranx/profile' : '/niranx/auth')}
            className="glass-button btn-3d"
          >
            <User className="w-4 h-4 mr-2 animate-bounce-gentle" />
            {isLoggedIn ? 'Profile' : 'Login'}
          </Button>

          <Button
            variant="outline"
            size="default"
            onClick={() => navigate('/niranx/widget-settings')}
            className="glass-button transform-3d hover:scale-110 transition-all duration-300"
          >
            <Target className="w-4 h-4 mr-2" />
            Manage Widgets
          </Button>
        </div>
        </div>
      </div>

      {/* Widgets Grid — Drag-and-Drop */}
      <DraggableWidgetGrid
        widgets={widgets}
        isWidgetEnabled={isWidgetEnabled}
        storageKey="dashboard-widget-order"
      />

      {/* Empty State */}
      {!widgets.some(w => isWidgetEnabled(w.key)) && (
        <div className="text-center py-16 animate-fade-in">
          <div className="mb-6">
            <GraduationCap className="w-20 h-20 mx-auto text-muted-foreground/50" />
          </div>
          <h3 className="text-2xl font-bold mb-2">No Widgets Enabled</h3>
          <p className="text-muted-foreground mb-6">
            Add widgets to customize your dashboard and get started!
          </p>
          <Button onClick={() => navigate('/niranx/widget-settings')} size="lg" className="glass-button">
            <Target className="w-5 h-5 mr-2" />
            Add Your First Widget
          </Button>
        </div>
      )}

      {/* Background Decorations with 3D effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-success/5 rounded-full blur-3xl animate-pulse-scale" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
};

export default Index;
