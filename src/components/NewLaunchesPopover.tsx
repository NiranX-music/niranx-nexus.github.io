import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export function NewLaunchesPopover() {
  const navigate = useNavigate();

  const launches = [
    {
      title: 'Math Lab',
      description: 'Scientific calculator with trigonometric formulas and ratios',
      date: 'This Week',
      path: '/niranx/labs/math',
      badge: 'New',
    },
    {
      title: 'Virtual Labs Enhancement',
      description: 'Lab notebooks with PDF export and collaborative experiments',
      date: 'This Week',
      path: '/niranx/labs',
      badge: 'Updated',
    },
    {
      title: 'Quiz Leaderboard',
      description: 'Compete with others on lab quizzes across all subjects',
      date: 'This Week',
      path: '/niranx/labs/chemistry',
      badge: 'New',
    },
    {
      title: 'Virtual Equipment',
      description: 'Interactive lab equipment simulations for hands-on learning',
      date: 'This Week',
      path: '/niranx/labs/physics',
      badge: 'New',
    },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Rocket className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary animate-pulse" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              What's New This Week
            </CardTitle>
            <CardDescription>
              Check out the latest features and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 max-h-[400px] overflow-y-auto">
            <div className="divide-y">
              {launches.map((launch, index) => (
                <div
                  key={index}
                  className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(launch.path)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">{launch.title}</h4>
                        <Badge variant={launch.badge === 'New' ? 'default' : 'secondary'} className="text-xs">
                          {launch.badge}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {launch.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {launch.date}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
