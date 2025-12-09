import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Target, BookOpen, Moon, Zap, Check, 
  Clock, Music, Brain, Trophy, Coffee
} from 'lucide-react';

interface Persona {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  widgets: string[];
  theme: 'light' | 'dark' | 'system';
}

const personas: Persona[] = [
  {
    id: 'exam_prep',
    name: 'Exam Prep Mode',
    description: 'Intensive focus for competitive exams and finals',
    icon: <Target className="w-8 h-8" />,
    color: 'from-orange-500 to-red-500',
    features: ['Focus Timer prominent', 'Exam countdown', 'AI Solver quick access', 'Minimal distractions'],
    widgets: ['pomodoro', 'exams', 'ai-solver', 'tasks'],
    theme: 'light'
  },
  {
    id: 'daily_learner',
    name: 'Daily Learner',
    description: 'Balanced approach for consistent daily learning',
    icon: <BookOpen className="w-8 h-8" />,
    color: 'from-blue-500 to-cyan-500',
    features: ['Notes front & center', 'Music integration', 'Task management', 'Progress tracking'],
    widgets: ['notes', 'music', 'tasks', 'analytics'],
    theme: 'system'
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Optimized for late-night study sessions',
    icon: <Moon className="w-8 h-8" />,
    color: 'from-purple-500 to-indigo-500',
    features: ['Dark theme default', 'Chill Corner access', 'Lo-fi music', 'Eye-friendly colors'],
    widgets: ['music', 'chill-corner', 'notes', 'pomodoro'],
    theme: 'dark'
  },
  {
    id: 'quick_sessions',
    name: 'Quick Sessions',
    description: 'Short, intense bursts of productivity',
    icon: <Zap className="w-8 h-8" />,
    color: 'from-yellow-500 to-orange-500',
    features: ['Pomodoro focus', 'Quick notes', 'Streak tracking', 'Gamification heavy'],
    widgets: ['pomodoro', 'quick-notes', 'streaks', 'xp-display'],
    theme: 'system'
  }
];

export default function PersonaSetup() {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSelectPersona = async () => {
    if (!selectedPersona || !user) return;

    setIsLoading(true);
    try {
      const persona = personas.find(p => p.id === selectedPersona);
      if (!persona) return;

      const { error } = await supabase.from('study_personas').upsert({
        user_id: user.id,
        persona_type: selectedPersona,
        widgets_config: { enabled: persona.widgets },
        custom_preferences: { theme: persona.theme }
      }, { onConflict: 'user_id' });

      if (error) throw error;

      // Apply theme preference
      if (persona.theme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else if (persona.theme === 'light') {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }

      // Enable the widgets for this persona
      const widgetSettings = persona.widgets.reduce((acc, widget) => {
        acc[widget] = true;
        return acc;
      }, {} as Record<string, boolean>);
      localStorage.setItem('widgetSettings', JSON.stringify(widgetSettings));

      toast({
        title: 'Persona Applied! 🎉',
        description: `Your dashboard is now optimized for ${persona.name}`,
      });

      navigate('/');
    } catch (error) {
      console.error('Error saving persona:', error);
      toast({
        title: 'Error',
        description: 'Failed to save persona. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Choose Your Study Persona
          </h1>
          <p className="text-muted-foreground text-lg">
            We'll customize your dashboard based on how you prefer to study
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {personas.map((persona, index) => (
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`relative cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  selectedPersona === persona.id
                    ? 'ring-2 ring-primary shadow-lg shadow-primary/20'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedPersona(persona.id)}
              >
                {selectedPersona === persona.id && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </div>
                )}

                <CardHeader className="pb-2">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${persona.color} flex items-center justify-center text-white mb-3`}>
                    {persona.icon}
                  </div>
                  <CardTitle className="text-xl">{persona.name}</CardTitle>
                  <CardDescription>{persona.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {persona.features.map((feature, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="min-w-[150px]"
          >
            Skip for Now
          </Button>
          <Button
            onClick={handleSelectPersona}
            disabled={!selectedPersona || isLoading}
            className="min-w-[200px] bg-gradient-to-r from-primary to-primary/80"
          >
            {isLoading ? 'Applying...' : 'Apply Persona'}
          </Button>
        </motion.div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          You can change your persona anytime from Settings
        </p>
      </div>
    </div>
  );
}
