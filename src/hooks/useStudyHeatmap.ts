import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useStudyHeatmap() {
  const { user } = useAuth();

  const logStudySession = useCallback(async (
    minutes: number,
    subjects?: string[]
  ) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    try {
      // First, try to get existing record for today
      const { data: existing } = await supabase
        .from('study_heatmap_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('study_date', today)
        .single();

      if (existing) {
        // Update existing record
        const updatedSubjects = Array.from(new Set([
          ...(existing.subjects_studied || []),
          ...(subjects || [])
        ]));

        await supabase
          .from('study_heatmap_data')
          .update({
            total_minutes: existing.total_minutes + minutes,
            sessions_count: existing.sessions_count + 1,
            subjects_studied: updatedSubjects,
            focus_score: Math.min(100, existing.focus_score + Math.floor(minutes / 10))
          })
          .eq('id', existing.id);
      } else {
        // Create new record
        await supabase
          .from('study_heatmap_data')
          .insert({
            user_id: user.id,
            study_date: today,
            total_minutes: minutes,
            sessions_count: 1,
            subjects_studied: subjects || [],
            focus_score: Math.min(100, Math.floor(minutes / 10))
          });
      }
    } catch (error) {
      console.error('Error logging study session:', error);
    }
  }, [user]);

  const getTodayStats = useCallback(async () => {
    if (!user) return null;

    const today = new Date().toISOString().split('T')[0];

    try {
      const { data } = await supabase
        .from('study_heatmap_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('study_date', today)
        .single();

      return data;
    } catch (error) {
      return null;
    }
  }, [user]);

  const getWeeklyStats = useCallback(async () => {
    if (!user) return [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    try {
      const { data } = await supabase
        .from('study_heatmap_data')
        .select('*')
        .eq('user_id', user.id)
        .gte('study_date', startDate.toISOString().split('T')[0])
        .order('study_date', { ascending: true });

      return data || [];
    } catch (error) {
      console.error('Error fetching weekly stats:', error);
      return [];
    }
  }, [user]);

  return {
    logStudySession,
    getTodayStats,
    getWeeklyStats
  };
}
