import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface StudyHabit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  frequency: string;
  target_per_day: number;
  color: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  notes: string | null;
}

export const useHabits = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<StudyHabit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('study_habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHabits(data || []);
    } catch (error) {
      console.error('Error fetching habits:', error);
    }
  };

  const fetchCompletions = async (startDate: Date, endDate: Date) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', startDate.toISOString())
        .lte('completed_at', endDate.toISOString());

      if (error) throw error;
      setCompletions(data || []);
    } catch (error) {
      console.error('Error fetching completions:', error);
    }
  };

  const createHabit = async (habit: Partial<StudyHabit>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('study_habits')
        .insert([{
          ...habit,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      setHabits([data, ...habits]);
      toast.success('Habit created!');
      return data;
    } catch (error) {
      console.error('Error creating habit:', error);
      toast.error('Failed to create habit');
    }
  };

  const updateHabit = async (id: string, updates: Partial<StudyHabit>) => {
    try {
      const { error } = await supabase
        .from('study_habits')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setHabits(habits.map(h => h.id === id ? { ...h, ...updates } : h));
      toast.success('Habit updated!');
    } catch (error) {
      console.error('Error updating habit:', error);
      toast.error('Failed to update habit');
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('study_habits')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setHabits(habits.filter(h => h.id !== id));
      toast.success('Habit deleted!');
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast.error('Failed to delete habit');
    }
  };

  const completeHabit = async (habitId: string, notes?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habit_completions')
        .insert({
          habit_id: habitId,
          user_id: user.id,
          notes,
        })
        .select()
        .single();

      if (error) throw error;
      setCompletions([...completions, data]);
      toast.success('Habit completed! 🎉');
      return data;
    } catch (error) {
      console.error('Error completing habit:', error);
      toast.error('Failed to complete habit');
    }
  };

  const getTodayCompletions = (habitId: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return completions.filter(c => 
      c.habit_id === habitId && 
      new Date(c.completed_at) >= today
    );
  };

  const getStreak = (habitId: string) => {
    const habitCompletions = completions
      .filter(c => c.habit_id === habitId)
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());

    if (habitCompletions.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const dayCompletions = habitCompletions.filter(c => {
        const completedDate = new Date(c.completed_at);
        completedDate.setHours(0, 0, 0, 0);
        return completedDate.getTime() === currentDate.getTime();
      });

      if (dayCompletions.length > 0) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (i === 0) {
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchHabits();
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      await fetchCompletions(startOfMonth, endOfMonth);
      setLoading(false);
    };

    loadData();
  }, [user]);

  return {
    habits,
    completions,
    loading,
    createHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
    getTodayCompletions,
    getStreak,
    refreshHabits: fetchHabits,
    refreshCompletions: fetchCompletions,
  };
};
