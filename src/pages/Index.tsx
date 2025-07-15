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
import MacDock from "@/components/layout/MacDock";

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
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
      setCurrentPage(page);
    } else if (page === 'profile') {
      // Handle profile page (could be a modal or separate page)
      console.log('Navigate to profile');
    } else {
      // Check if requires auth and redirect if needed
      if (page !== 'pomodoro' && (!isLoggedIn || isGuest)) {
        navigate('/login');
        return;
      }
      // Navigate to other pages using proper routing
      navigate(`/${page}`);
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
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Brain className="w-10 h-10 text-primary animate-pulse-scale" />
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            StudyVerse
          </h1>
          <Sparkles className="w-8 h-8 text-accent animate-bounce-gentle" />
        </div>
        <p className="text-lg text-muted-foreground mb-6">
          Your all-in-one Gen-Z study ecosystem 🚀
        </p>
        
        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <Card 
            className={`glass-card cursor-pointer hover:scale-105 transition-transform ${
              !isLoggedIn && isGuest ? 'opacity-60' : ''
            }`}
            onClick={() => handleNavigation('tasks')}
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-center items-center mb-3">
                <CheckSquare className="w-10 h-10 text-primary" />
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
            className="glass-card cursor-pointer hover:scale-105 transition-transform"
            onClick={() => handleNavigation('pomodoro')}
          >
            <CardContent className="p-6 text-center">
              <Timer className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-lg">Focus</h3>
              <p className="text-sm text-muted-foreground">Pomodoro timer</p>
              <Badge variant="secondary" className="mt-2 text-xs">Always Available</Badge>
            </CardContent>
          </Card>
          
          <Card 
            className={`glass-card cursor-pointer hover:scale-105 transition-transform ${
              !isLoggedIn && isGuest ? 'opacity-60' : ''
            }`}
            onClick={() => handleNavigation('music')}
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-center items-center mb-3">
                <Music className="w-10 h-10 text-primary" />
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
            className={`glass-card cursor-pointer hover:scale-105 transition-transform ${
              !isLoggedIn && isGuest ? 'opacity-60' : ''
            }`}
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
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          <Button
            variant="outline"
            size="default"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="glass-button"
          >
            {isDarkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>

          <Button
            variant={isLoggedIn ? "default" : "outline"}
            size="default"
            onClick={() => navigate('/login')}
            className="glass-button"
          >
            <User className="w-4 h-4 mr-2" />
            {isLoggedIn ? (isGuest ? 'Guest Mode' : 'Logged In') : 'Login'}
          </Button>
          
          <div className="flex flex-wrap gap-3">
            {widgets.map(({ key, label, icon: Icon }) => (
              <Badge
                key={key}
                variant={activeWidgets[key] ? "default" : "secondary"}
                className="cursor-pointer hover:scale-105 transition-transform text-sm px-3 py-1"
                onClick={() => toggleWidget(key)}
              >
                <Icon className="w-4 h-4 mr-1" />
                {label}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 auto-rows-min">
        {widgets.map(({ key, component: Component }) => 
          activeWidgets[key] && (
            <div key={key} className="animate-fade-in">
              <Component />
            </div>
          )
        )}
      </div>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl bg-gradient-primary hover:scale-110 transition-all duration-300"
        onClick={() => toggleWidget('analytics')}
      >
        <Zap className="w-6 h-6" />
      </Button>

      {/* macOS Dock */}
      <MacDock onNavigate={handleNavigation} currentPage={currentPage} />

      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse-scale"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-bounce-gentle"></div>
      </div>
    </div>
  );
};

export default Index;
