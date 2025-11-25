import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronUp, 
  Brain,
  CheckSquare,
  Timer,
  BarChart3,
  Music,
  MessageCircle,
  Calendar,
  GraduationCap,
  Trophy,
  Users,
  Flame,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DockItem {
  id: string;
  label: string;
  icon: any;
  route: string;
  color: string;
}

const dockItems: DockItem[] = [
  { id: 'ai-chat', label: 'AI Chat', icon: Brain, route: '/niranx/ai-chat', color: 'text-primary' },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, route: '/niranx/tasks', color: 'text-accent' },
  { id: 'focus', label: 'Focus Engine', icon: Flame, route: '/niranx/focus-engine', color: 'text-orange-500' },
  { id: 'timer', label: 'Pomodoro', icon: Timer, route: '/niranx/pomodoro', color: 'text-red-500' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, route: '/niranx/analytics', color: 'text-blue-500' },
  { id: 'music', label: 'Music', icon: Music, route: '/niranx/music', color: 'text-purple-500' },
  { id: 'debates', label: 'Debates', icon: MessageCircle, route: '/niranx/debates', color: 'text-cyan-500' },
  { id: 'scheduler', label: 'Scheduler', icon: Calendar, route: '/niranx/class-scheduler', color: 'text-green-500' },
  { id: 'labs', label: 'Labs', icon: GraduationCap, route: '/niranx/labs', color: 'text-yellow-500' },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, route: '/niranx/leaderboard', color: 'text-amber-500' },
  { id: 'guilds', label: 'Guilds', icon: Users, route: '/niranx/guilds', color: 'text-indigo-500' },
  { id: 'challenges', label: 'Challenges', icon: Zap, route: '/niranx/daily-challenges', color: 'text-pink-500' },
];

const MacDock = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleItemClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 mobile-hide">
      <TooltipProvider>
        <div className="relative">
          {/* Toggle Button */}
          <div className="flex justify-center mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "glass-button rounded-full px-4 py-2 shadow-lg hover:scale-110 transition-all duration-300",
                "bg-background/80 backdrop-blur-xl border border-primary/20"
              )}
            >
              <ChevronUp 
                className={cn(
                  "w-5 h-5 transition-transform duration-300",
                  isExpanded && "rotate-180"
                )} 
              />
              <span className="ml-2 text-sm font-medium">
                {isExpanded ? 'Hide' : 'Quick Access'}
              </span>
            </Button>
          </div>

          {/* Dock Container */}
          <div
            className={cn(
              "glass-card border border-primary/20 rounded-3xl p-3 shadow-2xl backdrop-blur-2xl overflow-hidden transition-all duration-500 ease-out",
              "bg-gradient-to-r from-background/90 via-background/80 to-background/90",
              isExpanded 
                ? "opacity-100 scale-100 translate-y-0 max-h-[200px]" 
                : "opacity-0 scale-95 translate-y-4 max-h-0 p-0 border-0"
            )}
            style={{
              boxShadow: isExpanded ? 'var(--shadow-widget)' : 'none',
            }}
          >
            <div className="flex items-center justify-center gap-2 flex-wrap max-w-5xl">
              {dockItems.map((item, index) => (
                <Tooltip key={item.id} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleItemClick(item.route)}
                      className={cn(
                        "group relative p-4 rounded-2xl transition-all duration-300 hover:scale-125 hover:-translate-y-2",
                        "bg-background/50 hover:bg-primary/10 border border-transparent hover:border-primary/30",
                        "animate-scale-in"
                      )}
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      <item.icon 
                        className={cn(
                          "w-6 h-6 transition-all duration-300",
                          item.color,
                          "group-hover:drop-shadow-[0_0_8px_currentColor]"
                        )} 
                      />
                      
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"
                        style={{
                          background: `radial-gradient(circle, currentColor 0%, transparent 70%)`
                        }}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    className="glass-card border-primary/20 animate-fade-in"
                  >
                    <p className="font-medium">{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Decorative glow */}
          {isExpanded && (
            <div 
              className="absolute inset-0 -z-10 blur-3xl opacity-30 rounded-3xl animate-pulse-glow"
              style={{
                background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
              }}
            />
          )}
        </div>
      </TooltipProvider>
    </div>
  );
};

export default MacDock;