
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { generateSampleData } from './dataSeed';

// Create and export the supabase client with proper configuration
export const supabase = createClient<Database>(
  "https://fkmsuaxcswzoqmggzqsf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrbXN1YXhjc3d6b3FtZ2d6cXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMTk0NjIsImV4cCI6MjA1OTc5NTQ2Mn0.1s2wLfuMSjwwZ1hZDxxaLK1mHWQ2XaDanf2qOVoP4RU",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: localStorage
    }
  }
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

// Helper function to ensure storage bucket exists
export const ensureStorageBucket = async (bucketName: string) => {
  try {
    // First check if bucket exists to avoid errors
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Bucket ${bucketName} doesn't exist. Please create it via SQL migration.`);
      return null;
    }
    
    return { name: bucketName };
  } catch (error) {
    console.error(`Error checking bucket ${bucketName}:`, error);
    return null;
  }
};

// Upload a file to storage
export const uploadFile = async (bucketName: string, filePath: string, file: File) => {
  try {
    await ensureStorageBucket(bucketName);
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
      
    return publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Get nearby venue recommendations for dates
export const getNearbyVenues = async (venueType: 'coffee' | 'meal' | 'drink', radius: number = 5000) => {
  try {
    const { data, error } = await supabase
      .from('loyalty_venues')
      .select('*')
      .eq('type', venueType)
      .order('name');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting venues:', error);
    throw error;
  }
};

// Send a date request to another user
export const sendDateRequest = async (dateDetails: {
  match_id: string;
  date_time: string;
  location_name: string;
  location_address: string;
  type: 'coffee' | 'meal' | 'drink';
}) => {
  try {
    const { data, error } = await supabase
      .from('dates')
      .insert({
        ...dateDetails,
        status: 'pending'
      })
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Error sending date request:', error);
    throw error;
  }
};

// Accept a date request
export const acceptDateRequest = async (dateId: string) => {
  try {
    const { data, error } = await supabase
      .from('dates')
      .update({ status: 'scheduled' })
      .eq('id', dateId)
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Error accepting date request:', error);
    throw error;
  }
};

// Load sample data for testing
export const loadSampleData = async (userId: string) => {
  try {
    const sampleData = await generateSampleData(userId);
    console.log("Sample data generated:", sampleData);
    return sampleData;
  } catch (error) {
    console.error("Error loading sample data:", error);
    throw error;
  }
};

// Get profiles near a user's location
export const getNearbyProfiles = async (userId: string, radiusMiles: number = 25) => {
  try {
    // In a real implementation, this would use geospatial queries with PostGIS
    // For demo purposes, we'll simulate with random distances
    
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('location')
      .eq('id', userId)
      .single();
      
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', userId);
      
    // Simulate distance calculation
    return (data || []).map(profile => ({
      ...profile,
      distance: Math.floor(Math.random() * 50) // Random distance 0-50 miles
    })).filter(profile => profile.distance <= radiusMiles);
  } catch (error) {
    console.error('Error fetching nearby profiles:', error);
    throw error;
  }
};
