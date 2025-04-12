
import { supabase } from '@/lib/supabase';

export interface DateSchedule {
  match_id: string;
  date_time: string;
  location_name: string;
  location_address: string;
  type: 'coffee' | 'meal' | 'drink';
  status: 'scheduled' | 'completed' | 'cancelled';
}

export const ChatService = {
  // Get messages for a specific match
  getMessages: async (matchId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
    
    return data || [];
  },
  
  // Send a message
  sendMessage: async (matchId: string, senderId: string, content: string) => {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: senderId,
        content,
        read: false
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error sending message:", error);
      throw error;
    }
    
    return data;
  },
  
  // Schedule a date
  scheduleDate: async (dateDetails: DateSchedule) => {
    const { data, error } = await supabase
      .from('dates')
      .insert({
        match_id: dateDetails.match_id,
        date_time: dateDetails.date_time,
        location_name: dateDetails.location_name,
        location_address: dateDetails.location_address,
        type: dateDetails.type,
        status: dateDetails.status
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error scheduling date:", error);
      throw error;
    }
    
    return data;
  },
  
  // Get scheduled dates for a match
  getScheduledDates: async (matchId: string) => {
    const { data, error } = await supabase
      .from('dates')
      .select('*')
      .eq('match_id', matchId)
      .order('date_time', { ascending: true });
      
    if (error) {
      console.error("Error fetching scheduled dates:", error);
      throw error;
    }
    
    return data || [];
  },
  
  // Submit a review for a date
  submitReview: async (reviewData: {
    date_id: string;
    reviewer_id: string;
    reviewed_id: string;
    punctuality_rating: number;
    communication_rating: number;
    overall_rating: number;
    would_meet_again: boolean;
    comments?: string;
  }) => {
    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select()
      .single();
      
    if (error) {
      console.error("Error submitting review:", error);
      throw error;
    }
    
    return data;
  }
};
