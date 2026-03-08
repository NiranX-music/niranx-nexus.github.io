import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Global realtime sync component that sets up cross-device synchronization
 * for all major data tables. Include this once in the app root.
 */
export function GlobalRealtimeSync() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const channels: ReturnType<typeof supabase.channel>[] = [];

    // User profile sync
    const profileChannel = supabase
      .channel(`global-profile-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          window.dispatchEvent(new CustomEvent('profile-sync', { detail: payload.new }));
          queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['profile'] });
        }
      )
      .subscribe();
    channels.push(profileChannel);

    // Notifications sync
    const notificationsChannel = supabase
      .channel(`global-notifications-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          window.dispatchEvent(new CustomEvent('notification-sync', { detail: payload }));
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .subscribe();
    channels.push(notificationsChannel);

    // Tasks sync
    const tasksChannel = supabase
      .channel(`global-tasks-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          window.dispatchEvent(new CustomEvent('tasks-sync'));
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
      )
      .subscribe();
    channels.push(tasksChannel);

    // Notes sync
    const notesChannel = supabase
      .channel(`global-notes-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          window.dispatchEvent(new CustomEvent('notes-sync'));
          queryClient.invalidateQueries({ queryKey: ['notes'] });
        }
      )
      .subscribe();
    channels.push(notesChannel);

    // Messages sync
    const messagesChannel = supabase
      .channel(`global-messages-sync-${user.id}`)
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
            window.dispatchEvent(new CustomEvent('message-sync', { detail: msg }));
            queryClient.invalidateQueries({ queryKey: ['messages'] });
          }
        }
      )
      .subscribe();
    channels.push(messagesChannel);

    // Mail sync
    const mailChannel = supabase
      .channel(`global-mail-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'niranx_emails',
        },
        (payload) => {
          window.dispatchEvent(new CustomEvent('mail-sync', { detail: payload }));
          queryClient.invalidateQueries({ queryKey: ['emails'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'niranx_mailboxes',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
        }
      )
      .subscribe();
    channels.push(mailChannel);

    // Exams sync
    const examsChannel = supabase
      .channel(`global-exams-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exams',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          window.dispatchEvent(new CustomEvent('exams-sync'));
          queryClient.invalidateQueries({ queryKey: ['exams'] });
        }
      )
      .subscribe();
    channels.push(examsChannel);

    // Homework sync
    const homeworkChannel = supabase
      .channel(`global-homework-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'homework_items',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          window.dispatchEvent(new CustomEvent('homework-sync'));
          queryClient.invalidateQueries({ queryKey: ['homework'] });
        }
      )
      .subscribe();
    channels.push(homeworkChannel);

    // Scheduled classes sync
    const classesChannel = supabase
      .channel(`global-classes-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scheduled_classes',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          window.dispatchEvent(new CustomEvent('classes-sync'));
          queryClient.invalidateQueries({ queryKey: ['scheduled-classes'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_classes',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['live-classes'] });
        }
      )
      .subscribe();
    channels.push(classesChannel);

    // Study data sync
    const studyChannel = supabase
      .channel(`global-study-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_streaks',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          window.dispatchEvent(new CustomEvent('streak-sync'));
          queryClient.invalidateQueries({ queryKey: ['streaks'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_heatmap_data',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          window.dispatchEvent(new CustomEvent('heatmap-sync'));
          queryClient.invalidateQueries({ queryKey: ['heatmap'] });
        }
      )
      .subscribe();
    channels.push(studyChannel);

    // Debates sync
    const debatesChannel = supabase
      .channel(`global-debates-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'debate_topics',
        },
        () => {
          window.dispatchEvent(new CustomEvent('debates-sync'));
          queryClient.invalidateQueries({ queryKey: ['debates'] });
        }
      )
      .subscribe();
    channels.push(debatesChannel);

    // Guilds sync
    const guildsChannel = supabase
      .channel(`global-guilds-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guilds',
        },
        () => {
          window.dispatchEvent(new CustomEvent('guilds-sync'));
          queryClient.invalidateQueries({ queryKey: ['guilds'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guild_members',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['guild-members'] });
        }
      )
      .subscribe();
    channels.push(guildsChannel);

    // Cloud storage sync
    const storageChannel = supabase
      .channel(`global-storage-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_cloud_storage',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          window.dispatchEvent(new CustomEvent('storage-sync'));
          queryClient.invalidateQueries({ queryKey: ['cloud-storage'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_cloud_folders',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['cloud-folders'] });
        }
      )
      .subscribe();
    channels.push(storageChannel);

    // Playlists and music sync
    const musicChannel = supabase
      .channel(`global-music-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'playlists',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          window.dispatchEvent(new CustomEvent('playlists-sync'));
          queryClient.invalidateQueries({ queryKey: ['playlists'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'listed_songs',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['listed-songs'] });
        }
      )
      .subscribe();
    channels.push(musicChannel);

    // AI conversations sync
    const aiChannel = supabase
      .channel(`global-ai-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_conversations',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_generations',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['ai-generations'] });
        }
      )
      .subscribe();
    channels.push(aiChannel);

    // User sync data (cloud activity tracking)
    const syncDataChannel = supabase
      .channel(`global-sync-data-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_sync_data',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          window.dispatchEvent(new CustomEvent('sync-data-updated'));
          queryClient.invalidateQueries({ queryKey: ['user-sync-data'] });
        }
      )
      .subscribe();
    channels.push(syncDataChannel);

    // Cleanup on unmount
    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user, queryClient]);

  return null;
}
