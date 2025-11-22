// Application configuration and environment variables
// This replaces hardcoded values with secure configuration

export const appConfig = {
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
  
  // Feature Flags
  features: {
    googleAuth: true,
    guestMode: true,
    aiChat: true,
    voiceInterface: false, // Disabled until properly implemented
  },
};

// Development mode checks
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;