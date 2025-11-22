import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface AccessibilityPreferences {
  high_contrast_mode: boolean;
  font_size_multiplier: number;
  reduce_motion: boolean;
  text_to_speech_enabled: boolean;
  tts_rate: number;
  tts_voice: string | null;
  keyboard_shortcuts_enhanced: boolean;
  focus_indicators_enhanced: boolean;
}

interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  updatePreferences: (prefs: Partial<AccessibilityPreferences>) => Promise<void>;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  loading: boolean;
}

const defaultPreferences: AccessibilityPreferences = {
  high_contrast_mode: false,
  font_size_multiplier: 1.0,
  reduce_motion: false,
  text_to_speech_enabled: false,
  tts_rate: 1.0,
  tts_voice: null,
  keyboard_shortcuts_enhanced: false,
  focus_indicators_enhanced: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadPreferences();
    } else {
      const saved = localStorage.getItem('accessibility_preferences');
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
      setLoading(false);
    }
  }, [user]);

  // Apply preferences to DOM
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast mode
    if (preferences.high_contrast_mode) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Font size
    root.style.fontSize = `${preferences.font_size_multiplier * 16}px`;

    // Reduce motion
    if (preferences.reduce_motion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Enhanced focus indicators
    if (preferences.focus_indicators_enhanced) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }
  }, [preferences]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('accessibility_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPreferences({
          high_contrast_mode: data.high_contrast_mode,
          font_size_multiplier: Number(data.font_size_multiplier),
          reduce_motion: data.reduce_motion,
          text_to_speech_enabled: data.text_to_speech_enabled,
          tts_rate: Number(data.tts_rate),
          tts_voice: data.tts_voice,
          keyboard_shortcuts_enhanced: data.keyboard_shortcuts_enhanced,
          focus_indicators_enhanced: data.focus_indicators_enhanced,
        });
      }
    } catch (error) {
      console.error('Error loading accessibility preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPrefs: Partial<AccessibilityPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);

    if (user) {
      try {
        const { error } = await supabase
          .from('accessibility_preferences')
          .upsert({
            user_id: user.id,
            ...updated,
          });

        if (error) throw error;
      } catch (error) {
        console.error('Error saving accessibility preferences:', error);
      }
    } else {
      localStorage.setItem('accessibility_preferences', JSON.stringify(updated));
    }
  };

  const speak = (text: string) => {
    if (!preferences.text_to_speech_enabled || !speechSynthesis) return;

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = preferences.tts_rate;
    
    if (preferences.tts_voice) {
      const voices = speechSynthesis.getVoices();
      const selectedVoice = voices.find(v => v.name === preferences.tts_voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
    }
  };

  return (
    <AccessibilityContext.Provider value={{ 
      preferences, 
      updatePreferences, 
      speak, 
      stopSpeaking, 
      loading 
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
