
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
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

export class ChatService {
  // Subscribe to real-time chat messages for a specific match
  static subscribeToChat(matchId: string, onNewMessage: (message: ChatMessage) => void) {
    console.log(`Subscribing to chat messages for match ${matchId}`);
    
    // Create a subscription channel
    const channel = supabase
      .channel(`match-messages-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          onNewMessage(payload.new as ChatMessage);
        }
      )
      .subscribe();
      
    // Return unsubscribe function
    return () => {
      console.log(`Unsubscribing from chat messages for match ${matchId}`);
      supabase.removeChannel(channel);
    };
  }
  
  // Get chat history for a match
  static async getChatHistory(matchId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
    } catch (error: any) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }
  
  // Send a message
  static async sendMessage(matchId: string, senderId: string, content: string): Promise<ChatMessage> {
    try {
      const newMessage = {
        match_id: matchId,
        sender_id: senderId,
        content,
        read: false
      };
      
      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
  
  // Mark messages as read
  static async markAsRead(matchId: string, receiverId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('match_id', matchId)
        .eq('sender_id', receiverId)
        .eq('read', false);
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Error marking messages as read:', error);
    }
  }
  
  // Schedule a date
  static async scheduleDate(dateData: DateSchedule): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('dates')
        .insert({
          ...dateData
        })
        .select();
      
      if (error) throw error;
      
      return data[0];
    } catch (error: any) {
      console.error('Error scheduling date:', error);
      throw error;
    }
  }
  
  // Get all matches for a user
  static async getMatches(userId: string) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          profiles!matches_user1_fkey(*),
          profiles!matches_user2_fkey(*),
          messages:messages(id, content, sender_id, created_at, read)
        `)
        .or(`user1.eq.${userId},user2.eq.${userId}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Process matches data
      return (data || []).map((match: any) => {
        const isUser1 = match.user1 === userId;
        const partnerId = isUser1 ? match.user2 : match.user1;
        const partnerProfile = isUser1 
          ? match.profiles_matches_user2_fkey
          : match.profiles_matches_user1_fkey;
          
        // Get last message if it exists
        let lastMessage = null;
        let unreadCount = 0;
        
        if (match.messages && match.messages.length > 0) {
          // Sort messages by created_at
          const sortedMessages = [...match.messages].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          
          lastMessage = sortedMessages[0];
          
          // Count unread messages
          unreadCount = sortedMessages.filter(
            (msg) => msg.sender_id !== userId && !msg.read
          ).length;
        }
        
        return {
          id: match.id,
          partnerId,
          partnerName: partnerProfile?.full_name || 'Anonymous',
          partnerPhoto: partnerProfile?.photos?.[0] || null,
          isAnonymous: match.is_anonymous && !match.identity_revealed,
          compatibilityScore: match.compatibility_score || 0,
          lastMessage: lastMessage?.content || null,
          lastMessageTime: lastMessage?.created_at || match.created_at,
          unreadCount
        };
      });
    } catch (error: any) {
      console.error('Error fetching matches:', error);
      throw error;
    }
  }
  
  // Request to reveal identity
  static async requestIdentityReveal(matchId: string): Promise<void> {
    try {
      await supabase.rpc('request_identity_reveal', { match_id: matchId });
      toast.success('Identity reveal request sent!');
    } catch (error: any) {
      console.error('Error requesting identity reveal:', error);
      toast.error('Failed to send identity reveal request');
      throw error;
    }
  }
  
  // Submit a review for a date
  static async submitReview(reviewData: {
    date_id: string;
    reviewer_id: string;
    reviewed_id: string;
    punctuality_rating: number;
    communication_rating: number;
    overall_rating: number;
    would_meet_again: boolean;
    comments?: string;
    share_publicly?: boolean;
  }): Promise<Review> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select();
        
      if (error) throw error;
      
      return data[0] as Review;
    } catch (error: any) {
      console.error('Error submitting review:', error);
      throw error;
    }
  }
}
