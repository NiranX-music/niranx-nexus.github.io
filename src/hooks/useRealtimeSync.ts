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

// Hook for syncing tasks across devices
export function useTasksSync(onUpdate?: () => void) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`tasks-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          onUpdate?.();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, onUpdate]);
}

// Hook for syncing notes across devices
export function useNotesSync(onUpdate?: () => void) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notes-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          onUpdate?.();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, onUpdate]);
}

// Hook for syncing notifications across devices
export function useNotificationsSync(onUpdate?: () => void) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          onUpdate?.();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, onUpdate]);
}

// Hook for syncing mail across devices
export function useMailSync(onUpdate?: () => void) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`mail-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'niranx_emails',
        },
        (payload) => {
          const email = payload.new as any;
          // Only trigger for user's emails
          if (email?.sender_id === user.id || email?.receiver_id === user.id) {
            onUpdate?.();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, onUpdate]);
}

// Hook for syncing study data across devices
export function useStudyDataSync(onUpdate?: () => void) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channels: RealtimeChannel[] = [];

    // Study streaks sync
    const streaksChannel = supabase
      .channel(`study-streaks-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_streaks',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          onUpdate?.();
        }
      )
      .subscribe();
    channels.push(streaksChannel);

    // Study heatmap sync
    const heatmapChannel = supabase
      .channel(`study-heatmap-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_heatmap_data',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          onUpdate?.();
        }
      )
      .subscribe();
    channels.push(heatmapChannel);

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user, onUpdate]);
}

// Hook for syncing guilds data across devices
export function useGuildsSync(guildId?: string, onUpdate?: () => void) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channels: RealtimeChannel[] = [];

    // Guild members sync
    if (guildId) {
      const membersChannel = supabase
        .channel(`guild-members-sync-${guildId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'guild_members',
            filter: `guild_id=eq.${guildId}`,
          },
          () => {
            onUpdate?.();
          }
        )
        .subscribe();
      channels.push(membersChannel);

      // Guild messages sync
      const messagesChannel = supabase
        .channel(`guild-messages-sync-${guildId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'guild_messages',
            filter: `guild_id=eq.${guildId}`,
          },
          () => {
            onUpdate?.();
          }
        )
        .subscribe();
      channels.push(messagesChannel);
    }

    // Guilds list sync
    const guildsChannel = supabase
      .channel(`guilds-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guilds',
        },
        () => {
          onUpdate?.();
        }
      )
      .subscribe();
    channels.push(guildsChannel);

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user, guildId, onUpdate]);
}

// Hook for syncing live classes across devices
export function useLiveClassSync(classId?: string, onUpdate?: () => void) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channels: RealtimeChannel[] = [];

    // Live classes sync
    const classesChannel = supabase
      .channel(`live-classes-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_classes',
        },
        () => {
          onUpdate?.();
        }
      )
      .subscribe();
    channels.push(classesChannel);

    if (classId) {
      // Class Q&A sync
      const qaChannel = supabase
        .channel(`class-qa-sync-${classId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'live_class_qa',
            filter: `class_id=eq.${classId}`,
          },
          () => {
            onUpdate?.();
          }
        )
        .subscribe();
      channels.push(qaChannel);

      // Class notes sync
      const notesChannel = supabase
        .channel(`class-notes-sync-${classId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'live_class_notes',
            filter: `class_id=eq.${classId}`,
          },
          () => {
            onUpdate?.();
          }
        )
        .subscribe();
      channels.push(notesChannel);

      // Class polls sync
      const pollsChannel = supabase
        .channel(`class-polls-sync-${classId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'live_class_polls',
            filter: `class_id=eq.${classId}`,
          },
          () => {
            onUpdate?.();
          }
        )
        .subscribe();
      channels.push(pollsChannel);
    }

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user, classId, onUpdate]);
}

// Hook for syncing debates across devices
export function useDebatesSync(debateId?: string, onUpdate?: () => void) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channels: RealtimeChannel[] = [];

    // Debates list sync
    const debatesChannel = supabase
      .channel(`debates-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'debate_topics',
        },
        () => {
          onUpdate?.();
        }
      )
      .subscribe();
    channels.push(debatesChannel);

    if (debateId) {
      // Debate comments sync
      const commentsChannel = supabase
        .channel(`debate-comments-sync-${debateId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'debate_comments',
            filter: `debate_id=eq.${debateId}`,
          },
          () => {
            onUpdate?.();
          }
        )
        .subscribe();
      channels.push(commentsChannel);
    }

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user, debateId, onUpdate]);
}

// Hook for syncing exams and homework across devices
export function useSchedulerSync(onUpdate?: () => void) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channels: RealtimeChannel[] = [];

    // Exams sync
    const examsChannel = supabase
      .channel(`exams-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exams',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          onUpdate?.();
        }
      )
      .subscribe();
    channels.push(examsChannel);

    // Homework sync
    const homeworkChannel = supabase
      .channel(`homework-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'homework_items',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          onUpdate?.();
        }
      )
      .subscribe();
    channels.push(homeworkChannel);

    // Scheduled classes sync
    const classesChannel = supabase
      .channel(`scheduled-classes-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scheduled_classes',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          onUpdate?.();
        }
      )
      .subscribe();
    channels.push(classesChannel);

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user, onUpdate]);
}

// Hook for syncing playlists and music preferences
export function useMusicSync(onUpdate?: () => void) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channels: RealtimeChannel[] = [];

    // Playlists sync
    const playlistsChannel = supabase
      .channel(`playlists-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'playlists',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          onUpdate?.();
        }
      )
      .subscribe();
    channels.push(playlistsChannel);

    // Listed songs sync
    const songsChannel = supabase
      .channel(`listed-songs-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'listed_songs',
        },
        () => {
          onUpdate?.();
        }
      )
      .subscribe();
    channels.push(songsChannel);

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user, onUpdate]);
}

// Hook for syncing cloud storage files
export function useCloudStorageSync(onUpdate?: () => void) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channels: RealtimeChannel[] = [];

    // Cloud folders sync
    const foldersChannel = supabase
      .channel(`cloud-folders-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_cloud_folders',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          onUpdate?.();
        }
      )
      .subscribe();
    channels.push(foldersChannel);

    // Cloud storage usage sync
    const storageChannel = supabase
      .channel(`cloud-storage-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_cloud_storage',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          onUpdate?.();
        }
      )
      .subscribe();
    channels.push(storageChannel);

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user, onUpdate]);
}

// Master hook for syncing all user data across devices
export function useGlobalRealtimeSync() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Dispatch custom events for different data updates
    const channel = supabase
      .channel(`global-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          window.dispatchEvent(new CustomEvent('profile-update', { detail: payload.new }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          window.dispatchEvent(new CustomEvent('notification-update', { detail: payload }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
}
