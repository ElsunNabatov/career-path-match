
import { supabase } from "@/lib/supabase";
import { ReviewData } from "@/types/chat";
import { Review } from "@/types/supabase";

export class ReviewService {
  // Submit a review for a date
  static async submitReview(reviewData: ReviewData): Promise<Review> {
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
