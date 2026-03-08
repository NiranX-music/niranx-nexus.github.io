import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Automatically syncs user page activity to NiranX Cloud on every navigation.
 * Tracks page visits, time spent, device info, and sync status.
 */
export function useCloudSync() {
  const { user } = useAuth();
  const location = useLocation();
  const pageEntryTime = useRef<number>(Date.now());
  const previousPage = useRef<string | null>(null);
  const sessionId = useRef<string>(crypto.randomUUID());

  const getDeviceInfo = useCallback(() => ({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }), []);

  const getPageTitle = useCallback((pathname: string) => {
    const segments = pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1];
    if (!last || last === 'dashboard') return 'Dashboard';
    return last.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }, []);

  // Save time spent on previous page before navigating away
  const savePreviousPageTime = useCallback(async () => {
    if (!user || !previousPage.current) return;

    const timeSpent = Math.floor((Date.now() - pageEntryTime.current) / 1000);
    if (timeSpent < 1) return;

    try {
      // Use upsert to add time to existing record
      const { data: existing } = await supabase
        .from('user_sync_data')
        .select('total_time_seconds, visit_count')
        .eq('user_id', user.id)
        .eq('page_url', previousPage.current)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('user_sync_data')
          .update({
            total_time_seconds: existing.total_time_seconds + timeSpent,
            last_synced_at: new Date().toISOString(),
            sync_status: 'synced',
          })
          .eq('user_id', user.id)
          .eq('page_url', previousPage.current);
      }
    } catch (err) {
      console.error('Cloud sync: failed to save page time', err);
    }
  }, [user]);

  // Sync current page visit to cloud
  const syncPageVisit = useCallback(async (pathname: string) => {
    if (!user) return;

    const pageTitle = getPageTitle(pathname);
    const deviceInfo = getDeviceInfo();

    try {
      const { data: existing } = await supabase
        .from('user_sync_data')
        .select('id, visit_count')
        .eq('user_id', user.id)
        .eq('page_url', pathname)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('user_sync_data')
          .update({
            visit_count: existing.visit_count + 1,
            last_synced_at: new Date().toISOString(),
            sync_status: 'synced',
            session_id: sessionId.current,
            device_info: deviceInfo,
            page_title: pageTitle,
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('user_sync_data')
          .insert({
            user_id: user.id,
            page_url: pathname,
            page_title: pageTitle,
            device_info: deviceInfo,
            session_id: sessionId.current,
            sync_status: 'synced',
            last_synced_at: new Date().toISOString(),
          });
      }

      // Also update recent_pages via RPC
      await supabase.rpc('update_recent_page', {
        p_user_id: user.id,
        p_page_url: pathname,
        p_page_title: pageTitle,
      });
    } catch (err) {
      console.error('Cloud sync: failed to sync page visit', err);
    }
  }, [user, getPageTitle, getDeviceInfo]);

  // On route change: save previous page time, then sync new page
  useEffect(() => {
    if (!user) return;

    const currentPath = location.pathname;

    // Save time on previous page
    savePreviousPageTime();

    // Reset timer for new page
    pageEntryTime.current = Date.now();
    previousPage.current = currentPath;

    // Sync new page visit
    syncPageVisit(currentPath);
  }, [location.pathname, user, savePreviousPageTime, syncPageVisit]);

  // Save time when user leaves/closes the tab
  useEffect(() => {
    if (!user) return;

    const handleBeforeUnload = () => {
      if (!previousPage.current) return;
      const timeSpent = Math.floor((Date.now() - pageEntryTime.current) / 1000);
      if (timeSpent < 1) return;

      // Use sendBeacon for reliable delivery on page close
      const payload = JSON.stringify({
        user_id: user.id,
        page_url: previousPage.current,
        time_spent: timeSpent,
      });

      navigator.sendBeacon?.(
        `https://tophenwypevlfbznlwil.supabase.co/rest/v1/rpc/update_recent_page`,
        payload
      );
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user]);
}
