
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
  linkedin_verified?: boolean;
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

// Date scheduling types
export interface DateSchedule {
  id: string;
  created_at?: string;
  match_id: string;
  date_time: string;
  location_id?: string;
  location_name: string;
  location_address: string;
  type?: string;
  status?: string;
  partnerName?: string;
  partnerId?: string;
  partnerIsAnonymous?: boolean;
  partnerPhoto?: string;
  isInitiator?: boolean;
  reviewed?: boolean;
}

export interface DateLocation {
  id: string;
  name: string;
  address: string;
  type: string;
  discount?: number;
}

// Review types
export interface Review {
  id: string;
  created_at?: string;
  date_id: string;
  reviewer_id: string;
  reviewed_id: string;
  punctuality_rating?: number;
  communication_rating?: number;
  overall_rating?: number;
  would_meet_again: boolean;
  comments?: string;
  share_publicly?: boolean;
}

export interface Hobby {
  id: string;
  name: string;
  category: string;
}

export interface AIAdvisorInteraction {
  id: string;
  user_id: string;
  created_at?: string;
  interaction_log: {
    messages: any[];
    usageCount: number;
    matchId?: string;
    profileId?: string;
  };
  context_type: string;
}

export interface MessageLog {
  id: string;
  created_at?: string;
  conversation_id: string;
  content: string;
  was_flagged?: boolean;
  flag_reason?: string;
}
