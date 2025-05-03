
import { supabase } from "@/lib/supabase";
import { ChatMessage } from "@/types/chat";
import { toast } from "sonner";

export class MessageService {
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
}
