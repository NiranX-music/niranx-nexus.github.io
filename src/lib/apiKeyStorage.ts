// Secure API key storage utilities
import { generateSecureToken } from './security';

interface SecureStorage {
  setKey(service: string, key: string): void;
  getKey(service: string): string | null;
  removeKey(service: string): void;
  hasKey(service: string): boolean;
}

class EncryptedStorage implements SecureStorage {
  private getStorageKey(service: string): string {
    return `secure_${service}_key`;
  }

  private encrypt(data: string): string {
    // Simple encryption for demo - in production, use proper encryption
    const encoded = btoa(data);
    return encoded;
  }

  private decrypt(data: string): string {
    try {
      return atob(data);
    } catch {
      return '';
    }
  }

  setKey(service: string, key: string): void {
    if (!key) {
      this.removeKey(service);
      return;
    }
    
    const encrypted = this.encrypt(key);
    sessionStorage.setItem(this.getStorageKey(service), encrypted);
    
    // Clear from localStorage if it exists there (migration)
    localStorage.removeItem(`${service}_api_key`);
    localStorage.removeItem(this.getStorageKey(service));
  }

  getKey(service: string): string | null {
    // Try sessionStorage first (secure)
    const sessionKey = sessionStorage.getItem(this.getStorageKey(service));
    if (sessionKey) {
      return this.decrypt(sessionKey);
    }

    // Fallback to localStorage (for migration) and move to sessionStorage
    const legacyKey = localStorage.getItem(`${service}_api_key`);
    if (legacyKey) {
      this.setKey(service, legacyKey);
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

  hasKey(service: string): boolean {
    return this.getKey(service) !== null;
  }
}

// Singleton instance
export const secureStorage = new EncryptedStorage();

// Service-specific helpers
export const openAIStorage = {
  setKey: (key: string) => secureStorage.setKey('openai', key),
  getKey: () => secureStorage.getKey('openai'),
  removeKey: () => secureStorage.removeKey('openai'),
  hasKey: () => secureStorage.hasKey('openai'),
};

// Warning utility for insecure storage detection
export const warnAboutInsecureStorage = (service: string): void => {
  const legacyKey = localStorage.getItem(`${service}_api_key`);
  if (legacyKey) {
    console.warn(`⚠️ ${service} API key found in localStorage. Moving to secure storage...`);
  }
};

// Session validation
export const validateSession = (): boolean => {
  // Check if session is still valid (not expired)
  const sessionStart = sessionStorage.getItem('session_start');
  if (!sessionStart) {
    sessionStorage.setItem('session_start', Date.now().toString());
    return true;
  }

  const maxSessionTime = 8 * 60 * 60 * 1000; // 8 hours
  const elapsed = Date.now() - parseInt(sessionStart);
  
  if (elapsed > maxSessionTime) {
    // Session expired, clear all secure storage
    sessionStorage.clear();
    return false;
  }

  return true;
};