import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Generic hook to sync any data to a Supabase table instead of localStorage.
 * Falls back to localStorage for unauthenticated users.
 */
export function useCloudStorage<T>(
  table: string,
  defaultValue: T,
  options?: {
    /** Column to match user (default: 'user_id') */
    userColumn?: string;
    /** If true, store as single row with jsonb 'data' column */
    singleRow?: boolean;
    /** Unique constraint column for single-row mode */
    uniqueColumn?: string;
    /** localStorage fallback key */
    localKey?: string;
  }
) {
  const { user } = useAuth();
  const [data, setData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const userCol = options?.userColumn || 'user_id';
  const localKey = options?.localKey || `cloud-${table}`;

  // Load data
  useEffect(() => {
    if (user) {
      loadFromDB();
    } else {
      // Fallback to localStorage
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
      if (options?.singleRow) {
        const { data: row } = await supabase
          .from(table)
          .select('*')
          .eq(userCol, user.id)
          .maybeSingle();
        if (row) {
          // If it has a 'data' field, use that, otherwise use the whole row
          setData((row as any).data ?? (row as any));
        }
      } else {
        const { data: rows } = await supabase
          .from(table)
          .select('*')
          .eq(userCol, user.id)
          .order('created_at', { ascending: false });
        if (rows) setData(rows as any);
      }
    } catch (error) {
      console.error(`Error loading from ${table}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const save = useCallback(async (newData: T) => {
    setData(newData);
    if (user) {
      // DB save handled by caller (insert/update/upsert)
    } else {
      localStorage.setItem(localKey, JSON.stringify(newData));
    }
  }, [user, localKey]);

  const refresh = useCallback(() => {
    if (user) loadFromDB();
  }, [user]);

  return { data, setData: save, loading, refresh, isAuthenticated: !!user };
}
