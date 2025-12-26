// Custom Service Worker with Push Notifications, Periodic Sync, and Background Sync

const CACHE_NAME = 'niranx-v1';
const SYNC_TAG = 'niranx-background-sync';
const PERIODIC_SYNC_TAG = 'niranx-periodic-sync';

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  let data = {
    title: 'NiranX StudyVerse',
    body: 'You have a new notification',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: 'niranx-notification',
    data: {}
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/pwa-192x192.png',
    badge: data.badge || '/pwa-192x192.png',
    tag: data.tag || 'niranx-notification',
    data: data.data || {},
    vibrate: [100, 50, 100],
    actions: data.actions || [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    requireInteraction: data.requireInteraction || false
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  if (action === 'dismiss') {
    return;
  }

  // Default action - open the app
  const urlToOpen = data.url || '/niranx';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes('/niranx') && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Open a new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background Sync handler
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === SYNC_TAG || event.tag.startsWith('niranx-')) {
    event.waitUntil(doBackgroundSync(event.tag));
  }
});

async function doBackgroundSync(tag) {
  console.log('[SW] Performing background sync for:', tag);
  
  try {
    // Get pending sync data from IndexedDB
    const pendingData = await getPendingSyncData();
    
    for (const item of pendingData) {
      try {
        const response = await fetch(item.url, {
          method: item.method || 'POST',
          headers: item.headers || { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
        
        if (response.ok) {
          await removePendingSyncItem(item.id);
          console.log('[SW] Sync successful for item:', item.id);
        }
      } catch (error) {
        console.error('[SW] Sync failed for item:', item.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync error:', error);
  }
}

// Periodic Background Sync handler
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync triggered:', event.tag);

  if (event.tag === PERIODIC_SYNC_TAG || event.tag.startsWith('niranx-periodic-')) {
    event.waitUntil(doPeriodicSync(event.tag));
  }
});

async function doPeriodicSync(tag) {
  console.log('[SW] Performing periodic sync for:', tag);
  
  try {
    // Sync tasks with server
    if (tag.includes('tasks')) {
      await syncTasks();
    }
    
    // Sync notes with server
    if (tag.includes('notes')) {
      await syncNotes();
    }
    
    // Check for new notifications
    if (tag === PERIODIC_SYNC_TAG) {
      await checkForNewContent();
    }
    
    // Sync study progress
    if (tag.includes('progress')) {
      await syncStudyProgress();
    }
  } catch (error) {
    console.error('[SW] Periodic sync error:', error);
  }
}

async function syncTasks() {
  console.log('[SW] Syncing tasks...');
  // Implementation would sync tasks with the server
}

async function syncNotes() {
  console.log('[SW] Syncing notes...');
  // Implementation would sync notes with the server
}

async function syncStudyProgress() {
  console.log('[SW] Syncing study progress...');
  // Implementation would sync study progress
}

async function checkForNewContent() {
  console.log('[SW] Checking for new content...');
  
  try {
    // Check for upcoming classes, assignments, etc.
    const response = await fetch('/api/notifications/check');
    if (response.ok) {
      const data = await response.json();
      if (data.notifications && data.notifications.length > 0) {
        for (const notification of data.notifications) {
          await self.registration.showNotification(notification.title, {
            body: notification.body,
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            data: notification.data
          });
        }
      }
    }
  } catch (error) {
    console.log('[SW] Check for new content failed:', error);
  }
}

// IndexedDB helpers for pending sync data
const DB_NAME = 'niranx-sync-db';
const STORE_NAME = 'pending-sync';

function openSyncDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function getPendingSyncData() {
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
    console.error('[SW] Error getting pending sync data:', error);
    return [];
  }
}

async function removePendingSyncItem(id) {
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
    console.error('[SW] Error removing sync item:', error);
  }
}

// Handle messages from the main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_URLS':
      event.waitUntil(cacheUrls(payload.urls));
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(clearCache(payload?.cacheName));
      break;
      
    case 'SHOW_NOTIFICATION':
      event.waitUntil(
        self.registration.showNotification(payload.title, payload.options)
      );
      break;
  }
});

async function cacheUrls(urls) {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(urls);
}

async function clearCache(cacheName) {
  if (cacheName) {
    await caches.delete(cacheName);
  } else {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(name => caches.delete(name))
    );
  }
}

// Handle fetch events for offline support
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request);
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      })
  );
});

console.log('[SW] Custom service worker loaded');
