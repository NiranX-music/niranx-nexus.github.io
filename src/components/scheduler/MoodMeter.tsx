import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smile, Frown, Meh, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MoodMeterProps {
  classId: string;
}

type MoodType = 'too_fast' | 'perfect' | 'too_slow' | 'confused';

export const MoodMeter = ({ classId }: MoodMeterProps) => {
  const [moodCounts, setMoodCounts] = useState({
    too_fast: 0,
    perfect: 0,
    too_slow: 0,
    confused: 0
  });
  const [userMood, setUserMood] = useState<MoodType | null>(null);
  const [currentUserId, setCurrentUserId] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchMoods = async () => {
      const { data } = await supabase
        .from('live_class_mood')
        .select('mood')
        .eq('class_id', classId);

      if (data) {
        const counts = {
          too_fast: 0,
          perfect: 0,
          too_slow: 0,
          confused: 0
        };

        data.forEach((item) => {
          counts[item.mood as MoodType]++;
        });

        setMoodCounts(counts);
      }

      // Check user's current mood
      const { data: userMoodData } = await supabase
        .from('live_class_mood')
        .select('mood')
        .eq('class_id', classId)
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (userMoodData) {
        setUserMood(userMoodData.mood as MoodType);
      }
    };

    if (currentUserId) {
      fetchMoods();

      // Subscribe to real-time updates
      const channel = supabase
        .channel(`mood-${classId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'live_class_mood',
            filter: `class_id=eq.${classId}`
          },
          () => fetchMoods()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [classId, currentUserId]);

  const submitMood = async (mood: MoodType) => {
    const { error } = await supabase.from('live_class_mood').insert({
      class_id: classId,
      user_id: currentUserId,
      mood
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        variant: 'destructive'
      });
    } else {
      setUserMood(mood);
      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for your feedback!'
      });
    }
  };

  const totalVotes = Object.values(moodCounts).reduce((a, b) => a + b, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Class Pace Feedback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={userMood === 'too_fast' ? 'default' : 'outline'}
            onClick={() => submitMood('too_fast')}
            className="flex flex-col items-center gap-2 h-auto py-3"
          >
            <Frown className="w-6 h-6" />
            <div className="text-xs">Too Fast</div>
            <div className="text-xs text-muted-foreground">
              {totalVotes > 0 ? `${Math.round((moodCounts.too_fast / totalVotes) * 100)}%` : '0%'}
            </div>
          </Button>

          <Button
            variant={userMood === 'perfect' ? 'default' : 'outline'}
            onClick={() => submitMood('perfect')}
            className="flex flex-col items-center gap-2 h-auto py-3"
          >
            <Smile className="w-6 h-6" />
            <div className="text-xs">Perfect</div>
            <div className="text-xs text-muted-foreground">
              {totalVotes > 0 ? `${Math.round((moodCounts.perfect / totalVotes) * 100)}%` : '0%'}
            </div>
          </Button>

          <Button
            variant={userMood === 'too_slow' ? 'default' : 'outline'}
            onClick={() => submitMood('too_slow')}
            className="flex flex-col items-center gap-2 h-auto py-3"
          >
            <Meh className="w-6 h-6" />
            <div className="text-xs">Too Slow</div>
            <div className="text-xs text-muted-foreground">
              {totalVotes > 0 ? `${Math.round((moodCounts.too_slow / totalVotes) * 100)}%` : '0%'}
            </div>
          </Button>

          <Button
            variant={userMood === 'confused' ? 'default' : 'outline'}
            onClick={() => submitMood('confused')}
            className="flex flex-col items-center gap-2 h-auto py-3"
          >
            <HelpCircle className="w-6 h-6" />
            <div className="text-xs">Confused</div>
            <div className="text-xs text-muted-foreground">
              {totalVotes > 0 ? `${Math.round((moodCounts.confused / totalVotes) * 100)}%` : '0%'}
            </div>
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          {totalVotes} {totalVotes === 1 ? 'response' : 'responses'} collected
        </p>
      </CardContent>
    </Card>
  );
};
