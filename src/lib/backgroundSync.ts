// Background Sync and Periodic Sync utilities

const SYNC_TAG = 'niranx-background-sync';
const PERIODIC_SYNC_TAGS = {
  tasks: 'niranx-periodic-tasks',
  notes: 'niranx-periodic-notes',
  progress: 'niranx-periodic-progress',
  main: 'niranx-periodic-sync'
};

// Check if Background Sync is supported
export function isBackgroundSyncSupported(): boolean {
  return 'serviceWorker' in navigator && 'SyncManager' in window;
}

// Check if Periodic Background Sync is supported
export function isPeriodicSyncSupported(): boolean {
  return 'serviceWorker' in navigator && 'PeriodicSyncManager' in (navigator as any);
}

// Register a one-time background sync
export async function registerBackgroundSync(tag: string = SYNC_TAG): Promise<boolean> {
  if (!isBackgroundSyncSupported()) {
    console.warn('Background Sync not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await (registration as any).sync.register(tag);
    console.log('Background sync registered:', tag);
    return true;
  } catch (error) {
    console.error('Failed to register background sync:', error);
    return false;
  }
}

// Register periodic background sync
export async function registerPeriodicSync(
  tag: string = PERIODIC_SYNC_TAGS.main,
  minIntervalMs: number = 12 * 60 * 60 * 1000 // 12 hours minimum
): Promise<boolean> {
  if (!isPeriodicSyncSupported()) {
    console.warn('Periodic Background Sync not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const periodicSync = (registration as any).periodicSync;
    
    // Check permission status
    const status = await navigator.permissions.query({
      name: 'periodic-background-sync' as PermissionName
    });
    
    if (status.state === 'denied') {
      console.warn('Periodic sync permission denied');
      return false;
    }

    await periodicSync.register(tag, {
      minInterval: minIntervalMs
    });
    
    console.log('Periodic sync registered:', tag, 'interval:', minIntervalMs);
    return true;
  } catch (error) {
    console.error('Failed to register periodic sync:', error);
    return false;
  }
}

// Unregister periodic sync
export async function unregisterPeriodicSync(tag: string): Promise<boolean> {
  if (!isPeriodicSyncSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const periodicSync = (registration as any).periodicSync;
    await periodicSync.unregister(tag);
    console.log('Periodic sync unregistered:', tag);
    return true;
  } catch (error) {
    console.error('Failed to unregister periodic sync:', error);
    return false;
  }
}

// Get all registered periodic syncs
export async function getRegisteredPeriodicSyncs(): Promise<string[]> {
  if (!isPeriodicSyncSupported()) {
    return [];
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const periodicSync = (registration as any).periodicSync;
    const tags = await periodicSync.getTags();
    return tags;
  } catch (error) {
    console.error('Failed to get periodic sync tags:', error);
    return [];
  }
}

// Add data to sync queue (stored in IndexedDB)
const DB_NAME = 'niranx-sync-db';
const STORE_NAME = 'pending-sync';

function openSyncDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

export interface SyncItem {
  id?: number;
  url: string;
  method: string;
  headers?: Record<string, string>;
  data: any;
  createdAt: number;
}

// Add item to sync queue
export async function addToSyncQueue(item: Omit<SyncItem, 'id' | 'createdAt'>): Promise<number> {
  try {
    const db = await openSyncDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add({
        ...item,
        createdAt: Date.now()
      });
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        // Trigger background sync after adding
        registerBackgroundSync();
        resolve(request.result as number);
      };
    });
  } catch (error) {
    console.error('Failed to add to sync queue:', error);
    throw error;
  }
}

// Get all pending sync items
export async function getPendingSyncItems(): Promise<SyncItem[]> {
  try {
    const db = await openSyncDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  } catch (error) {
    console.error('Failed to get pending sync items:', error);
    return [];
  }
}

// Remove item from sync queue
export async function removeSyncItem(id: number): Promise<void> {
  try {
    const db = await openSyncDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('Failed to remove sync item:', error);
    throw error;
  }
}

// Clear all pending sync items
export async function clearSyncQueue(): Promise<void> {
  try {
    const db = await openSyncDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('Failed to clear sync queue:', error);
    throw error;
  }
}

// Initialize all periodic syncs for the app
export async function initializePeriodicSyncs(): Promise<void> {
  if (!isPeriodicSyncSupported()) {
    console.log('Periodic sync not supported, skipping initialization');
    return;
  }

  // Register different periodic syncs with different intervals
  await registerPeriodicSync(PERIODIC_SYNC_TAGS.main, 12 * 60 * 60 * 1000); // 12 hours
  await registerPeriodicSync(PERIODIC_SYNC_TAGS.tasks, 60 * 60 * 1000); // 1 hour  
  await registerPeriodicSync(PERIODIC_SYNC_TAGS.notes, 30 * 60 * 1000); // 30 minutes
  await registerPeriodicSync(PERIODIC_SYNC_TAGS.progress, 24 * 60 * 60 * 1000); // 24 hours
}

// Export sync tags for use elsewhere
export { SYNC_TAG, PERIODIC_SYNC_TAGS };
