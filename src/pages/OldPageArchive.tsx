import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Archive, Clock, Calendar, BookOpen, ArrowRight, Info, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const archivedPages = [
  {
    id: 'nexus-ai',
    title: 'NiranX Nexus AI',
    description: 'Multi-model AI chat with Bytez API integration',
    icon: Brain,
    route: '/niranx/bytez-ai',
    color: 'text-purple-500',
    features: ['Multiple AI models', 'Vision capabilities', 'Code assistance'],
  },
  {
    id: 'pomodoro',
    title: 'Pomodoro Timer',
    description: 'Classic 25-minute focus sessions with break intervals',
    icon: Clock,
    route: '/niranx/pomodoro',
    color: 'text-red-500',
    features: ['25/5 minute intervals', 'Session tracking', 'Break reminders'],
  },
  {
    id: 'timetable',
    title: 'Smart Timetable',
    description: 'Weekly schedule planner with time slots and subjects',
    icon: Calendar,
    route: '/niranx/smart-timetable',
    color: 'text-blue-500',
    features: ['Weekly view', 'Subject organization', 'Time management'],
  },
  {
    id: 'library',
    title: 'Library',
    description: 'Study materials and resource collection',
    icon: BookOpen,
    route: '/niranx/library',
    color: 'text-green-500',
    features: ['Resource storage', 'Material organization', 'Quick access'],
  },
];

export default function OldPageArchive() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Archive className="w-8 h-8 text-muted-foreground" />
        <div>
          <h1 className="text-3xl font-bold">Old Page Archive</h1>
          <p className="text-muted-foreground">
            Access previous versions of features - preserved for reference
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="glass-card border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Why are these pages archived?</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                These features have been replaced with newer, more powerful alternatives. 
                The Focus Engine now includes enhanced Pomodoro functionality, the new Dashboard 
                provides advanced analytics, and the File Hub replaces the Library with better organization.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                These pages remain accessible for users who prefer the classic interface or need to access 
                historical data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Archived Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {archivedPages.map((page) => (
          <Card key={page.id} className="glass-card hover-lift group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg bg-muted/50 ${page.color}`}>
                  <page.icon className="w-6 h-6" />
                </div>
                <Badge variant="secondary" className="bg-muted">
                  Archived
                </Badge>
              </div>
              <CardTitle className="mt-4">{page.title}</CardTitle>
              <CardDescription>{page.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Features:</p>
                <ul className="space-y-1">
                  {page.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => navigate(page.route)}
                className="w-full group-hover:shadow-neon transition-all"
              >
                Open Page
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recommended Alternatives</CardTitle>
          <CardDescription>
            Check out these newer features with enhanced capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors">
            <div>
              <p className="font-medium">Focus Engine</p>
              <p className="text-sm text-muted-foreground">
                Enhanced Pomodoro + Havoc Mode with better tracking
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/niranx/focus-engine')}>
              Visit
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors">
            <div>
              <p className="font-medium">Advanced Dashboard</p>
              <p className="text-sm text-muted-foreground">
                Complete analytics with insights and visualizations
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/niranx/dashboard')}>
              Visit
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors">
            <div>
              <p className="font-medium">File Hub</p>
              <p className="text-sm text-muted-foreground">
                Modern file management with cloud storage
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/niranx/file-hub')}>
              Visit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
