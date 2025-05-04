
import { Json } from "@/integrations/supabase/types";

// Profile type used throughout the application
export interface Profile {
  id: string;
  created_at?: string;
  updated_at?: string;
  full_name?: string;
  bio?: string;
  gender?: string;
  birthday?: string;
  profile_photo_url?: string;
  interested_in?: string[];
  hobbies?: string[];
  job_title?: string;
  company?: string;
  education?: string;
  location?: string;
  location_lat?: number;
  location_lng?: number;
  photos?: string[];
  is_anonymous_mode?: boolean;
  selfie_verified?: boolean;
  linkedin_url?: string;
  skills?: string[];
  orientation?: string;
  zodiac_sign?: string;
  life_path_number?: number;
  subscription?: string;
}

export interface LoyaltyVenue {
  id: string;
  name: string;
  address: string;
  type: 'coffee' | 'meal' | 'drink';
  discount_free: number;
  discount_premium: number;
  discount_premium_plus: number;
  logo_url?: string;
}
