
import { supabase } from "@/lib/supabase";
import { Match } from "@/types/chat";
import { toast } from "sonner";

export class MatchService {
  // Get all matches for a user
  static async getMatches(userId: string): Promise<Match[]> {
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
      // Fix the type error by providing a more specific type for the RPC function
      // We need to use a type assertion with a properly structured object type
      interface RevealIdentityParams {
        match_id: string;
      }
      
      await supabase.rpc('request_identity_reveal', {
        match_id: matchId
      } as RevealIdentityParams);
      
      toast.success('Identity reveal request sent!');
    } catch (error: any) {
      console.error('Error requesting identity reveal:', error);
      toast.error('Failed to send identity reveal request');
      throw error;
    }
  }
}
