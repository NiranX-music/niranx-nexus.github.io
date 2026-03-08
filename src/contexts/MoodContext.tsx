import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export type MoodType = 'excited' | 'focused' | 'calm' | 'tired' | 'stressed';

interface MoodContextType {
  mood: MoodType;
  setMood: (mood: MoodType) => void;
  moodHistory: { mood: MoodType; timestamp: Date }[];
  getMoodTheme: () => { gradient: string; music: string };
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

const moodThemes = {
  excited: { gradient: 'from-pink-500 via-purple-500 to-violet-600', music: 'upbeat-energetic' },
  focused: { gradient: 'from-blue-600 via-indigo-600 to-purple-700', music: 'deep-focus' },
  calm: { gradient: 'from-teal-500 via-cyan-600 to-blue-700', music: 'ambient-calm' },
  tired: { gradient: 'from-slate-600 via-gray-700 to-slate-800', music: 'soft-chill' },
  stressed: { gradient: 'from-orange-500 via-red-500 to-pink-600', music: 'stress-relief' },
};

export function MoodProvider({ children }: { children: React.ReactNode }) {
  const [mood, setMoodState] = useState<MoodType>('focused');
  const [moodHistory, setMoodHistory] = useState<{ mood: MoodType; timestamp: Date }[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadMoodFromDB();
    }
  }, [user]);

  const loadMoodFromDB = async () => {
    if (!user) return;
    try {
      const { data } = await (supabase as any)
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (data && data.length > 0) {
        setMoodState(data[0].mood as MoodType);
        setMoodHistory(data.map((e: any) => ({ mood: e.mood as MoodType, timestamp: new Date(e.created_at) })));
      }
    } catch (error) {
      console.error('Error loading mood:', error);
    }
  };

  const setMood = useCallback(async (newMood: MoodType) => {
    setMoodState(newMood);
    const entry = { mood: newMood, timestamp: new Date() };
    setMoodHistory(prev => [entry, ...prev].slice(0, 50));

    if (user) {
      try {
        await (supabase as any).from('mood_entries').insert({
          user_id: user.id,
          mood: newMood,
        });
      } catch (error) {
        console.error('Error saving mood:', error);
      }
    }
  }, [user]);

  const getMoodTheme = () => moodThemes[mood];

  return (
    <MoodContext.Provider value={{ mood, setMood, moodHistory, getMoodTheme }}>
      {children}
    </MoodContext.Provider>
  );
}

export function useMood() {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
}
