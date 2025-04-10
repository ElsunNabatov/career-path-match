
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

// Create and export the supabase client
export const supabase = createClient<Database>(
  "https://fkmsuaxcswzoqmggzqsf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrbXN1YXhjc3d6b3FtZ2d6cXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMTk0NjIsImV4cCI6MjA1OTc5NTQ2Mn0.1s2wLfuMSjwwZ1hZDxxaLK1mHWQ2XaDanf2qOVoP4RU"
);

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper function to get user profile data
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};
