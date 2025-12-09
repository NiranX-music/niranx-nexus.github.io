// IndexedDB wrapper for offline notes storage

const DB_NAME = 'niranx-offline-db';
const DB_VERSION = 1;
const NOTES_STORE = 'offline-notes';

interface OfflineNote {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  syncStatus: 'pending' | 'synced' | 'conflict';
  userId: string;
}

class OfflineNotesDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(NOTES_STORE)) {
          const store = db.createObjectStore(NOTES_STORE, { keyPath: 'id' });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('syncStatus', 'syncStatus', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };
    });
  }

  async saveNote(note: OfflineNote): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([NOTES_STORE], 'readwrite');
      const store = transaction.objectStore(NOTES_STORE);
      const request = store.put(note);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getNote(id: string): Promise<OfflineNote | undefined> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([NOTES_STORE], 'readonly');
      const store = transaction.objectStore(NOTES_STORE);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAllNotes(userId: string): Promise<OfflineNote[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([NOTES_STORE], 'readonly');
      const store = transaction.objectStore(NOTES_STORE);
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getPendingNotes(): Promise<OfflineNote[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([NOTES_STORE], 'readonly');
      const store = transaction.objectStore(NOTES_STORE);
      const index = store.index('syncStatus');
      const request = index.getAll('pending');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteNote(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([NOTES_STORE], 'readwrite');
      const store = transaction.objectStore(NOTES_STORE);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async markAsSynced(id: string): Promise<void> {
    const note = await this.getNote(id);
    if (note) {
      note.syncStatus = 'synced';
      await this.saveNote(note);
    }
  }

  async clearSyncedNotes(): Promise<void> {
    const syncedNotes = await this.getSyncedNotes();
    for (const note of syncedNotes) {
      await this.deleteNote(note.id);
    }
  }

  private async getSyncedNotes(): Promise<OfflineNote[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([NOTES_STORE], 'readonly');
      const store = transaction.objectStore(NOTES_STORE);
      const index = store.index('syncStatus');
      const request = index.getAll('synced');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
}

export const offlineNotesDB = new OfflineNotesDB();

// Sync manager for background synchronization
export async function syncOfflineNotes(supabase: any, userId: string): Promise<void> {
  try {
    const pendingNotes = await offlineNotesDB.getPendingNotes();
    
    for (const note of pendingNotes) {
      if (note.userId !== userId) continue;

      // Check if note exists on server
      const { data: serverNote } = await supabase
        .from('notes')
        .select('updated_at')
        .eq('id', note.id)
        .single();

      if (serverNote) {
        const serverTime = new Date(serverNote.updated_at).getTime();
        
        if (note.updatedAt > serverTime) {
          // Local is newer, update server
          await supabase
            .from('notes')
            .update({
              title: note.title,
              content: note.content,
              updated_at: new Date(note.updatedAt).toISOString()
            })
            .eq('id', note.id);
        } else if (note.updatedAt < serverTime) {
          // Server is newer, mark as conflict
          note.syncStatus = 'conflict';
          await offlineNotesDB.saveNote(note);
          continue;
        }
      } else {
        // Note doesn't exist on server, create it
        await supabase.from('notes').insert({
          id: note.id,
          user_id: userId,
          title: note.title,
          content: note.content,
          created_at: new Date(note.updatedAt).toISOString(),
          updated_at: new Date(note.updatedAt).toISOString()
        });
      }

      await offlineNotesDB.markAsSynced(note.id);
    }
  } catch (error) {
    console.error('Error syncing offline notes:', error);
    throw error;
  }
}

// Check if we're online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Register online/offline event listeners
export function registerNetworkListeners(onOnline: () => void, onOffline: () => void): () => void {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}
