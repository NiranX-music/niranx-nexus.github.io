import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Star, Trophy, Flame, BookOpen, Brain, Code, Target, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  reward_xp: number;
  unlocked: boolean;
}

const iconMap: Record<string, typeof Award> = {
  star: Star, trophy: Trophy, flame: Flame, book: BookOpen,
  brain: Brain, code: Code, target: Target, award: Award,
};

const rarityColors: Record<string, string> = {
  common: 'border-muted-foreground/30 bg-muted/10',
  uncommon: 'border-green-500/30 bg-green-500/10',
  rare: 'border-blue-500/30 bg-blue-500/10',
  epic: 'border-purple-500/30 bg-purple-500/10',
  legendary: 'border-yellow-500/30 bg-yellow-500/10',
};

const rarityBadge: Record<string, string> = {
  common: 'bg-muted-foreground/20 text-muted-foreground',
  uncommon: 'bg-green-500/20 text-green-500',
  rare: 'bg-blue-500/20 text-blue-500',
  epic: 'bg-purple-500/20 text-purple-500',
  legendary: 'bg-yellow-500/20 text-yellow-500',
};

export default function AchievementShowcase() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('achievements').select('*').order('rarity');
      if (data) {
        setAchievements(data.map(a => ({
          ...a,
          description: a.description || '',
          icon: a.icon || 'award',
          category: a.category || 'General',
          rarity: a.rarity || 'common',
          reward_xp: a.reward_xp || 0,
          unlocked: false, // Would check user_achievements table
        })));
      }
    };
    fetch();
  }, [user]);

  // Fallback demo achievements
  const demoAchievements: Achievement[] = achievements.length > 0 ? achievements : [
    { id: '1', name: 'First Steps', description: 'Complete your first study session', icon: 'star', category: 'Getting Started', rarity: 'common', reward_xp: 50, unlocked: true },
    { id: '2', name: 'Week Warrior', description: 'Study 7 days in a row', icon: 'flame', category: 'Streaks', rarity: 'uncommon', reward_xp: 100, unlocked: true },
    { id: '3', name: 'Quiz Champion', description: 'Score 100% on 10 quizzes', icon: 'trophy', category: 'Academic', rarity: 'rare', reward_xp: 200, unlocked: false },
    { id: '4', name: 'Knowledge Seeker', description: 'Complete 5 courses', icon: 'book', category: 'Academic', rarity: 'epic', reward_xp: 500, unlocked: false },
    { id: '5', name: 'Code Master', description: 'Complete 100 coding challenges', icon: 'code', category: 'Coding', rarity: 'legendary', reward_xp: 1000, unlocked: false },
    { id: '6', name: 'Mind Reader', description: 'Create 50 flashcard decks', icon: 'brain', category: 'Study', rarity: 'rare', reward_xp: 200, unlocked: true },
  ];

  const categories = ['All', ...Array.from(new Set(demoAchievements.map(a => a.category)))];
  const [activeTab, setActiveTab] = useState('All');

  const filtered = activeTab === 'All' ? demoAchievements : demoAchievements.filter(a => a.category === activeTab);
  const unlocked = demoAchievements.filter(a => a.unlocked).length;

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-5xl">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Award className="w-10 h-10 text-primary" />
          <h1 className="text-3xl font-bold font-[Orbitron]">Achievement Showcase</h1>
        </div>
        <p className="text-muted-foreground">{unlocked}/{demoAchievements.length} achievements unlocked</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto">
          {categories.map(c => <TabsTrigger key={c} value={c}>{c}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(a => {
          const Icon = iconMap[a.icon] || Award;
          return (
            <Card key={a.id} className={`border ${rarityColors[a.rarity]} ${!a.unlocked ? 'opacity-50' : ''} transition-all hover:scale-[1.02]`}>
              <CardContent className="p-5 text-center space-y-3">
                <div className="relative inline-block">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${a.unlocked ? 'bg-primary/20' : 'bg-muted/20'}`}>
                    {a.unlocked ? <Icon className="w-8 h-8 text-primary" /> : <Lock className="w-8 h-8 text-muted-foreground" />}
                  </div>
                </div>
                <h3 className="font-bold">{a.name}</h3>
                <p className="text-sm text-muted-foreground">{a.description}</p>
                <div className="flex justify-center gap-2">
                  <Badge className={rarityBadge[a.rarity]}>{a.rarity}</Badge>
                  <Badge variant="outline">+{a.reward_xp} XP</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
