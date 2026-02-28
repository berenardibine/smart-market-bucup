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
    PostgrestVersion: "14.1"
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
          seo_description: string | null
          seo_image: string | null
          seo_title: string | null
          slug: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          seo_description?: string | null
          seo_image?: string | null
          seo_title?: string | null
          slug: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          seo_description?: string | null
          seo_image?: string | null
          seo_title?: string | null
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
      email_templates: {
        Row: {
          created_at: string
          created_by: string | null
          html_content: string
          id: string
          subject: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          html_content: string
          id?: string
          subject: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          html_content?: string
          id?: string
          subject?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_products: {
        Row: {
          created_at: string | null
          end_at: string
          id: string
          is_active: boolean | null
          issued_by: string
          product_id: string
          reason: string | null
          referrer_id: string | null
          start_at: string
        }
        Insert: {
          created_at?: string | null
          end_at: string
          id?: string
          is_active?: boolean | null
          issued_by?: string
          product_id: string
          reason?: string | null
          referrer_id?: string | null
          start_at?: string
        }
        Update: {
          created_at?: string | null
          end_at?: string
          id?: string
          is_active?: boolean | null
          issued_by?: string
          product_id?: string
          reason?: string | null
          referrer_id?: string | null
          start_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "featured_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
      identity_verifications: {
        Row: {
          admin_notes: string | null
          created_at: string
          device_id: string | null
          face_scan_url: string | null
          id: string
          id_back_url: string | null
          id_front_url: string | null
          id_number: string | null
          ip_address: string | null
          method: string
          ocr_data: Json | null
          reviewed_at: string | null
          reviewed_by: string | null
          score: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          device_id?: string | null
          face_scan_url?: string | null
          id?: string
          id_back_url?: string | null
          id_front_url?: string | null
          id_number?: string | null
          ip_address?: string | null
          method?: string
          ocr_data?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          device_id?: string | null
          face_scan_url?: string | null
          id?: string
          id_back_url?: string | null
          id_front_url?: string | null
          id_number?: string | null
          ip_address?: string | null
          method?: string
          ocr_data?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number | null
          status?: string
          updated_at?: string
          user_id?: string
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
      invalid_referrals: {
        Row: {
          created_at: string | null
          details: Json | null
          detected_by: string | null
          id: string
          reason: string
          referral_code: string
          referral_id: string | null
          review_action: string | null
          reviewed: boolean | null
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          detected_by?: string | null
          id?: string
          reason: string
          referral_code: string
          referral_id?: string | null
          review_action?: string | null
          reviewed?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          detected_by?: string | null
          id?: string
          reason?: string
          referral_code?: string
          referral_id?: string | null
          review_action?: string | null
          reviewed?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invalid_referrals_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
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
          location_geog: unknown
          location_id: string | null
          price: number
          product_type: string | null
          quantity: number
          rental_fee: number | null
          rental_rate_type: string | null
          rental_status: string | null
          rental_unit: string | null
          seller_id: string
          seo_description: string | null
          seo_image: string | null
          seo_title: string | null
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
          location_geog?: unknown
          location_id?: string | null
          price: number
          product_type?: string | null
          quantity: number
          rental_fee?: number | null
          rental_rate_type?: string | null
          rental_status?: string | null
          rental_unit?: string | null
          seller_id: string
          seo_description?: string | null
          seo_image?: string | null
          seo_title?: string | null
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
          location_geog?: unknown
          location_id?: string | null
          price?: number
          product_type?: string | null
          quantity?: number
          rental_fee?: number | null
          rental_rate_type?: string | null
          rental_status?: string | null
          rental_unit?: string | null
          seller_id?: string
          seo_description?: string | null
          seo_image?: string | null
          seo_title?: string | null
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
          geom_geog: unknown
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
          preferred_view: string | null
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
          geom_geog?: unknown
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
          preferred_view?: string | null
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
          geom_geog?: unknown
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
          preferred_view?: string | null
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
      referral_rewards: {
        Row: {
          amount: number
          created_at: string | null
          credited_at: string | null
          expires_at: string | null
          id: string
          referral_id: string | null
          revoke_reason: string | null
          revoked_at: string | null
          reward_type: string
          status: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string | null
          credited_at?: string | null
          expires_at?: string | null
          id?: string
          referral_id?: string | null
          revoke_reason?: string | null
          revoked_at?: string | null
          reward_type: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          credited_at?: string | null
          expires_at?: string | null
          id?: string
          referral_id?: string | null
          revoke_reason?: string | null
          revoked_at?: string | null
          reward_type?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_shares: {
        Row: {
          channel: string
          created_at: string | null
          id: string
          ip_address: string | null
          referral_code: string
          share_url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          channel: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          referral_code: string
          share_url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          referral_code?: string
          share_url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          activated_at: string | null
          created_at: string | null
          id: string
          invalid_reason: string | null
          ip_address: string | null
          is_seller_referral: boolean | null
          is_valid: boolean | null
          metadata: Json | null
          referee_account_age_days: number | null
          referee_products_count: number | null
          referral_code: string
          referred_user_id: string | null
          referrer_id: string | null
          source_link: string | null
          status: string | null
          validated_at: string | null
        }
        Insert: {
          activated_at?: string | null
          created_at?: string | null
          id?: string
          invalid_reason?: string | null
          ip_address?: string | null
          is_seller_referral?: boolean | null
          is_valid?: boolean | null
          metadata?: Json | null
          referee_account_age_days?: number | null
          referee_products_count?: number | null
          referral_code: string
          referred_user_id?: string | null
          referrer_id?: string | null
          source_link?: string | null
          status?: string | null
          validated_at?: string | null
        }
        Update: {
          activated_at?: string | null
          created_at?: string | null
          id?: string
          invalid_reason?: string | null
          ip_address?: string | null
          is_seller_referral?: boolean | null
          is_valid?: boolean | null
          metadata?: Json | null
          referee_account_age_days?: number | null
          referee_products_count?: number | null
          referral_code?: string
          referred_user_id?: string | null
          referrer_id?: string | null
          source_link?: string | null
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
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
        ]
      }
      reward_redemptions: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          id: string
          product_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reward_details: Json | null
          reward_type: string
          status: string
          task_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reward_details?: Json | null
          reward_type: string
          status?: string
          task_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reward_details?: Json | null
          reward_type?: string
          status?: string
          task_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reward_tasks: {
        Row: {
          category: string | null
          color: string | null
          created_at: string
          created_by: string | null
          description: string
          expires_at: string | null
          featured_duration_days: number | null
          featured_product_count: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          requirement_count: number | null
          requires_evidence: boolean | null
          reward_coins: number
          reward_points: number
          reward_type: string | null
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
          featured_duration_days?: number | null
          featured_product_count?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          requirement_count?: number | null
          requires_evidence?: boolean | null
          reward_coins?: number
          reward_points?: number
          reward_type?: string | null
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
          featured_duration_days?: number | null
          featured_product_count?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          requirement_count?: number | null
          requires_evidence?: boolean | null
          reward_coins?: number
          reward_points?: number
          reward_type?: string | null
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
            foreignKeyName: "seller_connections_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sent_emails: {
        Row: {
          created_at: string
          error_message: string | null
          html_body: string
          id: string
          recipient_count: number
          recipients: string[]
          sent_by: string | null
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          html_body: string
          id?: string
          recipient_count?: number
          recipients: string[]
          sent_by?: string | null
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          html_body?: string
          id?: string
          recipient_count?: number
          recipients?: string[]
          sent_by?: string | null
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "sent_emails_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          slug: string | null
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
          slug?: string | null
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
          slug?: string | null
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
        ]
      }
      site_pages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_published: boolean | null
          meta_description: string | null
          seo_image: string | null
          seo_title: string | null
          slug: string
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          content?: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          seo_image?: string | null
          seo_title?: string | null
          slug: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          seo_image?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
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
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
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
          last_2fa_verified_at: string | null
          secret_key: string | null
          session_expires_at: string | null
          two_factor_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          last_2fa_verified_at?: string | null
          secret_key?: string | null
          session_expires_at?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          last_2fa_verified_at?: string | null
          secret_key?: string | null
          session_expires_at?: string | null
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
      visitor_preferences: {
        Row: {
          created_at: string | null
          detected_country: string | null
          filter_preference: string | null
          id: string
          ip_address: string | null
          session_id: string
        }
        Insert: {
          created_at?: string | null
          detected_country?: string | null
          filter_preference?: string | null
          id?: string
          ip_address?: string | null
          session_id: string
        }
        Update: {
          created_at?: string | null
          detected_country?: string | null
          filter_preference?: string | null
          id?: string
          ip_address?: string | null
          session_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      check_recent_impression: {
        Args: { p_hours?: number; p_product_id: string; p_session_id: string }
        Returns: boolean
      }
      check_recent_view: {
        Args: { p_minutes?: number; p_product_id: string; p_session_id: string }
        Returns: boolean
      }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      generate_slug: { Args: { input_text: string }; Returns: string }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_nearby_products_postgis: {
        Args: {
          b_lat: number
          b_lng: number
          limit_count?: number
          radius_m?: number
        }
        Returns: {
          admin_posted: boolean
          category: string
          country: string
          created_at: string
          currency_code: string
          currency_symbol: string
          distance_m: number
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
          slug: string
          sponsored: boolean
          title: string
          views: number
        }[]
      }
      gettransactionid: { Args: never; Returns: unknown }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
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
      longtransactionsenabled: { Args: never; Returns: boolean }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
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
    },
  },
} as const
