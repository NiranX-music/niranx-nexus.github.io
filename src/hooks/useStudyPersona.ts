import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type PersonaType = 'exam_prep' | 'daily_learner' | 'night_owl' | 'quick_sessions';

interface StudyPersona {
  id: string;
  user_id: string;
  persona_type: string;
  custom_preferences: Record<string, any>;
  widgets_config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface PersonaConfig {
  widgets: string[];
  theme: 'light' | 'dark' | 'system';
  focusMode: boolean;
  musicEnabled: boolean;
  gamificationLevel: 'minimal' | 'moderate' | 'full';
}

const personaConfigs: Record<PersonaType, PersonaConfig> = {
  exam_prep: {
    widgets: ['pomodoro', 'exams', 'ai-solver', 'tasks'],
    theme: 'light',
    focusMode: true,
    musicEnabled: false,
    gamificationLevel: 'moderate'
  },
  daily_learner: {
    widgets: ['notes', 'music', 'tasks', 'analytics'],
    theme: 'system',
    focusMode: false,
    musicEnabled: true,
    gamificationLevel: 'full'
  },
  night_owl: {
    widgets: ['music', 'chill-corner', 'notes', 'pomodoro'],
    theme: 'dark',
    focusMode: false,
    musicEnabled: true,
    gamificationLevel: 'moderate'
  },
  quick_sessions: {
    widgets: ['pomodoro', 'quick-notes', 'streaks', 'xp-display'],
    theme: 'system',
    focusMode: true,
    musicEnabled: false,
    gamificationLevel: 'full'
  }
};

export function useStudyPersona() {
  const [persona, setPersona] = useState<StudyPersona | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPersona = useCallback(async () => {
    if (!user) {
      setPersona(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('study_personas')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching persona:', error);
      }

      if (data) {
        setPersona({
          ...data,
          custom_preferences: (data.custom_preferences as Record<string, any>) || {},
          widgets_config: (data.widgets_config as Record<string, any>) || {}
        });
      } else {
        setPersona(null);
      }
    } catch (error) {
      console.error('Error fetching persona:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPersona();
  }, [fetchPersona]);

  const updatePersona = async (personaType: PersonaType, customPreferences?: Record<string, any>) => {
    if (!user) return;

    const config = personaConfigs[personaType];
    
    try {
      const { data, error } = await supabase
        .from('study_personas')
        .upsert({
          user_id: user.id,
          persona_type: personaType,
          widgets_config: { enabled: config.widgets },
          custom_preferences: {
            theme: config.theme,
            focusMode: config.focusMode,
            musicEnabled: config.musicEnabled,
            gamificationLevel: config.gamificationLevel,
            ...customPreferences
          }
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setPersona({
          ...data,
          custom_preferences: (data.custom_preferences as Record<string, any>) || {},
          widgets_config: (data.widgets_config as Record<string, any>) || {}
        });
      }

      // Apply widget settings
      localStorage.setItem('widgetSettings', JSON.stringify(
        config.widgets.reduce((acc, widget) => ({ ...acc, [widget]: true }), {})
      ));

      // Apply theme if specified
      if (config.theme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else if (config.theme === 'light') {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }

      return data;
    } catch (error) {
      console.error('Error updating persona:', error);
      throw error;
    }
  };

  const getPersonaConfig = (personaType: PersonaType): PersonaConfig => {
    return personaConfigs[personaType];
  };

  const hasCompletedSetup = !!persona;

  return {
    persona,
    loading,
    updatePersona,
    getPersonaConfig,
    hasCompletedSetup,
    refetch: fetchPersona
  };
}
