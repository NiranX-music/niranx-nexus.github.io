import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://tophenwypevlfbznlwil.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvcGhlbnd5cGV2bGZiem5sd2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MzUxMTgsImV4cCI6MjA3OTIxMTExOH0.wB_kkLZXpp35-9Cm3hf9brp_nqiBEaoZ5cbUCIJn_Pw';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: window.localStorage
  }
});