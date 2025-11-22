import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Smile, Meh, Frown, AlertCircle, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type MoodType = 'too_slow' | 'just_right' | 'too_fast' | 'confused' | 'lost';

interface MoodMeterProps {
  classId: string;
}

const moods: { type: MoodType; icon: typeof Smile; label: string; color: string }[] = [
  { type: 'too_slow', icon: Meh, label: 'Too Slow', color: 'blue' },
  { type: 'just_right', icon: Smile, label: 'Just Right', color: 'green' },
  { type: 'too_fast', icon: Frown, label: 'Too Fast', color: 'orange' },
  { type: 'confused', icon: HelpCircle, label: 'Confused', color: 'purple' },
  { type: 'lost', icon: AlertCircle, label: 'Lost', color: 'red' },
];

export function MoodMeter({ classId }: MoodMeterProps) {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [moodStats, setMoodStats] = useState<Record<MoodType, number>>({
    too_slow: 0,
    just_right: 0,
    too_fast: 0,
    confused: 0,
    lost: 0,
  });

  useEffect(() => {
    loadMoodStats();
    subscribeToMoodChanges();
  }, [classId]);

  const loadMoodStats = async () => {
    const { data, error } = await supabase
      .from('live_class_mood')
      .select('mood')
      .eq('class_id', classId);

    if (error) {
      console.error('Error loading mood stats:', error);
    } else if (data) {
      const stats: Record<MoodType, number> = {
        too_slow: 0,
        just_right: 0,
        too_fast: 0,
        confused: 0,
        lost: 0,
      };
      data.forEach((item) => {
        stats[item.mood as MoodType]++;
      });
      setMoodStats(stats);
    }
  };

  const subscribeToMoodChanges = () => {
    const channel = supabase
      .channel(`mood-${classId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_class_mood',
          filter: `class_id=eq.${classId}`,
        },
        () => {
          loadMoodStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSubmitMood = async (mood: MoodType) => {
    if (!user) return;

    const { error } = await supabase.from('live_class_mood').insert({
      class_id: classId,
      user_id: user.id,
      mood,
    });

    if (error) {
      console.error('Error submitting mood:', error);
      toast.error('Failed to submit feedback');
    } else {
      setSelectedMood(mood);
      toast.success('Feedback submitted!');
    }
  };

  const totalResponses = Object.values(moodStats).reduce((a, b) => a + b, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pace Feedback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center text-sm text-muted-foreground">
          How is the class pace?
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {moods.map(({ type, icon: Icon, label, color }) => (
            <Button
              key={type}
              variant={selectedMood === type ? 'default' : 'outline'}
              className="flex flex-col h-auto py-4"
              onClick={() => handleSubmitMood(type)}
            >
              <Icon className="w-6 h-6 mb-2" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>

        {totalResponses > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold">Class Feedback ({totalResponses} responses)</p>
            {moods.map(({ type, label, color }) => {
              const percentage = totalResponses > 0 ? (moodStats[type] / totalResponses) * 100 : 0;
              return (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{label}</span>
                    <span>{moodStats[type]} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
