
import { MessageService } from "./MessageService";
import { MatchService } from "./MatchService";
import { DateService } from "./DateService";
import { ReviewService } from "./ReviewService";
import { ChatMessage, DateSchedule, ReviewData } from "@/types/chat";
import { Review } from "@/types/supabase";

// Re-export all services through ChatService to maintain API compatibility
export { ChatMessage, DateSchedule } from "@/types/chat";

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
}
