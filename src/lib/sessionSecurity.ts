// Enhanced session security utilities
import { appConfig } from './appConfig';

interface SessionData {
  userId?: string;
  startTime: number;
  lastActivity: number;
  fingerprint: string;
}

class SessionManager {
  private readonly sessionKey = 'secure_session_data';
  
  private generateFingerprint(): string {
    // Create a basic browser fingerprint for session validation
    const data = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
    ].join('|');
    
    // Simple hash function (not cryptographically secure but sufficient for fingerprinting)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString(36);
  }
  
  startSession(userId?: string): void {
    const now = Date.now();
    const sessionData: SessionData = {
      userId,
      startTime: now,
      lastActivity: now,
      fingerprint: this.generateFingerprint(),
    };
    
    sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
    
    // Clear any legacy session markers
    sessionStorage.removeItem('session_start');
  }
  
  updateActivity(): void {
    const sessionData = this.getSessionData();
    if (sessionData) {
      sessionData.lastActivity = Date.now();
      sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
    }
  }
  
  validateSession(): boolean {
    const sessionData = this.getSessionData();
    if (!sessionData) return false;
    
    const now = Date.now();
    const { startTime, lastActivity, fingerprint } = sessionData;
    
    // Check session age
    if (now - startTime > appConfig.security.maxSessionTime) {
      this.clearSession();
      return false;
    }
    
    // Check inactivity (30 minutes)
    const maxInactivity = 30 * 60 * 1000;
    if (now - lastActivity > maxInactivity) {
      this.clearSession();
      return false;
    }
    
    // Check fingerprint
    if (fingerprint !== this.generateFingerprint()) {
      this.clearSession();
      return false;
    }
    
    return true;
  }
  
  private getSessionData(): SessionData | null {
    try {
      const data = sessionStorage.getItem(this.sessionKey);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
  
  clearSession(): void {
    sessionStorage.clear();
  }
  
  getSessionInfo(): { isValid: boolean; timeRemaining?: number; userId?: string } {
    const sessionData = this.getSessionData();
    if (!sessionData || !this.validateSession()) {
      return { isValid: false };
    }
    
    const now = Date.now();
    const timeRemaining = appConfig.security.maxSessionTime - (now - sessionData.startTime);
    
    return {
      isValid: true,
      timeRemaining,
      userId: sessionData.userId,
    };
  }
}

// Singleton instance
export const sessionManager = new SessionManager();

// Auto-activity tracking
let activityTimer: number | null = null;

const trackActivity = () => {
  sessionManager.updateActivity();
  
  // Clear existing timer
  if (activityTimer) {
    clearTimeout(activityTimer);
  }
  
  // Set new timer for next update (5 minutes)
  activityTimer = window.setTimeout(trackActivity, 5 * 60 * 1000);
};

// Initialize activity tracking
if (typeof window !== 'undefined') {
  // Track mouse movement, keyboard input, and clicks
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
    document.addEventListener(event, trackActivity, { passive: true, capture: false });
  });
  
  // Start initial tracking
  trackActivity();
}

// Session validation hook for components
export const useSessionValidation = () => {
  const validateAndClear = () => {
    if (!sessionManager.validateSession()) {
      // Session invalid, clear storage and redirect to login
      sessionManager.clearSession();
      window.location.href = '/login';
    }
  };
  
  return { validateAndClear };
};