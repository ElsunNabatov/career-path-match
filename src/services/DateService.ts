
import { supabase } from "@/lib/supabase";
import { DateSchedule } from "@/types/chat";

export class DateService {
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
}
