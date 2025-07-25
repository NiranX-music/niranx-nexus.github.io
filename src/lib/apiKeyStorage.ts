// Secure API key storage utilities
import { generateSecureToken } from './security';

interface SecureStorage {
  setKey(service: string, key: string): Promise<void>;
  getKey(service: string): Promise<string | null>;
  removeKey(service: string): void;
  hasKey(service: string): Promise<boolean>;
}

class EncryptedStorage implements SecureStorage {
  private getStorageKey(service: string): string {
    return `secure_${service}_key`;
  }

  private async encrypt(data: string): Promise<string> {
    try {
      // Generate a random key for encryption
      const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      
      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt the data
      const encoded = new TextEncoder().encode(data);
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoded
      );
      
      // Export the key
      const exportedKey = await crypto.subtle.exportKey('raw', key);
      
      // Combine key, IV, and encrypted data
      const combined = new Uint8Array(exportedKey.byteLength + iv.length + encrypted.byteLength);
      combined.set(new Uint8Array(exportedKey), 0);
      combined.set(iv, exportedKey.byteLength);
      combined.set(new Uint8Array(encrypted), exportedKey.byteLength + iv.length);
      
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.warn('Encryption failed, falling back to base64:', error);
      return btoa(data);
    }
  }

  private async decrypt(data: string): Promise<string> {
    try {
      const combined = new Uint8Array(
        atob(data).split('').map(char => char.charCodeAt(0))
      );
      
      // Extract components
      const keyData = combined.slice(0, 32);
      const iv = combined.slice(32, 44);
      const encrypted = combined.slice(44);
      
      // Import the key
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );
      
      // Decrypt the data
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );
      
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      // Fallback to base64 decoding for legacy data
      try {
        return atob(data);
      } catch {
        console.error('Decryption failed:', error);
        return '';
      }
    }
  }

  async setKey(service: string, key: string): Promise<void> {
    if (!key) {
      this.removeKey(service);
      return;
    }
    
    const encrypted = await this.encrypt(key);
    sessionStorage.setItem(this.getStorageKey(service), encrypted);
    
    // Clear from localStorage if it exists there (migration)
    localStorage.removeItem(`${service}_api_key`);
    localStorage.removeItem(this.getStorageKey(service));
  }

  async getKey(service: string): Promise<string | null> {
    // Try sessionStorage first (secure)
    const sessionKey = sessionStorage.getItem(this.getStorageKey(service));
    if (sessionKey) {
      return await this.decrypt(sessionKey);
    }

    // Fallback to localStorage (for migration) and move to sessionStorage
    const legacyKey = localStorage.getItem(`${service}_api_key`);
    if (legacyKey) {
      await this.setKey(service, legacyKey);
      localStorage.removeItem(`${service}_api_key`);
      return legacyKey;
    }

    return null;
  }

  removeKey(service: string): void {
    sessionStorage.removeItem(this.getStorageKey(service));
    localStorage.removeItem(`${service}_api_key`); // Clean up legacy
    localStorage.removeItem(this.getStorageKey(service));
  }

  async hasKey(service: string): Promise<boolean> {
    const key = await this.getKey(service);
    return key !== null;
  }
}

// Singleton instance
export const secureStorage = new EncryptedStorage();

// Service-specific helpers
export const openAIStorage = {
  setKey: async (key: string) => await secureStorage.setKey('openai', key),
  getKey: async () => await secureStorage.getKey('openai'),
  removeKey: () => secureStorage.removeKey('openai'),
  hasKey: async () => await secureStorage.hasKey('openai'),
};

// Warning utility for insecure storage detection
export const warnAboutInsecureStorage = (service: string): void => {
  const legacyKey = localStorage.getItem(`${service}_api_key`);
  if (legacyKey) {
    console.warn(`⚠️ ${service} API key found in localStorage. Moving to secure storage...`);
  }
};

// Enhanced session validation with security manager
import { sessionManager } from './sessionSecurity';

export const validateSession = (): boolean => {
  return sessionManager.validateSession();
};