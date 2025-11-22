import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LiveClass {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
}

export function useClassNotifications(classes: LiveClass[]) {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [activeClassIds, setActiveClassIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    }
    return false;
  };

  const playAlarmSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const showNotification = (classItem: LiveClass) => {
    if (notificationPermission === 'granted') {
      const notification = new Notification('Class Starting Now!', {
        body: `${classItem.title} is starting`,
        icon: '/pwa-192x192.png',
        tag: classItem.id,
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };

  useEffect(() => {
    const checkActiveClasses = () => {
      const now = new Date();
      const newActiveClasses = new Set<string>();

      classes.forEach((classItem) => {
        const startTime = new Date(classItem.start_time);
        const endTime = new Date(classItem.end_time);
        const isActive = now >= startTime && now <= endTime;

        if (isActive && !activeClassIds.has(classItem.id)) {
          newActiveClasses.add(classItem.id);
          playAlarmSound();
          showNotification(classItem);
        } else if (isActive) {
          newActiveClasses.add(classItem.id);
        }
      });

      setActiveClassIds(newActiveClasses);
    };

    checkActiveClasses();
    const interval = setInterval(checkActiveClasses, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [classes, activeClassIds, notificationPermission]);

  return {
    notificationPermission,
    requestPermission,
    activeClassIds,
  };
}
