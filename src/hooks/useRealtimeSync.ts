import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

interface SyncConfig {
  table: string;
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

export function useRealtimeSync(configs: SyncConfig[]) {
  const { user } = useAuth();
  const channelsRef = useRef<RealtimeChannel[]>([]);

  const setupSubscriptions = useCallback(() => {
    if (!user) return;

    // Clean up existing channels
    channelsRef.current.forEach(channel => {
      supabase.removeChannel(channel);
    });
    channelsRef.current = [];

    configs.forEach((config, index) => {
      const channelName = `realtime-sync-${config.table}-${index}-${user.id}`;
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: config.table,
            filter: config.filter,
          },
          (payload) => {
            switch (payload.eventType) {
              case 'INSERT':
                config.onInsert?.(payload.new);
                break;
              case 'UPDATE':
                config.onUpdate?.(payload.new);
                break;
              case 'DELETE':
                config.onDelete?.(payload.old);
                break;
            }
          }
        )
        .subscribe();

      channelsRef.current.push(channel);
    });
  }, [user, configs]);

  useEffect(() => {
    setupSubscriptions();

    return () => {
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [setupSubscriptions]);

  return { refresh: setupSubscriptions };
}

// Hook for syncing user profile data across devices
export function useUserDataSync(onProfileUpdate?: (data: any) => void) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user-data-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          onProfileUpdate?.(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          // XP and level updates
          if (payload.eventType === 'UPDATE') {
            window.dispatchEvent(new CustomEvent('xp-update', { detail: payload.new }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, onProfileUpdate]);
}

// Hook for cross-device message sync
export function useMessageSync(partnerId?: string, onNewMessage?: (msg: any) => void) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const filter = partnerId 
      ? `or(and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id}))`
      : `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`;

    const channel = supabase
      .channel(`messages-sync-${user.id}-${partnerId || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const msg = payload.new as any;
          if (msg.sender_id === user.id || msg.receiver_id === user.id) {
            if (!partnerId || msg.sender_id === partnerId || msg.receiver_id === partnerId) {
              onNewMessage?.(msg);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, partnerId, onNewMessage]);
}
