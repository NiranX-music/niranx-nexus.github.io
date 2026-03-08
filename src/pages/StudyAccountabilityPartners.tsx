import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Handshake, Trophy, Target, Clock, TrendingUp, Plus, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface Partner {
  id: string;
  name: string;
  avatar: string;
  sharedGoals: number;
  completedGoals: number;
  streak: number;
  lastActive: string;
}

const MOCK_PARTNERS: Partner[] = [
  { id: '1', name: 'Alex Chen', avatar: '🧑‍💻', sharedGoals: 5, completedGoals: 3, streak: 12, lastActive: '2 min ago' },
  { id: '2', name: 'Priya Sharma', avatar: '👩‍🔬', sharedGoals: 3, completedGoals: 2, streak: 7, lastActive: '1 hour ago' },
];

const MOCK_GOALS = [
  { id: '1', title: 'Complete 3 Pomodoro sessions daily', progress: 67, partner: 'Alex Chen', dueDate: 'Mar 15', status: 'active' as const },
  { id: '2', title: 'Read 2 chapters of Physics', progress: 100, partner: 'Alex Chen', dueDate: 'Mar 10', status: 'completed' as const },
  { id: '3', title: 'Score 80%+ on Chemistry quiz', progress: 45, partner: 'Priya Sharma', dueDate: 'Mar 20', status: 'active' as const },
  { id: '4', title: 'Study 20 hours this week', progress: 30, partner: 'Priya Sharma', dueDate: 'Mar 14', status: 'active' as const },
];

export default function StudyAccountabilityPartners() {
  const [activeTab, setActiveTab] = useState<'partners' | 'goals'>('partners');

  return (
    <div className="min-h-screen p-6 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <Handshake className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Accountability Partners</h1>
          <p className="text-muted-foreground">Stay accountable with study partners and shared goals</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button variant={activeTab === 'partners' ? 'default' : 'outline'} onClick={() => setActiveTab('partners')}>
          Partners
        </Button>
        <Button variant={activeTab === 'goals' ? 'default' : 'outline'} onClick={() => setActiveTab('goals')}>
          Shared Goals
        </Button>
        <Button variant="outline" className="ml-auto" onClick={() => toast.info('Coming soon')}>
          <Plus className="w-4 h-4 mr-1" /> Add Partner
        </Button>
      </div>

      {activeTab === 'partners' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_PARTNERS.map(partner => (
            <div key={partner.id} className="holo-card p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{partner.avatar}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{partner.name}</h3>
                  <p className="text-sm text-muted-foreground">Active {partner.lastActive}</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{partner.streak}</div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-muted/50">
                  <Target className="w-4 h-4 mx-auto mb-1 text-primary" />
                  <div className="text-lg font-bold text-foreground">{partner.sharedGoals}</div>
                  <div className="text-xs text-muted-foreground">Goals</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-green-500" />
                  <div className="text-lg font-bold text-foreground">{partner.completedGoals}</div>
                  <div className="text-xs text-muted-foreground">Done</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <Trophy className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                  <div className="text-lg font-bold text-foreground">{Math.round((partner.completedGoals / partner.sharedGoals) * 100)}%</div>
                  <div className="text-xs text-muted-foreground">Rate</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="space-y-4">
          {MOCK_GOALS.map(goal => (
            <div key={goal.id} className="holo-card p-5 flex items-center gap-4">
              {goal.status === 'completed' ? (
                <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
              ) : (
                <Target className="w-6 h-6 text-primary shrink-0" />
              )}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className={`font-medium ${goal.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {goal.title}
                  </h3>
                  <Badge variant="secondary" className="text-xs">{goal.partner}</Badge>
                </div>
                <Progress value={goal.progress} className="h-2" />
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{goal.progress}% complete</span>
                  <span>Due: {goal.dueDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
