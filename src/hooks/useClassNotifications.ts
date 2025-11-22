import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { differenceInMinutes } from 'date-fns';

export const useClassNotifications = (userId: string | undefined) => {
  const { toast } = useToast();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission;
    }
    return Notification.permission;
  };

  const playAlarmSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi6Ax/DZkEIKE2S35OysWxMNSpvh8LhlHQQ9kt3z0n8rBSeGze3bm0sNFWy75OmiVBIJPpze8cFvIwUnhM3o15VBCRFqvef');
    audio.play().catch(console.error);
  };

  const showNotification = (title: string, body: string, classId: string) => {
    if (notificationPermission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: classId,
        requireInteraction: true
      });

      notification.onclick = () => {
        window.focus();
        window.location.href = '/niranx/class-scheduler';
        notification.close();
      };
    }

    toast({
      title,
      description: body,
      duration: 10000,
    });

    playAlarmSound();
  };

  useEffect(() => {
    if (!userId) return;

    const checkUpcomingClasses = async () => {
      const now = new Date();
      const { data: classes } = await supabase
        .from('live_classes')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', now.toISOString())
        .order('start_time', { ascending: true })
        .limit(10);

      if (!classes) return;

      classes.forEach((cls) => {
        const minutesUntil = differenceInMinutes(new Date(cls.start_time), now);
        
        // Notify 5 minutes before class
        if (minutesUntil === 5) {
          showNotification(
            '⏰ Class Starting Soon!',
            `${cls.title} starts in 5 minutes`,
            cls.id
          );
        }
        
        // Notify at class start time
        if (minutesUntil === 0) {
          showNotification(
            '🔔 Class Starting Now!',
            `${cls.title} is starting now!`,
            cls.id
          );
        }
      });
    };

    // Check every minute
    const interval = setInterval(checkUpcomingClasses, 60000);
    checkUpcomingClasses(); // Initial check

    return () => clearInterval(interval);
  }, [userId, notificationPermission, toast]);

  return { notificationPermission, requestNotificationPermission };
};
