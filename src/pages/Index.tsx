import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Lock
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
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

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState({
    music: true,
    files: true,
    schedule: true,
    tasks: true,
    pomodoro: true,
    analytics: false,
    chill: true,
    notes: true,
    studyMaterials: true,
    aiChat: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('studyverse-dark-mode');
    if (saved) {
      setIsDarkMode(JSON.parse(saved));
    }
    
    // Check login status
    const loginStatus = localStorage.getItem("isLoggedIn");
    const authMethod = localStorage.getItem("authMethod");
    
    setIsLoggedIn(loginStatus === "true");
    setIsGuest(authMethod === "guest");
  }, []);

  useEffect(() => {
    localStorage.setItem('studyverse-dark-mode', JSON.stringify(isDarkMode));
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleWidget = (widget: string) => {
    setActiveWidgets(prev => ({
      ...prev,
      [widget]: !prev[widget]
    }));
  };

  const handleNavigation = (page: string) => {
    if (page === 'dashboard') {
      // Stay on current dashboard page
      return;
    } else if (page === 'profile') {
      // Handle profile page (could be a modal or separate page)
      console.log('Navigate to profile');
    } else {
      // Check if requires auth and redirect if needed
      if (page !== 'pomodoro' && (!isLoggedIn || isGuest)) {
        navigate('/niranx/login');
        return;
      }
      // Navigate to other pages using proper routing
      navigate(`/niranx/${page}`);
    }
  };

  const widgets = [
    { key: 'music', label: 'Music Player', icon: Music, component: MusicPlayer },
    { key: 'files', label: 'File Explorer', icon: FolderOpen, component: FileExplorer },
    { key: 'schedule', label: 'Class Schedule', icon: Calendar, component: ClassScheduler },
    { key: 'tasks', label: 'Task Manager', icon: CheckSquare, component: TaskManager },
    { key: 'pomodoro', label: 'Pomodoro Timer', icon: Timer, component: PomodoroTimer },
    { key: 'analytics', label: 'Analytics', icon: BarChart3, component: Analytics },
    { key: 'chill', label: 'Chill Corner', icon: Heart, component: ChillCorner },
    { key: 'notes', label: 'Quick Notes', icon: StickyNote, component: NotesWidget },
    { key: 'studyMaterials', label: 'Study Hub', icon: Brain, component: StudyMaterialHub },
    { key: 'aiChat', label: 'AI Buddy', icon: MessageCircle, component: AIStudyBuddy },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 perspective-3d">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        {/* Top Toolbar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1"></div>
          <div className="flex items-center gap-3 card-3d hover-lift">
            <Brain className="w-8 h-8 text-primary animate-pulse-scale" />
            <h1 className="text-2xl md:text-3xl font-bold gradient-text neon-glow">
              NiranX StudyVerse
            </h1>
            <Sparkles className="w-6 h-6 text-accent animate-float" />
          </div>
          <div className="flex-1 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigation('analytics')}
              className="flex items-center gap-2 transform-3d hover:scale-110 hover:shadow-lg transition-all duration-300"
            >
              <BarChart3 className="w-4 h-4 animate-bounce-gentle" />
              Analytics
            </Button>
          </div>
        </div>
        
        <div className="text-center animate-slide-up">
          <p className="text-lg text-muted-foreground mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Your all-in-one Gen-Z study ecosystem 🚀
          </p>
        
          {/* Quick Navigation Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <Card 
            className={`glass-card cursor-pointer card-3d hover-lift animate-scale-in transform-3d ${
              !isLoggedIn && isGuest ? 'opacity-60' : ''
            }`}
            style={{ animationDelay: '0.1s' }}
            onClick={() => handleNavigation('tasks')}
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-center items-center mb-3">
                <CheckSquare className="w-10 h-10 text-primary animate-wobble" />
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
            className="glass-card cursor-pointer card-3d hover-lift animate-scale-in transform-3d"
            style={{ animationDelay: '0.2s' }}
            onClick={() => handleNavigation('pomodoro')}
          >
            <CardContent className="p-6 text-center">
              <Timer className="w-10 h-10 text-primary mx-auto mb-3 animate-rotate-slow" />
              <h3 className="font-semibold text-lg">Focus</h3>
              <p className="text-sm text-muted-foreground">Pomodoro timer</p>
              <Badge variant="secondary" className="mt-2 text-xs animate-shimmer">Always Available</Badge>
            </CardContent>
          </Card>
          
          <Card 
            className={`glass-card cursor-pointer card-3d hover-lift animate-scale-in transform-3d ${
              !isLoggedIn && isGuest ? 'opacity-60' : ''
            }`}
            style={{ animationDelay: '0.3s' }}
            onClick={() => handleNavigation('music')}
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-center items-center mb-3">
                <Music className="w-10 h-10 text-primary animate-pulse-scale" />
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
            className={`glass-card cursor-pointer card-3d hover-lift animate-scale-in transform-3d ${
              !isLoggedIn && isGuest ? 'opacity-60' : ''
            }`}
            style={{ animationDelay: '0.4s' }}
            onClick={() => handleNavigation('games')}
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-center items-center mb-3">
                <Gamepad2 className="w-10 h-10 text-primary" />
                {!isLoggedIn && <Lock className="w-4 h-4 text-muted-foreground ml-2" />}
              </div>
              <h3 className="font-semibold text-lg">Games</h3>
              <p className="text-sm text-muted-foreground">Brain training</p>
              {!isLoggedIn && (
                <Badge variant="outline" className="mt-2 text-xs">Login Required</Badge>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Theme Toggle & Widget Controls */}
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
            onClick={() => navigate('/niranx/login')}
            className="glass-button btn-3d"
          >
            <User className="w-4 h-4 mr-2 animate-bounce-gentle" />
            {isLoggedIn ? (isGuest ? 'Guest Mode' : 'Logged In') : 'Login'}
          </Button>
          
          <div className="flex flex-wrap gap-3">
            {widgets.map(({ key, label, icon: Icon }, index) => (
              <Badge
                key={key}
                variant={activeWidgets[key] ? "default" : "secondary"}
                className="cursor-pointer transform-3d hover:scale-110 transition-all duration-300 text-sm px-3 py-1 animate-scale-in"
                style={{ animationDelay: `${0.6 + index * 0.05}s` }}
                onClick={() => toggleWidget(key)}
              >
                <Icon className="w-4 h-4 mr-1 group-hover:rotate-12 transition-transform" />
                {label}
              </Badge>
            ))}
          </div>
        </div>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 auto-rows-min perspective-3d">
        {widgets.map(({ key, component: Component }, index) => 
          activeWidgets[key] && (
            <div 
              key={key} 
              className="animate-flip-in card-3d hover-lift"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Component />
            </div>
          )
        )}
      </div>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl bg-gradient-to-br from-primary to-primary-glow transform-3d hover:scale-125 hover:rotate-180 transition-all duration-500 animate-glow-pulse z-50"
        onClick={() => toggleWidget('analytics')}
      >
        <Zap className="w-6 h-6" />
      </Button>

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
