import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBrowserNotifications } from '@/hooks/useBrowserNotifications';
import { toast } from 'sonner';

export const NotificationListener = () => {
  const { user } = useAuth();
  const { sendNotification, isGranted } = useBrowserNotifications();

  useEffect(() => {
    if (!user) return;

    // Subscribe to new notifications
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new as any;
          
          // Show toast notification
          toast.info(notification.title, {
            description: notification.message,
            duration: 5000,
          });

          // Show browser notification if enabled
          if (isGranted) {
            sendNotification(notification.title, {
              body: notification.message,
              tag: notification.id,
              requireInteraction: false,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isGranted, sendNotification]);

  return null;
};
