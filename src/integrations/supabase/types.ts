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
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          location: string | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          location?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          location?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_usage_logs: {
        Row: {
          completion_tokens: number | null
          created_at: string | null
          error_message: string | null
          estimated_cost: number | null
          feature: string | null
          id: string
          metadata: Json | null
          model: string
          prompt_length: number | null
          prompt_tokens: number | null
          request_type: string
          response_length: number | null
          response_time_ms: number | null
          status: string | null
          total_tokens: number | null
          user_id: string
        }
        Insert: {
          completion_tokens?: number | null
          created_at?: string | null
          error_message?: string | null
          estimated_cost?: number | null
          feature?: string | null
          id?: string
          metadata?: Json | null
          model: string
          prompt_length?: number | null
          prompt_tokens?: number | null
          request_type: string
          response_length?: number | null
          response_time_ms?: number | null
          status?: string | null
          total_tokens?: number | null
          user_id: string
        }
        Update: {
          completion_tokens?: number | null
          created_at?: string | null
          error_message?: string | null
          estimated_cost?: number | null
          feature?: string | null
          id?: string
          metadata?: Json | null
          model?: string
          prompt_length?: number | null
          prompt_tokens?: number | null
          request_type?: string
          response_length?: number | null
          response_time_ms?: number | null
          status?: string | null
          total_tokens?: number | null
          user_id?: string
        }
        Relationships: []
      }
      ai_user_quotas: {
        Row: {
          created_at: string | null
          current_month_cost: number | null
          current_month_requests: number | null
          current_month_tokens: number | null
          id: string
          last_reset_at: string | null
          monthly_request_limit: number | null
          monthly_token_limit: number | null
          plan_tier: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_month_cost?: number | null
          current_month_requests?: number | null
          current_month_tokens?: number | null
          id?: string
          last_reset_at?: string | null
          monthly_request_limit?: number | null
          monthly_token_limit?: number | null
          plan_tier?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_month_cost?: number | null
          current_month_requests?: number | null
          current_month_tokens?: number | null
          id?: string
          last_reset_at?: string | null
          monthly_request_limit?: number | null
          monthly_token_limit?: number | null
          plan_tier?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      analytics: {
        Row: {
          audience_demographics: Json | null
          campaign_id: string | null
          click_through_rate: number | null
          clicks: number | null
          comments: number | null
          created_at: string
          detailed_metrics: Json | null
          engagement: number | null
          engagement_rate: number | null
          id: string
          impressions: number | null
          likes: number | null
          metric_date: string
          platform: string
          post_id: string | null
          reach: number | null
          saves: number | null
          shares: number | null
          updated_at: string
          user_id: string
          video_completion_rate: number | null
          video_views: number | null
        }
        Insert: {
          audience_demographics?: Json | null
          campaign_id?: string | null
          click_through_rate?: number | null
          clicks?: number | null
          comments?: number | null
          created_at?: string
          detailed_metrics?: Json | null
          engagement?: number | null
          engagement_rate?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          metric_date: string
          platform: string
          post_id?: string | null
          reach?: number | null
          saves?: number | null
          shares?: number | null
          updated_at?: string
          user_id: string
          video_completion_rate?: number | null
          video_views?: number | null
        }
        Update: {
          audience_demographics?: Json | null
          campaign_id?: string | null
          click_through_rate?: number | null
          clicks?: number | null
          comments?: number | null
          created_at?: string
          detailed_metrics?: Json | null
          engagement?: number | null
          engagement_rate?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          metric_date?: string
          platform?: string
          post_id?: string | null
          reach?: number | null
          saves?: number | null
          shares?: number | null
          updated_at?: string
          user_id?: string
          video_completion_rate?: number | null
          video_views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
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
      brand_settings: {
        Row: {
          accent_color: string | null
          bio: string | null
          brand_hashtags: string[] | null
          business_name: string | null
          created_at: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          key_messages: string[] | null
          linkedin_url: string | null
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          tagline: string | null
          tiktok_url: string | null
          tone: string | null
          twitter_url: string | null
          updated_at: string | null
          user_id: string
          website_url: string | null
          youtube_url: string | null
        }
        Insert: {
          accent_color?: string | null
          bio?: string | null
          brand_hashtags?: string[] | null
          business_name?: string | null
          created_at?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          key_messages?: string[] | null
          linkedin_url?: string | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          tagline?: string | null
          tiktok_url?: string | null
          tone?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id: string
          website_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          accent_color?: string | null
          bio?: string | null
          brand_hashtags?: string[] | null
          business_name?: string | null
          created_at?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          key_messages?: string[] | null
          linkedin_url?: string | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          tagline?: string | null
          tiktok_url?: string | null
          tone?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id?: string
          website_url?: string | null
          youtube_url?: string | null
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
      content_folders: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          parent_folder_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          parent_folder_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          parent_folder_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "content_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      content_library: {
        Row: {
          campaign_id: string | null
          category: string | null
          content_text: string | null
          content_type: string
          created_at: string | null
          folder_id: string | null
          generated_content: string
          hashtags: string[] | null
          id: string
          is_favorite: boolean | null
          is_template: boolean | null
          last_used_at: string | null
          length: string | null
          media_urls: Json | null
          objective: string | null
          performance_score: number | null
          platform: string | null
          prompt: string | null
          rating: number | null
          tags: string[] | null
          times_used: number | null
          title: string | null
          tone: string | null
          updated_at: string | null
          used_in_campaign: boolean | null
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          category?: string | null
          content_text?: string | null
          content_type: string
          created_at?: string | null
          folder_id?: string | null
          generated_content: string
          hashtags?: string[] | null
          id?: string
          is_favorite?: boolean | null
          is_template?: boolean | null
          last_used_at?: string | null
          length?: string | null
          media_urls?: Json | null
          objective?: string | null
          performance_score?: number | null
          platform?: string | null
          prompt?: string | null
          rating?: number | null
          tags?: string[] | null
          times_used?: number | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
          used_in_campaign?: boolean | null
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          category?: string | null
          content_text?: string | null
          content_type?: string
          created_at?: string | null
          folder_id?: string | null
          generated_content?: string
          hashtags?: string[] | null
          id?: string
          is_favorite?: boolean | null
          is_template?: boolean | null
          last_used_at?: string | null
          length?: string | null
          media_urls?: Json | null
          objective?: string | null
          performance_score?: number | null
          platform?: string | null
          prompt?: string | null
          rating?: number | null
          tags?: string[] | null
          times_used?: number | null
          title?: string | null
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
          {
            foreignKeyName: "content_library_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "content_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      login_sessions: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string | null
          device_type: string | null
          expires_at: string | null
          id: string
          ip_address: string | null
          is_current: boolean | null
          last_active_at: string | null
          os: string | null
          session_token: string
          user_id: string
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          last_active_at?: string | null
          os?: string | null
          session_token?: string
          user_id: string
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          last_active_at?: string | null
          os?: string | null
          session_token?: string
          user_id?: string
        }
        Relationships: []
      }
      media_folders: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          item_count: number | null
          name: string
          parent_folder_id: string | null
          total_size: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          item_count?: number | null
          name: string
          parent_folder_id?: string | null
          total_size?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          item_count?: number | null
          name?: string
          parent_folder_id?: string | null
          total_size?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "media_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      media_library: {
        Row: {
          alt_text: string | null
          avg_engagement_rate: number | null
          color_palette: Json | null
          description: string | null
          duration: number | null
          file_size: number
          file_type: string
          filename: string
          folder_id: string | null
          height: number | null
          id: string
          is_favorite: boolean | null
          last_used_at: string | null
          mime_type: string
          original_filename: string
          storage_url: string
          tags: string[] | null
          thumbnail_url: string | null
          times_used: number | null
          title: string | null
          total_impressions: number | null
          updated_at: string | null
          uploaded_at: string | null
          used_in_posts: string[] | null
          user_id: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          avg_engagement_rate?: number | null
          color_palette?: Json | null
          description?: string | null
          duration?: number | null
          file_size: number
          file_type: string
          filename: string
          folder_id?: string | null
          height?: number | null
          id?: string
          is_favorite?: boolean | null
          last_used_at?: string | null
          mime_type: string
          original_filename: string
          storage_url: string
          tags?: string[] | null
          thumbnail_url?: string | null
          times_used?: number | null
          title?: string | null
          total_impressions?: number | null
          updated_at?: string | null
          uploaded_at?: string | null
          used_in_posts?: string[] | null
          user_id: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          avg_engagement_rate?: number | null
          color_palette?: Json | null
          description?: string | null
          duration?: number | null
          file_size?: number
          file_type?: string
          filename?: string
          folder_id?: string | null
          height?: number | null
          id?: string
          is_favorite?: boolean | null
          last_used_at?: string | null
          mime_type?: string
          original_filename?: string
          storage_url?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          times_used?: number | null
          title?: string | null
          total_impressions?: number | null
          updated_at?: string | null
          uploaded_at?: string | null
          used_in_posts?: string[] | null
          user_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_library_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "media_folders"
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
      posts: {
        Row: {
          campaign_id: string | null
          content: string | null
          created_at: string
          engagement_data: Json | null
          hashtags: string[] | null
          id: string
          last_synced_at: string | null
          media_urls: Json | null
          platform: string
          platform_post_id: string | null
          published_at: string | null
          scheduled_for: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          content?: string | null
          created_at?: string
          engagement_data?: Json | null
          hashtags?: string[] | null
          id?: string
          last_synced_at?: string | null
          media_urls?: Json | null
          platform: string
          platform_post_id?: string | null
          published_at?: string | null
          scheduled_for?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          content?: string | null
          created_at?: string
          engagement_data?: Json | null
          hashtags?: string[] | null
          id?: string
          last_synced_at?: string | null
          media_urls?: Json | null
          platform?: string
          platform_post_id?: string | null
          published_at?: string | null
          scheduled_for?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_posts: {
        Row: {
          approval_status: string | null
          best_time_suggestion: string | null
          campaign_id: string | null
          clicks: number | null
          content: string
          created_at: string | null
          engagements: number | null
          error_message: string | null
          id: string
          impressions: number | null
          is_recurring: boolean | null
          media_urls: string[] | null
          parent_recurring_id: string | null
          platforms: string[]
          post_type: string
          published_at: string | null
          queue_position: number | null
          recurrence: string | null
          recurrence_end_date: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          scheduled_time: string
          status: string
          timezone: string | null
          title: string
          updated_at: string | null
          user_id: string
          version: number | null
        }
        Insert: {
          approval_status?: string | null
          best_time_suggestion?: string | null
          campaign_id?: string | null
          clicks?: number | null
          content: string
          created_at?: string | null
          engagements?: number | null
          error_message?: string | null
          id?: string
          impressions?: number | null
          is_recurring?: boolean | null
          media_urls?: string[] | null
          parent_recurring_id?: string | null
          platforms: string[]
          post_type: string
          published_at?: string | null
          queue_position?: number | null
          recurrence?: string | null
          recurrence_end_date?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scheduled_time: string
          status?: string
          timezone?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          version?: number | null
        }
        Update: {
          approval_status?: string | null
          best_time_suggestion?: string | null
          campaign_id?: string | null
          clicks?: number | null
          content?: string
          created_at?: string | null
          engagements?: number | null
          error_message?: string | null
          id?: string
          impressions?: number | null
          is_recurring?: boolean | null
          media_urls?: string[] | null
          parent_recurring_id?: string | null
          platforms?: string[]
          post_type?: string
          published_at?: string | null
          queue_position?: number | null
          recurrence?: string | null
          recurrence_end_date?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scheduled_time?: string
          status?: string
          timezone?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_parent_recurring_id_fkey"
            columns: ["parent_recurring_id"]
            isOneToOne: false
            referencedRelation: "scheduled_posts"
            referencedColumns: ["id"]
          },
        ]
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
      team_members: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          id: string
          invitation_email: string | null
          invitation_expires_at: string | null
          invitation_token: string | null
          invited_by: string | null
          permissions: Json | null
          role: string
          status: string
          team_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          invitation_email?: string | null
          invitation_expires_at?: string | null
          invitation_token?: string | null
          invited_by?: string | null
          permissions?: Json | null
          role?: string
          status?: string
          team_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          invitation_email?: string | null
          invitation_expires_at?: string | null
          invitation_token?: string | null
          invited_by?: string | null
          permissions?: Json | null
          role?: string
          status?: string
          team_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          auto_hashtag_suggestions: boolean | null
          auto_save_drafts: boolean | null
          campaign_milestone_notification: boolean | null
          created_at: string | null
          date_format: string | null
          default_post_status: string | null
          email_notifications: boolean | null
          error_notification: boolean | null
          high_engagement_notification: boolean | null
          id: string
          language: string | null
          make_profile_public: boolean | null
          post_published_notification: boolean | null
          share_analytics: boolean | null
          show_best_time_suggestions: boolean | null
          theme: string | null
          time_format: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
          weekly_report_notification: boolean | null
        }
        Insert: {
          auto_hashtag_suggestions?: boolean | null
          auto_save_drafts?: boolean | null
          campaign_milestone_notification?: boolean | null
          created_at?: string | null
          date_format?: string | null
          default_post_status?: string | null
          email_notifications?: boolean | null
          error_notification?: boolean | null
          high_engagement_notification?: boolean | null
          id?: string
          language?: string | null
          make_profile_public?: boolean | null
          post_published_notification?: boolean | null
          share_analytics?: boolean | null
          show_best_time_suggestions?: boolean | null
          theme?: string | null
          time_format?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
          weekly_report_notification?: boolean | null
        }
        Update: {
          auto_hashtag_suggestions?: boolean | null
          auto_save_drafts?: boolean | null
          campaign_milestone_notification?: boolean | null
          created_at?: string | null
          date_format?: string | null
          default_post_status?: string | null
          email_notifications?: boolean | null
          error_notification?: boolean | null
          high_engagement_notification?: boolean | null
          id?: string
          language?: string | null
          make_profile_public?: boolean | null
          post_published_notification?: boolean | null
          share_analytics?: boolean | null
          show_best_time_suggestions?: boolean | null
          theme?: string | null
          time_format?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
          weekly_report_notification?: boolean | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          account_status: string | null
          avatar_url: string | null
          backup_codes: string[] | null
          created_at: string | null
          email_verified: boolean | null
          full_name: string | null
          id: string
          last_login_at: string | null
          phone_number: string | null
          phone_verified: boolean | null
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_status?: string | null
          avatar_url?: string | null
          backup_codes?: string[] | null
          created_at?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_status?: string | null
          avatar_url?: string | null
          backup_codes?: string[] | null
          created_at?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      campaign_analytics_summary: {
        Row: {
          avg_ctr: number | null
          avg_engagement_rate: number | null
          campaign_id: string | null
          campaign_name: string | null
          first_metric_date: string | null
          last_metric_date: string | null
          platform: string | null
          total_clicks: number | null
          total_comments: number | null
          total_engagement: number | null
          total_impressions: number | null
          total_likes: number | null
          total_reach: number | null
          total_shares: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_performance_summary: {
        Row: {
          avg_ctr: number | null
          avg_engagement_rate: number | null
          campaigns_count: number | null
          metric_date: string | null
          posts_count: number | null
          total_clicks: number | null
          total_comments: number | null
          total_engagement: number | null
          total_impressions: number | null
          total_likes: number | null
          total_reach: number | null
          total_shares: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_ai_usage: {
        Args: {
          p_cost: number
          p_requests: number
          p_tokens: number
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "editor" | "viewer"
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
      app_role: ["owner", "admin", "editor", "viewer"],
      campaign_status: ["active", "paused", "draft"],
      campaign_trend: ["up", "down", "neutral"],
    },
  },
} as const
