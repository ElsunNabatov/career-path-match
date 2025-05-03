
import { Review } from "@/types/supabase";

export type ChatMessage = {
  id: string;
  created_at: string;
  match_id: string;
  sender_id: string;
  content: string;
  read: boolean;
};

export type DateSchedule = {
  match_id: string;
  date_time: string;
  location_name: string;
  location_address: string;
  type: 'coffee' | 'meal' | 'drink' | string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled' | string;
};

export type Match = {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerPhoto: string | null;
  isAnonymous: boolean;
  compatibilityScore: number;
  lastMessage: string | null;
  lastMessageTime: string;
  unreadCount: number;
};

export type ReviewData = {
  date_id: string;
  reviewer_id: string;
  reviewed_id: string;
  punctuality_rating: number;
  communication_rating: number;
  overall_rating: number;
  would_meet_again: boolean;
  comments?: string;
  share_publicly?: boolean;
};
