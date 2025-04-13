export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_advisor_interactions: {
        Row: {
          context_type: string
          created_at: string | null
          id: string
          interaction_log: Json
          user_id: string
        }
        Insert: {
          context_type: string
          created_at?: string | null
          id?: string
          interaction_log: Json
          user_id: string
        }
        Update: {
          context_type?: string
          created_at?: string | null
          id?: string
          interaction_log?: Json
          user_id?: string
        }
        Relationships: []
      }
      dates: {
        Row: {
          created_at: string
          date_time: string
          id: string
          location_address: string
          location_id: string | null
          location_name: string
          match_id: string
          status: string | null
          type: string | null
        }
        Insert: {
          created_at?: string
          date_time: string
          id?: string
          location_address: string
          location_id?: string | null
          location_name: string
          match_id: string
          status?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string
          date_time?: string
          id?: string
          location_address?: string
          location_id?: string | null
          location_name?: string
          match_id?: string
          status?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dates_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "loyalty_venues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dates_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_venues: {
        Row: {
          address: string
          discount_free: number | null
          discount_premium: number | null
          discount_premium_plus: number | null
          id: string
          logo_url: string | null
          name: string
          type: string | null
        }
        Insert: {
          address: string
          discount_free?: number | null
          discount_premium?: number | null
          discount_premium_plus?: number | null
          id?: string
          logo_url?: string | null
          name: string
          type?: string | null
        }
        Update: {
          address?: string
          discount_free?: number | null
          discount_premium?: number | null
          discount_premium_plus?: number | null
          id?: string
          logo_url?: string | null
          name?: string
          type?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          id: string
          identity_revealed: boolean | null
          is_anonymous: boolean | null
          status: string | null
          user1: string
          user2: string
        }
        Insert: {
          created_at?: string
          id?: string
          identity_revealed?: boolean | null
          is_anonymous?: boolean | null
          status?: string | null
          user1: string
          user2: string
        }
        Update: {
          created_at?: string
          id?: string
          identity_revealed?: boolean | null
          is_anonymous?: boolean | null
          status?: string | null
          user1?: string
          user2?: string
        }
        Relationships: []
      }
      message_logs: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          flag_reason: string | null
          id: string
          was_flagged: boolean | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          flag_reason?: string | null
          id?: string
          was_flagged?: boolean | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          flag_reason?: string | null
          id?: string
          was_flagged?: boolean | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          match_id: string
          read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          match_id: string
          read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          match_id?: string
          read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          birthday: string | null
          company: string | null
          created_at: string
          education: string | null
          full_name: string | null
          gender: string | null
          hobbies: Json | null
          id: string
          interested_in: string[] | null
          is_anonymous_mode: boolean | null
          job_title: string | null
          linkedin_url: string | null
          linkedin_verified: boolean | null
          location: string | null
          photos: string[] | null
          review_score: number | null
          skills: string[] | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          birthday?: string | null
          company?: string | null
          created_at?: string
          education?: string | null
          full_name?: string | null
          gender?: string | null
          hobbies?: Json | null
          id: string
          interested_in?: string[] | null
          is_anonymous_mode?: boolean | null
          job_title?: string | null
          linkedin_url?: string | null
          linkedin_verified?: boolean | null
          location?: string | null
          photos?: string[] | null
          review_score?: number | null
          skills?: string[] | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          birthday?: string | null
          company?: string | null
          created_at?: string
          education?: string | null
          full_name?: string | null
          gender?: string | null
          hobbies?: Json | null
          id?: string
          interested_in?: string[] | null
          is_anonymous_mode?: boolean | null
          job_title?: string | null
          linkedin_url?: string | null
          linkedin_verified?: boolean | null
          location?: string | null
          photos?: string[] | null
          review_score?: number | null
          skills?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comments: string | null
          communication_rating: number | null
          created_at: string
          date_id: string
          id: string
          overall_rating: number | null
          punctuality_rating: number | null
          reviewed_id: string
          reviewer_id: string
          would_meet_again: boolean
        }
        Insert: {
          comments?: string | null
          communication_rating?: number | null
          created_at?: string
          date_id: string
          id?: string
          overall_rating?: number | null
          punctuality_rating?: number | null
          reviewed_id: string
          reviewer_id: string
          would_meet_again: boolean
        }
        Update: {
          comments?: string | null
          communication_rating?: number | null
          created_at?: string
          date_id?: string
          id?: string
          overall_rating?: number | null
          punctuality_rating?: number | null
          reviewed_id?: string
          reviewer_id?: string
          would_meet_again?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "reviews_date_id_fkey"
            columns: ["date_id"]
            isOneToOne: false
            referencedRelation: "dates"
            referencedColumns: ["id"]
          },
        ]
      }
      sticker_inventory: {
        Row: {
          coffee_stickers: number | null
          id: string
          meal_stickers: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          coffee_stickers?: number | null
          id?: string
          meal_stickers?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          coffee_stickers?: number | null
          id?: string
          meal_stickers?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          auto_renew: boolean | null
          expires_at: string
          id: string
          payment_method: string | null
          plan: string | null
          starts_at: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          expires_at: string
          id?: string
          payment_method?: string | null
          plan?: string | null
          starts_at?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean | null
          expires_at?: string
          id?: string
          payment_method?: string | null
          plan?: string | null
          starts_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
