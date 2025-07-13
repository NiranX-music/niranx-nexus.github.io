import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  Brain
} from "lucide-react";
import MusicPlayer from "@/components/widgets/MusicPlayer";
import FileExplorer from "@/components/widgets/FileExplorer";
import ClassScheduler from "@/components/widgets/ClassScheduler";
import TaskManager from "@/components/widgets/TaskManager";
import PomodoroTimer from "@/components/widgets/PomodoroTimer";
import Analytics from "@/components/widgets/Analytics";
import ChillCorner from "@/components/widgets/ChillCorner";
import NotesWidget from "@/components/widgets/NotesWidget";

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState({
    music: true,
    files: true,
    schedule: true,
    tasks: true,
    pomodoro: true,
    analytics: false,
    chill: true,
    notes: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem('studyverse-dark-mode');
    if (saved) {
      setIsDarkMode(JSON.parse(saved));
    }
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

  const widgets = [
    { key: 'music', label: 'Music Player', icon: Music, component: MusicPlayer },
    { key: 'files', label: 'File Explorer', icon: FolderOpen, component: FileExplorer },
    { key: 'schedule', label: 'Class Schedule', icon: Calendar, component: ClassScheduler },
    { key: 'tasks', label: 'Task Manager', icon: CheckSquare, component: TaskManager },
    { key: 'pomodoro', label: 'Pomodoro Timer', icon: Timer, component: PomodoroTimer },
    { key: 'analytics', label: 'Analytics', icon: BarChart3, component: Analytics },
    { key: 'chill', label: 'Chill Corner', icon: Heart, component: ChillCorner },
    { key: 'notes', label: 'Quick Notes', icon: StickyNote, component: NotesWidget },
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
        
        {/* Theme Toggle & Widget Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="glass-button"
          >
            {isDarkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>
          
          <div className="flex flex-wrap gap-2">
            {widgets.map(({ key, label, icon: Icon }) => (
              <Badge
                key={key}
                variant={activeWidgets[key] ? "default" : "secondary"}
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => toggleWidget(key)}
              >
                <Icon className="w-3 h-3 mr-1" />
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

      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse-scale"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-bounce-gentle"></div>
      </div>
    </div>
  );
};

export default Index;
