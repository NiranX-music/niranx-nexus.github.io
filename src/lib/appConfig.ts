// Application configuration and environment variables
// This replaces hardcoded values with secure configuration

export const appConfig = {
  // OAuth Configuration - Managed by backend
  
  // Security Configuration
  security: {
    maxSessionTime: 8 * 60 * 60 * 1000, // 8 hours
    otpExpiryMinutes: 10,
    rateLimits: {
      authAttempts: 5,
      messageSubmissions: 10,
      apiCalls: 100,
    },
    rateLimitWindows: {
      authAttempts: 15 * 60 * 1000, // 15 minutes
      messageSubmissions: 60 * 1000, // 1 minute
      apiCalls: 60 * 60 * 1000, // 1 hour
    },
  },
  
  // API Configuration
  api: {
    supabase: {
      url: 'https://ppmggnprfchrwfqjhwpp.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbWdnbnByZmNocndmcWpod3BwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMzg0MzQsImV4cCI6MjA2MzgxNDQzNH0.5b5h7eJKZvg9HbzCuoBYzWLK0iJLNDcwkiU9Snjtg2c',
    },
  },
  
  // Feature Flags
  features: {
    googleAuth: true,
    guestMode: true,
    aiChat: true,
    voiceInterface: false, // Disabled until properly implemented
  },
};

// Validation functions
export const validateConfig = (): boolean => {
  const required = [
    appConfig.api.supabase.url,
    appConfig.api.supabase.anonKey,
  ];
  
  return required.every(value => value && value.length > 0);
};

// Development mode checks
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Security headers for CSP
export const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://ppmggnprfchrwfqjhwpp.supabase.co https://api.openai.com wss:",
    "frame-src 'self' https://accounts.google.com",
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};