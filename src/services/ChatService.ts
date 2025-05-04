import { MessageService } from "./MessageService";
import { MatchService } from "./MatchService";
import { DateService } from "./DateService";
import { ReviewService } from "./ReviewService";
import { supabase } from '@/lib/supabase';
import { type ChatMessage, type DateSchedule, type ReviewData } from "@/types/chat";
import { type Review } from "@/types/supabase";

// Re-export all services through ChatService to maintain API compatibility
export type { ChatMessage, DateSchedule } from "@/types/chat";

export class ChatService {
  // MessageService methods
  static subscribeToChat = MessageService.subscribeToChat;
  static getChatHistory = MessageService.getChatHistory;
  static sendMessage = MessageService.sendMessage;
  static markAsRead = MessageService.markAsRead;
  
  // MatchService methods
  static getMatches = MatchService.getMatches;
  static requestIdentityReveal = MatchService.requestIdentityReveal;
  
  // DateService methods
  static scheduleDate = DateService.scheduleDate;
  
  // ReviewService methods
  static submitReview = ReviewService.submitReview;
  
  // Dating Advisor methods
  static async logAdvisorInteraction(userId: string, contextType: 'people_page' | 'chat', interactionLog: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_advisor_interactions')
        .insert({
          user_id: userId,
          context_type: contextType,
          interaction_log: interactionLog
        });
        
      if (error) throw error;
    } catch (error: any) {
      console.error('Error logging advisor interaction:', error);
    }
  }
  
  static async getProfilesNearby(userId: string, radius: number = 25): Promise<any[]> {
    try {
      // In a real implementation, this would use geospatial queries
      // For now, we're simulating with mock data
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('location')
        .eq('id', userId)
        .single();
        
      if (userError) throw userError;
      
      // Get other profiles - in a real implementation we'd use PostGIS
      // to calculate distance between coordinates
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', userId);
        
      if (error) throw error;
      
      // Simulate distance calculation - in reality would use coordinates
      const profilesWithDistance = data?.map(profile => ({
        ...profile,
        distance: Math.floor(Math.random() * radius) // Mock distance calculation
      }));
      
      return profilesWithDistance.filter(p => p.distance <= radius);
    } catch (error: any) {
      console.error('Error getting nearby profiles:', error);
      return [];
    }
  }
}
