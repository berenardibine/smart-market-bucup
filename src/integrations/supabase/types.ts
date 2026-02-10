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
      admin_actions: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          reason: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          reason?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          admin_id: string | null
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      admin_messages: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      ads: {
        Row: {
          bg_color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string
          font_size: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link: string | null
          location_id: string | null
          priority: number | null
          start_date: string
          target_audience: string | null
          text_color: string | null
          title: string
          type: string
        }
        Insert: {
          bg_color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date: string
          font_size?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link?: string | null
          location_id?: string | null
          priority?: number | null
          start_date?: string
          target_audience?: string | null
          text_color?: string | null
          title: string
          type: string
        }
        Update: {
          bg_color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string
          font_size?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link?: string | null
          location_id?: string | null
          priority?: number | null
          start_date?: string
          target_audience?: string | null
          text_color?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_suggestions: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          seller_id: string | null
          suggestion_type: string
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          seller_id?: string | null
          suggestion_type: string
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          seller_id?: string | null
          suggestion_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_suggestions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_suggestions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_optimization_jobs: {
        Row: {
          compression_ratio: number | null
          created_at: string | null
          errors: Json | null
          files_failed: number | null
          files_processed: number | null
          files_skipped: number | null
          id: string
          optimized_size_total: number | null
          original_size_total: number | null
          space_saved: number | null
          status: string | null
        }
        Insert: {
          compression_ratio?: number | null
          created_at?: string | null
          errors?: Json | null
          files_failed?: number | null
          files_processed?: number | null
          files_skipped?: number | null
          id?: string
          optimized_size_total?: number | null
          original_size_total?: number | null
          space_saved?: number | null
          status?: string | null
        }
        Update: {
          compression_ratio?: number | null
          created_at?: string | null
          errors?: Json | null
          files_failed?: number | null
          files_processed?: number | null
          files_skipped?: number | null
          id?: string
          optimized_size_total?: number | null
          original_size_total?: number | null
          space_saved?: number | null
          status?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          type?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          product_id: string | null
          rating: number | null
          seller_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          product_id?: string | null
          rating?: number | null
          seller_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          product_id?: string | null
          rating?: number | null
          seller_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_id: string
          comments_count: number | null
          community_id: string
          content: string
          created_at: string
          id: string
          images: string[] | null
          is_pinned: boolean | null
          likes_count: number | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          author_id: string
          comments_count?: number | null
          community_id: string
          content: string
          created_at?: string
          id?: string
          images?: string[] | null
          is_pinned?: boolean | null
          likes_count?: number | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          author_id?: string
          comments_count?: number | null
          community_id?: string
          content?: string
          created_at?: string
          id?: string
          images?: string[] | null
          is_pinned?: boolean | null
          likes_count?: number | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          phone_number: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          phone_number?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          phone_number?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          buyer_id: string
          created_at: string | null
          id: string
          product_id: string | null
          seller_id: string
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          id?: string
          product_id?: string | null
          seller_id: string
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          id?: string
          product_id?: string | null
          seller_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          created_at: string
          currency_code: string | null
          currency_symbol: string | null
          id: string
          is_active: boolean | null
          iso_code: string | null
          lat: number | null
          level_names: Json | null
          lng: number | null
          name: string
          phone_code: string | null
        }
        Insert: {
          created_at?: string
          currency_code?: string | null
          currency_symbol?: string | null
          id?: string
          is_active?: boolean | null
          iso_code?: string | null
          lat?: number | null
          level_names?: Json | null
          lng?: number | null
          name: string
          phone_code?: string | null
        }
        Update: {
          created_at?: string
          currency_code?: string | null
          currency_symbol?: string | null
          id?: string
          is_active?: boolean | null
          iso_code?: string | null
          lat?: number | null
          level_names?: Json | null
          lng?: number | null
          name?: string
          phone_code?: string | null
        }
        Relationships: []
      }
      districts: {
        Row: {
          created_at: string | null
          id: string
          name: string
          province_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          province_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          province_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "districts_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      file_optimization_logs: {
        Row: {
          compression_ratio: number
          created_at: string | null
          id: string
          optimized_size: number
          optimized_url: string
          original_size: number
          original_url: string
          target_type: string | null
          user_id: string | null
          was_enhanced: boolean | null
        }
        Insert: {
          compression_ratio?: number
          created_at?: string | null
          id?: string
          optimized_size?: number
          optimized_url: string
          original_size?: number
          original_url: string
          target_type?: string | null
          user_id?: string | null
          was_enhanced?: boolean | null
        }
        Update: {
          compression_ratio?: number
          created_at?: string | null
          id?: string
          optimized_size?: number
          optimized_url?: string
          original_size?: number
          original_url?: string
          target_type?: string | null
          user_id?: string | null
          was_enhanced?: boolean | null
        }
        Relationships: []
      }
      filter_analytics: {
        Row: {
          created_at: string | null
          filter_type: string
          filter_value: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          filter_type: string
          filter_value?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          filter_type?: string
          filter_value?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      help_articles: {
        Row: {
          category: string
          content: string
          created_at: string | null
          id: string
          is_published: boolean | null
          slug: string
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          slug: string
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          slug?: string
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      invalid_clicks: {
        Row: {
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          link_analytics_id: string | null
          product_id: string
          reason: string
          risk_score: number | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          link_analytics_id?: string | null
          product_id: string
          reason: string
          risk_score?: number | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          link_analytics_id?: string | null
          product_id?: string
          reason?: string
          risk_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invalid_clicks_link_analytics_id_fkey"
            columns: ["link_analytics_id"]
            isOneToOne: false
            referencedRelation: "link_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invalid_clicks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      link_analytics: {
        Row: {
          browser: string | null
          country: string | null
          created_at: string
          device_type: string | null
          event: string
          id: string
          ip_address: string | null
          is_valid: boolean | null
          product_id: string
          referrer: string | null
          source: string | null
          user_agent: string | null
          user_id: string | null
          validation_score: number | null
        }
        Insert: {
          browser?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event?: string
          id?: string
          ip_address?: string | null
          is_valid?: boolean | null
          product_id: string
          referrer?: string | null
          source?: string | null
          user_agent?: string | null
          user_id?: string | null
          validation_score?: number | null
        }
        Update: {
          browser?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event?: string
          id?: string
          ip_address?: string | null
          is_valid?: boolean | null
          product_id?: string
          referrer?: string | null
          source?: string | null
          user_agent?: string | null
          user_id?: string | null
          validation_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "link_analytics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          delivered_at: string | null
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_badges: {
        Row: {
          badge_type: string
          count: number | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          badge_type: string
          count?: number | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          badge_type?: string
          count?: number | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_tokens: {
        Row: {
          created_at: string | null
          device_info: Json | null
          id: string
          token: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          id?: string
          token: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          id?: string
          token?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications_history: {
        Row: {
          body: string
          clicked: boolean | null
          delivered: boolean | null
          id: string
          sent_at: string | null
          title: string
          type: string | null
          url: string | null
          user_id: string | null
        }
        Insert: {
          body: string
          clicked?: boolean | null
          delivered?: boolean | null
          id?: string
          sent_at?: string | null
          title: string
          type?: string | null
          url?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string
          clicked?: boolean | null
          delivered?: boolean | null
          id?: string
          sent_at?: string | null
          title?: string
          type?: string | null
          url?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_analytics: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          type: string
          viewer_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          type: string
          viewer_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          type?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_analytics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_analytics_daily: {
        Row: {
          created_at: string
          date: string
          id: string
          impressions_count: number | null
          product_id: string
          source_breakdown: Json | null
          unique_impressions: number | null
          unique_views: number | null
          views_count: number | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          impressions_count?: number | null
          product_id: string
          source_breakdown?: Json | null
          unique_impressions?: number | null
          unique_views?: number | null
          views_count?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          impressions_count?: number | null
          product_id?: string
          source_breakdown?: Json | null
          unique_impressions?: number | null
          unique_views?: number | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_analytics_daily_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_comments: {
        Row: {
          author_name: string
          content: string
          created_at: string | null
          id: string
          is_deleted: boolean | null
          product_id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          product_id: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          product_id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_comments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_daily_agg: {
        Row: {
          date: string
          id: string
          impressions: number | null
          product_id: string
          views: number | null
        }
        Insert: {
          date?: string
          id?: string
          impressions?: number | null
          product_id: string
          views?: number | null
        }
        Update: {
          date?: string
          id?: string
          impressions?: number | null
          product_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_daily_agg_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_impressions: {
        Row: {
          created_at: string
          id: string
          product_id: string
          ref_source: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          ref_source?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          ref_source?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_impressions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_likes: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_likes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_metrics_cache: {
        Row: {
          id: string
          last_updated: string | null
          product_id: string
          total_impressions: number | null
          total_views: number | null
        }
        Insert: {
          id?: string
          last_updated?: string | null
          product_id: string
          total_impressions?: number | null
          total_views?: number | null
        }
        Update: {
          id?: string
          last_updated?: string | null
          product_id?: string
          total_impressions?: number | null
          total_views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_metrics_cache_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_ratings: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          rating: number
          seller_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          rating: number
          seller_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          rating?: number
          seller_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_ratings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_ratings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_ratings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_requests: {
        Row: {
          buyer_id: string
          buyer_location: string | null
          buyer_name: string
          buyer_phone: string
          created_at: string | null
          id: string
          product_id: string
          seller_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          buyer_location?: string | null
          buyer_name: string
          buyer_phone: string
          created_at?: string | null
          id?: string
          product_id: string
          seller_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          buyer_location?: string | null
          buyer_name?: string
          buyer_phone?: string
          created_at?: string | null
          id?: string
          product_id?: string
          seller_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_views: {
        Row: {
          created_at: string
          id: string
          product_id: string
          ref_source: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          ref_source?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          ref_source?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_views_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          admin_location: string | null
          admin_phone: string | null
          admin_posted: boolean | null
          category: string | null
          contact_call: string | null
          contact_whatsapp: string | null
          country: string | null
          created_at: string | null
          currency_code: string | null
          currency_symbol: string | null
          description: string
          discount: number | null
          discount_expiry: string | null
          id: string
          images: string[]
          impressions: number | null
          is_negotiable: boolean | null
          last_edited_by: string | null
          lat: number | null
          likes: number | null
          lng: number | null
          location: string | null
          location_id: string | null
          price: number
          product_type: string | null
          quantity: number
          rental_fee: number | null
          rental_rate_type: string | null
          rental_status: string | null
          rental_unit: string | null
          seller_id: string
          share_count: number | null
          shop_id: string | null
          show_connect_button: boolean | null
          slug: string | null
          sponsored: boolean | null
          status: string | null
          title: string
          updated_at: string | null
          video_url: string | null
          views: number | null
        }
        Insert: {
          admin_location?: string | null
          admin_phone?: string | null
          admin_posted?: boolean | null
          category?: string | null
          contact_call?: string | null
          contact_whatsapp?: string | null
          country?: string | null
          created_at?: string | null
          currency_code?: string | null
          currency_symbol?: string | null
          description: string
          discount?: number | null
          discount_expiry?: string | null
          id?: string
          images: string[]
          impressions?: number | null
          is_negotiable?: boolean | null
          last_edited_by?: string | null
          lat?: number | null
          likes?: number | null
          lng?: number | null
          location?: string | null
          location_id?: string | null
          price: number
          product_type?: string | null
          quantity: number
          rental_fee?: number | null
          rental_rate_type?: string | null
          rental_status?: string | null
          rental_unit?: string | null
          seller_id: string
          share_count?: number | null
          shop_id?: string | null
          show_connect_button?: boolean | null
          slug?: string | null
          sponsored?: boolean | null
          status?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
          views?: number | null
        }
        Update: {
          admin_location?: string | null
          admin_phone?: string | null
          admin_posted?: boolean | null
          category?: string | null
          contact_call?: string | null
          contact_whatsapp?: string | null
          country?: string | null
          created_at?: string | null
          currency_code?: string | null
          currency_symbol?: string | null
          description?: string
          discount?: number | null
          discount_expiry?: string | null
          id?: string
          images?: string[]
          impressions?: number | null
          is_negotiable?: boolean | null
          last_edited_by?: string | null
          lat?: number | null
          likes?: number | null
          lng?: number | null
          location?: string | null
          location_id?: string | null
          price?: number
          product_type?: string | null
          quantity?: number
          rental_fee?: number | null
          rental_rate_type?: string | null
          rental_status?: string | null
          rental_unit?: string | null
          seller_id?: string
          share_count?: number | null
          shop_id?: string | null
          show_connect_button?: boolean | null
          slug?: string | null
          sponsored?: boolean | null
          status?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auto_location_enabled: boolean | null
          bio: string | null
          blocking_reason: string | null
          business_name: string | null
          call_number: string | null
          city: string | null
          country: string | null
          country_code: string | null
          created_at: string | null
          currency_code: string | null
          currency_symbol: string | null
          detected_ip: string | null
          district_id: string | null
          email: string
          full_name: string
          id: string
          id_back_photo: string | null
          id_front_photo: string | null
          identity_verified: boolean | null
          installed_at: string | null
          installed_pwa: boolean | null
          ip_address: string | null
          last_active: string | null
          last_location_update: string | null
          lat: number | null
          lng: number | null
          location: string | null
          phone_number: string | null
          profile_image: string | null
          province_id: string | null
          rating: number | null
          rating_count: number | null
          referral_code: string | null
          referred_by: string | null
          region: string | null
          sector_id: string | null
          status: string | null
          updated_at: string | null
          user_type: string
          verification_notes: string | null
          whatsapp_number: string | null
        }
        Insert: {
          auto_location_enabled?: boolean | null
          bio?: string | null
          blocking_reason?: string | null
          business_name?: string | null
          call_number?: string | null
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          currency_code?: string | null
          currency_symbol?: string | null
          detected_ip?: string | null
          district_id?: string | null
          email: string
          full_name: string
          id: string
          id_back_photo?: string | null
          id_front_photo?: string | null
          identity_verified?: boolean | null
          installed_at?: string | null
          installed_pwa?: boolean | null
          ip_address?: string | null
          last_active?: string | null
          last_location_update?: string | null
          lat?: number | null
          lng?: number | null
          location?: string | null
          phone_number?: string | null
          profile_image?: string | null
          province_id?: string | null
          rating?: number | null
          rating_count?: number | null
          referral_code?: string | null
          referred_by?: string | null
          region?: string | null
          sector_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_type?: string
          verification_notes?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          auto_location_enabled?: boolean | null
          bio?: string | null
          blocking_reason?: string | null
          business_name?: string | null
          call_number?: string | null
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          currency_code?: string | null
          currency_symbol?: string | null
          detected_ip?: string | null
          district_id?: string | null
          email?: string
          full_name?: string
          id?: string
          id_back_photo?: string | null
          id_front_photo?: string | null
          identity_verified?: boolean | null
          installed_at?: string | null
          installed_pwa?: boolean | null
          ip_address?: string | null
          last_active?: string | null
          last_location_update?: string | null
          lat?: number | null
          lng?: number | null
          location?: string | null
          phone_number?: string | null
          profile_image?: string | null
          province_id?: string | null
          rating?: number | null
          rating_count?: number | null
          referral_code?: string | null
          referred_by?: string | null
          region?: string | null
          sector_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_type?: string
          verification_notes?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      provinces: {
        Row: {
          country_id: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          country_id?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          country_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "provinces_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pwa_installs_log: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pwa_installs_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pwa_installs_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_index: {
        Row: {
          id: string
          product_id: string
          recommended_ids: Json
          updated_at: string | null
        }
        Insert: {
          id?: string
          product_id: string
          recommended_ids?: Json
          updated_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          recommended_ids?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_index_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_logs: {
        Row: {
          created_at: string | null
          detected_by: string | null
          id: string
          reason: string | null
          referral_code: string
          referral_id: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          detected_by?: string | null
          id?: string
          reason?: string | null
          referral_code: string
          referral_id?: string | null
          status: string
        }
        Update: {
          created_at?: string | null
          detected_by?: string | null
          id?: string
          reason?: string | null
          referral_code?: string
          referral_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_logs_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          is_seller_referral: boolean | null
          is_valid: boolean | null
          referral_code: string
          referred_user_id: string | null
          referrer_id: string | null
          status: string | null
          validated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_seller_referral?: boolean | null
          is_valid?: boolean | null
          referral_code: string
          referred_user_id?: string | null
          referrer_id?: string | null
          status?: string | null
          validated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_seller_referral?: boolean | null
          is_valid?: boolean | null
          referral_code?: string
          referred_user_id?: string | null
          referrer_id?: string | null
          status?: string | null
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          details: string | null
          id: string
          product_id: string | null
          reason: string
          reported_seller_id: string | null
          reporter_email: string | null
          reporter_name: string
          reporter_phone: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          id?: string
          product_id?: string | null
          reason: string
          reported_seller_id?: string | null
          reporter_email?: string | null
          reporter_name: string
          reporter_phone: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          details?: string | null
          id?: string
          product_id?: string | null
          reason?: string
          reported_seller_id?: string | null
          reporter_email?: string | null
          reporter_name?: string
          reporter_phone?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_seller_id_fkey"
            columns: ["reported_seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_seller_id_fkey"
            columns: ["reported_seller_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_tasks: {
        Row: {
          category: string | null
          color: string | null
          created_at: string
          created_by: string | null
          description: string
          expires_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          requirement_count: number | null
          requires_evidence: boolean | null
          reward_coins: number
          reward_points: number
          task_type: string
          title: string
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          expires_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          requirement_count?: number | null
          requires_evidence?: boolean | null
          reward_coins?: number
          reward_points?: number
          task_type: string
          title: string
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          expires_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          requirement_count?: number | null
          requires_evidence?: boolean | null
          reward_coins?: number
          reward_points?: number
          task_type?: string
          title?: string
        }
        Relationships: []
      }
      sectors: {
        Row: {
          created_at: string | null
          district_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          district_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          district_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "sectors_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_activity: {
        Row: {
          created_at: string | null
          edits_this_month: number
          id: string
          last_reset_date: string
          posts_this_month: number
          updated_at: string | null
          updates_this_month: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          edits_this_month?: number
          id?: string
          last_reset_date?: string
          posts_this_month?: number
          updated_at?: string | null
          updates_this_month?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          edits_this_month?: number
          id?: string
          last_reset_date?: string
          posts_this_month?: number
          updated_at?: string | null
          updates_this_month?: number
          user_id?: string
        }
        Relationships: []
      }
      seller_connections: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          seller_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          seller_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_connections_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_connections_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_connections_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_connections_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string | null
          currency_code: string | null
          description: string | null
          district_id: string | null
          id: string
          is_active: boolean | null
          lat: number | null
          lng: number | null
          logo_url: string | null
          market_center: string | null
          name: string
          owner_id: string | null
          province_id: string | null
          region: string | null
          sector_id: string | null
          seller_id: string
          trading_center: string | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          currency_code?: string | null
          description?: string | null
          district_id?: string | null
          id?: string
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          market_center?: string | null
          name: string
          owner_id?: string | null
          province_id?: string | null
          region?: string | null
          sector_id?: string | null
          seller_id: string
          trading_center?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          currency_code?: string | null
          description?: string | null
          district_id?: string | null
          id?: string
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          market_center?: string | null
          name?: string
          owner_id?: string | null
          province_id?: string | null
          region?: string | null
          sector_id?: string | null
          seller_id?: string
          trading_center?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shops_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shops_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shops_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shops_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shops_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          site_description: string | null
          site_name: string | null
          twitter_url: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          site_description?: string | null
          site_name?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          site_description?: string | null
          site_name?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      subscription_requests: {
        Row: {
          admin_note: string | null
          amount_rwf: number
          created_at: string | null
          id: string
          message: string | null
          payment_reference: string | null
          phone_paid_to: string | null
          requested_plan_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount_rwf: number
          created_at?: string | null
          id?: string
          message?: string | null
          payment_reference?: string | null
          phone_paid_to?: string | null
          requested_plan_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount_rwf?: number
          created_at?: string | null
          id?: string
          message?: string | null
          payment_reference?: string | null
          phone_paid_to?: string | null
          requested_plan_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      trending_hashtags: {
        Row: {
          hashtag: string
          id: string
          last_used_at: string | null
          usage_count: number | null
        }
        Insert: {
          hashtag: string
          id?: string
          last_used_at?: string | null
          usage_count?: number | null
        }
        Update: {
          hashtag?: string
          id?: string
          last_used_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      user_browsing_history: {
        Row: {
          id: string
          product_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_browsing_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          dark_mode: boolean | null
          email_notifications: boolean | null
          id: string
          language: string | null
          push_notifications: boolean | null
          show_online_status: boolean | null
          theme: string | null
          two_factor_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dark_mode?: boolean | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          push_notifications?: boolean | null
          show_online_status?: boolean | null
          theme?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dark_mode?: boolean | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          push_notifications?: boolean | null
          show_online_status?: boolean | null
          theme?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_privacy: {
        Row: {
          allow_messaging: boolean | null
          created_at: string | null
          hide_contact: boolean | null
          hide_products: boolean | null
          id: string
          show_online_status: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allow_messaging?: boolean | null
          created_at?: string | null
          hide_contact?: boolean | null
          hide_products?: boolean | null
          id?: string
          show_online_status?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allow_messaging?: boolean | null
          created_at?: string | null
          hide_contact?: boolean | null
          hide_products?: boolean | null
          id?: string
          show_online_status?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_rewards: {
        Row: {
          badge: string | null
          coins: number | null
          id: string
          last_login_date: string | null
          level: number | null
          points: number | null
          streak_days: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          badge?: string | null
          coins?: number | null
          id?: string
          last_login_date?: string | null
          level?: number | null
          points?: number | null
          streak_days?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          badge?: string | null
          coins?: number | null
          id?: string
          last_login_date?: string | null
          level?: number | null
          points?: number | null
          streak_days?: number | null
          updated_at?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      user_security: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          id: string
          secret_key: string | null
          two_factor_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          secret_key?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          secret_key?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          browser: string | null
          created_at: string | null
          device_name: string | null
          device_type: string | null
          id: string
          ip_address: string | null
          is_current: boolean | null
          last_active: string | null
          location: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string | null
          device_name?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          last_active?: string | null
          location?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string | null
          device_name?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          last_active?: string | null
          location?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          bio: string | null
          business_name: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          location: string | null
          profile_image: string | null
          rating: number | null
          rating_count: number | null
          referral_code: string | null
          user_type: string | null
        }
        Insert: {
          bio?: string | null
          business_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          location?: string | null
          profile_image?: string | null
          rating?: number | null
          rating_count?: number | null
          referral_code?: string | null
          user_type?: string | null
        }
        Update: {
          bio?: string | null
          business_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          location?: string | null
          profile_image?: string | null
          rating?: number | null
          rating_count?: number | null
          referral_code?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_engagement_score: {
        Args: { p_clicks: number; p_impressions: number }
        Returns: number
      }
      can_user_perform_action: {
        Args: { _action_type: string; _user_id: string }
        Returns: boolean
      }
      check_recent_impression: {
        Args: { p_hours?: number; p_product_id: string; p_session_id: string }
        Returns: boolean
      }
      check_recent_view: {
        Args: { p_minutes?: number; p_product_id: string; p_session_id: string }
        Returns: boolean
      }
      check_user_status: {
        Args: { user_uuid: string }
        Returns: {
          blocking_reason: string
          status: string
        }[]
      }
      expire_marketing_posts: { Args: never; Returns: undefined }
      generate_product_slug: {
        Args: { product_title: string; shop_name?: string }
        Returns: string
      }
      get_child_locations: {
        Args: { location_uuid: string }
        Returns: {
          location_id: string
        }[]
      }
      get_location_hierarchy: {
        Args: { location_uuid: string }
        Returns: {
          location_id: string
          location_name: string
          location_slug: string
          location_type: string
        }[]
      }
      get_nearby_products: {
        Args: {
          max_results?: number
          radius_km?: number
          user_lat: number
          user_lng: number
        }
        Returns: {
          admin_posted: boolean
          category: string
          country: string
          created_at: string
          currency_code: string
          currency_symbol: string
          distance_km: number
          id: string
          images: string[]
          is_negotiable: boolean
          lat: number
          likes: number
          lng: number
          price: number
          product_type: string
          rental_unit: string
          seller_id: string
          seller_image: string
          seller_name: string
          sponsored: boolean
          title: string
          views: number
        }[]
      }
      get_session_comment_count: {
        Args: { p_hours?: number; p_session_id: string }
        Returns: number
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      haversine_distance: {
        Args: { lat1: number; lat2: number; lng1: number; lng2: number }
        Returns: number
      }
      increment_daily_agg: {
        Args: {
          p_date: string
          p_increment_impressions?: number
          p_increment_views?: number
          p_product_id: string
        }
        Returns: undefined
      }
      increment_opportunity_view: {
        Args: { opportunity_uuid: string }
        Returns: undefined
      }
      increment_product_metrics: {
        Args: {
          p_increment_impressions?: number
          p_increment_views?: number
          p_product_id: string
        }
        Returns: undefined
      }
      increment_product_view: {
        Args: { product_uuid: string }
        Returns: undefined
      }
      process_referral: {
        Args: { p_referral_code: string; p_referred_user_id: string }
        Returns: Json
      }
      record_user_action: {
        Args: { _action_type: string; _user_id: string }
        Returns: undefined
      }
      reset_monthly_activity: { Args: never; Returns: undefined }
      validate_referral_code: {
        Args: { p_referral_code: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      product_category:
        | "Electronics"
        | "Fashion"
        | "Home & Garden"
        | "Sports & Outdoors"
        | "Toys & Games"
        | "Books"
        | "Automotive"
        | "Health & Beauty"
        | "Food & Beverages"
        | "Other"
        | "Agriculture Product"
        | "Equipment for Lent"
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
      app_role: ["admin", "moderator", "user"],
      product_category: [
        "Electronics",
        "Fashion",
        "Home & Garden",
        "Sports & Outdoors",
        "Toys & Games",
        "Books",
        "Automotive",
        "Health & Beauty",
        "Food & Beverages",
        "Other",
        "Agriculture Product",
        "Equipment for Lent",
      ],
    },
  },
} as const
