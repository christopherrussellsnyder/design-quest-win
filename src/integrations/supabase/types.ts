export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audiences: {
        Row: {
          age_max: number | null
          age_min: number | null
          behaviors: string[] | null
          cities: string[] | null
          countries: string[] | null
          created_at: string | null
          description: string | null
          education_levels: string[] | null
          estimated_size_max: number | null
          estimated_size_min: number | null
          gender: string[] | null
          id: string
          income_ranges: string[] | null
          industries: string[] | null
          interests: string[] | null
          is_favorite: boolean | null
          job_titles: string[] | null
          languages: string[] | null
          last_used_at: string | null
          name: string
          platforms: string[] | null
          radius_km: number | null
          regions: string[] | null
          updated_at: string | null
          used_in_campaigns: number | null
          user_id: string
        }
        Insert: {
          age_max?: number | null
          age_min?: number | null
          behaviors?: string[] | null
          cities?: string[] | null
          countries?: string[] | null
          created_at?: string | null
          description?: string | null
          education_levels?: string[] | null
          estimated_size_max?: number | null
          estimated_size_min?: number | null
          gender?: string[] | null
          id?: string
          income_ranges?: string[] | null
          industries?: string[] | null
          interests?: string[] | null
          is_favorite?: boolean | null
          job_titles?: string[] | null
          languages?: string[] | null
          last_used_at?: string | null
          name: string
          platforms?: string[] | null
          radius_km?: number | null
          regions?: string[] | null
          updated_at?: string | null
          used_in_campaigns?: number | null
          user_id: string
        }
        Update: {
          age_max?: number | null
          age_min?: number | null
          behaviors?: string[] | null
          cities?: string[] | null
          countries?: string[] | null
          created_at?: string | null
          description?: string | null
          education_levels?: string[] | null
          estimated_size_max?: number | null
          estimated_size_min?: number | null
          gender?: string[] | null
          id?: string
          income_ranges?: string[] | null
          industries?: string[] | null
          interests?: string[] | null
          is_favorite?: boolean | null
          job_titles?: string[] | null
          languages?: string[] | null
          last_used_at?: string | null
          name?: string
          platforms?: string[] | null
          radius_km?: number | null
          regions?: string[] | null
          updated_at?: string | null
          used_in_campaigns?: number | null
          user_id?: string
        }
        Relationships: []
      }
      automation_rules: {
        Row: {
          actions: Json
          created_at: string | null
          description: string | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          name: string
          trigger_config: Json
          trigger_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actions: Json
          created_at?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name: string
          trigger_config: Json
          trigger_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actions?: Json
          created_at?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name?: string
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      campaign_drafts: {
        Row: {
          audience_segment: string | null
          bid_strategy: string | null
          call_to_action: string | null
          completed: boolean | null
          created_at: string | null
          current_step: number | null
          daily_limit: number | null
          end_date: string | null
          estimated_reach_max: number | null
          estimated_reach_min: number | null
          id: string
          interests: string[] | null
          locations: string | null
          name: string | null
          objective: string | null
          platforms: string[] | null
          primary_message: string | null
          start_date: string | null
          total_budget: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          audience_segment?: string | null
          bid_strategy?: string | null
          call_to_action?: string | null
          completed?: boolean | null
          created_at?: string | null
          current_step?: number | null
          daily_limit?: number | null
          end_date?: string | null
          estimated_reach_max?: number | null
          estimated_reach_min?: number | null
          id?: string
          interests?: string[] | null
          locations?: string | null
          name?: string | null
          objective?: string | null
          platforms?: string[] | null
          primary_message?: string | null
          start_date?: string | null
          total_budget?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          audience_segment?: string | null
          bid_strategy?: string | null
          call_to_action?: string | null
          completed?: boolean | null
          created_at?: string | null
          current_step?: number | null
          daily_limit?: number | null
          end_date?: string | null
          estimated_reach_max?: number | null
          estimated_reach_min?: number | null
          id?: string
          interests?: string[] | null
          locations?: string | null
          name?: string | null
          objective?: string | null
          platforms?: string[] | null
          primary_message?: string | null
          start_date?: string | null
          total_budget?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      campaign_templates: {
        Row: {
          category: string
          created_at: string | null
          default_message: string | null
          default_platforms: string[] | null
          description: string | null
          icon: string | null
          id: string
          name: string
          objective: string
          popular: boolean | null
        }
        Insert: {
          category: string
          created_at?: string | null
          default_message?: string | null
          default_platforms?: string[] | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          objective: string
          popular?: boolean | null
        }
        Update: {
          category?: string
          created_at?: string | null
          default_message?: string | null
          default_platforms?: string[] | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          objective?: string
          popular?: boolean | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          created_at: string
          daily_limit: number | null
          end_date: string | null
          estimated_reach: number | null
          id: string
          name: string
          objective: string | null
          platform: string
          predicted_conversions: number | null
          predicted_roi: string | null
          roi: string | null
          spend: number
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          total_budget: number | null
          trend: Database["public"]["Enums"]["campaign_trend"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_limit?: number | null
          end_date?: string | null
          estimated_reach?: number | null
          id?: string
          name: string
          objective?: string | null
          platform: string
          predicted_conversions?: number | null
          predicted_roi?: string | null
          roi?: string | null
          spend?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          total_budget?: number | null
          trend?: Database["public"]["Enums"]["campaign_trend"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_limit?: number | null
          end_date?: string | null
          estimated_reach?: number | null
          id?: string
          name?: string
          objective?: string | null
          platform?: string
          predicted_conversions?: number | null
          predicted_roi?: string | null
          roi?: string | null
          spend?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          total_budget?: number | null
          trend?: Database["public"]["Enums"]["campaign_trend"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_library: {
        Row: {
          campaign_id: string | null
          content_type: string
          created_at: string | null
          generated_content: string
          id: string
          is_favorite: boolean | null
          length: string | null
          objective: string | null
          platform: string | null
          prompt: string | null
          rating: number | null
          tone: string | null
          updated_at: string | null
          used_in_campaign: boolean | null
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          content_type: string
          created_at?: string | null
          generated_content: string
          id?: string
          is_favorite?: boolean | null
          length?: string | null
          objective?: string | null
          platform?: string | null
          prompt?: string | null
          rating?: number | null
          tone?: string | null
          updated_at?: string | null
          used_in_campaign?: boolean | null
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          content_type?: string
          created_at?: string | null
          generated_content?: string
          id?: string
          is_favorite?: boolean | null
          length?: string | null
          objective?: string | null
          platform?: string | null
          prompt?: string | null
          rating?: number | null
          tone?: string | null
          updated_at?: string | null
          used_in_campaign?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_library_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics_daily: {
        Row: {
          conversions: number | null
          created_at: string
          date: string
          email_open_rate: number | null
          engagement_rate: number | null
          id: string
          reach: number | null
          user_id: string
        }
        Insert: {
          conversions?: number | null
          created_at?: string
          date: string
          email_open_rate?: number | null
          engagement_rate?: number | null
          id?: string
          reach?: number | null
          user_id: string
        }
        Update: {
          conversions?: number | null
          created_at?: string
          date?: string
          email_open_rate?: number | null
          engagement_rate?: number | null
          id?: string
          reach?: number | null
          user_id?: string
        }
        Relationships: []
      }
      performance_data: {
        Row: {
          conversions: number | null
          created_at: string
          date: string
          day_name: string
          engagement: number | null
          id: string
          reach: number | null
          user_id: string
        }
        Insert: {
          conversions?: number | null
          created_at?: string
          date: string
          day_name: string
          engagement?: number | null
          id?: string
          reach?: number | null
          user_id: string
        }
        Update: {
          conversions?: number | null
          created_at?: string
          date?: string
          day_name?: string
          engagement?: number | null
          id?: string
          reach?: number | null
          user_id?: string
        }
        Relationships: []
      }
      scheduled_posts: {
        Row: {
          campaign_id: string | null
          clicks: number | null
          content: string
          created_at: string | null
          engagements: number | null
          error_message: string | null
          id: string
          impressions: number | null
          media_urls: string[] | null
          platforms: string[]
          post_type: string
          published_at: string | null
          recurrence: string | null
          recurrence_end_date: string | null
          scheduled_time: string
          status: string
          timezone: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          clicks?: number | null
          content: string
          created_at?: string | null
          engagements?: number | null
          error_message?: string | null
          id?: string
          impressions?: number | null
          media_urls?: string[] | null
          platforms: string[]
          post_type: string
          published_at?: string | null
          recurrence?: string | null
          recurrence_end_date?: string | null
          scheduled_time: string
          status?: string
          timezone?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          clicks?: number | null
          content?: string
          created_at?: string | null
          engagements?: number | null
          error_message?: string | null
          id?: string
          impressions?: number | null
          media_urls?: string[] | null
          platforms?: string[]
          post_type?: string
          published_at?: string | null
          recurrence?: string | null
          recurrence_end_date?: string | null
          scheduled_time?: string
          status?: string
          timezone?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      social_connections: {
        Row: {
          access_token: string
          account_name: string | null
          account_type: string | null
          created_at: string | null
          error_message: string | null
          follower_count: number | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          platform: string
          platform_user_id: string
          platform_username: string | null
          profile_picture_url: string | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          account_name?: string | null
          account_type?: string | null
          created_at?: string | null
          error_message?: string | null
          follower_count?: number | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          platform: string
          platform_user_id: string
          platform_username?: string | null
          profile_picture_url?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          account_name?: string | null
          account_type?: string | null
          created_at?: string | null
          error_message?: string | null
          follower_count?: number | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          platform?: string
          platform_user_id?: string
          platform_username?: string | null
          profile_picture_url?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
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
      campaign_status: "active" | "paused" | "draft"
      campaign_trend: "up" | "down" | "neutral"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      campaign_status: ["active", "paused", "draft"],
      campaign_trend: ["up", "down", "neutral"],
    },
  },
} as const
