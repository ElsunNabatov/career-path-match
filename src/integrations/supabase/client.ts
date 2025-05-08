
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fkmsuaxcswzoqmggzqsf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrbXN1YXhjc3d6b3FtZ2d6cXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMTk0NjIsImV4cCI6MjA1OTc5NTQ2Mn0.1s2wLfuMSjwwZ1hZDxxaLK1mHWQ2XaDanf2qOVoP4RU";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    // Add proper redirect URLs for authentication
    flowType: 'pkce',
    detectSessionInUrl: true,
    debug: true
  }
});

// Create a helper function to get the application base URL for redirects
export const getAppBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // Fallback for non-browser environments
  return 'http://localhost:5173';
};

// Helper function to get correct redirect URL
export const getRedirectUrl = (path = '/verification') => {
  return `${getAppBaseUrl()}${path}`;
};
