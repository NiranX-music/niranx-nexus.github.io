import { useState } from 'react';
import { 
  Home, 
  Calendar, 
  BarChart3, 
  GraduationCap,
  Music,
  Settings,
  User,
  CheckSquare,
  Timer,
  Gamepad2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

interface DockItem {
  id: string;
  label: string;
  icon: any;
  active?: boolean;
  onClick: () => void;
}

interface MacDockProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const MacDock = ({ onNavigate, currentPage }: MacDockProps) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const dockItems: DockItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, onClick: () => onNavigate('dashboard') },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, onClick: () => onNavigate('tasks') },
    { id: 'pomodoro', label: 'Pomodoro', icon: Timer, onClick: () => onNavigate('pomodoro') },
    { id: 'music', label: 'Music Zone', icon: Music, onClick: () => window.open('https://open.spotify.com/', '_blank') },
    { id: 'games', label: 'Games', icon: Gamepad2, onClick: () => onNavigate('games') },
    { id: 'timetable', label: 'Smart Timetable', icon: Calendar, onClick: () => onNavigate('timetable') },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, onClick: () => onNavigate('analytics') },
    { id: 'exams', label: 'Exam Hub', icon: GraduationCap, onClick: () => onNavigate('exams') },
    { id: 'profile', label: 'Profile', icon: User, onClick: () => onNavigate('profile') },
  ];

  return (
    <div className={`fixed left-1/2 transform -translate-x-1/2 z-[100] ${isMobile ? 'bottom-0' : 'bottom-4'}`}>
      <div className={`bg-background/80 backdrop-blur-xl border border-border shadow-2xl ${isMobile ? 'rounded-t-2xl p-2 pb-3' : 'rounded-2xl p-2'}`}>
        <div className="flex items-end gap-1">
          {dockItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const isHovered = hoveredItem === item.id;
            const scale = isHovered ? 'scale-125' : isActive ? 'scale-110' : 'scale-100';
            
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`
                      relative h-12 w-12 rounded-xl transition-all duration-300 ease-out
                      ${scale} hover:scale-125
                      ${isActive ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-accent'}
                    `}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={item.onClick}
                  >
                    <Icon className="h-5 w-5" />
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="mb-2">
                  <p className="text-sm font-medium">{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MacDock;