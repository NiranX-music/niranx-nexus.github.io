import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  todayStudied: boolean;
  totalDays: number;
}

export const useStreakTracking = () => {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    todayStudied: false,
    totalDays: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStreakData = async () => {
    if (!user) return;

    try {
      // Get current streak
      const { data: currentStreakData, error: streakError } = await supabase
        .rpc('get_current_streak', { p_user_id: user.id });

      if (streakError) throw streakError;

      // Check if studied today
      const { data: todayData, error: todayError } = await supabase
        .from('study_streaks')
        .select('minutes_studied')
        .eq('user_id', user.id)
        .eq('study_date', new Date().toISOString().split('T')[0])
        .single();

      // Get total study days and longest streak
      const { data: allStreaks, error: allError } = await supabase
        .from('study_streaks')
        .select('study_date, minutes_studied')
        .eq('user_id', user.id)
        .gt('minutes_studied', 0)
        .order('study_date', { ascending: false });

      if (allError && allError.code !== 'PGRST116') throw allError;

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 0;
      let lastDate: Date | null = null;

      (allStreaks || []).forEach((streak) => {
        const currentDate = new Date(streak.study_date);
        
        if (!lastDate) {
          tempStreak = 1;
        } else {
          const dayDiff = Math.floor(
            (lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (dayDiff === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
        
        lastDate = currentDate;
      });
      
      longestStreak = Math.max(longestStreak, tempStreak);

      setStreakData({
        currentStreak: currentStreakData || 0,
        longestStreak,
        todayStudied: !!todayData && todayData.minutes_studied > 0,
        totalDays: allStreaks?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordActivity = async (minutes: number = 0, tasks: number = 0, xp: number = 0) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('record_study_activity', {
        p_user_id: user.id,
        p_minutes: minutes,
        p_tasks: tasks,
        p_xp: xp,
      });

      if (error) throw error;

      // Refresh streak data
      await fetchStreakData();

      // Show motivational message for first study of the day
      if (!streakData.todayStudied) {
        toast.success('Great job! Your streak continues! 🔥');
      }
    } catch (error) {
      console.error('Error recording activity:', error);
    }
  };

  useEffect(() => {
    fetchStreakData();

    // Subscribe to streak updates
    const channel = supabase
      .channel('streak-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_streaks',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchStreakData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    streakData,
    loading,
    recordActivity,
    refreshStreak: fetchStreakData,
  };
};
