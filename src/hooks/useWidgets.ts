import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface WidgetPreference {
  widget_name: string;
  is_enabled: boolean;
  position?: number;
}

export const AVAILABLE_WIDGETS = [
  { name: 'music_player', label: 'Music Player', icon: '🎵' },
  { name: 'file_explorer', label: 'File Explorer', icon: '📁' },
  { name: 'class_schedule', label: 'Class Schedule', icon: '📅' },
  { name: 'task_manager', label: 'Task Manager', icon: '✓' },
  { name: 'pomodoro_timer', label: 'Pomodoro Timer', icon: '⏲️' },
  { name: 'notes', label: 'Quick Notes', icon: '📝' },
  { name: 'analytics', label: 'Analytics', icon: '📊' },
  { name: 'ai_buddy', label: 'AI Study Buddy', icon: '🤖' },
  { name: 'study_materials', label: 'Study Materials', icon: '📚' },
  { name: 'chill_corner', label: 'Chill Corner', icon: '🎮' },
] as const;

export function useWidgets() {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<WidgetPreference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWidgetPreferences();
    } else {
      // Load from localStorage for guests
      const saved = localStorage.getItem('widgetPreferences');
      if (saved) {
        setWidgets(JSON.parse(saved));
      }
      setLoading(false);
    }
  }, [user]);

  // Real-time subscription for cross-device sync
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`widgets-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'widget_preferences',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadWidgetPreferences();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadWidgetPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('widget_preferences')
        .select('widget_name, is_enabled, position')
        .eq('user_id', user.id);

      if (error) throw error;

      setWidgets(data || []);
    } catch (error) {
      console.error('Error loading widget preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWidget = async (widgetName: string, enabled: boolean) => {
    if (user) {
      try {
        const { error } = await supabase
          .from('widget_preferences')
          .upsert({
            user_id: user.id,
            widget_name: widgetName,
            is_enabled: enabled,
          }, {
            onConflict: 'user_id,widget_name'
          });

        if (error) throw error;
        await loadWidgetPreferences();
      } catch (error) {
        console.error('Error updating widget preference:', error);
      }
    } else {
      // Update localStorage for guests
      const updated = [...widgets];
      const index = updated.findIndex(w => w.widget_name === widgetName);
      if (index >= 0) {
        updated[index].is_enabled = enabled;
      } else {
        updated.push({ widget_name: widgetName, is_enabled: enabled });
      }
      setWidgets(updated);
      localStorage.setItem('widgetPreferences', JSON.stringify(updated));
    }
  };

  const isWidgetEnabled = (widgetName: string) => {
    const widget = widgets.find(w => w.widget_name === widgetName);
    // Return false by default - widgets must be explicitly enabled
    return widget?.is_enabled ?? false;
  };

  return {
    widgets,
    loading,
    toggleWidget,
    isWidgetEnabled,
  };
}
