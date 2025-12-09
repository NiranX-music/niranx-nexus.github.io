// Push Notification utilities

export interface PushSubscriptionData {
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  device_info: {
    userAgent: string;
    platform: string;
    language: string;
  };
}

// Check if push notifications are supported
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

// Get current permission status
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

// Subscribe to push notifications
export async function subscribeToPush(): Promise<PushSubscriptionData | null> {
  if (!isPushSupported()) {
    console.warn('Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check existing subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Create new subscription
      // Note: In production, you'd use your VAPID public key here
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true
      });
    }

    const subscriptionJson = subscription.toJSON();
    
    return {
      endpoint: subscription.endpoint,
      p256dh_key: subscriptionJson.keys?.p256dh || '',
      auth_key: subscriptionJson.keys?.auth || '',
      device_info: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      }
    };
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    return null;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to unsubscribe from push:', error);
    return false;
  }
}

// Show local notification
export function showLocalNotification(
  title: string,
  options?: NotificationOptions
): void {
  if (getNotificationPermission() !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  const defaultOptions: NotificationOptions = {
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: 'niranx-notification',
    ...options
  };

  new Notification(title, defaultOptions);
}

// Schedule a notification (using setTimeout as fallback)
export function scheduleNotification(
  title: string,
  options: NotificationOptions,
  delayMs: number
): number {
  return window.setTimeout(() => {
    showLocalNotification(title, options);
  }, delayMs);
}

// Cancel scheduled notification
export function cancelScheduledNotification(timeoutId: number): void {
  clearTimeout(timeoutId);
}

// Convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Notification types for the app
export type NotificationType = 
  | 'class_reminder'
  | 'assignment_due'
  | 'streak_warning'
  | 'achievement_unlocked'
  | 'xmail_received'
  | 'debate_reply'
  | 'study_break'
  | 'daily_challenge';

export interface AppNotification {
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, any>;
  scheduledFor?: Date;
}

// Create notification based on type
export function createAppNotification(notification: AppNotification): void {
  const icons: Record<NotificationType, string> = {
    class_reminder: '📚',
    assignment_due: '📝',
    streak_warning: '🔥',
    achievement_unlocked: '🏆',
    xmail_received: '📧',
    debate_reply: '💬',
    study_break: '☕',
    daily_challenge: '⚡'
  };

  const options: NotificationOptions = {
    body: notification.body,
    icon: notification.icon || '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: notification.type,
    data: notification.data
  };

  if (notification.scheduledFor) {
    const delay = notification.scheduledFor.getTime() - Date.now();
    if (delay > 0) {
      scheduleNotification(
        `${icons[notification.type]} ${notification.title}`,
        options,
        delay
      );
      return;
    }
  }

  showLocalNotification(`${icons[notification.type]} ${notification.title}`, options);
}
