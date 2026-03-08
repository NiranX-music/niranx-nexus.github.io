import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Generic hook to sync data to Supabase via raw fetch instead of typed client.
 * Falls back to localStorage for unauthenticated users.
 */
export function useCloudStorage<T>(
  table: string,
  defaultValue: T,
  localKey: string
) {
  const { user } = useAuth();
  const [data, setData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFromDB();
    } else {
      try {
        const saved = localStorage.getItem(localKey);
        if (saved) setData(JSON.parse(saved));
      } catch {}
      setLoading(false);
    }
  }, [user]);

  const loadFromDB = async () => {
    if (!user) return;
    try {
      const { data: rows, error } = await (supabase as any)
        .from(table)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && rows) setData(rows as T);
    } catch (error) {
      console.error(`Error loading from ${table}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const save = useCallback(async (newData: T) => {
    setData(newData);
    if (!user) {
      localStorage.setItem(localKey, JSON.stringify(newData));
    }
  }, [user, localKey]);

  const refresh = useCallback(() => {
    if (user) loadFromDB();
  }, [user]);

  return { data, setData: save, loading, refresh, isAuthenticated: !!user };
}
