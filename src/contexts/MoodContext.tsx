import React, { createContext, useContext, useEffect, useState } from 'react';

export type MoodType = 'excited' | 'focused' | 'calm' | 'tired' | 'stressed';

interface MoodContextType {
  mood: MoodType;
  setMood: (mood: MoodType) => void;
  moodHistory: { mood: MoodType; timestamp: Date }[];
  getMoodTheme: () => { gradient: string; music: string };
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

const moodThemes = {
  excited: {
    gradient: 'from-pink-500 via-purple-500 to-violet-600',
    music: 'upbeat-energetic',
  },
  focused: {
    gradient: 'from-blue-600 via-indigo-600 to-purple-700',
    music: 'deep-focus',
  },
  calm: {
    gradient: 'from-teal-500 via-cyan-600 to-blue-700',
    music: 'ambient-calm',
  },
  tired: {
    gradient: 'from-slate-600 via-gray-700 to-slate-800',
    music: 'soft-chill',
  },
  stressed: {
    gradient: 'from-orange-500 via-red-500 to-pink-600',
    music: 'stress-relief',
  },
};

export function MoodProvider({ children }: { children: React.ReactNode }) {
  const [mood, setMood] = useState<MoodType>('focused');
  const [moodHistory, setMoodHistory] = useState<{ mood: MoodType; timestamp: Date }[]>([]);

  useEffect(() => {
    const savedMood = localStorage.getItem('current-mood');
    const savedHistory = localStorage.getItem('mood-history');
    
    if (savedMood) setMood(savedMood as MoodType);
    if (savedHistory) {
      try {
        setMoodHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse mood history');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('current-mood', mood);
    
    // Add to history
    const newEntry = { mood, timestamp: new Date() };
    const updatedHistory = [...moodHistory, newEntry].slice(-50); // Keep last 50
    setMoodHistory(updatedHistory);
    localStorage.setItem('mood-history', JSON.stringify(updatedHistory));
  }, [mood]);

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
