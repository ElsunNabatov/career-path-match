
export type Profile = {
  id: string;
  created_at?: string;
  updated_at?: string;
  full_name: string;
  birthday: string;
  gender: string;
  interested_in: string[];
  bio: string;
  linkedin_verified: boolean;
  job_title?: string;
  company?: string;
  education?: string;
  skills?: string[];
  photos?: string[];
  location?: string;
  review_score?: number;
  linkedin_url?: string;
};

export type Match = {
  id: string;
  created_at: string;
  user1: string;
  user2: string;
  status: 'pending' | 'accepted' | 'rejected' | 'scheduled' | 'completed';
  is_anonymous?: boolean;
};

export type Message = {
  id: string;
  created_at: string;
  match_id: string;
  sender_id: string;
  content: string;
  read: boolean;
};

export type DateSchedule = {
  id: string;
  created_at: string;
  match_id: string;
  date_time: string;
  location_name: string;
  location_address: string;
  type: 'coffee' | 'meal' | 'drink' | string; // Allow any string but enforce our preferred types
  status: 'scheduled' | 'completed' | 'cancelled' | string; // Allow any string but enforce our preferred statuses
};

export type Review = {
  id: string;
  created_at: string;
  date_id: string; 
  reviewer_id: string;
  reviewed_id: string;
  punctuality_rating: number;
  communication_rating: number;
  overall_rating: number;
  would_meet_again: boolean;
  comments?: string;
};

export type LoyaltyVenue = {
  id: string;
  name: string;
  address: string;
  type: 'coffee' | 'restaurant';
  discount_free: number;
  discount_premium: number;
  discount_premium_plus: number;
  logo_url?: string;
};

export type UserSubscription = {
  id: string;
  user_id: string;
  plan: 'free' | 'premium' | 'premium_plus';
  starts_at: string;
  expires_at: string;
  auto_renew: boolean;
  payment_method?: string;
};

export type StickerInventory = {
  id: string;
  user_id: string;
  coffee_stickers: number;
  meal_stickers: number;
  updated_at: string;
};
