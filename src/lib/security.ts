// Security utilities for input validation and sanitization

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }
  if (password.length > 128) {
    return { valid: false, message: "Password must be less than 128 characters" };
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  return { valid: true };
};

export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove potentially dangerous characters and patterns
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

export const validateUsername = (username: string): { valid: boolean; message?: string } => {
  if (!username || username.length < 3) {
    return { valid: false, message: "Username must be at least 3 characters long" };
  }
  if (username.length > 50) {
    return { valid: false, message: "Username must be less than 50 characters" };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, message: "Username can only contain letters, numbers, underscores, and hyphens" };
  }
  return { valid: true };
};

export const validateDisplayName = (displayName: string): { valid: boolean; message?: string } => {
  if (!displayName || displayName.trim().length < 2) {
    return { valid: false, message: "Display name must be at least 2 characters long" };
  }
  if (displayName.length > 100) {
    return { valid: false, message: "Display name must be less than 100 characters" };
  }
  // Check for potentially malicious content
  if (/<script|javascript:|on\w+=|<iframe|<object/i.test(displayName)) {
    return { valid: false, message: "Display name contains invalid characters" };
  }
  return { valid: true };
};

export const validateBio = (bio: string): { valid: boolean; message?: string } => {
  if (bio && bio.length > 500) {
    return { valid: false, message: "Bio must be less than 500 characters" };
  }
  // Check for potentially malicious content
  if (/<script|javascript:|on\w+=|<iframe|<object/i.test(bio)) {
    return { valid: false, message: "Bio contains invalid characters" };
  }
  return { valid: true };
};

export const validateMessageContent = (content: string): { valid: boolean; message?: string } => {
  if (!content || content.trim().length === 0) {
    return { valid: false, message: "Message cannot be empty" };
  }
  if (content.length > 5000) {
    return { valid: false, message: "Message must be less than 5000 characters" };
  }
  // Check for spam patterns
  if (/viagra|casino|lottery|winner.*money|congratulations.*money/i.test(content)) {
    return { valid: false, message: "Message contains prohibited content" };
  }
  return { valid: true };
};

// Rate limiting utility for client-side
export const checkClientRateLimit = (key: string, limit: number, windowMs: number): boolean => {
  try {
    const now = Date.now();
    const stored = localStorage.getItem(`rateLimit_${key}`);
    
    if (!stored) {
      localStorage.setItem(`rateLimit_${key}`, JSON.stringify({ count: 1, timestamp: now }));
      return true;
    }
    
    const data = JSON.parse(stored);
    const timeDiff = now - data.timestamp;
    
    if (timeDiff > windowMs) {
      // Reset window
      localStorage.setItem(`rateLimit_${key}`, JSON.stringify({ count: 1, timestamp: now }));
      return true;
    }
    
    if (data.count >= limit) {
      return false; // Rate limit exceeded
    }
    
    // Increment count
    localStorage.setItem(`rateLimit_${key}`, JSON.stringify({ 
      count: data.count + 1, 
      timestamp: data.timestamp 
    }));
    return true;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return true; // Allow on error to avoid blocking users
  }
};

// Content Security Policy helpers
export const secureHTML = (content: string): string => {
  // Basic HTML sanitization - remove dangerous tags and attributes
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
};

// Secure random string generation
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Environment validation
export const validateEnvironmentKey = (key: string): boolean => {
  // Validate API keys format (basic check)
  if (!key || typeof key !== 'string') return false;
  if (key.length < 20) return false; // Most API keys are longer
  return true;
};

// Message Encryption Utilities
const ENCRYPTION_PREFIX = 'ENC:';

/**
 * Derives an encryption key from the user's session
 */
async function deriveEncryptionKey(userId: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(userId.padEnd(32, '0')),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode('niranx-secure-messages'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts message content using AES-GCM
 */
export async function encryptMessage(content: string, userId: string): Promise<string> {
  try {
    const key = await deriveEncryptionKey(userId);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedContent = new TextEncoder().encode(content);
    
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedContent
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);
    
    // Convert to base64 and add prefix
    return ENCRYPTION_PREFIX + btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    return content; // Fallback to unencrypted on error
  }
}

/**
 * Decrypts message content using AES-GCM
 */
export async function decryptMessage(encryptedContent: string, userId: string): Promise<string> {
  try {
    // Check if message is encrypted
    if (!encryptedContent.startsWith(ENCRYPTION_PREFIX)) {
      return encryptedContent; // Return as-is if not encrypted
    }
    
    const base64Data = encryptedContent.slice(ENCRYPTION_PREFIX.length);
    const combined = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);
    
    const key = await deriveEncryptionKey(userId);
    
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );
    
    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error('Decryption failed:', error);
    return '[Encrypted message - unable to decrypt]';
  }
}

/**
 * Checks if content is encrypted
 */
export function isEncryptedMessage(content: string): boolean {
  return content.startsWith(ENCRYPTION_PREFIX);
}