import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://ppmggnprfchrwfqjhwpp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbWdnbnByZmNocndmcWpod3BwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMzg0MzQsImV4cCI6MjA2MzgxNDQzNH0.5b5h7eJKZvg9HbzCuoBYzWLK0iJLNDcwkiU9Snjtg2c';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: window.localStorage
  }
});