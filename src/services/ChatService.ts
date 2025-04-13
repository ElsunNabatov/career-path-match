
import { supabase } from '@/lib/supabase';

export interface DateSchedule {
  match_id: string;
  date_time: string;
  location_name: string;
  location_address: string;
  type: 'coffee' | 'meal' | 'drink';
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
}

// Simple content moderation
const moderateContent = (content: string): { isApproved: boolean; reason?: string } => {
  // Define keywords for content moderation (simplified version)
  const sexualKeywords = ['sex', 'nude', 'naked', 'hook up', 'hookup', 'nsfw'];
  const toxicKeywords = ['fuck', 'shit', 'bitch', 'asshole', 'idiot', 'stupid', 'hate'];
  
  const lowerContent = content.toLowerCase();
  
  // Check for sexual content
  if (sexualKeywords.some(word => lowerContent.includes(word))) {
    return { isApproved: false, reason: 'sexual_content' };
  }
  
  // Check for toxic language
  if (toxicKeywords.some(word => lowerContent.includes(word))) {
    return { isApproved: false, reason: 'toxic_language' };
  }
  
  return { isApproved: true };
};

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
  
  // Send a message with content moderation
  sendMessage: async (matchId: string, senderId: string, content: string) => {
    // First moderate the content
    const { isApproved, reason } = moderateContent(content);
    
    if (!isApproved) {
      // Log the flagged message but don't send it
      await supabase
        .from('message_logs')
        .insert({
          conversation_id: matchId,
          content,
          was_flagged: true,
          flag_reason: reason
        });
        
      throw new Error(`Message contains inappropriate content: ${reason}`);
    }
    
    // If content is approved, send the message
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
  
  // Send message suggestion from AI advisor
  getSuggestion: async (matchId: string, currentMessage?: string) => {
    // This would normally call an AI API
    // For now, returning static suggestions
    const suggestions = [
      "What's your favorite part of your job?",
      "Have you read any good books lately?",
      "What's something you're looking forward to this year?",
      "Do you have any travel plans coming up?",
      "What do you like to do on weekends?",
      "Any favorite restaurants in the area?"
    ];
    
    return suggestions[Math.floor(Math.random() * suggestions.length)];
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
    share_publicly?: boolean;
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
