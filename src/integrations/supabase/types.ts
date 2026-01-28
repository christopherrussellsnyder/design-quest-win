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
      ab_test_learning: {
        Row: {
          avg_confidence: number | null
          avg_improvement: number | null
          best_performing_day: number | null
          best_performing_time: string | null
          created_at: string | null
          id: string
          last_analyzed: string | null
          loss_count: number | null
          pattern_type: string
          pattern_value: string
          performance_trend: string | null
          platform: string
          sample_content: Json | null
          total_tests: number | null
          updated_at: string | null
          user_id: string
          win_count: number | null
        }
        Insert: {
          avg_confidence?: number | null
          avg_improvement?: number | null
          best_performing_day?: number | null
          best_performing_time?: string | null
          created_at?: string | null
          id?: string
          last_analyzed?: string | null
          loss_count?: number | null
          pattern_type: string
          pattern_value: string
          performance_trend?: string | null
          platform: string
          sample_content?: Json | null
          total_tests?: number | null
          updated_at?: string | null
          user_id: string
          win_count?: number | null
        }
        Update: {
          avg_confidence?: number | null
          avg_improvement?: number | null
          best_performing_day?: number | null
          best_performing_time?: string | null
          created_at?: string | null
          id?: string
          last_analyzed?: string | null
          loss_count?: number | null
          pattern_type?: string
          pattern_value?: string
          performance_trend?: string | null
          platform?: string
          sample_content?: Json | null
          total_tests?: number | null
          updated_at?: string | null
          user_id?: string
          win_count?: number | null
        }
        Relationships: []
      }
      ab_test_results: {
        Row: {
          ab_test_id: string | null
          comments: number | null
          content_length: number | null
          content_type: string | null
          conversions: number | null
          engagement: number | null
          engagement_rate: number | null
          has_media: boolean | null
          id: string
          impressions: number | null
          leads: number | null
          likes: number | null
          link_clicks: number | null
          media_type: string | null
          platform: string | null
          post_id: string | null
          posting_day: number | null
          posting_hour: number | null
          profile_views: number | null
          published_at: string | null
          reach: number | null
          reactions: Json | null
          recorded_at: string | null
          replies: number | null
          retweets: number | null
          saves: number | null
          shares: number | null
          variant_id: string | null
        }
        Insert: {
          ab_test_id?: string | null
          comments?: number | null
          content_length?: number | null
          content_type?: string | null
          conversions?: number | null
          engagement?: number | null
          engagement_rate?: number | null
          has_media?: boolean | null
          id?: string
          impressions?: number | null
          leads?: number | null
          likes?: number | null
          link_clicks?: number | null
          media_type?: string | null
          platform?: string | null
          post_id?: string | null
          posting_day?: number | null
          posting_hour?: number | null
          profile_views?: number | null
          published_at?: string | null
          reach?: number | null
          reactions?: Json | null
          recorded_at?: string | null
          replies?: number | null
          retweets?: number | null
          saves?: number | null
          shares?: number | null
          variant_id?: string | null
        }
        Update: {
          ab_test_id?: string | null
          comments?: number | null
          content_length?: number | null
          content_type?: string | null
          conversions?: number | null
          engagement?: number | null
          engagement_rate?: number | null
          has_media?: boolean | null
          id?: string
          impressions?: number | null
          leads?: number | null
          likes?: number | null
          link_clicks?: number | null
          media_type?: string | null
          platform?: string | null
          post_id?: string | null
          posting_day?: number | null
          posting_hour?: number | null
          profile_views?: number | null
          published_at?: string | null
          reach?: number | null
          reactions?: Json | null
          recorded_at?: string | null
          replies?: number | null
          retweets?: number | null
          saves?: number | null
          shares?: number | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_results_ab_test_id_fkey"
            columns: ["ab_test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_results_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "scheduled_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_results_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "ab_test_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_test_variants: {
        Row: {
          ab_test_id: string | null
          avg_engagement_rate: number | null
          content_template: string | null
          conversion_count: number | null
          conversion_rate: number | null
          created_at: string | null
          id: string
          is_control: boolean | null
          posts_published: number | null
          total_engagement: number | null
          total_impressions: number | null
          variable_value: Json | null
          variant_name: string
        }
        Insert: {
          ab_test_id?: string | null
          avg_engagement_rate?: number | null
          content_template?: string | null
          conversion_count?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          is_control?: boolean | null
          posts_published?: number | null
          total_engagement?: number | null
          total_impressions?: number | null
          variable_value?: Json | null
          variant_name: string
        }
        Update: {
          ab_test_id?: string | null
          avg_engagement_rate?: number | null
          content_template?: string | null
          conversion_count?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          is_control?: boolean | null
          posts_published?: number | null
          total_engagement?: number | null
          total_impressions?: number | null
          variable_value?: Json | null
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_variants_ab_test_id_fkey"
            columns: ["ab_test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_tests: {
        Row: {
          auto_optimize: boolean | null
          confidence_level: number | null
          created_at: string | null
          description: string | null
          end_date: string | null
          hypothesis: string | null
          id: string
          learning_applied: boolean | null
          minimum_sample_size: number | null
          name: string
          platform: string | null
          predicted_winner_id: string | null
          prediction_confidence: number | null
          results: Json | null
          start_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          variable_being_tested: string
          winner_variant_id: string | null
        }
        Insert: {
          auto_optimize?: boolean | null
          confidence_level?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          hypothesis?: string | null
          id?: string
          learning_applied?: boolean | null
          minimum_sample_size?: number | null
          name: string
          platform?: string | null
          predicted_winner_id?: string | null
          prediction_confidence?: number | null
          results?: Json | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          variable_being_tested: string
          winner_variant_id?: string | null
        }
        Update: {
          auto_optimize?: boolean | null
          confidence_level?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          hypothesis?: string | null
          id?: string
          learning_applied?: boolean | null
          minimum_sample_size?: number | null
          name?: string
          platform?: string | null
          predicted_winner_id?: string | null
          prediction_confidence?: number | null
          results?: Json | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          variable_being_tested?: string
          winner_variant_id?: string | null
        }
        Relationships: []
      }
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
      ai_conversations: {
        Row: {
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_generated_videos: {
        Row: {
          aspect_ratio: string
          avatar_type: string | null
          background_music: string | null
          completed_at: string | null
          created_at: string
          duration: number
          error_message: string | null
          generation_cost: number | null
          id: string
          metadata: Json | null
          processing_time_ms: number | null
          script: string
          status: string
          storage_path: string | null
          target_audience: string | null
          text_overlay_enabled: boolean | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          video_style: string
          video_url: string | null
        }
        Insert: {
          aspect_ratio?: string
          avatar_type?: string | null
          background_music?: string | null
          completed_at?: string | null
          created_at?: string
          duration?: number
          error_message?: string | null
          generation_cost?: number | null
          id?: string
          metadata?: Json | null
          processing_time_ms?: number | null
          script: string
          status?: string
          storage_path?: string | null
          target_audience?: string | null
          text_overlay_enabled?: boolean | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          video_style?: string
          video_url?: string | null
        }
        Update: {
          aspect_ratio?: string
          avatar_type?: string | null
          background_music?: string | null
          completed_at?: string | null
          created_at?: string
          duration?: number
          error_message?: string | null
          generation_cost?: number | null
          id?: string
          metadata?: Json | null
          processing_time_ms?: number | null
          script?: string
          status?: string
          storage_path?: string | null
          target_audience?: string | null
          text_overlay_enabled?: boolean | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          video_style?: string
          video_url?: string | null
        }
        Relationships: []
      }
      ai_generation_logs: {
        Row: {
          created_at: string | null
          id: string
          predicted_engagement: number | null
          prompt: string
          success_patterns_used: boolean | null
          top_variant: string | null
          user_id: string
          variations_generated: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          predicted_engagement?: number | null
          prompt: string
          success_patterns_used?: boolean | null
          top_variant?: string | null
          user_id: string
          variations_generated?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          predicted_engagement?: number | null
          prompt?: string
          success_patterns_used?: boolean | null
          top_variant?: string | null
          user_id?: string
          variations_generated?: number | null
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          attachments: Json | null
          content: string
          context_used: Json | null
          conversation_id: string
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          context_used?: Json | null
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          context_used?: Json | null
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
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
      audience_activity_patterns: {
        Row: {
          avg_engagement_rate: number | null
          day_of_week: number
          hour_of_day: number
          id: string
          last_calculated: string | null
          platform: string
          sample_size: number | null
          user_id: string
        }
        Insert: {
          avg_engagement_rate?: number | null
          day_of_week: number
          hour_of_day: number
          id?: string
          last_calculated?: string | null
          platform: string
          sample_size?: number | null
          user_id: string
        }
        Update: {
          avg_engagement_rate?: number | null
          day_of_week?: number
          hour_of_day?: number
          id?: string
          last_calculated?: string | null
          platform?: string
          sample_size?: number | null
          user_id?: string
        }
        Relationships: []
      }
      audience_insights: {
        Row: {
          analysis_date: string | null
          conversions: number | null
          cost_per_action: number | null
          created_at: string | null
          engagements: number | null
          id: string
          impressions: number | null
          insight_type: string
          is_top_performer: boolean | null
          performance_metrics: Json | null
          platform: string
          recommendation_score: number | null
          return_on_ad_spend: number | null
          targeting_parameters: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_date?: string | null
          conversions?: number | null
          cost_per_action?: number | null
          created_at?: string | null
          engagements?: number | null
          id?: string
          impressions?: number | null
          insight_type: string
          is_top_performer?: boolean | null
          performance_metrics?: Json | null
          platform: string
          recommendation_score?: number | null
          return_on_ad_spend?: number | null
          targeting_parameters?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_date?: string | null
          conversions?: number | null
          cost_per_action?: number | null
          created_at?: string | null
          engagements?: number | null
          id?: string
          impressions?: number | null
          insight_type?: string
          is_top_performer?: boolean | null
          performance_metrics?: Json | null
          platform?: string
          recommendation_score?: number | null
          return_on_ad_spend?: number | null
          targeting_parameters?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      auto_ab_tests: {
        Row: {
          ab_test_id: string | null
          auto_pause_enabled: boolean | null
          auto_winner_select: boolean | null
          budget_reallocation: Json | null
          created_at: string | null
          created_by_system: boolean | null
          id: string
          min_impressions_before_pause: number | null
          performance_threshold: number | null
          status: string | null
          trigger_reason: string | null
          underperforming_paused_at: string | null
        }
        Insert: {
          ab_test_id?: string | null
          auto_pause_enabled?: boolean | null
          auto_winner_select?: boolean | null
          budget_reallocation?: Json | null
          created_at?: string | null
          created_by_system?: boolean | null
          id?: string
          min_impressions_before_pause?: number | null
          performance_threshold?: number | null
          status?: string | null
          trigger_reason?: string | null
          underperforming_paused_at?: string | null
        }
        Update: {
          ab_test_id?: string | null
          auto_pause_enabled?: boolean | null
          auto_winner_select?: boolean | null
          budget_reallocation?: Json | null
          created_at?: string | null
          created_by_system?: boolean | null
          id?: string
          min_impressions_before_pause?: number | null
          performance_threshold?: number | null
          status?: string | null
          trigger_reason?: string | null
          underperforming_paused_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auto_ab_tests_ab_test_id_fkey"
            columns: ["ab_test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_schedule_preferences: {
        Row: {
          auto_fill_queue: boolean | null
          avoid_nights: boolean | null
          avoid_weekends: boolean | null
          created_at: string | null
          custom_time_restrictions: Json | null
          enabled: boolean | null
          id: string
          min_hours_between_posts: number | null
          posts_per_day: number | null
          posts_per_week: number | null
          preferred_platforms: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_fill_queue?: boolean | null
          avoid_nights?: boolean | null
          avoid_weekends?: boolean | null
          created_at?: string | null
          custom_time_restrictions?: Json | null
          enabled?: boolean | null
          id?: string
          min_hours_between_posts?: number | null
          posts_per_day?: number | null
          posts_per_week?: number | null
          preferred_platforms?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_fill_queue?: boolean | null
          avoid_nights?: boolean | null
          avoid_weekends?: boolean | null
          created_at?: string | null
          custom_time_restrictions?: Json | null
          enabled?: boolean | null
          id?: string
          min_hours_between_posts?: number | null
          posts_per_day?: number | null
          posts_per_week?: number | null
          preferred_platforms?: string[] | null
          updated_at?: string | null
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
      business_context: {
        Row: {
          analyzed_at: string | null
          business_profile: Json | null
          id: string
          is_active: boolean | null
          last_updated: string | null
          scraped_pages: Json | null
          user_id: string
          website_url: string
        }
        Insert: {
          analyzed_at?: string | null
          business_profile?: Json | null
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          scraped_pages?: Json | null
          user_id: string
          website_url: string
        }
        Update: {
          analyzed_at?: string | null
          business_profile?: Json | null
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          scraped_pages?: Json | null
          user_id?: string
          website_url?: string
        }
        Relationships: []
      }
      business_information: {
        Row: {
          available_content_types: Json | null
          avg_post_engagement_rate: number | null
          best_performing_content_types: Json | null
          brand_values: Json | null
          brand_voice_traits: Json | null
          business_name: string | null
          business_stage: string | null
          business_type: string | null
          buying_behavior: string | null
          company_size: string | null
          competitive_advantage: string | null
          content_creation_frequency: string | null
          content_restrictions: string | null
          content_themes: Json | null
          created_at: string | null
          current_conversion_rate: number | null
          customer_acquisition_cost: number | null
          customer_lifetime_value: number | null
          customer_pain_points: string | null
          education_levels: Json | null
          email_subscriber_count: number | null
          gender_distribution: Json | null
          geographic_focus: Json | null
          id: string
          income_level: string | null
          industry: string | null
          location: string | null
          monthly_revenue_range: string | null
          monthly_website_visitors: number | null
          photography_style: string | null
          primary_brand_color: string | null
          primary_products_services: string | null
          professional_photos_count: number | null
          secondary_brand_color: string | null
          target_age_max: number | null
          target_age_min: number | null
          testimonials_count: number | null
          tone_formal_casual: number | null
          tone_informative_entertaining: number | null
          tone_serious_playful: number | null
          top_competitors: Json | null
          total_social_followers: number | null
          unique_value_proposition: string | null
          updated_at: string | null
          user_id: string
          video_production_capability: string | null
          videos_available_count: number | null
          website: string | null
          years_in_business: number | null
        }
        Insert: {
          available_content_types?: Json | null
          avg_post_engagement_rate?: number | null
          best_performing_content_types?: Json | null
          brand_values?: Json | null
          brand_voice_traits?: Json | null
          business_name?: string | null
          business_stage?: string | null
          business_type?: string | null
          buying_behavior?: string | null
          company_size?: string | null
          competitive_advantage?: string | null
          content_creation_frequency?: string | null
          content_restrictions?: string | null
          content_themes?: Json | null
          created_at?: string | null
          current_conversion_rate?: number | null
          customer_acquisition_cost?: number | null
          customer_lifetime_value?: number | null
          customer_pain_points?: string | null
          education_levels?: Json | null
          email_subscriber_count?: number | null
          gender_distribution?: Json | null
          geographic_focus?: Json | null
          id?: string
          income_level?: string | null
          industry?: string | null
          location?: string | null
          monthly_revenue_range?: string | null
          monthly_website_visitors?: number | null
          photography_style?: string | null
          primary_brand_color?: string | null
          primary_products_services?: string | null
          professional_photos_count?: number | null
          secondary_brand_color?: string | null
          target_age_max?: number | null
          target_age_min?: number | null
          testimonials_count?: number | null
          tone_formal_casual?: number | null
          tone_informative_entertaining?: number | null
          tone_serious_playful?: number | null
          top_competitors?: Json | null
          total_social_followers?: number | null
          unique_value_proposition?: string | null
          updated_at?: string | null
          user_id: string
          video_production_capability?: string | null
          videos_available_count?: number | null
          website?: string | null
          years_in_business?: number | null
        }
        Update: {
          available_content_types?: Json | null
          avg_post_engagement_rate?: number | null
          best_performing_content_types?: Json | null
          brand_values?: Json | null
          brand_voice_traits?: Json | null
          business_name?: string | null
          business_stage?: string | null
          business_type?: string | null
          buying_behavior?: string | null
          company_size?: string | null
          competitive_advantage?: string | null
          content_creation_frequency?: string | null
          content_restrictions?: string | null
          content_themes?: Json | null
          created_at?: string | null
          current_conversion_rate?: number | null
          customer_acquisition_cost?: number | null
          customer_lifetime_value?: number | null
          customer_pain_points?: string | null
          education_levels?: Json | null
          email_subscriber_count?: number | null
          gender_distribution?: Json | null
          geographic_focus?: Json | null
          id?: string
          income_level?: string | null
          industry?: string | null
          location?: string | null
          monthly_revenue_range?: string | null
          monthly_website_visitors?: number | null
          photography_style?: string | null
          primary_brand_color?: string | null
          primary_products_services?: string | null
          professional_photos_count?: number | null
          secondary_brand_color?: string | null
          target_age_max?: number | null
          target_age_min?: number | null
          testimonials_count?: number | null
          tone_formal_casual?: number | null
          tone_informative_entertaining?: number | null
          tone_serious_playful?: number | null
          top_competitors?: Json | null
          total_social_followers?: number | null
          unique_value_proposition?: string | null
          updated_at?: string | null
          user_id?: string
          video_production_capability?: string | null
          videos_available_count?: number | null
          website?: string | null
          years_in_business?: number | null
        }
        Relationships: []
      }
      business_profiles: {
        Row: {
          average_order_value: number | null
          business_goals: string[] | null
          business_name: string | null
          competitor_names: string[] | null
          created_at: string | null
          id: string
          industry: string | null
          niche: string | null
          price_point: string | null
          products_services: string | null
          target_age_max: number | null
          target_age_min: number | null
          target_genders: string[] | null
          target_interests: string[] | null
          target_locations: string[] | null
          unique_selling_points: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_order_value?: number | null
          business_goals?: string[] | null
          business_name?: string | null
          competitor_names?: string[] | null
          created_at?: string | null
          id?: string
          industry?: string | null
          niche?: string | null
          price_point?: string | null
          products_services?: string | null
          target_age_max?: number | null
          target_age_min?: number | null
          target_genders?: string[] | null
          target_interests?: string[] | null
          target_locations?: string[] | null
          unique_selling_points?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_order_value?: number | null
          business_goals?: string[] | null
          business_name?: string | null
          competitor_names?: string[] | null
          created_at?: string | null
          id?: string
          industry?: string | null
          niche?: string | null
          price_point?: string | null
          products_services?: string | null
          target_age_max?: number | null
          target_age_min?: number | null
          target_genders?: string[] | null
          target_interests?: string[] | null
          target_locations?: string[] | null
          unique_selling_points?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      campaign_ai_strategies: {
        Row: {
          business_profile_id: string | null
          campaign_id: string | null
          confidence_score: number | null
          created_at: string | null
          generation_progress: number | null
          generation_status: string | null
          id: string
          niche: string | null
          objective: string | null
          platform: string
          posts_generated: number | null
          predicted_metrics: Json | null
          strategy_data: Json
          total_posts: number | null
          updated_at: string | null
          user_id: string
          weekly_themes: Json | null
        }
        Insert: {
          business_profile_id?: string | null
          campaign_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          generation_progress?: number | null
          generation_status?: string | null
          id?: string
          niche?: string | null
          objective?: string | null
          platform: string
          posts_generated?: number | null
          predicted_metrics?: Json | null
          strategy_data?: Json
          total_posts?: number | null
          updated_at?: string | null
          user_id: string
          weekly_themes?: Json | null
        }
        Update: {
          business_profile_id?: string | null
          campaign_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          generation_progress?: number | null
          generation_status?: string | null
          id?: string
          niche?: string | null
          objective?: string | null
          platform?: string
          posts_generated?: number | null
          predicted_metrics?: Json | null
          strategy_data?: Json
          total_posts?: number | null
          updated_at?: string | null
          user_id?: string
          weekly_themes?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_ai_strategies_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_ai_strategies_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_content_calendar: {
        Row: {
          actual_performance_metrics: Json | null
          campaign_id: string | null
          content_body: string | null
          content_cta: string | null
          content_hook: string | null
          content_theme: string | null
          content_type: string | null
          created_at: string | null
          day_number: number
          expected_engagement_score: number | null
          hashtags: string[] | null
          id: string
          media_suggestions: string | null
          ml_confidence_score: number | null
          platform: string
          platform_specific_tips: string[] | null
          post_date: string | null
          post_status: string | null
          post_time_recommended: string | null
          reasoning: string | null
          target_audience_segment: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_performance_metrics?: Json | null
          campaign_id?: string | null
          content_body?: string | null
          content_cta?: string | null
          content_hook?: string | null
          content_theme?: string | null
          content_type?: string | null
          created_at?: string | null
          day_number: number
          expected_engagement_score?: number | null
          hashtags?: string[] | null
          id?: string
          media_suggestions?: string | null
          ml_confidence_score?: number | null
          platform: string
          platform_specific_tips?: string[] | null
          post_date?: string | null
          post_status?: string | null
          post_time_recommended?: string | null
          reasoning?: string | null
          target_audience_segment?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_performance_metrics?: Json | null
          campaign_id?: string | null
          content_body?: string | null
          content_cta?: string | null
          content_hook?: string | null
          content_theme?: string | null
          content_type?: string | null
          created_at?: string | null
          day_number?: number
          expected_engagement_score?: number | null
          hashtags?: string[] | null
          id?: string
          media_suggestions?: string | null
          ml_confidence_score?: number | null
          platform?: string
          platform_specific_tips?: string[] | null
          post_date?: string | null
          post_status?: string | null
          post_time_recommended?: string | null
          reasoning?: string | null
          target_audience_segment?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_content_calendar_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
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
      campaign_performance_tracking: {
        Row: {
          campaign_id: string | null
          content_type_breakdown: Json | null
          created_at: string | null
          engagement_rate: number | null
          goal_progress: Json | null
          id: string
          optimization_suggestions: Json | null
          platform_breakdown: Json | null
          posts_published: number | null
          timing_breakdown: Json | null
          top_performing_posts: Json | null
          total_engagement: number | null
          total_impressions: number | null
          tracked_date: string
          underperforming_posts: Json | null
        }
        Insert: {
          campaign_id?: string | null
          content_type_breakdown?: Json | null
          created_at?: string | null
          engagement_rate?: number | null
          goal_progress?: Json | null
          id?: string
          optimization_suggestions?: Json | null
          platform_breakdown?: Json | null
          posts_published?: number | null
          timing_breakdown?: Json | null
          top_performing_posts?: Json | null
          total_engagement?: number | null
          total_impressions?: number | null
          tracked_date?: string
          underperforming_posts?: Json | null
        }
        Update: {
          campaign_id?: string | null
          content_type_breakdown?: Json | null
          created_at?: string | null
          engagement_rate?: number | null
          goal_progress?: Json | null
          id?: string
          optimization_suggestions?: Json | null
          platform_breakdown?: Json | null
          posts_published?: number | null
          timing_breakdown?: Json | null
          top_performing_posts?: Json | null
          total_engagement?: number | null
          total_impressions?: number | null
          tracked_date?: string
          underperforming_posts?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_performance_tracking_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_strategy_requests: {
        Row: {
          additional_platforms: Json | null
          budget_range: string | null
          campaign_differentiation: string | null
          campaign_themes: Json | null
          created_at: string | null
          duration_days: number
          generated_strategy_id: string | null
          id: string
          primary_goal: string
          primary_platform: string
          seasonal_details: string | null
          seasonal_type: string | null
          secondary_goals: Json | null
          special_requirements: string | null
          start_date: string
          status: string
          target_conversions: number | null
          target_engagement_rate: number | null
          target_followers: number | null
          target_impressions: number | null
          updated_at: string | null
          urgency_level: string
          user_id: string
        }
        Insert: {
          additional_platforms?: Json | null
          budget_range?: string | null
          campaign_differentiation?: string | null
          campaign_themes?: Json | null
          created_at?: string | null
          duration_days?: number
          generated_strategy_id?: string | null
          id?: string
          primary_goal: string
          primary_platform: string
          seasonal_details?: string | null
          seasonal_type?: string | null
          secondary_goals?: Json | null
          special_requirements?: string | null
          start_date: string
          status?: string
          target_conversions?: number | null
          target_engagement_rate?: number | null
          target_followers?: number | null
          target_impressions?: number | null
          updated_at?: string | null
          urgency_level?: string
          user_id: string
        }
        Update: {
          additional_platforms?: Json | null
          budget_range?: string | null
          campaign_differentiation?: string | null
          campaign_themes?: Json | null
          created_at?: string | null
          duration_days?: number
          generated_strategy_id?: string | null
          id?: string
          primary_goal?: string
          primary_platform?: string
          seasonal_details?: string | null
          seasonal_type?: string | null
          secondary_goals?: Json | null
          special_requirements?: string | null
          start_date?: string
          status?: string
          target_conversions?: number | null
          target_engagement_rate?: number | null
          target_followers?: number | null
          target_impressions?: number | null
          updated_at?: string | null
          urgency_level?: string
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
          actual_vs_predicted: Json | null
          budget: number | null
          created_at: string
          daily_limit: number | null
          description: string | null
          end_date: string | null
          estimated_reach: number | null
          goals: Json | null
          id: string
          learning_applied: boolean | null
          name: string
          niche: string | null
          objective: string | null
          optimization_score: number | null
          platform: string
          post_campaign_learnings: Json | null
          predicted_conversions: number | null
          predicted_performance: Json | null
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
          actual_vs_predicted?: Json | null
          budget?: number | null
          created_at?: string
          daily_limit?: number | null
          description?: string | null
          end_date?: string | null
          estimated_reach?: number | null
          goals?: Json | null
          id?: string
          learning_applied?: boolean | null
          name: string
          niche?: string | null
          objective?: string | null
          optimization_score?: number | null
          platform: string
          post_campaign_learnings?: Json | null
          predicted_conversions?: number | null
          predicted_performance?: Json | null
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
          actual_vs_predicted?: Json | null
          budget?: number | null
          created_at?: string
          daily_limit?: number | null
          description?: string | null
          end_date?: string | null
          estimated_reach?: number | null
          goals?: Json | null
          id?: string
          learning_applied?: boolean | null
          name?: string
          niche?: string | null
          objective?: string | null
          optimization_score?: number | null
          platform?: string
          post_campaign_learnings?: Json | null
          predicted_conversions?: number | null
          predicted_performance?: Json | null
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
      campaigns_learning: {
        Row: {
          applies_to_future: boolean | null
          campaign_id: string | null
          confidence_level: string | null
          conversions_total: number | null
          cpc: number | null
          cpm: number | null
          created_at: string | null
          engagement_total: number | null
          extracted_at: string | null
          id: string
          impressions_total: number | null
          learning_type: string
          niche: string | null
          notes: string | null
          pattern_value: string
          performance_impact: number | null
          platform: string
          roas: number | null
          sample_size: number | null
          user_id: string
        }
        Insert: {
          applies_to_future?: boolean | null
          campaign_id?: string | null
          confidence_level?: string | null
          conversions_total?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string | null
          engagement_total?: number | null
          extracted_at?: string | null
          id?: string
          impressions_total?: number | null
          learning_type: string
          niche?: string | null
          notes?: string | null
          pattern_value: string
          performance_impact?: number | null
          platform: string
          roas?: number | null
          sample_size?: number | null
          user_id: string
        }
        Update: {
          applies_to_future?: boolean | null
          campaign_id?: string | null
          confidence_level?: string | null
          conversions_total?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string | null
          engagement_total?: number | null
          extracted_at?: string | null
          id?: string
          impressions_total?: number | null
          learning_type?: string
          niche?: string | null
          notes?: string | null
          pattern_value?: string
          performance_impact?: number | null
          platform?: string
          roas?: number | null
          sample_size?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_learning_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_benchmarks: {
        Row: {
          avg_engagement_rate: number | null
          avg_post_length: number | null
          avg_posts_per_week: number | null
          benchmark_date: string
          competitor_id: string | null
          content_type_breakdown: Json | null
          created_at: string | null
          id: string
          platform: string
          posting_times: Json | null
          strengths: string[] | null
          top_hashtags: string[] | null
          user_id: string
          weaknesses: string[] | null
        }
        Insert: {
          avg_engagement_rate?: number | null
          avg_post_length?: number | null
          avg_posts_per_week?: number | null
          benchmark_date?: string
          competitor_id?: string | null
          content_type_breakdown?: Json | null
          created_at?: string | null
          id?: string
          platform: string
          posting_times?: Json | null
          strengths?: string[] | null
          top_hashtags?: string[] | null
          user_id: string
          weaknesses?: string[] | null
        }
        Update: {
          avg_engagement_rate?: number | null
          avg_post_length?: number | null
          avg_posts_per_week?: number | null
          benchmark_date?: string
          competitor_id?: string | null
          content_type_breakdown?: Json | null
          created_at?: string | null
          id?: string
          platform?: string
          posting_times?: Json | null
          strengths?: string[] | null
          top_hashtags?: string[] | null
          user_id?: string
          weaknesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_benchmarks_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      competitors: {
        Row: {
          created_at: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          name: string
          notes: string | null
          social_handles: Json | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          name: string
          notes?: string | null
          social_handles?: Json | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          name?: string
          notes?: string | null
          social_handles?: Json | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      connected_accounts: {
        Row: {
          access_token: string | null
          connected_at: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          metadata: Json | null
          platform: string
          platform_profile_url: string | null
          platform_user_id: string | null
          platform_username: string | null
          refresh_token: string | null
          scope: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          connected_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          metadata?: Json | null
          platform: string
          platform_profile_url?: string | null
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token?: string | null
          scope?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          connected_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          metadata?: Json | null
          platform?: string
          platform_profile_url?: string | null
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token?: string | null
          scope?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      content_embeddings: {
        Row: {
          content_text: string
          created_at: string | null
          embedding_vector: number[]
          id: string
          key_phrases: string[] | null
          post_id: string | null
          readability_score: number | null
          sentence_count: number | null
          sentiment_label: string | null
          sentiment_score: number | null
          topic_tags: string[] | null
          user_id: string
          virality_score: number | null
          word_count: number | null
        }
        Insert: {
          content_text: string
          created_at?: string | null
          embedding_vector: number[]
          id?: string
          key_phrases?: string[] | null
          post_id?: string | null
          readability_score?: number | null
          sentence_count?: number | null
          sentiment_label?: string | null
          sentiment_score?: number | null
          topic_tags?: string[] | null
          user_id: string
          virality_score?: number | null
          word_count?: number | null
        }
        Update: {
          content_text?: string
          created_at?: string | null
          embedding_vector?: number[]
          id?: string
          key_phrases?: string[] | null
          post_id?: string | null
          readability_score?: number | null
          sentence_count?: number | null
          sentiment_label?: string | null
          sentiment_score?: number | null
          topic_tags?: string[] | null
          user_id?: string
          virality_score?: number | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_embeddings_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "scheduled_posts"
            referencedColumns: ["id"]
          },
        ]
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
      content_improvement_history: {
        Row: {
          applied: boolean | null
          created_at: string | null
          id: string
          improved_content: string
          improved_score: number | null
          improvement_type: string
          original_content: string
          original_score: number | null
          score_improvement: number | null
          user_id: string
        }
        Insert: {
          applied?: boolean | null
          created_at?: string | null
          id?: string
          improved_content: string
          improved_score?: number | null
          improvement_type: string
          original_content: string
          original_score?: number | null
          score_improvement?: number | null
          user_id: string
        }
        Update: {
          applied?: boolean | null
          created_at?: string | null
          id?: string
          improved_content?: string
          improved_score?: number | null
          improvement_type?: string
          original_content?: string
          original_score?: number | null
          score_improvement?: number | null
          user_id?: string
        }
        Relationships: []
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
      content_performance_patterns: {
        Row: {
          avg_engagement_rate: number | null
          created_at: string | null
          id: string
          last_calculated: string | null
          pattern_type: string
          pattern_value: string
          performance_score: number | null
          platform: string
          post_count: number | null
          sample_posts: Json | null
          total_engagement: number | null
          total_impressions: number | null
          user_id: string
        }
        Insert: {
          avg_engagement_rate?: number | null
          created_at?: string | null
          id?: string
          last_calculated?: string | null
          pattern_type: string
          pattern_value: string
          performance_score?: number | null
          platform: string
          post_count?: number | null
          sample_posts?: Json | null
          total_engagement?: number | null
          total_impressions?: number | null
          user_id: string
        }
        Update: {
          avg_engagement_rate?: number | null
          created_at?: string | null
          id?: string
          last_calculated?: string | null
          pattern_type?: string
          pattern_value?: string
          performance_score?: number | null
          platform?: string
          post_count?: number | null
          sample_posts?: Json | null
          total_engagement?: number | null
          total_impressions?: number | null
          user_id?: string
        }
        Relationships: []
      }
      content_strategies: {
        Row: {
          content_mix: Json | null
          conversation_id: string | null
          created_at: string | null
          duration_days: number
          end_date: string
          goals: Json | null
          id: string
          platform: string | null
          predicted_metrics: Json | null
          start_date: string
          title: string
          user_id: string
        }
        Insert: {
          content_mix?: Json | null
          conversation_id?: string | null
          created_at?: string | null
          duration_days: number
          end_date: string
          goals?: Json | null
          id?: string
          platform?: string | null
          predicted_metrics?: Json | null
          start_date: string
          title: string
          user_id: string
        }
        Update: {
          content_mix?: Json | null
          conversation_id?: string | null
          created_at?: string | null
          duration_days?: number
          end_date?: string
          goals?: Json | null
          id?: string
          platform?: string | null
          predicted_metrics?: Json | null
          start_date?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_strategies_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement_predictions: {
        Row: {
          actual_engagement_rate: number | null
          actual_impressions: number | null
          content: string
          created_at: string | null
          id: string
          platform: string
          post_id: string | null
          predicted_engagement_rate: number | null
          predicted_impressions: number | null
          predicted_score: number
          prediction_accuracy: number | null
          score_factors: Json | null
          user_id: string
        }
        Insert: {
          actual_engagement_rate?: number | null
          actual_impressions?: number | null
          content: string
          created_at?: string | null
          id?: string
          platform: string
          post_id?: string | null
          predicted_engagement_rate?: number | null
          predicted_impressions?: number | null
          predicted_score: number
          prediction_accuracy?: number | null
          score_factors?: Json | null
          user_id: string
        }
        Update: {
          actual_engagement_rate?: number | null
          actual_impressions?: number | null
          content?: string
          created_at?: string | null
          id?: string
          platform?: string
          post_id?: string | null
          predicted_engagement_rate?: number | null
          predicted_impressions?: number | null
          predicted_score?: number
          prediction_accuracy?: number | null
          score_factors?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "engagement_predictions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "scheduled_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_benchmarks: {
        Row: {
          avg_engagement_rate: number
          avg_follower_growth: number | null
          avg_posts_per_week: number
          benchmark_month: string
          created_at: string | null
          id: string
          industry: string
          platform: string
          sample_size: number | null
          top_content_types: Json | null
        }
        Insert: {
          avg_engagement_rate: number
          avg_follower_growth?: number | null
          avg_posts_per_week: number
          benchmark_month: string
          created_at?: string | null
          id?: string
          industry: string
          platform: string
          sample_size?: number | null
          top_content_types?: Json | null
        }
        Update: {
          avg_engagement_rate?: number
          avg_follower_growth?: number | null
          avg_posts_per_week?: number
          benchmark_month?: string
          created_at?: string | null
          id?: string
          industry?: string
          platform?: string
          sample_size?: number | null
          top_content_types?: Json | null
        }
        Relationships: []
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
      ml_model_versions: {
        Row: {
          accuracy_score: number | null
          feature_importance: Json | null
          id: string
          is_active: boolean | null
          mean_absolute_error: number | null
          model_parameters: Json | null
          model_version: string
          trained_at: string | null
          training_samples: number | null
          user_id: string
        }
        Insert: {
          accuracy_score?: number | null
          feature_importance?: Json | null
          id?: string
          is_active?: boolean | null
          mean_absolute_error?: number | null
          model_parameters?: Json | null
          model_version: string
          trained_at?: string | null
          training_samples?: number | null
          user_id: string
        }
        Update: {
          accuracy_score?: number | null
          feature_importance?: Json | null
          id?: string
          is_active?: boolean | null
          mean_absolute_error?: number | null
          model_parameters?: Json | null
          model_version?: string
          trained_at?: string | null
          training_samples?: number | null
          user_id?: string
        }
        Relationships: []
      }
      ml_predictions_cache: {
        Row: {
          created_at: string | null
          day_of_week: number
          expires_at: string | null
          feature_values: Json | null
          hour_of_day: number
          id: string
          model_version_id: string | null
          platform: string | null
          predicted_engagement_rate: number | null
          prediction_confidence: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          expires_at?: string | null
          feature_values?: Json | null
          hour_of_day: number
          id?: string
          model_version_id?: string | null
          platform?: string | null
          predicted_engagement_rate?: number | null
          prediction_confidence?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          expires_at?: string | null
          feature_values?: Json | null
          hour_of_day?: number
          id?: string
          model_version_id?: string | null
          platform?: string | null
          predicted_engagement_rate?: number | null
          prediction_confidence?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ml_predictions_cache_model_version_id_fkey"
            columns: ["model_version_id"]
            isOneToOne: false
            referencedRelation: "ml_model_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      ml_training_data: {
        Row: {
          content_length: number | null
          created_at: string | null
          day_of_week: number
          emoji_count: number | null
          engagement_rate: number | null
          has_image: boolean | null
          has_media: boolean | null
          has_question: boolean | null
          has_video: boolean | null
          hashtag_count: number | null
          hour_of_day: number
          id: string
          impressions: number | null
          is_holiday: boolean | null
          is_weekend: boolean | null
          month: number
          platform: string | null
          post_id: string | null
          season: string | null
          total_engagement: number | null
          user_id: string
          weather_condition: string | null
        }
        Insert: {
          content_length?: number | null
          created_at?: string | null
          day_of_week: number
          emoji_count?: number | null
          engagement_rate?: number | null
          has_image?: boolean | null
          has_media?: boolean | null
          has_question?: boolean | null
          has_video?: boolean | null
          hashtag_count?: number | null
          hour_of_day: number
          id?: string
          impressions?: number | null
          is_holiday?: boolean | null
          is_weekend?: boolean | null
          month: number
          platform?: string | null
          post_id?: string | null
          season?: string | null
          total_engagement?: number | null
          user_id: string
          weather_condition?: string | null
        }
        Update: {
          content_length?: number | null
          created_at?: string | null
          day_of_week?: number
          emoji_count?: number | null
          engagement_rate?: number | null
          has_image?: boolean | null
          has_media?: boolean | null
          has_question?: boolean | null
          has_video?: boolean | null
          hashtag_count?: number | null
          hour_of_day?: number
          id?: string
          impressions?: number | null
          is_holiday?: boolean | null
          is_weekend?: boolean | null
          month?: number
          platform?: string | null
          post_id?: string | null
          season?: string | null
          total_engagement?: number | null
          user_id?: string
          weather_condition?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ml_training_data_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "scheduled_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      niche_strategies: {
        Row: {
          avg_engagement_benchmark: number | null
          best_practices: string[] | null
          created_at: string | null
          id: string
          messaging_themes: string[] | null
          niche: string
          optimal_content_mix: Json | null
          platform: string
          priority_score: number | null
          recommended_content_types: string[] | null
          recommended_posting_frequency: string | null
          sample_strategies: Json | null
          success_rate: number | null
          updated_at: string | null
        }
        Insert: {
          avg_engagement_benchmark?: number | null
          best_practices?: string[] | null
          created_at?: string | null
          id?: string
          messaging_themes?: string[] | null
          niche: string
          optimal_content_mix?: Json | null
          platform: string
          priority_score?: number | null
          recommended_content_types?: string[] | null
          recommended_posting_frequency?: string | null
          sample_strategies?: Json | null
          success_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_engagement_benchmark?: number | null
          best_practices?: string[] | null
          created_at?: string | null
          id?: string
          messaging_themes?: string[] | null
          niche?: string
          optimal_content_mix?: Json | null
          platform?: string
          priority_score?: number | null
          recommended_content_types?: string[] | null
          recommended_posting_frequency?: string | null
          sample_strategies?: Json | null
          success_rate?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      optimization_actions: {
        Row: {
          action_data: Json
          action_type: string
          created_at: string | null
          executed_at: string | null
          id: string
          result: Json | null
          rule_id: string | null
          status: string | null
          triggered_by: string | null
          user_id: string
        }
        Insert: {
          action_data: Json
          action_type: string
          created_at?: string | null
          executed_at?: string | null
          id?: string
          result?: Json | null
          rule_id?: string | null
          status?: string | null
          triggered_by?: string | null
          user_id: string
        }
        Update: {
          action_data?: Json
          action_type?: string
          created_at?: string | null
          executed_at?: string | null
          id?: string
          result?: Json | null
          rule_id?: string | null
          status?: string | null
          triggered_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "optimization_actions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "optimization_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      optimization_rules: {
        Row: {
          action: Json
          condition: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          last_triggered: string | null
          priority: number | null
          rule_name: string
          rule_type: string
          success_count: number | null
          trigger_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action: Json
          condition: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered?: string | null
          priority?: number | null
          rule_name: string
          rule_type: string
          success_count?: number | null
          trigger_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action?: Json
          condition?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered?: string | null
          priority?: number | null
          rule_name?: string
          rule_type?: string
          success_count?: number | null
          trigger_count?: number | null
          updated_at?: string | null
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
      performance_monitoring: {
        Row: {
          alert_sent: boolean | null
          baseline_value: number | null
          id: string
          metric_name: string
          metric_value: number
          monitored_at: string | null
          status: string | null
          threshold_max: number | null
          threshold_min: number | null
          user_id: string
        }
        Insert: {
          alert_sent?: boolean | null
          baseline_value?: number | null
          id?: string
          metric_name: string
          metric_value: number
          monitored_at?: string | null
          status?: string | null
          threshold_max?: number | null
          threshold_min?: number | null
          user_id: string
        }
        Update: {
          alert_sent?: boolean | null
          baseline_value?: number | null
          id?: string
          metric_name?: string
          metric_value?: number
          monitored_at?: string | null
          status?: string | null
          threshold_max?: number | null
          threshold_min?: number | null
          user_id?: string
        }
        Relationships: []
      }
      platform_niche_benchmarks: {
        Row: {
          avg_cpc: number | null
          avg_cpm: number | null
          avg_ctr: number | null
          avg_engagement_rate: number | null
          avg_roas: number | null
          created_at: string | null
          id: string
          last_updated: string | null
          niche: string
          optimal_posting_days: number[] | null
          optimal_posting_times: number[] | null
          platform: string
          recommended_post_frequency: string | null
          sample_size: number | null
          top_content_types: string[] | null
        }
        Insert: {
          avg_cpc?: number | null
          avg_cpm?: number | null
          avg_ctr?: number | null
          avg_engagement_rate?: number | null
          avg_roas?: number | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          niche: string
          optimal_posting_days?: number[] | null
          optimal_posting_times?: number[] | null
          platform: string
          recommended_post_frequency?: string | null
          sample_size?: number | null
          top_content_types?: string[] | null
        }
        Update: {
          avg_cpc?: number | null
          avg_cpm?: number | null
          avg_ctr?: number | null
          avg_engagement_rate?: number | null
          avg_roas?: number | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          niche?: string
          optimal_posting_days?: number[] | null
          optimal_posting_times?: number[] | null
          platform?: string
          recommended_post_frequency?: string | null
          sample_size?: number | null
          top_content_types?: string[] | null
        }
        Relationships: []
      }
      platform_performance_benchmarks: {
        Row: {
          avg_comments: number | null
          avg_ctr: number | null
          avg_engagement_rate: number | null
          avg_likes: number | null
          avg_reach: number | null
          avg_shares: number | null
          best_content_length_range: Json | null
          content_type: string
          created_at: string | null
          id: string
          last_calculated: string | null
          optimal_posting_days: number[] | null
          optimal_posting_hours: number[] | null
          platform: string
          sample_size: number | null
          top_performing_ctas: string[] | null
          top_performing_hashtags: string[] | null
          user_id: string
        }
        Insert: {
          avg_comments?: number | null
          avg_ctr?: number | null
          avg_engagement_rate?: number | null
          avg_likes?: number | null
          avg_reach?: number | null
          avg_shares?: number | null
          best_content_length_range?: Json | null
          content_type: string
          created_at?: string | null
          id?: string
          last_calculated?: string | null
          optimal_posting_days?: number[] | null
          optimal_posting_hours?: number[] | null
          platform: string
          sample_size?: number | null
          top_performing_ctas?: string[] | null
          top_performing_hashtags?: string[] | null
          user_id: string
        }
        Update: {
          avg_comments?: number | null
          avg_ctr?: number | null
          avg_engagement_rate?: number | null
          avg_likes?: number | null
          avg_reach?: number | null
          avg_shares?: number | null
          best_content_length_range?: Json | null
          content_type?: string
          created_at?: string | null
          id?: string
          last_calculated?: string | null
          optimal_posting_days?: number[] | null
          optimal_posting_hours?: number[] | null
          platform?: string
          sample_size?: number | null
          top_performing_ctas?: string[] | null
          top_performing_hashtags?: string[] | null
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
      strategy_posts: {
        Row: {
          caption: string
          cta: string | null
          day_number: number
          hashtags: string[] | null
          hook: string | null
          id: string
          post_date: string
          post_time: string | null
          post_type: string | null
          predicted_engagement: number | null
          predicted_reach: number | null
          rationale: string | null
          sort_order: number | null
          strategy_id: string
          theme: string | null
        }
        Insert: {
          caption: string
          cta?: string | null
          day_number: number
          hashtags?: string[] | null
          hook?: string | null
          id?: string
          post_date: string
          post_time?: string | null
          post_type?: string | null
          predicted_engagement?: number | null
          predicted_reach?: number | null
          rationale?: string | null
          sort_order?: number | null
          strategy_id: string
          theme?: string | null
        }
        Update: {
          caption?: string
          cta?: string | null
          day_number?: number
          hashtags?: string[] | null
          hook?: string | null
          id?: string
          post_date?: string
          post_time?: string | null
          post_type?: string | null
          predicted_engagement?: number | null
          predicted_reach?: number | null
          rationale?: string | null
          sort_order?: number | null
          strategy_id?: string
          theme?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategy_posts_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "content_strategies"
            referencedColumns: ["id"]
          },
        ]
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
      trending_topics: {
        Row: {
          category: string | null
          detected_at: string | null
          growth_rate: number | null
          id: string
          last_updated: string | null
          mention_count: number | null
          related_keywords: string[] | null
          topic: string
          trend_score: number | null
        }
        Insert: {
          category?: string | null
          detected_at?: string | null
          growth_rate?: number | null
          id?: string
          last_updated?: string | null
          mention_count?: number | null
          related_keywords?: string[] | null
          topic: string
          trend_score?: number | null
        }
        Update: {
          category?: string | null
          detected_at?: string | null
          growth_rate?: number | null
          id?: string
          last_updated?: string | null
          mention_count?: number | null
          related_keywords?: string[] | null
          topic?: string
          trend_score?: number | null
        }
        Relationships: []
      }
      twitter_analytics: {
        Row: {
          created_at: string | null
          engagements: number | null
          fetched_at: string | null
          id: string
          impressions: number | null
          likes: number | null
          post_id: string | null
          profile_clicks: number | null
          replies: number | null
          retweets: number | null
          tweet_id: string
          url_clicks: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          engagements?: number | null
          fetched_at?: string | null
          id?: string
          impressions?: number | null
          likes?: number | null
          post_id?: string | null
          profile_clicks?: number | null
          replies?: number | null
          retweets?: number | null
          tweet_id: string
          url_clicks?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          engagements?: number | null
          fetched_at?: string | null
          id?: string
          impressions?: number | null
          likes?: number | null
          post_id?: string | null
          profile_clicks?: number | null
          replies?: number | null
          retweets?: number | null
          tweet_id?: string
          url_clicks?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "twitter_analytics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "scheduled_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_analytics: {
        Row: {
          ai_insights: string | null
          extracted_data: Json | null
          id: string
          image_url: string
          platform: string | null
          time_period_end: string | null
          time_period_start: string | null
          uploaded_at: string | null
          user_id: string
        }
        Insert: {
          ai_insights?: string | null
          extracted_data?: Json | null
          id?: string
          image_url: string
          platform?: string | null
          time_period_end?: string | null
          time_period_start?: string | null
          uploaded_at?: string | null
          user_id: string
        }
        Update: {
          ai_insights?: string | null
          extracted_data?: Json | null
          id?: string
          image_url?: string
          platform?: string | null
          time_period_end?: string | null
          time_period_start?: string | null
          uploaded_at?: string | null
          user_id?: string
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
      virality_predictions: {
        Row: {
          actual_performance: Json | null
          content_hash: string
          content_text: string
          created_at: string | null
          id: string
          improvement_suggestions: Json | null
          predicted_engagement_rate: number | null
          predicted_impressions: number | null
          predicted_shares: number | null
          success_factors: Json | null
          trending_elements: string[] | null
          user_id: string
          virality_category: string
          virality_score: number
        }
        Insert: {
          actual_performance?: Json | null
          content_hash: string
          content_text: string
          created_at?: string | null
          id?: string
          improvement_suggestions?: Json | null
          predicted_engagement_rate?: number | null
          predicted_impressions?: number | null
          predicted_shares?: number | null
          success_factors?: Json | null
          trending_elements?: string[] | null
          user_id: string
          virality_category: string
          virality_score: number
        }
        Update: {
          actual_performance?: Json | null
          content_hash?: string
          content_text?: string
          created_at?: string | null
          id?: string
          improvement_suggestions?: Json | null
          predicted_engagement_rate?: number | null
          predicted_impressions?: number | null
          predicted_shares?: number | null
          success_factors?: Json | null
          trending_elements?: string[] | null
          user_id?: string
          virality_category?: string
          virality_score?: number
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
      analyze_content_patterns: {
        Args: { p_platform: string; p_user_id: string }
        Returns: Json
      }
      analyze_content_patterns_comprehensive: {
        Args: { p_platform?: string; p_user_id: string }
        Returns: {
          avg_engagement_rate: number
          pattern_type: string
          pattern_value: string
          performance_score: number
          post_count: number
        }[]
      }
      analyze_content_performance_by_type: {
        Args: { p_platform?: string; p_user_id: string }
        Returns: {
          avg_engagement_rate: number
          content_type: string
          post_count: number
        }[]
      }
      analyze_content_structure: {
        Args: { p_content: string }
        Returns: {
          avg_word_length: number
          exclamation_count: number
          punctuation_density: number
          question_count: number
          sentence_count: number
          unique_words: number
          uppercase_ratio: number
          word_count: number
        }[]
      }
      auto_schedule_queued_content: {
        Args: { p_user_id: string }
        Returns: {
          content_id: string
          expected_engagement: number
          scheduled_time: string
        }[]
      }
      auto_select_ab_winner: { Args: { p_test_id: string }; Returns: undefined }
      calculate_ab_test_significance: {
        Args: { p_test_id: string }
        Returns: {
          avg_engagement_rate: number
          confidence_level: number
          improvement_over_control: number
          is_statistically_significant: boolean
          sample_size: number
          variant_id: string
          variant_name: string
        }[]
      }
      calculate_audience_activity: {
        Args: { p_platform: string; p_user_id: string }
        Returns: {
          avg_engagement_rate: number
          day_of_week: number
          hour_of_day: number
          sample_size: number
        }[]
      }
      calculate_campaign_performance: {
        Args: { p_campaign_id: string }
        Returns: {
          avg_engagement_rate: number
          goal_completion_rate: number
          total_engagement: number
          total_impressions: number
          total_posts: number
        }[]
      }
      compare_to_industry: {
        Args: { p_industry: string; p_platform?: string; p_user_id: string }
        Returns: {
          industry_avg: number
          metric: string
          percentile: number
          status: string
          user_value: number
        }[]
      }
      evaluate_condition: {
        Args: { p_condition: Json; p_hours: number; p_value: number }
        Returns: boolean
      }
      execute_optimization_actions: { Args: never; Returns: number }
      find_next_optimal_slot: {
        Args: {
          p_after_time?: string
          p_days_ahead?: number
          p_platform: string
          p_user_id: string
        }
        Returns: {
          confidence: string
          expected_engagement: number
          reason: string
          suggested_time: string
        }[]
      }
      find_schedule_gaps: {
        Args: { p_days_ahead?: number; p_user_id: string }
        Returns: {
          gap_end: string
          gap_hours: number
          gap_start: string
        }[]
      }
      generate_competitive_insights: {
        Args: { p_industry: string; p_user_id: string }
        Returns: {
          description: string
          insight_type: string
          priority: string
          recommendation: string
          title: string
        }[]
      }
      get_active_business_context: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_analytics_summary: {
        Args: {
          p_date_from: string
          p_date_to: string
          p_platform?: string
          p_user_id: string
        }
        Returns: {
          avg_engagement_rate: number
          total_clicks: number
          total_comments: number
          total_engagement: number
          total_impressions: number
          total_likes: number
          total_posts: number
          total_shares: number
        }[]
      }
      get_campaign_strategy_data: {
        Args: { p_platform?: string; p_user_id: string }
        Returns: {
          avg_engagement_rate: number
          best_content_length: string
          best_content_type: string
          best_posting_time: string
          total_posts_analyzed: number
        }[]
      }
      get_ml_training_dataset: {
        Args: { p_user_id: string }
        Returns: {
          content_length: number
          day_of_week: number
          emoji_count: number
          engagement_rate: number
          has_media: boolean
          has_question: boolean
          has_video: boolean
          hashtag_count: number
          hour_of_day: number
          is_weekend: boolean
          month: number
        }[]
      }
      get_optimal_time_slots: {
        Args: { p_limit?: number; p_platform: string; p_user_id: string }
        Returns: {
          avg_engagement_rate: number
          confidence: string
          day_of_week: number
          hour_of_day: number
        }[]
      }
      get_posting_trends: {
        Args: { p_days?: number; p_user_id: string }
        Returns: {
          avg_engagement: number
          date: string
          post_count: number
        }[]
      }
      get_recent_analytics: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: Json
      }
      get_top_performing_elements: {
        Args: { p_element_type: string; p_limit?: number; p_user_id: string }
        Returns: {
          avg_engagement: number
          element: string
          usage_count: number
        }[]
      }
      get_top_performing_posts: {
        Args: { p_limit?: number; p_platform: string; p_user_id: string }
        Returns: {
          content: string
          engagement_rate: number
          id: string
          impressions: number
          published_at: string
          total_engagement: number
        }[]
      }
      get_top_posts_analytics: {
        Args: { p_limit?: number; p_platform?: string; p_user_id: string }
        Returns: {
          content: string
          engagement_rate: number
          engagement_total: number
          id: string
          platform: string
          published_at: string
        }[]
      }
      get_user_baseline_metrics: {
        Args: { p_platform: string; p_user_id: string }
        Returns: {
          avg_engagement_rate: number
          avg_impressions: number
          total_posts: number
        }[]
      }
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
