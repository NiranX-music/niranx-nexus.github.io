import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface QueuedAction {
  id: string;
  action: () => Promise<void>;
  timestamp: number;
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back online",
        description: "Syncing queued actions...",
      });
      processQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're offline",
        description: "Actions will be saved and synced when you're back online",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const queueAction = useCallback((action: () => Promise<void>) => {
    const queuedAction: QueuedAction = {
      id: crypto.randomUUID(),
      action,
      timestamp: Date.now(),
    };

    setQueue(prev => [...prev, queuedAction]);

    if (!isOnline) {
      toast({
        title: "Action queued",
        description: "This action will be synced when you're back online",
      });
    }

    return queuedAction.id;
  }, [isOnline]);

  const processQueue = useCallback(async () => {
    if (queue.length === 0 || syncing) return;

    setSyncing(true);

    const successfulIds: string[] = [];

    for (const queuedAction of queue) {
      try {
        await queuedAction.action();
        successfulIds.push(queuedAction.id);
      } catch (error) {
        console.error('Failed to process queued action:', error);
        // Leave failed actions in queue to retry later
      }
    }

    // Remove successfully synced actions
    setQueue(prev => prev.filter(item => !successfulIds.includes(item.id)));

    if (successfulIds.length > 0) {
      toast({
        title: "Sync complete",
        description: `${successfulIds.length} action(s) synced successfully`,
      });
    }

    setSyncing(false);
  }, [queue, syncing]);

  // Auto-process queue when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0 && !syncing) {
      processQueue();
    }
  }, [isOnline, queue.length, syncing, processQueue]);

  return {
    isOnline,
    queue,
    syncing,
    queueAction,
    processQueue,
  };
}
