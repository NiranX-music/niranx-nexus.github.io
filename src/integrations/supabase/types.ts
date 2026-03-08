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
      accessibility_preferences: {
        Row: {
          created_at: string | null
          focus_indicators_enhanced: boolean | null
          font_size_multiplier: number | null
          high_contrast_mode: boolean | null
          id: string
          keyboard_shortcuts_enhanced: boolean | null
          reduce_motion: boolean | null
          text_to_speech_enabled: boolean | null
          tts_rate: number | null
          tts_voice: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          focus_indicators_enhanced?: boolean | null
          font_size_multiplier?: number | null
          high_contrast_mode?: boolean | null
          id?: string
          keyboard_shortcuts_enhanced?: boolean | null
          reduce_motion?: boolean | null
          text_to_speech_enabled?: boolean | null
          tts_rate?: number | null
          tts_voice?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          focus_indicators_enhanced?: boolean | null
          font_size_multiplier?: number | null
          high_contrast_mode?: boolean | null
          id?: string
          keyboard_shortcuts_enhanced?: boolean | null
          reduce_motion?: boolean | null
          text_to_speech_enabled?: boolean | null
          tts_rate?: number | null
          tts_voice?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      achievements: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          hidden: boolean | null
          icon: string | null
          id: string
          image_url: string | null
          name: string
          rarity: string | null
          requirement_value: number | null
          reward_currency: number | null
          reward_xp: number | null
          type: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          hidden?: boolean | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name: string
          rarity?: string | null
          requirement_value?: number | null
          reward_currency?: number | null
          reward_xp?: number | null
          type?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          hidden?: boolean | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name?: string
          rarity?: string | null
          requirement_value?: number | null
          reward_currency?: number | null
          reward_xp?: number | null
          type?: string | null
        }
        Relationships: []
      }
      admin_api_keys_registry: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_configured: boolean | null
          key_name: string
          last_updated: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_configured?: boolean | null
          key_name: string
          last_updated?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_configured?: boolean | null
          key_name?: string
          last_updated?: string | null
        }
        Relationships: []
      }
      admin_custom_pages: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          css_content: string | null
          html_content: string
          id: string
          is_personal: boolean | null
          is_published: boolean | null
          js_content: string | null
          meta_description: string | null
          moderation_status: string | null
          rejection_reason: string | null
          show_author: boolean | null
          show_in_sidebar: boolean | null
          sidebar_group_id: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          css_content?: string | null
          html_content: string
          id?: string
          is_personal?: boolean | null
          is_published?: boolean | null
          js_content?: string | null
          meta_description?: string | null
          moderation_status?: string | null
          rejection_reason?: string | null
          show_author?: boolean | null
          show_in_sidebar?: boolean | null
          sidebar_group_id?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          css_content?: string | null
          html_content?: string
          id?: string
          is_personal?: boolean | null
          is_published?: boolean | null
          js_content?: string | null
          meta_description?: string | null
          moderation_status?: string | null
          rejection_reason?: string | null
          show_author?: boolean | null
          show_in_sidebar?: boolean | null
          sidebar_group_id?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_custom_pages_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "app_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_custom_pages_sidebar_group_id_fkey"
            columns: ["sidebar_group_id"]
            isOneToOne: false
            referencedRelation: "sidebar_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_editable_content: {
        Row: {
          content_key: string
          content_value: string
          id: string
          page_path: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content_key: string
          content_value: string
          id?: string
          page_path?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content_key?: string
          content_value?: string
          id?: string
          page_path?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          created_at: string | null
          created_by: string
          expires_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          message: string
          priority: string | null
          target_user_ids: string[] | null
          target_users: string | null
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          expires_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          priority?: string | null
          target_user_ids?: string[] | null
          target_users?: string | null
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          expires_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          priority?: string | null
          target_user_ids?: string[] | null
          target_users?: string | null
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      admin_requests: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_role_assignments: {
        Row: {
          expiration_date: string | null
          granted_at: string | null
          granted_by: string
          granted_to: string
          id: string
          reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          role_granted: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          expiration_date?: string | null
          granted_at?: string | null
          granted_by: string
          granted_to: string
          id?: string
          reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          role_granted: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          expiration_date?: string | null
          granted_at?: string | null
          granted_by?: string
          granted_to?: string
          id?: string
          reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          role_granted?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          created_at: string | null
          id: string
          is_archived: boolean | null
          last_activity: string | null
          subject: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          last_activity?: string | null
          subject?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          last_activity?: string | null
          subject?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_generations: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          id: string
          is_published: boolean | null
          prompt: string | null
          published_at: string | null
          result_data: Json | null
          slug: string | null
          status: string | null
          tool_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          prompt?: string | null
          published_at?: string | null
          result_data?: Json | null
          slug?: string | null
          status?: string | null
          tool_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          prompt?: string | null
          published_at?: string | null
          result_data?: Json | null
          slug?: string | null
          status?: string | null
          tool_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          category: string | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          rating: string | null
          role: string
        }
        Insert: {
          category?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          rating?: string | null
          role: string
        }
        Update: {
          category?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          rating?: string | null
          role?: string
        }
        Relationships: []
      }
      ai_solver_conversations: {
        Row: {
          created_at: string
          id: string
          subject: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          subject?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          subject?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_solver_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          image_url: string | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_solver_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_solver_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      album_artists: {
        Row: {
          album_id: string
          artist_id: string
          artist_name: string
          created_at: string | null
          id: string
          role: string | null
        }
        Insert: {
          album_id: string
          artist_id: string
          artist_name: string
          created_at?: string | null
          id?: string
          role?: string | null
        }
        Update: {
          album_id?: string
          artist_id?: string
          artist_name?: string
          created_at?: string | null
          id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "album_artists_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "album_artists_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      album_tracks: {
        Row: {
          album_id: string
          created_at: string | null
          id: string
          track_id: string
          track_number: number
        }
        Insert: {
          album_id: string
          created_at?: string | null
          id?: string
          track_id: string
          track_number?: number
        }
        Update: {
          album_id?: string
          created_at?: string | null
          id?: string
          track_id?: string
          track_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "album_tracks_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "album_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      albums: {
        Row: {
          artist_id: string | null
          artist_name: string
          cover_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          genre: string | null
          id: string
          is_approved: boolean | null
          release_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          artist_id?: string | null
          artist_name: string
          cover_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          genre?: string | null
          id?: string
          is_approved?: boolean | null
          release_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          artist_id?: string | null
          artist_name?: string
          cover_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          genre?: string | null
          id?: string
          is_approved?: boolean | null
          release_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "albums_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_snapshots: {
        Row: {
          created_at: string | null
          focus_score: number | null
          id: string
          pomodoro_sessions: number | null
          snapshot_date: string
          subject_breakdown: Json | null
          tasks_completed: number | null
          total_study_hours: number | null
          user_id: string
          weekly_hours: number[] | null
        }
        Insert: {
          created_at?: string | null
          focus_score?: number | null
          id?: string
          pomodoro_sessions?: number | null
          snapshot_date?: string
          subject_breakdown?: Json | null
          tasks_completed?: number | null
          total_study_hours?: number | null
          user_id: string
          weekly_hours?: number[] | null
        }
        Update: {
          created_at?: string | null
          focus_score?: number | null
          id?: string
          pomodoro_sessions?: number | null
          snapshot_date?: string
          subject_breakdown?: Json | null
          tasks_completed?: number | null
          total_study_hours?: number | null
          user_id?: string
          weekly_hours?: number[] | null
        }
        Relationships: []
      }
      api_usage_logs: {
        Row: {
          api_key_id: string
          created_at: string
          endpoint: string
          id: string
          ip_address: string | null
          method: string
          request_body: Json | null
          response_size_bytes: number | null
          response_time_ms: number | null
          status_code: number
          user_id: string
        }
        Insert: {
          api_key_id: string
          created_at?: string
          endpoint: string
          id?: string
          ip_address?: string | null
          method?: string
          request_body?: Json | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code?: number
          user_id: string
        }
        Update: {
          api_key_id?: string
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: string | null
          method?: string
          request_body?: Json | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "developer_api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      app_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      ar_flashcard_sessions: {
        Row: {
          cards_viewed: number | null
          created_at: string | null
          deck_id: string | null
          duration_seconds: number | null
          id: string
          session_date: string | null
          user_id: string
        }
        Insert: {
          cards_viewed?: number | null
          created_at?: string | null
          deck_id?: string | null
          duration_seconds?: number | null
          id?: string
          session_date?: string | null
          user_id: string
        }
        Update: {
          cards_viewed?: number | null
          created_at?: string | null
          deck_id?: string | null
          duration_seconds?: number | null
          id?: string
          session_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      artist_catalogue_folders: {
        Row: {
          artist_id: string
          created_at: string | null
          created_by: string
          folder_name: string
          id: string
          parent_folder_id: string | null
          updated_at: string | null
        }
        Insert: {
          artist_id: string
          created_at?: string | null
          created_by: string
          folder_name: string
          id?: string
          parent_folder_id?: string | null
          updated_at?: string | null
        }
        Update: {
          artist_id?: string
          created_at?: string | null
          created_by?: string
          folder_name?: string
          id?: string
          parent_folder_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_catalogue_folders_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_catalogue_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "artist_catalogue_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_followers: {
        Row: {
          artist_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          artist_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          artist_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_followers_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_sessions: {
        Row: {
          artist_id: string
          created_at: string | null
          expires_at: string
          id: string
          session_token: string
        }
        Insert: {
          artist_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          session_token: string
        }
        Update: {
          artist_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          session_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_sessions_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      artists: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          created_by: string | null
          custom_url: string | null
          email: string | null
          follower_count: number | null
          id: string
          is_verified: boolean | null
          monthly_listeners: number | null
          name: string
          password_hash: string | null
          studio_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_url?: string | null
          email?: string | null
          follower_count?: number | null
          id?: string
          is_verified?: boolean | null
          monthly_listeners?: number | null
          name: string
          password_hash?: string | null
          studio_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_url?: string | null
          email?: string | null
          follower_count?: number | null
          id?: string
          is_verified?: boolean | null
          monthly_listeners?: number | null
          name?: string
          password_hash?: string | null
          studio_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      attendance_records: {
        Row: {
          auto_detected: boolean | null
          classroom_id: string
          created_at: string | null
          date: string
          id: string
          notes: string | null
          recorded_by: string | null
          status: string
          student_id: string
        }
        Insert: {
          auto_detected?: boolean | null
          classroom_id: string
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          recorded_by?: string | null
          status: string
          student_id: string
        }
        Update: {
          auto_detected?: boolean | null
          classroom_id?: string
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          recorded_by?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      backblaze_files: {
        Row: {
          content_type: string | null
          created_at: string | null
          file_id: string
          file_name: string
          file_size: number
          id: string
          upload_timestamp: string | null
          user_id: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string | null
          file_id: string
          file_name: string
          file_size: number
          id?: string
          upload_timestamp?: string | null
          user_id: string
        }
        Update: {
          content_type?: string | null
          created_at?: string | null
          file_id?: string
          file_name?: string
          file_size?: number
          id?: string
          upload_timestamp?: string | null
          user_id?: string
        }
        Relationships: []
      }
      blocked_sites: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      blog_edits: {
        Row: {
          blog_id: string
          edited_at: string | null
          edited_by: string
          id: string
          new_content: string
          previous_content: string
        }
        Insert: {
          blog_id: string
          edited_at?: string | null
          edited_by: string
          id?: string
          new_content: string
          previous_content: string
        }
        Update: {
          blog_id?: string
          edited_at?: string | null
          edited_by?: string
          id?: string
          new_content?: string
          previous_content?: string
        }
        Relationships: []
      }
      blogs: {
        Row: {
          attachments: Json | null
          content: string
          cover_image_url: string | null
          created_at: string | null
          created_by: string
          id: string
          is_published: boolean | null
          publisher_id: string | null
          publisher_name: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          cover_image_url?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          is_published?: boolean | null
          publisher_id?: string | null
          publisher_name?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          is_published?: boolean | null
          publisher_id?: string | null
          publisher_name?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bookmark_collections: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      bytez_conversations: {
        Row: {
          created_at: string
          id: string
          model: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          model?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          model?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bytez_messages: {
        Row: {
          attachments: Json | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "bytez_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "bytez_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_room_members: {
        Row: {
          id: string
          joined_at: string | null
          role: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          role?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_group: boolean | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_group?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_group?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      claimed_daily_rewards: {
        Row: {
          bonus_items: Json | null
          claim_date: string
          created_at: string | null
          id: string
          is_random_bonus: boolean | null
          reward_tier_id: string | null
          streak_count: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          bonus_items?: Json | null
          claim_date?: string
          created_at?: string | null
          id?: string
          is_random_bonus?: boolean | null
          reward_tier_id?: string | null
          streak_count: number
          user_id: string
          xp_earned: number
        }
        Update: {
          bonus_items?: Json | null
          claim_date?: string
          created_at?: string | null
          id?: string
          is_random_bonus?: boolean | null
          reward_tier_id?: string | null
          streak_count?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "claimed_daily_rewards_reward_tier_id_fkey"
            columns: ["reward_tier_id"]
            isOneToOne: false
            referencedRelation: "reward_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      class_recordings: {
        Row: {
          ai_timestamps: Json | null
          class_id: string
          created_at: string | null
          duration: number | null
          id: string
          recording_url: string
          topic_links: Json | null
        }
        Insert: {
          ai_timestamps?: Json | null
          class_id: string
          created_at?: string | null
          duration?: number | null
          id?: string
          recording_url: string
          topic_links?: Json | null
        }
        Update: {
          ai_timestamps?: Json | null
          class_id?: string
          created_at?: string | null
          duration?: number | null
          id?: string
          recording_url?: string
          topic_links?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "class_recordings_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "live_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom_announcements: {
        Row: {
          attachments: Json | null
          classroom_id: string
          content: string
          created_at: string | null
          id: string
          is_pinned: boolean | null
          notify_students: boolean | null
          priority: string | null
          teacher_id: string
          title: string
        }
        Insert: {
          attachments?: Json | null
          classroom_id: string
          content: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          notify_students?: boolean | null
          priority?: string | null
          teacher_id: string
          title: string
        }
        Update: {
          attachments?: Json | null
          classroom_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          notify_students?: boolean | null
          priority?: string | null
          teacher_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "classroom_announcements_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom_debates: {
        Row: {
          assignment_type: string | null
          classroom_id: string
          created_at: string | null
          debate_topic_id: string
          due_date: string | null
          id: string
          instructions: string | null
          is_published: boolean | null
          min_word_count: number | null
          peer_review_enabled: boolean | null
          points_possible: number | null
          required_evidence_count: number | null
          rubric_id: string | null
        }
        Insert: {
          assignment_type?: string | null
          classroom_id: string
          created_at?: string | null
          debate_topic_id: string
          due_date?: string | null
          id?: string
          instructions?: string | null
          is_published?: boolean | null
          min_word_count?: number | null
          peer_review_enabled?: boolean | null
          points_possible?: number | null
          required_evidence_count?: number | null
          rubric_id?: string | null
        }
        Update: {
          assignment_type?: string | null
          classroom_id?: string
          created_at?: string | null
          debate_topic_id?: string
          due_date?: string | null
          id?: string
          instructions?: string | null
          is_published?: boolean | null
          min_word_count?: number | null
          peer_review_enabled?: boolean | null
          points_possible?: number | null
          required_evidence_count?: number | null
          rubric_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classroom_debates_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classroom_debates_debate_topic_id_fkey"
            columns: ["debate_topic_id"]
            isOneToOne: false
            referencedRelation: "debate_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classroom_debates_rubric_id_fkey"
            columns: ["rubric_id"]
            isOneToOne: false
            referencedRelation: "grading_rubrics"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom_members: {
        Row: {
          attendance_rate: number | null
          classroom_id: string
          enrollment_status: string | null
          id: string
          joined_at: string | null
          participation_score: number | null
          role: string | null
          student_id: string
        }
        Insert: {
          attendance_rate?: number | null
          classroom_id: string
          enrollment_status?: string | null
          id?: string
          joined_at?: string | null
          participation_score?: number | null
          role?: string | null
          student_id: string
        }
        Update: {
          attendance_rate?: number | null
          classroom_id?: string
          enrollment_status?: string | null
          id?: string
          joined_at?: string | null
          participation_score?: number | null
          role?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "classroom_members_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom_videos: {
        Row: {
          added_by: string
          classroom_id: string
          created_at: string | null
          id: string
          order_index: number | null
          video_description: string | null
          video_title: string
          video_url: string
        }
        Insert: {
          added_by: string
          classroom_id: string
          created_at?: string | null
          id?: string
          order_index?: number | null
          video_description?: string | null
          video_title: string
          video_url: string
        }
        Update: {
          added_by?: string
          classroom_id?: string
          created_at?: string | null
          id?: string
          order_index?: number | null
          video_description?: string | null
          video_title?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "classroom_videos_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      classrooms: {
        Row: {
          academic_year: string | null
          class_code: string | null
          created_at: string | null
          description: string | null
          grade_level: string | null
          id: string
          is_active: boolean | null
          max_students: number | null
          meeting_schedule: Json | null
          name: string
          settings: Json | null
          subject: string | null
          syllabus: Json | null
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          academic_year?: string | null
          class_code?: string | null
          created_at?: string | null
          description?: string | null
          grade_level?: string | null
          id?: string
          is_active?: boolean | null
          max_students?: number | null
          meeting_schedule?: Json | null
          name: string
          settings?: Json | null
          subject?: string | null
          syllabus?: Json | null
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string | null
          class_code?: string | null
          created_at?: string | null
          description?: string | null
          grade_level?: string | null
          id?: string
          is_active?: boolean | null
          max_students?: number | null
          meeting_schedule?: Json | null
          name?: string
          settings?: Json | null
          subject?: string | null
          syllabus?: Json | null
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      collaborative_experiments: {
        Row: {
          created_at: string | null
          data: Json | null
          description: string | null
          experiment_name: string
          id: string
          is_public: boolean | null
          lab_type: string
          owner_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          description?: string | null
          experiment_name: string
          id?: string
          is_public?: boolean | null
          lab_type: string
          owner_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          description?: string | null
          experiment_name?: string
          id?: string
          is_public?: boolean | null
          lab_type?: string
          owner_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cornell_notes: {
        Row: {
          created_at: string | null
          cues: string | null
          id: string
          main_notes: string | null
          subject: string | null
          summary: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          cues?: string | null
          id?: string
          main_notes?: string | null
          subject?: string | null
          summary?: string | null
          title?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          cues?: string | null
          id?: string
          main_notes?: string | null
          subject?: string | null
          summary?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      course_progress: {
        Row: {
          completed_lessons: Json | null
          completed_modules: number[] | null
          course_id: string
          current_module: number | null
          id: string
          last_activity: string | null
          quiz_scores: Json | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          completed_lessons?: Json | null
          completed_modules?: number[] | null
          course_id: string
          current_module?: number | null
          id?: string
          last_activity?: string | null
          quiz_scores?: Json | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          completed_lessons?: Json | null
          completed_modules?: number[] | null
          course_id?: string
          current_module?: number | null
          id?: string
          last_activity?: string | null
          quiz_scores?: Json | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "generated_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_themes: {
        Row: {
          colors: Json
          created_at: string | null
          downloads_count: number | null
          id: string
          is_public: boolean | null
          share_token: string | null
          theme_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          colors: Json
          created_at?: string | null
          downloads_count?: number | null
          id?: string
          is_public?: boolean | null
          share_token?: string | null
          theme_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          colors?: Json
          created_at?: string | null
          downloads_count?: number | null
          id?: string
          is_public?: boolean | null
          share_token?: string | null
          theme_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          challenge_date: string | null
          challenge_type: string
          created_at: string | null
          description: string
          id: string
          target_value: number
          title: string
          xp_reward: number | null
        }
        Insert: {
          challenge_date?: string | null
          challenge_type: string
          created_at?: string | null
          description: string
          id?: string
          target_value: number
          title: string
          xp_reward?: number | null
        }
        Update: {
          challenge_date?: string | null
          challenge_type?: string
          created_at?: string | null
          description?: string
          id?: string
          target_value?: number
          title?: string
          xp_reward?: number | null
        }
        Relationships: []
      }
      daily_rewards: {
        Row: {
          created_at: string | null
          id: string
          reward_date: string | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          reward_date?: string | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          reward_date?: string | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      debate_awards: {
        Row: {
          cost_coins: number
          created_at: string | null
          description: string | null
          icon: string
          id: string
          name: string
          rarity: Database["public"]["Enums"]["debate_award_rarity"] | null
          xp_value: number
        }
        Insert: {
          cost_coins: number
          created_at?: string | null
          description?: string | null
          icon: string
          id?: string
          name: string
          rarity?: Database["public"]["Enums"]["debate_award_rarity"] | null
          xp_value: number
        }
        Update: {
          cost_coins?: number
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          name?: string
          rarity?: Database["public"]["Enums"]["debate_award_rarity"] | null
          xp_value?: number
        }
        Relationships: []
      }
      debate_awards_given: {
        Row: {
          award_id: string
          created_at: string | null
          given_by: string
          given_to: string
          id: string
          target_id: string
          target_type: Database["public"]["Enums"]["debate_target_type"]
        }
        Insert: {
          award_id: string
          created_at?: string | null
          given_by: string
          given_to: string
          id?: string
          target_id: string
          target_type: Database["public"]["Enums"]["debate_target_type"]
        }
        Update: {
          award_id?: string
          created_at?: string | null
          given_by?: string
          given_to?: string
          id?: string
          target_id?: string
          target_type?: Database["public"]["Enums"]["debate_target_type"]
        }
        Relationships: [
          {
            foreignKeyName: "debate_awards_given_award_id_fkey"
            columns: ["award_id"]
            isOneToOne: false
            referencedRelation: "debate_awards"
            referencedColumns: ["id"]
          },
        ]
      }
      debate_bookmarks: {
        Row: {
          created_at: string | null
          debate_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          debate_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          debate_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debate_bookmarks_debate_id_fkey"
            columns: ["debate_id"]
            isOneToOne: false
            referencedRelation: "debate_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      debate_categories: {
        Row: {
          color: string | null
          created_at: string | null
          debate_count: number | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          debate_count?: number | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          debate_count?: number | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      debate_comments: {
        Row: {
          ai_argument_score: number | null
          content: string
          created_at: string | null
          debate_id: string
          depth_level: number | null
          downvotes: number | null
          has_evidence: boolean | null
          id: string
          is_edited: boolean | null
          parent_comment_id: string | null
          stance: Database["public"]["Enums"]["debate_stance"] | null
          updated_at: string | null
          upvotes: number | null
          user_id: string
        }
        Insert: {
          ai_argument_score?: number | null
          content: string
          created_at?: string | null
          debate_id: string
          depth_level?: number | null
          downvotes?: number | null
          has_evidence?: boolean | null
          id?: string
          is_edited?: boolean | null
          parent_comment_id?: string | null
          stance?: Database["public"]["Enums"]["debate_stance"] | null
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
        }
        Update: {
          ai_argument_score?: number | null
          content?: string
          created_at?: string | null
          debate_id?: string
          depth_level?: number | null
          downvotes?: number | null
          has_evidence?: boolean | null
          id?: string
          is_edited?: boolean | null
          parent_comment_id?: string | null
          stance?: Database["public"]["Enums"]["debate_stance"] | null
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debate_comments_debate_id_fkey"
            columns: ["debate_id"]
            isOneToOne: false
            referencedRelation: "debate_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debate_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "debate_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      debate_evidence: {
        Row: {
          comment_id: string
          created_at: string | null
          credibility_score: number | null
          description: string | null
          id: string
          source_type: Database["public"]["Enums"]["debate_source_type"]
          source_url: string | null
          title: string | null
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          credibility_score?: number | null
          description?: string | null
          id?: string
          source_type: Database["public"]["Enums"]["debate_source_type"]
          source_url?: string | null
          title?: string | null
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          credibility_score?: number | null
          description?: string | null
          id?: string
          source_type?: Database["public"]["Enums"]["debate_source_type"]
          source_url?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "debate_evidence_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "debate_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      debate_participation_tracking: {
        Row: {
          arguments_posted: number | null
          classroom_debate_id: string
          comments_count: number | null
          engagement_score: number | null
          evidence_cited: number | null
          fallacies_detected: number | null
          id: string
          last_activity: string | null
          peer_reviews_given: number | null
          student_id: string
          time_spent_minutes: number | null
          upvotes_received: number | null
        }
        Insert: {
          arguments_posted?: number | null
          classroom_debate_id: string
          comments_count?: number | null
          engagement_score?: number | null
          evidence_cited?: number | null
          fallacies_detected?: number | null
          id?: string
          last_activity?: string | null
          peer_reviews_given?: number | null
          student_id: string
          time_spent_minutes?: number | null
          upvotes_received?: number | null
        }
        Update: {
          arguments_posted?: number | null
          classroom_debate_id?: string
          comments_count?: number | null
          engagement_score?: number | null
          evidence_cited?: number | null
          fallacies_detected?: number | null
          id?: string
          last_activity?: string | null
          peer_reviews_given?: number | null
          student_id?: string
          time_spent_minutes?: number | null
          upvotes_received?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "debate_participation_tracking_classroom_debate_id_fkey"
            columns: ["classroom_debate_id"]
            isOneToOne: false
            referencedRelation: "classroom_debates"
            referencedColumns: ["id"]
          },
        ]
      }
      debate_reports: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["debate_report_status"] | null
          target_id: string
          target_type: Database["public"]["Enums"]["debate_target_type"]
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["debate_report_status"] | null
          target_id: string
          target_type: Database["public"]["Enums"]["debate_target_type"]
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["debate_report_status"] | null
          target_id?: string
          target_type?: Database["public"]["Enums"]["debate_target_type"]
        }
        Relationships: []
      }
      debate_subscriptions: {
        Row: {
          created_at: string | null
          debate_id: string
          id: string
          notify_on_comment: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          debate_id: string
          id?: string
          notify_on_comment?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          debate_id?: string
          id?: string
          notify_on_comment?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debate_subscriptions_debate_id_fkey"
            columns: ["debate_id"]
            isOneToOne: false
            referencedRelation: "debate_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      debate_topics: {
        Row: {
          category_id: string | null
          classroom_id: string | null
          comment_count: number | null
          controversy_score: number | null
          created_at: string | null
          description: string
          downvotes: number | null
          hotness_score: number | null
          id: string
          is_classroom_debate: boolean | null
          is_locked: boolean | null
          is_pinned: boolean | null
          is_private: boolean | null
          stance_against_count: number | null
          stance_for_count: number | null
          stance_neutral_count: number | null
          tags: string[] | null
          time_limit: string | null
          title: string
          updated_at: string | null
          upvotes: number | null
          user_id: string
          view_count: number | null
          voting_ends_at: string | null
          winning_stance: Database["public"]["Enums"]["debate_stance"] | null
        }
        Insert: {
          category_id?: string | null
          classroom_id?: string | null
          comment_count?: number | null
          controversy_score?: number | null
          created_at?: string | null
          description: string
          downvotes?: number | null
          hotness_score?: number | null
          id?: string
          is_classroom_debate?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          is_private?: boolean | null
          stance_against_count?: number | null
          stance_for_count?: number | null
          stance_neutral_count?: number | null
          tags?: string[] | null
          time_limit?: string | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
          view_count?: number | null
          voting_ends_at?: string | null
          winning_stance?: Database["public"]["Enums"]["debate_stance"] | null
        }
        Update: {
          category_id?: string | null
          classroom_id?: string | null
          comment_count?: number | null
          controversy_score?: number | null
          created_at?: string | null
          description?: string
          downvotes?: number | null
          hotness_score?: number | null
          id?: string
          is_classroom_debate?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          is_private?: boolean | null
          stance_against_count?: number | null
          stance_for_count?: number | null
          stance_neutral_count?: number | null
          tags?: string[] | null
          time_limit?: string | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
          view_count?: number | null
          voting_ends_at?: string | null
          winning_stance?: Database["public"]["Enums"]["debate_stance"] | null
        }
        Relationships: [
          {
            foreignKeyName: "debate_topics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "debate_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debate_topics_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      debate_user_stances: {
        Row: {
          created_at: string | null
          debate_id: string
          id: string
          stance: Database["public"]["Enums"]["debate_stance"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          debate_id: string
          id?: string
          stance: Database["public"]["Enums"]["debate_stance"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          debate_id?: string
          id?: string
          stance?: Database["public"]["Enums"]["debate_stance"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debate_user_stances_debate_id_fkey"
            columns: ["debate_id"]
            isOneToOne: false
            referencedRelation: "debate_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      debate_votes: {
        Row: {
          created_at: string | null
          id: string
          target_id: string
          target_type: Database["public"]["Enums"]["debate_target_type"]
          user_id: string
          vote_type: Database["public"]["Enums"]["debate_vote_type"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          target_id: string
          target_type: Database["public"]["Enums"]["debate_target_type"]
          user_id: string
          vote_type: Database["public"]["Enums"]["debate_vote_type"]
        }
        Update: {
          created_at?: string | null
          id?: string
          target_id?: string
          target_type?: Database["public"]["Enums"]["debate_target_type"]
          user_id?: string
          vote_type?: Database["public"]["Enums"]["debate_vote_type"]
        }
        Relationships: []
      }
      developer_api_keys: {
        Row: {
          api_key: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          key_name: string
          key_prefix: string
          last_used_at: string | null
          permissions: string[]
          rate_limit_per_minute: number
          total_requests: number
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_name?: string
          key_prefix: string
          last_used_at?: string | null
          permissions?: string[]
          rate_limit_per_minute?: number
          total_requests?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_name?: string
          key_prefix?: string
          last_used_at?: string | null
          permissions?: string[]
          rate_limit_per_minute?: number
          total_requests?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      developer_webhooks: {
        Row: {
          created_at: string
          events: string[]
          failure_count: number
          id: string
          is_active: boolean
          last_triggered_at: string | null
          secret: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          events?: string[]
          failure_count?: number
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          secret: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          events?: string[]
          failure_count?: number
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          secret?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      email_report_preferences: {
        Row: {
          created_at: string | null
          day_of_week: number | null
          enabled: boolean | null
          frequency: string | null
          id: string
          include_ai_insights: boolean | null
          metrics_to_include: string[] | null
          time_of_day: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week?: number | null
          enabled?: boolean | null
          frequency?: string | null
          id?: string
          include_ai_insights?: boolean | null
          metrics_to_include?: string[] | null
          time_of_day?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number | null
          enabled?: boolean | null
          frequency?: string | null
          id?: string
          include_ai_insights?: boolean | null
          metrics_to_include?: string[] | null
          time_of_day?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      essay_rubrics: {
        Row: {
          created_at: string | null
          criteria: Json
          id: string
          is_public: boolean | null
          max_score: number | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          criteria: Json
          id?: string
          is_public?: boolean | null
          max_score?: number | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          criteria?: Json
          id?: string
          is_public?: boolean | null
          max_score?: number | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      essay_submissions: {
        Row: {
          ai_grade: Json | null
          ai_provider: string | null
          content: string
          created_at: string | null
          feedback: string | null
          id: string
          improvements: string[] | null
          rubric_id: string | null
          score: number | null
          strengths: string[] | null
          title: string | null
          user_id: string
          word_count: number | null
        }
        Insert: {
          ai_grade?: Json | null
          ai_provider?: string | null
          content: string
          created_at?: string | null
          feedback?: string | null
          id?: string
          improvements?: string[] | null
          rubric_id?: string | null
          score?: number | null
          strengths?: string[] | null
          title?: string | null
          user_id: string
          word_count?: number | null
        }
        Update: {
          ai_grade?: Json | null
          ai_provider?: string | null
          content?: string
          created_at?: string | null
          feedback?: string | null
          id?: string
          improvements?: string[] | null
          rubric_id?: string | null
          score?: number | null
          strengths?: string[] | null
          title?: string | null
          user_id?: string
          word_count?: number | null
        }
        Relationships: []
      }
      exam_resources: {
        Row: {
          created_at: string | null
          download_count: number | null
          duration: string | null
          exam_id: string
          file_path: string
          file_size: number | null
          id: string
          is_shared: boolean | null
          last_accessed_at: string | null
          password_hash: string | null
          permission_level: string | null
          share_token: string | null
          shared_until: string | null
          title: string
          type: string
          upload_date: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          download_count?: number | null
          duration?: string | null
          exam_id: string
          file_path: string
          file_size?: number | null
          id?: string
          is_shared?: boolean | null
          last_accessed_at?: string | null
          password_hash?: string | null
          permission_level?: string | null
          share_token?: string | null
          shared_until?: string | null
          title: string
          type: string
          upload_date?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          download_count?: number | null
          duration?: string | null
          exam_id?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_shared?: boolean | null
          last_accessed_at?: string | null
          password_hash?: string | null
          permission_level?: string | null
          share_token?: string | null
          shared_until?: string | null
          title?: string
          type?: string
          upload_date?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_resources_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string | null
          duration: string
          exam_date: string
          exam_time: string
          id: string
          name: string
          notes: string | null
          preparation_progress: number | null
          priority: string | null
          subject: string
          syllabus: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration: string
          exam_date: string
          exam_time: string
          id?: string
          name: string
          notes?: string | null
          preparation_progress?: number | null
          priority?: string | null
          subject: string
          syllabus?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration?: string
          exam_date?: string
          exam_time?: string
          id?: string
          name?: string
          notes?: string | null
          preparation_progress?: number | null
          priority?: string | null
          subject?: string
          syllabus?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      experiment_collaborators: {
        Row: {
          experiment_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          experiment_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          experiment_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiment_collaborators_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "collaborative_experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_submissions: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          feature_suggestions: string | null
          id: string
          issues_faced: string | null
          rating: number
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          user_class: string | null
          user_id: string
          user_name: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          feature_suggestions?: string | null
          id?: string
          issues_faced?: string | null
          rating: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_class?: string | null
          user_id: string
          user_name: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          feature_suggestions?: string | null
          id?: string
          issues_faced?: string | null
          rating?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_class?: string | null
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      feedback_suggestions: {
        Row: {
          attachments: Json | null
          category: string | null
          created_at: string | null
          description: string
          id: string
          priority: string | null
          status: string | null
          title: string
          type: string
          updated_at: string | null
          upvotes: number | null
          user_id: string | null
        }
        Insert: {
          attachments?: Json | null
          category?: string | null
          created_at?: string | null
          description: string
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          type: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Update: {
          attachments?: Json | null
          category?: string | null
          created_at?: string | null
          description?: string
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      flashcard_decks: {
        Row: {
          card_count: number | null
          created_at: string
          description: string | null
          id: string
          last_studied_at: string | null
          subject: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          card_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          last_studied_at?: string | null
          subject?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          card_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          last_studied_at?: string | null
          subject?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      flashcard_reviews: {
        Row: {
          flashcard_id: string
          id: string
          rating: number
          response_time_ms: number | null
          reviewed_at: string
          user_id: string
        }
        Insert: {
          flashcard_id: string
          id?: string
          rating: number
          response_time_ms?: number | null
          reviewed_at?: string
          user_id: string
        }
        Update: {
          flashcard_id?: string
          id?: string
          rating?: number
          response_time_ms?: number | null
          reviewed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_reviews_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          answer: string
          created_at: string
          deck_id: string
          difficulty: string | null
          ease_factor: number | null
          id: string
          interval_days: number | null
          next_review_at: string | null
          question: string
          review_count: number | null
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          deck_id: string
          difficulty?: string | null
          ease_factor?: number | null
          id?: string
          interval_days?: number | null
          next_review_at?: string | null
          question: string
          review_count?: number | null
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          deck_id?: string
          difficulty?: string | null
          ease_factor?: number | null
          id?: string
          interval_days?: number | null
          next_review_at?: string | null
          question?: string
          review_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "flashcard_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      focus_sessions: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          duration_minutes: number
          id: string
          interruptions: number | null
          mood: string | null
          notes: string | null
          session_type: string | null
          started_at: string | null
          subject: string | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          duration_minutes: number
          id?: string
          interruptions?: number | null
          mood?: string | null
          notes?: string | null
          session_type?: string | null
          started_at?: string | null
          subject?: string | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number
          id?: string
          interruptions?: number | null
          mood?: string | null
          notes?: string | null
          session_type?: string | null
          started_at?: string | null
          subject?: string | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      focus_sound_mixes: {
        Row: {
          created_at: string | null
          id: string
          is_public: boolean | null
          name: string
          play_count: number | null
          sounds_config: Json
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          play_count?: number | null
          sounds_config?: Json
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          play_count?: number | null
          sounds_config?: Json
          user_id?: string
        }
        Relationships: []
      }
      game_stats: {
        Row: {
          created_at: string | null
          game_type: string
          games_played: number | null
          high_score: number | null
          id: string
          metadata: Json | null
          score: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          game_type: string
          games_played?: number | null
          high_score?: number | null
          id?: string
          metadata?: Json | null
          score?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          game_type?: string
          games_played?: number | null
          high_score?: number | null
          id?: string
          metadata?: Json | null
          score?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      generated_courses: {
        Row: {
          ai_provider: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          estimated_hours: number | null
          id: string
          is_public: boolean | null
          modules: Json
          subject: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_provider?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_hours?: number | null
          id?: string
          is_public?: boolean | null
          modules?: Json
          subject?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_provider?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_hours?: number | null
          id?: string
          is_public?: boolean | null
          modules?: Json
          subject?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      generated_websites: {
        Row: {
          created_at: string | null
          css_code: string
          description: string
          html_code: string
          id: string
          is_published: boolean | null
          js_code: string | null
          published_at: string | null
          slug: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          css_code: string
          description: string
          html_code: string
          id?: string
          is_published?: boolean | null
          js_code?: string | null
          published_at?: string | null
          slug?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          css_code?: string
          description?: string
          html_code?: string
          id?: string
          is_published?: boolean | null
          js_code?: string | null
          published_at?: string | null
          slug?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      goal_milestones: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          goal_id: string
          id: string
          target_value: number
          title: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          goal_id: string
          id?: string
          target_value: number
          title: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          goal_id?: string
          id?: string
          target_value?: number
          title?: string
        }
        Relationships: []
      }
      google_calendar_tokens: {
        Row: {
          access_token: string
          account_name: string | null
          created_at: string
          expires_at: string
          google_email: string
          id: string
          is_primary: boolean | null
          refresh_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          account_name?: string | null
          created_at?: string
          expires_at: string
          google_email: string
          id?: string
          is_primary?: boolean | null
          refresh_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          account_name?: string | null
          created_at?: string
          expires_at?: string
          google_email?: string
          id?: string
          is_primary?: boolean | null
          refresh_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      google_drive_tokens: {
        Row: {
          access_token: string
          account_name: string | null
          created_at: string
          expires_at: string
          google_email: string | null
          id: string
          is_primary: boolean | null
          refresh_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          account_name?: string | null
          created_at?: string
          expires_at: string
          google_email?: string | null
          id?: string
          is_primary?: boolean | null
          refresh_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          account_name?: string | null
          created_at?: string
          expires_at?: string
          google_email?: string | null
          id?: string
          is_primary?: boolean | null
          refresh_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      grading_rubrics: {
        Row: {
          created_at: string | null
          criteria: Json
          id: string
          is_template: boolean | null
          name: string
          subject: string | null
          teacher_id: string
          total_points: number | null
        }
        Insert: {
          created_at?: string | null
          criteria?: Json
          id?: string
          is_template?: boolean | null
          name: string
          subject?: string | null
          teacher_id: string
          total_points?: number | null
        }
        Update: {
          created_at?: string | null
          criteria?: Json
          id?: string
          is_template?: boolean | null
          name?: string
          subject?: string | null
          teacher_id?: string
          total_points?: number | null
        }
        Relationships: []
      }
      groq_conversations: {
        Row: {
          created_at: string | null
          id: string
          model: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          model?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          model?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      groq_messages: {
        Row: {
          attachment_url: string | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          attachment_url?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          attachment_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "groq_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "groq_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      guardian_access_requests: {
        Row: {
          created_at: string | null
          guardian_id: string
          id: string
          message: string | null
          relationship_type: string
          status: string
          student_email: string
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          guardian_id: string
          id?: string
          message?: string | null
          relationship_type: string
          status?: string
          student_email: string
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          guardian_id?: string
          id?: string
          message?: string | null
          relationship_type?: string
          status?: string
          student_email?: string
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      guardian_role_requests: {
        Row: {
          created_at: string | null
          id: string
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          role_type: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role_type: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role_type?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      guardian_study_goals: {
        Row: {
          created_at: string | null
          current_value: number | null
          goal_type: string
          guardian_id: string
          id: string
          status: string | null
          student_id: string
          target_value: number
          updated_at: string | null
          week_end: string
          week_start: string
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          goal_type: string
          guardian_id: string
          id?: string
          status?: string | null
          student_id: string
          target_value: number
          updated_at?: string | null
          week_end?: string
          week_start?: string
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          goal_type?: string
          guardian_id?: string
          id?: string
          status?: string | null
          student_id?: string
          target_value?: number
          updated_at?: string | null
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
      guild_challenge_progress: {
        Row: {
          challenge_id: string
          completed: boolean | null
          completed_at: string | null
          current_value: number | null
          guild_id: string
          id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean | null
          completed_at?: string | null
          current_value?: number | null
          guild_id: string
          id?: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean | null
          completed_at?: string | null
          current_value?: number | null
          guild_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "guild_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_challenge_progress_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_challenges: {
        Row: {
          challenge_type: string
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          name: string
          reward_xp: number
          start_date: string | null
          target_value: number
        }
        Insert: {
          challenge_type: string
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          name: string
          reward_xp: number
          start_date?: string | null
          target_value: number
        }
        Update: {
          challenge_type?: string
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          name?: string
          reward_xp?: number
          start_date?: string | null
          target_value?: number
        }
        Relationships: []
      }
      guild_members: {
        Row: {
          contribution_xp: number | null
          guild_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          contribution_xp?: number | null
          guild_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          contribution_xp?: number | null
          guild_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_members_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_messages: {
        Row: {
          attachments: Json | null
          created_at: string | null
          guild_id: string
          id: string
          message: string
          message_type: string | null
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          guild_id: string
          id?: string
          message: string
          message_type?: string | null
          user_id: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          guild_id?: string
          id?: string
          message?: string
          message_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_messages_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guilds: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          member_limit: number | null
          name: string
          owner_id: string
          rank: number | null
          total_xp: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          member_limit?: number | null
          name: string
          owner_id: string
          rank?: number | null
          total_xp?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          member_limit?: number | null
          name?: string
          owner_id?: string
          rank?: number | null
          total_xp?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      habit_completions: {
        Row: {
          completed_at: string | null
          habit_id: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          habit_id: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          habit_id?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "study_habits"
            referencedColumns: ["id"]
          },
        ]
      }
      homework_assignments: {
        Row: {
          actual_time: number | null
          collaboration_enabled: boolean | null
          created_at: string | null
          dependency_ids: string[] | null
          description: string | null
          due_date: string
          estimated_time: number | null
          exam_link: string | null
          id: string
          priority: string | null
          progress_checkpoints: Json | null
          status: string | null
          subject: string
          title: string
          user_id: string
        }
        Insert: {
          actual_time?: number | null
          collaboration_enabled?: boolean | null
          created_at?: string | null
          dependency_ids?: string[] | null
          description?: string | null
          due_date: string
          estimated_time?: number | null
          exam_link?: string | null
          id?: string
          priority?: string | null
          progress_checkpoints?: Json | null
          status?: string | null
          subject: string
          title: string
          user_id: string
        }
        Update: {
          actual_time?: number | null
          collaboration_enabled?: boolean | null
          created_at?: string | null
          dependency_ids?: string[] | null
          description?: string | null
          due_date?: string
          estimated_time?: number | null
          exam_link?: string | null
          id?: string
          priority?: string | null
          progress_checkpoints?: Json | null
          status?: string | null
          subject?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      homework_checkpoints: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          homework_id: string
          id: string
          title: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          homework_id: string
          id?: string
          title: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          homework_id?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_checkpoints_homework_id_fkey"
            columns: ["homework_id"]
            isOneToOne: false
            referencedRelation: "homework_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      infinite_chains: {
        Row: {
          chain_data: Json | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chain_data?: Json | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chain_data?: Json | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      institutes: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      lab_achievements: {
        Row: {
          achievement_key: string
          id: string
          lab_type: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_key: string
          id?: string
          lab_type: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_key?: string
          id?: string
          lab_type?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lab_notebook_entries: {
        Row: {
          created_at: string | null
          data: Json | null
          experiment_name: string
          id: string
          lab_type: string
          observations: string | null
          results: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          experiment_name: string
          id?: string
          lab_type: string
          observations?: string | null
          results?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          experiment_name?: string
          id?: string
          lab_type?: string
          observations?: string | null
          results?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lab_quiz_scores: {
        Row: {
          answers: Json | null
          completed_at: string | null
          id: string
          lab_type: string
          quiz_id: string
          score: number
          total_questions: number
          user_id: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          id?: string
          lab_type: string
          quiz_id: string
          score: number
          total_questions: number
          user_id: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          id?: string
          lab_type?: string
          quiz_id?: string
          score?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      leaderboard_entries: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          leaderboard_type: string
          metadata: Json | null
          period_end: string
          period_start: string
          rank: number | null
          score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          leaderboard_type: string
          metadata?: Json | null
          period_end: string
          period_start: string
          rank?: number | null
          score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          leaderboard_type?: string
          metadata?: Json | null
          period_end?: string
          period_start?: string
          rank?: number | null
          score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      learning_style_adaptations: {
        Row: {
          adapted_settings: Json | null
          feature_key: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          adapted_settings?: Json | null
          feature_key?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          adapted_settings?: Json | null
          feature_key?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      learning_style_assessments: {
        Row: {
          created_at: string | null
          id: string
          primary_style: string | null
          recommendations: Json | null
          responses: Json | null
          secondary_style: string | null
          style_results: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          primary_style?: string | null
          recommendations?: Json | null
          responses?: Json | null
          secondary_style?: string | null
          style_results?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          primary_style?: string | null
          recommendations?: Json | null
          responses?: Json | null
          secondary_style?: string | null
          style_results?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      liked_tracks: {
        Row: {
          id: string
          liked_at: string | null
          track_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          liked_at?: string | null
          track_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          liked_at?: string | null
          track_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "liked_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string | null
          id: string
          track_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          track_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          track_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      link_archive: {
        Row: {
          added_by: string
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          tags: string[] | null
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          added_by: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          added_by?: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      listed_songs: {
        Row: {
          created_at: string
          duration: number | null
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          is_public: boolean | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          is_public?: boolean | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          is_public?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      listening_history: {
        Row: {
          context: string | null
          device_type: string | null
          duration_played: number | null
          id: string
          location_lat: number | null
          location_lng: number | null
          played_at: string | null
          track_id: string | null
          user_id: string | null
        }
        Insert: {
          context?: string | null
          device_type?: string | null
          duration_played?: number | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          played_at?: string | null
          track_id?: string | null
          user_id?: string | null
        }
        Update: {
          context?: string | null
          device_type?: string | null
          duration_played?: number | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          played_at?: string | null
          track_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listening_history_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      live_class_attendance: {
        Row: {
          class_id: string
          id: string
          is_online: boolean | null
          joined_at: string | null
          left_at: string | null
          user_id: string
        }
        Insert: {
          class_id: string
          id?: string
          is_online?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          user_id: string
        }
        Update: {
          class_id?: string
          id?: string
          is_online?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_class_attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "live_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      live_class_chat: {
        Row: {
          class_id: string
          created_at: string | null
          id: string
          message: string
          message_type: string | null
          user_id: string
        }
        Insert: {
          class_id: string
          created_at?: string | null
          id?: string
          message: string
          message_type?: string | null
          user_id: string
        }
        Update: {
          class_id?: string
          created_at?: string | null
          id?: string
          message?: string
          message_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_class_chat_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "live_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      live_class_doubts: {
        Row: {
          answer: string | null
          answered: boolean | null
          answered_at: string | null
          created_at: string | null
          id: string
          question: string
          session_id: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          answer?: string | null
          answered?: boolean | null
          answered_at?: string | null
          created_at?: string | null
          id?: string
          question: string
          session_id: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          answer?: string | null
          answered?: boolean | null
          answered_at?: string | null
          created_at?: string | null
          id?: string
          question?: string
          session_id?: string
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_class_doubts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_class_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_class_files: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          session_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          session_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          session_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_class_files_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_class_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_class_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_class_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_class_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_class_mood: {
        Row: {
          class_id: string
          id: string
          mood: string
          timestamp: string | null
          user_id: string
        }
        Insert: {
          class_id: string
          id?: string
          mood: string
          timestamp?: string | null
          user_id: string
        }
        Update: {
          class_id?: string
          id?: string
          mood?: string
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_class_mood_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "live_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      live_class_notes: {
        Row: {
          class_id: string
          content: string
          id: string
          is_shared: boolean | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          class_id: string
          content: string
          id?: string
          is_shared?: boolean | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          class_id?: string
          content?: string
          id?: string
          is_shared?: boolean | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_class_notes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "live_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      live_class_poll_responses: {
        Row: {
          created_at: string | null
          id: string
          poll_id: string
          selected_option: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          poll_id: string
          selected_option: string
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          poll_id?: string
          selected_option?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_class_poll_responses_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "live_class_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      live_class_polls: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          is_active: boolean | null
          options: Json
          question: string
          session_id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          is_active?: boolean | null
          options: Json
          question: string
          session_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          is_active?: boolean | null
          options?: Json
          question?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_class_polls_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_class_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_class_qa: {
        Row: {
          answer: string | null
          answered_at: string | null
          answered_by: string | null
          class_id: string
          created_at: string | null
          id: string
          question: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          class_id: string
          created_at?: string | null
          id?: string
          question: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          class_id?: string
          created_at?: string | null
          id?: string
          question?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_class_qa_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "live_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      live_class_questions: {
        Row: {
          answer: string | null
          answered_at: string | null
          answered_by: string | null
          class_id: string
          created_at: string | null
          id: string
          is_answered: boolean | null
          priority: number | null
          question: string
          student_id: string
          upvotes: number | null
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          class_id: string
          created_at?: string | null
          id?: string
          is_answered?: boolean | null
          priority?: number | null
          question: string
          student_id: string
          upvotes?: number | null
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          class_id?: string
          created_at?: string | null
          id?: string
          is_answered?: boolean | null
          priority?: number | null
          question?: string
          student_id?: string
          upvotes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "live_class_questions_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "live_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      live_class_raised_hands: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          id: string
          raised_at: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          id?: string
          raised_at?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          id?: string
          raised_at?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_class_raised_hands_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_class_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_class_sessions: {
        Row: {
          channel_name: string
          chat_mode: string | null
          classroom_id: string
          created_at: string | null
          ended_at: string | null
          id: string
          started_at: string | null
          status: string | null
          teacher_id: string
        }
        Insert: {
          channel_name: string
          chat_mode?: string | null
          classroom_id: string
          created_at?: string | null
          ended_at?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          teacher_id: string
        }
        Update: {
          channel_name?: string
          chat_mode?: string | null
          classroom_id?: string
          created_at?: string | null
          ended_at?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_class_sessions_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      live_classes: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          agora_channel_name: string | null
          agora_token: string | null
          attendance_count: number | null
          class_link: string | null
          classroom_id: string | null
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          is_recurring: boolean | null
          max_participants: number | null
          notes: string | null
          recording_enabled: boolean | null
          recording_url: string | null
          recurring_days: number[] | null
          recurring_end_date: string | null
          recurring_pattern: string | null
          scheduled_end: string | null
          scheduled_start: string | null
          scheduler_task_id: string | null
          screen_share_active: boolean | null
          screen_share_enabled: boolean | null
          screen_share_user_id: string | null
          start_time: string
          status: string | null
          subject: string
          teacher_id: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          agora_channel_name?: string | null
          agora_token?: string | null
          attendance_count?: number | null
          class_link?: string | null
          classroom_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          is_recurring?: boolean | null
          max_participants?: number | null
          notes?: string | null
          recording_enabled?: boolean | null
          recording_url?: string | null
          recurring_days?: number[] | null
          recurring_end_date?: string | null
          recurring_pattern?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          scheduler_task_id?: string | null
          screen_share_active?: boolean | null
          screen_share_enabled?: boolean | null
          screen_share_user_id?: string | null
          start_time: string
          status?: string | null
          subject: string
          teacher_id?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          agora_channel_name?: string | null
          agora_token?: string | null
          attendance_count?: number | null
          class_link?: string | null
          classroom_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          is_recurring?: boolean | null
          max_participants?: number | null
          notes?: string | null
          recording_enabled?: boolean | null
          recording_url?: string | null
          recurring_days?: number[] | null
          recurring_end_date?: string | null
          recurring_pattern?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          scheduler_task_id?: string | null
          screen_share_active?: boolean | null
          screen_share_enabled?: boolean | null
          screen_share_user_id?: string | null
          start_time?: string
          status?: string | null
          subject?: string
          teacher_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_classes_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_integrations: {
        Row: {
          api_credentials: Json | null
          classroom_id: string
          created_at: string | null
          id: string
          last_sync: string | null
          lms_course_id: string | null
          lms_type: string | null
          sync_enabled: boolean | null
          sync_errors: Json | null
          sync_grades: boolean | null
          sync_roster: boolean | null
        }
        Insert: {
          api_credentials?: Json | null
          classroom_id: string
          created_at?: string | null
          id?: string
          last_sync?: string | null
          lms_course_id?: string | null
          lms_type?: string | null
          sync_enabled?: boolean | null
          sync_errors?: Json | null
          sync_grades?: boolean | null
          sync_roster?: boolean | null
        }
        Update: {
          api_credentials?: Json | null
          classroom_id?: string
          created_at?: string | null
          id?: string
          last_sync?: string | null
          lms_course_id?: string | null
          lms_type?: string | null
          sync_enabled?: boolean | null
          sync_errors?: Json | null
          sync_grades?: boolean | null
          sync_roster?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "lms_integrations_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      local_server_saves: {
        Row: {
          bucket_name: string | null
          created_at: string
          file_name: string | null
          file_size: number | null
          file_type: string | null
          id: string
          original_data: Json | null
          source_id: string | null
          source_type: string
          storage_path: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bucket_name?: string | null
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          original_data?: Json | null
          source_id?: string | null
          source_type: string
          storage_path?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bucket_name?: string | null
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          original_data?: Json | null
          source_id?: string | null
          source_type?: string
          storage_path?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      login_streaks: {
        Row: {
          created_at: string | null
          id: string
          login_date: string
          streak_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          login_date?: string
          streak_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          login_date?: string
          streak_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      message_bookmarks: {
        Row: {
          bookmarked_at: string | null
          id: string
          message_id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          bookmarked_at?: string | null
          id?: string
          message_id: string
          notes?: string | null
          user_id: string
        }
        Update: {
          bookmarked_at?: string | null
          id?: string
          message_id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_bookmarks_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_edit_history: {
        Row: {
          edited_at: string | null
          edited_by: string
          id: string
          message_id: string
          previous_content: string
        }
        Insert: {
          edited_at?: string | null
          edited_by: string
          id?: string
          message_id: string
          previous_content: string
        }
        Update: {
          edited_at?: string | null
          edited_by?: string
          id?: string
          message_id?: string
          previous_content?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_edit_history_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string | null
          id: string
          message_id: string
          reaction: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_id: string
          reaction: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message_id?: string
          reaction?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reports: {
        Row: {
          created_at: string | null
          id: string
          message_id: string
          reason: string
          reported_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_id: string
          reason: string
          reported_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message_id?: string
          reason?: string
          reported_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_reports_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string | null
          forwarded_from: string | null
          id: string
          is_forwarded: boolean | null
          is_read: boolean | null
          message_type: string | null
          original_message_id: string | null
          parent_message_id: string | null
          read_at: string | null
          receiver_id: string
          room_id: string | null
          sender_id: string
          updated_at: string | null
          voice_duration: number | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string | null
          forwarded_from?: string | null
          id?: string
          is_forwarded?: boolean | null
          is_read?: boolean | null
          message_type?: string | null
          original_message_id?: string | null
          parent_message_id?: string | null
          read_at?: string | null
          receiver_id: string
          room_id?: string | null
          sender_id: string
          updated_at?: string | null
          voice_duration?: number | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string | null
          forwarded_from?: string | null
          id?: string
          is_forwarded?: boolean | null
          is_read?: boolean | null
          message_type?: string | null
          original_message_id?: string | null
          parent_message_id?: string | null
          read_at?: string | null
          receiver_id?: string
          room_id?: string | null
          sender_id?: string
          updated_at?: string | null
          voice_duration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      mind_maps: {
        Row: {
          connections: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          nodes: Json | null
          style_config: Json | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          connections?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          nodes?: Json | null
          style_config?: Json | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          connections?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          nodes?: Json | null
          style_config?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          created_at: string | null
          id: string
          mood: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mood: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mood?: string
          user_id?: string
        }
        Relationships: []
      }
      music_playlists: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nexus_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_visible: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          name?: string
        }
        Relationships: []
      }
      nexus_link_submissions: {
        Row: {
          admin_notes: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          url: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          url: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nexus_link_submissions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "nexus_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      nexus_links: {
        Row: {
          category_id: string | null
          comment_color: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          effect_type: string | null
          id: string
          image_url: string | null
          is_visible: boolean | null
          name: string
          special_comment: string | null
          tile_color: string | null
          url: string
        }
        Insert: {
          category_id?: string | null
          comment_color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          effect_type?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          name: string
          special_comment?: string | null
          tile_color?: string | null
          url: string
        }
        Update: {
          category_id?: string | null
          comment_color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          effect_type?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          name?: string
          special_comment?: string | null
          tile_color?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "nexus_links_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "nexus_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      nexus_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      niranx_ai_suggestions: {
        Row: {
          created_at: string | null
          email_id: string | null
          id: string
          model_used: string | null
          suggestions: Json
        }
        Insert: {
          created_at?: string | null
          email_id?: string | null
          id?: string
          model_used?: string | null
          suggestions?: Json
        }
        Update: {
          created_at?: string | null
          email_id?: string | null
          id?: string
          model_used?: string | null
          suggestions?: Json
        }
        Relationships: [
          {
            foreignKeyName: "niranx_ai_suggestions_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "niranx_emails"
            referencedColumns: ["id"]
          },
        ]
      }
      niranx_artists: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_visible: boolean | null
          name: string
          spotify_url: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          name: string
          spotify_url?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          name?: string
          spotify_url?: string | null
        }
        Relationships: []
      }
      niranx_blocked_senders: {
        Row: {
          blocked_at: string | null
          email_address: string
          id: string
          mailbox_id: string | null
          reason: string | null
          user_id: string
        }
        Insert: {
          blocked_at?: string | null
          email_address: string
          id?: string
          mailbox_id?: string | null
          reason?: string | null
          user_id: string
        }
        Update: {
          blocked_at?: string | null
          email_address?: string
          id?: string
          mailbox_id?: string | null
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "niranx_blocked_senders_mailbox_id_fkey"
            columns: ["mailbox_id"]
            isOneToOne: false
            referencedRelation: "niranx_mailboxes"
            referencedColumns: ["id"]
          },
        ]
      }
      niranx_contact_group_members: {
        Row: {
          added_at: string | null
          contact_id: string | null
          group_id: string | null
          id: string
        }
        Insert: {
          added_at?: string | null
          contact_id?: string | null
          group_id?: string | null
          id?: string
        }
        Update: {
          added_at?: string | null
          contact_id?: string | null
          group_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "niranx_contact_group_members_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "niranx_email_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "niranx_contact_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "niranx_contact_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      niranx_contact_groups: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      niranx_contact_submissions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      niranx_email_contacts: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          is_favorite: boolean | null
          mailbox_id: string
          name: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          is_favorite?: boolean | null
          mailbox_id: string
          name?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          is_favorite?: boolean | null
          mailbox_id?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "niranx_email_contacts_mailbox_id_fkey"
            columns: ["mailbox_id"]
            isOneToOne: false
            referencedRelation: "niranx_mailboxes"
            referencedColumns: ["id"]
          },
        ]
      }
      niranx_email_filters: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          mailbox_id: string | null
          name: string
          priority: number | null
          user_id: string
        }
        Insert: {
          actions?: Json
          conditions?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          mailbox_id?: string | null
          name: string
          priority?: number | null
          user_id: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          mailbox_id?: string | null
          name?: string
          priority?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "niranx_email_filters_mailbox_id_fkey"
            columns: ["mailbox_id"]
            isOneToOne: false
            referencedRelation: "niranx_mailboxes"
            referencedColumns: ["id"]
          },
        ]
      }
      niranx_email_folders: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          is_system: boolean | null
          mailbox_id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_system?: boolean | null
          mailbox_id: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_system?: boolean | null
          mailbox_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "niranx_email_folders_mailbox_id_fkey"
            columns: ["mailbox_id"]
            isOneToOne: false
            referencedRelation: "niranx_mailboxes"
            referencedColumns: ["id"]
          },
        ]
      }
      niranx_email_forwards: {
        Row: {
          created_at: string | null
          forward_to_external: string | null
          id: string
          is_active: boolean | null
          mailbox_id: string | null
        }
        Insert: {
          created_at?: string | null
          forward_to_external?: string | null
          id?: string
          is_active?: boolean | null
          mailbox_id?: string | null
        }
        Update: {
          created_at?: string | null
          forward_to_external?: string | null
          id?: string
          is_active?: boolean | null
          mailbox_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "niranx_email_forwards_mailbox_id_fkey"
            columns: ["mailbox_id"]
            isOneToOne: false
            referencedRelation: "niranx_mailboxes"
            referencedColumns: ["id"]
          },
        ]
      }
      niranx_email_labels: {
        Row: {
          color: string | null
          created_at: string
          id: string
          mailbox_id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          mailbox_id: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          mailbox_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "niranx_email_labels_mailbox_id_fkey"
            columns: ["mailbox_id"]
            isOneToOne: false
            referencedRelation: "niranx_mailboxes"
            referencedColumns: ["id"]
          },
        ]
      }
      niranx_email_signatures: {
        Row: {
          content: string
          created_at: string | null
          html_content: string | null
          id: string
          is_default: boolean | null
          mailbox_id: string | null
          name: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          html_content?: string | null
          id?: string
          is_default?: boolean | null
          mailbox_id?: string | null
          name: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          html_content?: string | null
          id?: string
          is_default?: boolean | null
          mailbox_id?: string | null
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "niranx_email_signatures_mailbox_id_fkey"
            columns: ["mailbox_id"]
            isOneToOne: false
            referencedRelation: "niranx_mailboxes"
            referencedColumns: ["id"]
          },
        ]
      }
      niranx_email_templates: {
        Row: {
          body: string
          category: string | null
          created_at: string | null
          html_body: string | null
          id: string
          mailbox_id: string | null
          name: string
          subject: string | null
          updated_at: string | null
          use_count: number | null
          user_id: string
        }
        Insert: {
          body: string
          category?: string | null
          created_at?: string | null
          html_body?: string | null
          id?: string
          mailbox_id?: string | null
          name: string
          subject?: string | null
          updated_at?: string | null
          use_count?: number | null
          user_id: string
        }
        Update: {
          body?: string
          category?: string | null
          created_at?: string | null
          html_body?: string | null
          id?: string
          mailbox_id?: string | null
          name?: string
          subject?: string | null
          updated_at?: string | null
          use_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "niranx_email_templates_mailbox_id_fkey"
            columns: ["mailbox_id"]
            isOneToOne: false
            referencedRelation: "niranx_mailboxes"
            referencedColumns: ["id"]
          },
        ]
      }
      niranx_emails: {
        Row: {
          attachments: Json | null
          bcc_addresses: string[] | null
          body: string | null
          cc_addresses: string[] | null
          created_at: string
          encryption_key: string | null
          external_headers: Json | null
          external_message_id: string | null
          folder: string | null
          from_address: string
          html_body: string | null
          id: string
          in_reply_to: string | null
          is_archived: boolean | null
          is_draft: boolean | null
          is_encrypted: boolean | null
          is_external: boolean | null
          is_public: boolean | null
          is_read: boolean | null
          is_read_receipt_requested: boolean | null
          is_scheduled: boolean | null
          is_sent: boolean | null
          is_spam: boolean | null
          is_starred: boolean | null
          is_trash: boolean | null
          is_verified: boolean | null
          labels: string[] | null
          mailbox_id: string
          priority: string | null
          read_at: string | null
          reply_to_id: string | null
          scheduled_at: string | null
          sent_at: string | null
          slug: string | null
          snoozed_until: string | null
          spam_score: number | null
          subject: string | null
          thread_id: string | null
          to_addresses: string[]
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          bcc_addresses?: string[] | null
          body?: string | null
          cc_addresses?: string[] | null
          created_at?: string
          encryption_key?: string | null
          external_headers?: Json | null
          external_message_id?: string | null
          folder?: string | null
          from_address: string
          html_body?: string | null
          id?: string
          in_reply_to?: string | null
          is_archived?: boolean | null
          is_draft?: boolean | null
          is_encrypted?: boolean | null
          is_external?: boolean | null
          is_public?: boolean | null
          is_read?: boolean | null
          is_read_receipt_requested?: boolean | null
          is_scheduled?: boolean | null
          is_sent?: boolean | null
          is_spam?: boolean | null
          is_starred?: boolean | null
          is_trash?: boolean | null
          is_verified?: boolean | null
          labels?: string[] | null
          mailbox_id: string
          priority?: string | null
          read_at?: string | null
          reply_to_id?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          slug?: string | null
          snoozed_until?: string | null
          spam_score?: number | null
          subject?: string | null
          thread_id?: string | null
          to_addresses: string[]
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          bcc_addresses?: string[] | null
          body?: string | null
          cc_addresses?: string[] | null
          created_at?: string
          encryption_key?: string | null
          external_headers?: Json | null
          external_message_id?: string | null
          folder?: string | null
          from_address?: string
          html_body?: string | null
          id?: string
          in_reply_to?: string | null
          is_archived?: boolean | null
          is_draft?: boolean | null
          is_encrypted?: boolean | null
          is_external?: boolean | null
          is_public?: boolean | null
          is_read?: boolean | null
          is_read_receipt_requested?: boolean | null
          is_scheduled?: boolean | null
          is_sent?: boolean | null
          is_spam?: boolean | null
          is_starred?: boolean | null
          is_trash?: boolean | null
          is_verified?: boolean | null
          labels?: string[] | null
          mailbox_id?: string
          priority?: string | null
          read_at?: string | null
          reply_to_id?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          slug?: string | null
          snoozed_until?: string | null
          spam_score?: number | null
          subject?: string | null
          thread_id?: string | null
          to_addresses?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "niranx_emails_in_reply_to_fkey"
            columns: ["in_reply_to"]
            isOneToOne: false
            referencedRelation: "niranx_emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "niranx_emails_mailbox_id_fkey"
            columns: ["mailbox_id"]
            isOneToOne: false
            referencedRelation: "niranx_mailboxes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "niranx_emails_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "niranx_emails"
            referencedColumns: ["id"]
          },
        ]
      }
      niranx_footer_links: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          display_order: number
          icon: string | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      niranx_mailboxes: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          date_of_birth: string | null
          default_signature_id: string | null
          display_name: string | null
          email_address: string
          id: string
          is_primary: boolean | null
          is_public_profile: boolean | null
          linked_account_id: string | null
          mobile_number: string | null
          mobile_verified: boolean | null
          settings: Json | null
          slug: string | null
          storage_limit: number | null
          storage_used: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          default_signature_id?: string | null
          display_name?: string | null
          email_address: string
          id?: string
          is_primary?: boolean | null
          is_public_profile?: boolean | null
          linked_account_id?: string | null
          mobile_number?: string | null
          mobile_verified?: boolean | null
          settings?: Json | null
          slug?: string | null
          storage_limit?: number | null
          storage_used?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          default_signature_id?: string | null
          display_name?: string | null
          email_address?: string
          id?: string
          is_primary?: boolean | null
          is_public_profile?: boolean | null
          linked_account_id?: string | null
          mobile_number?: string | null
          mobile_verified?: boolean | null
          settings?: Json | null
          slug?: string | null
          storage_limit?: number | null
          storage_used?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "niranx_mailboxes_default_signature_id_fkey"
            columns: ["default_signature_id"]
            isOneToOne: false
            referencedRelation: "niranx_email_signatures"
            referencedColumns: ["id"]
          },
        ]
      }
      niranx_music_releases: {
        Row: {
          cover_url: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_visible: boolean | null
          link_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          link_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          link_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      niranx_newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean | null
          name: string | null
          subscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          subscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          subscribed_at?: string | null
        }
        Relationships: []
      }
      niranx_projects: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_visible: boolean | null
          link_url: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          link_url?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          link_url?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      niranx_read_receipts: {
        Row: {
          email_id: string | null
          id: string
          ip_address: string | null
          read_at: string | null
          read_by: string
          user_agent: string | null
        }
        Insert: {
          email_id?: string | null
          id?: string
          ip_address?: string | null
          read_at?: string | null
          read_by: string
          user_agent?: string | null
        }
        Update: {
          email_id?: string | null
          id?: string
          ip_address?: string | null
          read_at?: string | null
          read_by?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "niranx_read_receipts_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "niranx_emails"
            referencedColumns: ["id"]
          },
        ]
      }
      niranx_shared_mailboxes: {
        Row: {
          id: string
          mailbox_id: string | null
          permission_level: string | null
          shared_at: string | null
          shared_by: string
          shared_with_user_id: string
        }
        Insert: {
          id?: string
          mailbox_id?: string | null
          permission_level?: string | null
          shared_at?: string | null
          shared_by: string
          shared_with_user_id: string
        }
        Update: {
          id?: string
          mailbox_id?: string | null
          permission_level?: string | null
          shared_at?: string | null
          shared_by?: string
          shared_with_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "niranx_shared_mailboxes_mailbox_id_fkey"
            columns: ["mailbox_id"]
            isOneToOne: false
            referencedRelation: "niranx_mailboxes"
            referencedColumns: ["id"]
          },
        ]
      }
      niranx_site_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      niranx_songs: {
        Row: {
          artist_id: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_visible: boolean | null
          spotify_url: string | null
          title: string
        }
        Insert: {
          artist_id?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          spotify_url?: string | null
          title: string
        }
        Update: {
          artist_id?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          spotify_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "niranx_songs_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "niranx_artists"
            referencedColumns: ["id"]
          },
        ]
      }
      niranx_tech_stack: {
        Row: {
          category_title: string
          created_at: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_visible: boolean | null
          technologies: Json | null
          updated_at: string | null
        }
        Insert: {
          category_title: string
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          technologies?: Json | null
          updated_at?: string | null
        }
        Update: {
          category_title?: string
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          technologies?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      niranx_testimonials: {
        Row: {
          author_avatar: string | null
          author_name: string
          author_title: string | null
          content: string
          created_at: string
          created_by: string | null
          display_order: number
          id: string
          is_active: boolean
          rating: number | null
          updated_at: string
        }
        Insert: {
          author_avatar?: string | null
          author_name: string
          author_title?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          rating?: number | null
          updated_at?: string
        }
        Update: {
          author_avatar?: string | null
          author_name?: string
          author_title?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          rating?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      niranx_webhook_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          payload: Json | null
          status: string | null
          webhook_type: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          payload?: Json | null
          status?: string | null
          webhook_type: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          payload?: Json | null
          status?: string | null
          webhook_type?: string
        }
        Relationships: []
      }
      note_summaries: {
        Row: {
          created_at: string | null
          file_type: string | null
          id: string
          key_points: string[]
          mind_map: Json | null
          original_file_path: string | null
          subject: string | null
          summary: string
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_type?: string | null
          id?: string
          key_points?: string[]
          mind_map?: Json | null
          original_file_path?: string | null
          subject?: string | null
          summary: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_type?: string | null
          id?: string
          key_points?: string[]
          mind_map?: Json | null
          original_file_path?: string | null
          subject?: string | null
          summary?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          browser_notifications: boolean | null
          created_at: string | null
          digest_mode: boolean | null
          digest_time: string | null
          email_notifications: boolean | null
          exam_reminders: boolean | null
          feedback_responses: boolean | null
          id: string
          priority_filter: string | null
          push_notifications: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          resource_access: boolean | null
          smart_timing_enabled: boolean | null
          streak_milestones: boolean | null
          streak_reminders: boolean | null
          task_due_soon: boolean | null
          task_reminders: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          browser_notifications?: boolean | null
          created_at?: string | null
          digest_mode?: boolean | null
          digest_time?: string | null
          email_notifications?: boolean | null
          exam_reminders?: boolean | null
          feedback_responses?: boolean | null
          id?: string
          priority_filter?: string | null
          push_notifications?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          resource_access?: boolean | null
          smart_timing_enabled?: boolean | null
          streak_milestones?: boolean | null
          streak_reminders?: boolean | null
          task_due_soon?: boolean | null
          task_reminders?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          browser_notifications?: boolean | null
          created_at?: string | null
          digest_mode?: boolean | null
          digest_time?: string | null
          email_notifications?: boolean | null
          exam_reminders?: boolean | null
          feedback_responses?: boolean | null
          id?: string
          priority_filter?: string | null
          push_notifications?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          resource_access?: boolean | null
          smart_timing_enabled?: boolean | null
          streak_milestones?: boolean | null
          streak_reminders?: boolean | null
          task_due_soon?: boolean | null
          task_reminders?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          notification_type: string
          priority: string | null
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          notification_type: string
          priority?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          notification_type?: string
          priority?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      offline_notes_sync: {
        Row: {
          content: string | null
          created_at: string
          id: string
          local_updated_at: string | null
          note_id: string
          server_updated_at: string | null
          sync_status: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          local_updated_at?: string | null
          note_id: string
          server_updated_at?: string | null
          sync_status?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          local_updated_at?: string | null
          note_id?: string
          server_updated_at?: string | null
          sync_status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      page_access_control: {
        Row: {
          allowed_roles: string[] | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          page_name: string
          page_url: string
          updated_at: string | null
        }
        Insert: {
          allowed_roles?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          page_name: string
          page_url: string
          updated_at?: string | null
        }
        Update: {
          allowed_roles?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          page_name?: string
          page_url?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      page_theme_overrides: {
        Row: {
          created_at: string | null
          id: string
          page_route: string
          theme_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          page_route: string
          theme_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          page_route?: string
          theme_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_theme_overrides_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "custom_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      parental_controls: {
        Row: {
          allowed_end_time: string | null
          allowed_start_time: string | null
          blocked_features: string[] | null
          created_at: string
          daily_break_reminder_minutes: number | null
          daily_study_limit_minutes: number | null
          enforce_focus_sessions: boolean | null
          guardian_id: string
          id: string
          is_active: boolean | null
          student_id: string
          updated_at: string
        }
        Insert: {
          allowed_end_time?: string | null
          allowed_start_time?: string | null
          blocked_features?: string[] | null
          created_at?: string
          daily_break_reminder_minutes?: number | null
          daily_study_limit_minutes?: number | null
          enforce_focus_sessions?: boolean | null
          guardian_id: string
          id?: string
          is_active?: boolean | null
          student_id: string
          updated_at?: string
        }
        Update: {
          allowed_end_time?: string | null
          allowed_start_time?: string | null
          blocked_features?: string[] | null
          created_at?: string
          daily_break_reminder_minutes?: number | null
          daily_study_limit_minutes?: number | null
          enforce_focus_sessions?: boolean | null
          guardian_id?: string
          id?: string
          is_active?: boolean | null
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      password_vault: {
        Row: {
          category: string | null
          created_at: string
          encrypted_password: string
          id: string
          is_favorite: boolean | null
          notes: string | null
          site_name: string
          site_url: string | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          encrypted_password: string
          id?: string
          is_favorite?: boolean | null
          notes?: string | null
          site_name: string
          site_url?: string | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          category?: string | null
          created_at?: string
          encrypted_password?: string
          id?: string
          is_favorite?: boolean | null
          notes?: string | null
          site_name?: string
          site_url?: string | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      pdf_history: {
        Row: {
          created_at: string | null
          file_name: string
          file_url: string | null
          id: string
          last_page: number | null
          last_viewed_at: string | null
          page_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_url?: string | null
          id?: string
          last_page?: number | null
          last_viewed_at?: string | null
          page_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_url?: string | null
          id?: string
          last_page?: number | null
          last_viewed_at?: string | null
          page_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      pdf_summary_history: {
        Row: {
          created_at: string
          filename: string
          id: string
          summary_text: string
          summary_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filename: string
          id?: string
          summary_text: string
          summary_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          filename?: string
          id?: string
          summary_text?: string
          summary_type?: string
          user_id?: string
        }
        Relationships: []
      }
      personal_apps: {
        Row: {
          category_id: string | null
          created_at: string
          css_content: string | null
          description: string | null
          html_content: string
          id: string
          is_public: boolean | null
          js_content: string | null
          slug: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          css_content?: string | null
          description?: string | null
          html_content?: string
          id?: string
          is_public?: boolean | null
          js_content?: string | null
          slug: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          css_content?: string | null
          description?: string | null
          html_content?: string
          id?: string
          is_public?: boolean | null
          js_content?: string | null
          slug?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_apps_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "app_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      picture_likes: {
        Row: {
          created_at: string | null
          id: string
          picture_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          picture_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          picture_id?: string
          user_id?: string
        }
        Relationships: []
      }
      pictures: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          image_url: string
          likes: number | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          likes?: number | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          likes?: number | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pinned_messages: {
        Row: {
          id: string
          message_id: string
          message_type: string
          pinned_at: string | null
          pinned_by: string
          room_id: string | null
        }
        Insert: {
          id?: string
          message_id: string
          message_type?: string
          pinned_at?: string | null
          pinned_by: string
          room_id?: string | null
        }
        Update: {
          id?: string
          message_id?: string
          message_type?: string
          pinned_at?: string | null
          pinned_by?: string
          room_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pinned_messages_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: true
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pinned_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_tracks: {
        Row: {
          added_at: string | null
          id: string
          playlist_id: string | null
          position: number
          track_id: string | null
        }
        Insert: {
          added_at?: string | null
          id?: string
          playlist_id?: string | null
          position: number
          track_id?: string | null
        }
        Update: {
          added_at?: string | null
          id?: string
          playlist_id?: string | null
          position?: number
          track_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playlist_tracks_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pomodoro_sessions: {
        Row: {
          break_duration: number | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          duration_minutes: number
          id: string
          session_type: string | null
          user_id: string
        }
        Insert: {
          break_duration?: number | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number
          id?: string
          session_type?: string | null
          user_id: string
        }
        Update: {
          break_duration?: number | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number
          id?: string
          session_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      preset_themes: {
        Row: {
          category: string | null
          colors: Json
          created_at: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          preview_image_url: string | null
          theme_name: string
        }
        Insert: {
          category?: string | null
          colors: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          preview_image_url?: string | null
          theme_name: string
        }
        Update: {
          category?: string | null
          colors?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          preview_image_url?: string | null
          theme_name?: string
        }
        Relationships: []
      }
      privacy_settings: {
        Row: {
          allow_friend_requests: boolean | null
          allow_messages: boolean | null
          created_at: string | null
          id: string
          profile_visibility: string | null
          show_achievements: boolean | null
          show_activity: boolean | null
          show_study_stats: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allow_friend_requests?: boolean | null
          allow_messages?: boolean | null
          created_at?: string | null
          id?: string
          profile_visibility?: string | null
          show_achievements?: boolean | null
          show_activity?: boolean | null
          show_study_stats?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allow_friend_requests?: boolean | null
          allow_messages?: boolean | null
          created_at?: string | null
          id?: string
          profile_visibility?: string | null
          show_achievements?: boolean | null
          show_activity?: boolean | null
          show_study_stats?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ambition: string | null
          avatar_url: string | null
          bio: string | null
          class: string | null
          created_at: string | null
          date_of_birth: string | null
          display_name: string | null
          full_name: string | null
          grade: string | null
          id: string
          institute_id: string | null
          institutes: Json | null
          is_verified: boolean | null
          last_login_reward: string | null
          level: number | null
          location: string | null
          onboarding_completed: boolean | null
          phone_number: string | null
          referral_source: string | null
          scheduler_columns: Json | null
          social_links: Json | null
          updated_at: string | null
          user_id: string
          username: string | null
          website: string | null
          xp: number | null
        }
        Insert: {
          ambition?: string | null
          avatar_url?: string | null
          bio?: string | null
          class?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          display_name?: string | null
          full_name?: string | null
          grade?: string | null
          id?: string
          institute_id?: string | null
          institutes?: Json | null
          is_verified?: boolean | null
          last_login_reward?: string | null
          level?: number | null
          location?: string | null
          onboarding_completed?: boolean | null
          phone_number?: string | null
          referral_source?: string | null
          scheduler_columns?: Json | null
          social_links?: Json | null
          updated_at?: string | null
          user_id: string
          username?: string | null
          website?: string | null
          xp?: number | null
        }
        Update: {
          ambition?: string | null
          avatar_url?: string | null
          bio?: string | null
          class?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          display_name?: string | null
          full_name?: string | null
          grade?: string | null
          id?: string
          institute_id?: string | null
          institutes?: Json | null
          is_verified?: boolean | null
          last_login_reward?: string | null
          level?: number | null
          location?: string | null
          onboarding_completed?: boolean | null
          phone_number?: string | null
          referral_source?: string | null
          scheduler_columns?: Json | null
          social_links?: Json | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
          website?: string | null
          xp?: number | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth_key: string | null
          created_at: string
          device_info: Json | null
          endpoint: string
          id: string
          is_active: boolean | null
          p256dh_key: string | null
          user_id: string
        }
        Insert: {
          auth_key?: string | null
          created_at?: string
          device_info?: Json | null
          endpoint: string
          id?: string
          is_active?: boolean | null
          p256dh_key?: string | null
          user_id: string
        }
        Update: {
          auth_key?: string | null
          created_at?: string
          device_info?: Json | null
          endpoint?: string
          id?: string
          is_active?: boolean | null
          p256dh_key?: string | null
          user_id?: string
        }
        Relationships: []
      }
      quick_links: {
        Row: {
          created_at: string | null
          icon_name: string | null
          id: string
          order_index: number | null
          title: string
          updated_at: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          icon_name?: string | null
          id?: string
          order_index?: number | null
          title: string
          updated_at?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          icon_name?: string | null
          id?: string
          order_index?: number | null
          title?: string
          updated_at?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      radio_listening_history: {
        Row: {
          country: string | null
          created_at: string
          duration_seconds: number | null
          genre: string | null
          id: string
          listened_at: string
          station_id: string
          station_logo: string | null
          station_name: string
          station_url: string | null
          user_id: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          duration_seconds?: number | null
          genre?: string | null
          id?: string
          listened_at?: string
          station_id: string
          station_logo?: string | null
          station_name: string
          station_url?: string | null
          user_id: string
        }
        Update: {
          country?: string | null
          created_at?: string
          duration_seconds?: number | null
          genre?: string | null
          id?: string
          listened_at?: string
          station_id?: string
          station_logo?: string | null
          station_name?: string
          station_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reading_sessions: {
        Row: {
          accuracy: number | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          text_length: number | null
          user_id: string
          wpm: number | null
        }
        Insert: {
          accuracy?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          text_length?: number | null
          user_id: string
          wpm?: number | null
        }
        Update: {
          accuracy?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          text_length?: number | null
          user_id?: string
          wpm?: number | null
        }
        Relationships: []
      }
      recent_pages: {
        Row: {
          id: string
          page_title: string
          page_url: string
          user_id: string
          visit_count: number | null
          visited_at: string | null
        }
        Insert: {
          id?: string
          page_title: string
          page_url: string
          user_id: string
          visit_count?: number | null
          visited_at?: string | null
        }
        Update: {
          id?: string
          page_title?: string
          page_url?: string
          user_id?: string
          visit_count?: number | null
          visited_at?: string | null
        }
        Relationships: []
      }
      recycle_bin: {
        Row: {
          bucket_name: string | null
          created_at: string
          deleted_at: string
          file_path: string | null
          id: string
          is_permanently_deleted: boolean | null
          original_data: Json
          original_id: string
          original_table: string
          restored_at: string | null
          retention_days: number | null
          scheduled_permanent_delete: string | null
          user_id: string
        }
        Insert: {
          bucket_name?: string | null
          created_at?: string
          deleted_at?: string
          file_path?: string | null
          id?: string
          is_permanently_deleted?: boolean | null
          original_data: Json
          original_id: string
          original_table: string
          restored_at?: string | null
          retention_days?: number | null
          scheduled_permanent_delete?: string | null
          user_id: string
        }
        Update: {
          bucket_name?: string | null
          created_at?: string
          deleted_at?: string
          file_path?: string | null
          id?: string
          is_permanently_deleted?: boolean | null
          original_data?: Json
          original_id?: string
          original_table?: string
          restored_at?: string | null
          retention_days?: number | null
          scheduled_permanent_delete?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reward_tiers: {
        Row: {
          bonus_items: Json | null
          created_at: string | null
          event_end_date: string | null
          event_name: string | null
          event_start_date: string | null
          id: string
          is_special_event: boolean | null
          required_streak: number
          tier_name: string
          xp_reward: number
        }
        Insert: {
          bonus_items?: Json | null
          created_at?: string | null
          event_end_date?: string | null
          event_name?: string | null
          event_start_date?: string | null
          id?: string
          is_special_event?: boolean | null
          required_streak: number
          tier_name: string
          xp_reward: number
        }
        Update: {
          bonus_items?: Json | null
          created_at?: string | null
          event_end_date?: string | null
          event_name?: string | null
          event_start_date?: string | null
          id?: string
          is_special_event?: boolean | null
          required_streak?: number
          tier_name?: string
          xp_reward?: number
        }
        Relationships: []
      }
      scanned_documents: {
        Row: {
          ai_provider: string | null
          created_at: string | null
          extracted_text: string | null
          id: string
          image_url: string | null
          processing_status: string | null
          title: string
          user_id: string
        }
        Insert: {
          ai_provider?: string | null
          created_at?: string | null
          extracted_text?: string | null
          id?: string
          image_url?: string | null
          processing_status?: string | null
          title?: string
          user_id: string
        }
        Update: {
          ai_provider?: string | null
          created_at?: string | null
          extracted_text?: string | null
          id?: string
          image_url?: string | null
          processing_status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      schedule_conflicts: {
        Row: {
          conflict_type: string
          detected_at: string | null
          id: string
          items: Json
          resolution_note: string | null
          resolved: boolean | null
          user_id: string
        }
        Insert: {
          conflict_type: string
          detected_at?: string | null
          id?: string
          items: Json
          resolution_note?: string | null
          resolved?: boolean | null
          user_id: string
        }
        Update: {
          conflict_type?: string
          detected_at?: string | null
          id?: string
          items?: Json
          resolution_note?: string | null
          resolved?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      schedule_tasks: {
        Row: {
          class_duration: number | null
          class_link: string | null
          created_at: string | null
          day_of_week: string
          end_time: string
          id: string
          is_recurring: boolean | null
          notes: string | null
          priority: string | null
          recording_link: string | null
          recurrence_type: string | null
          start_time: string
          status: string | null
          subject: string
          task_name: string
          task_type: string | null
          topic: string | null
          unique_url_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          class_duration?: number | null
          class_link?: string | null
          created_at?: string | null
          day_of_week: string
          end_time: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          priority?: string | null
          recording_link?: string | null
          recurrence_type?: string | null
          start_time: string
          status?: string | null
          subject: string
          task_name: string
          task_type?: string | null
          topic?: string | null
          unique_url_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          class_duration?: number | null
          class_link?: string | null
          created_at?: string | null
          day_of_week?: string
          end_time?: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          priority?: string | null
          recording_link?: string | null
          recurrence_type?: string | null
          start_time?: string
          status?: string | null
          subject?: string
          task_name?: string
          task_type?: string | null
          topic?: string | null
          unique_url_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      search_history: {
        Row: {
          id: string
          query: string
          results_count: number | null
          search_type: string | null
          searched_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          query: string
          results_count?: number | null
          search_type?: string | null
          searched_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          query?: string
          results_count?: number | null
          search_type?: string | null
          searched_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sidebar_groups: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_default: boolean
          is_enabled: boolean
          name: string
          order_index: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_default?: boolean
          is_enabled?: boolean
          name: string
          order_index?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_default?: boolean
          is_enabled?: boolean
          name?: string
          order_index?: number
          updated_at?: string
        }
        Relationships: []
      }
      sidebar_pages: {
        Row: {
          created_at: string
          disabled_until: string | null
          group_id: string | null
          icon: string | null
          id: string
          is_enabled: boolean
          order_index: number
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          disabled_until?: string | null
          group_id?: string | null
          icon?: string | null
          id?: string
          is_enabled?: boolean
          order_index?: number
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          disabled_until?: string | null
          group_id?: string | null
          icon?: string | null
          id?: string
          is_enabled?: boolean
          order_index?: number
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "sidebar_pages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "sidebar_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_bookmarks: {
        Row: {
          ai_summary: string | null
          category: string | null
          collection_id: string | null
          created_at: string | null
          description: string | null
          favicon: string | null
          id: string
          tags: string[] | null
          title: string
          updated_at: string | null
          url: string
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          category?: string | null
          collection_id?: string | null
          created_at?: string | null
          description?: string | null
          favicon?: string | null
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          url: string
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          category?: string | null
          collection_id?: string | null
          created_at?: string | null
          description?: string | null
          favicon?: string | null
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smart_bookmarks_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "bookmark_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      space_data: {
        Row: {
          created_at: string | null
          data_key: string
          data_type: string
          data_value: Json | null
          id: string
          space_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_key: string
          data_type: string
          data_value?: Json | null
          id?: string
          space_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_key?: string
          data_type?: string
          data_value?: Json | null
          id?: string
          space_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "space_data_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      spaces: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          description: string | null
          has_password: boolean | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          name: string
          password_hash: string | null
          pin_hash: string
          space_url: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          has_password?: boolean | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name: string
          password_hash?: string | null
          pin_hash: string
          space_url: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          has_password?: boolean | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name?: string
          password_hash?: string | null
          pin_hash?: string
          space_url?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      spotify_favorites: {
        Row: {
          album_image_url: string | null
          album_name: string | null
          artist_name: string
          created_at: string | null
          duration_ms: number | null
          id: string
          spotify_track_id: string
          track_name: string
          user_id: string
        }
        Insert: {
          album_image_url?: string | null
          album_name?: string | null
          artist_name: string
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          spotify_track_id: string
          track_name: string
          user_id: string
        }
        Update: {
          album_image_url?: string | null
          album_name?: string | null
          artist_name?: string
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          spotify_track_id?: string
          track_name?: string
          user_id?: string
        }
        Relationships: []
      }
      spotify_playlist_tracks: {
        Row: {
          added_at: string | null
          album_image_url: string | null
          album_name: string | null
          artist_name: string
          duration_ms: number | null
          id: string
          playlist_id: string
          spotify_track_id: string
          track_name: string
        }
        Insert: {
          added_at?: string | null
          album_image_url?: string | null
          album_name?: string | null
          artist_name: string
          duration_ms?: number | null
          id?: string
          playlist_id: string
          spotify_track_id: string
          track_name: string
        }
        Update: {
          added_at?: string | null
          album_image_url?: string | null
          album_name?: string | null
          artist_name?: string
          duration_ms?: number | null
          id?: string
          playlist_id?: string
          spotify_track_id?: string
          track_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "spotify_playlist_tracks_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "spotify_playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      spotify_playlists: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          spotify_playlist_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          spotify_playlist_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          spotify_playlist_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      spotify_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string
          id: string
          refresh_token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at: string
          id?: string
          refresh_token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          refresh_token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      store_items: {
        Row: {
          category: string | null
          created_at: string | null
          data: Json | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_available: boolean | null
          item_type: string
          name: string
          price_coins: number | null
          price_gems: number | null
          xp_cost: number
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          data?: Json | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_available?: boolean | null
          item_type: string
          name: string
          price_coins?: number | null
          price_gems?: number | null
          xp_cost: number
        }
        Update: {
          category?: string | null
          created_at?: string | null
          data?: Json | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_available?: boolean | null
          item_type?: string
          name?: string
          price_coins?: number | null
          price_gems?: number | null
          xp_cost?: number
        }
        Relationships: []
      }
      streak_badges: {
        Row: {
          badge_color: string
          created_at: string | null
          description: string | null
          icon: string
          id: string
          name: string
          rarity: string
          streak_requirement: number
        }
        Insert: {
          badge_color?: string
          created_at?: string | null
          description?: string | null
          icon: string
          id?: string
          name: string
          rarity?: string
          streak_requirement: number
        }
        Update: {
          badge_color?: string
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          name?: string
          rarity?: string
          streak_requirement?: number
        }
        Relationships: []
      }
      streak_milestones: {
        Row: {
          achieved_at: string | null
          created_at: string | null
          id: string
          streak_days: number
          user_id: string
          xp_reward: number | null
        }
        Insert: {
          achieved_at?: string | null
          created_at?: string | null
          id?: string
          streak_days: number
          user_id: string
          xp_reward?: number | null
        }
        Update: {
          achieved_at?: string | null
          created_at?: string | null
          id?: string
          streak_days?: number
          user_id?: string
          xp_reward?: number | null
        }
        Relationships: []
      }
      student_grades: {
        Row: {
          ai_analysis: Json | null
          ai_assisted: boolean | null
          classroom_debate_id: string
          feedback: string | null
          graded_at: string | null
          graded_by: string
          id: string
          letter_grade: string | null
          percentage: number | null
          published_to_student: boolean | null
          rubric_scores: Json | null
          student_id: string
          total_score: number | null
        }
        Insert: {
          ai_analysis?: Json | null
          ai_assisted?: boolean | null
          classroom_debate_id: string
          feedback?: string | null
          graded_at?: string | null
          graded_by: string
          id?: string
          letter_grade?: string | null
          percentage?: number | null
          published_to_student?: boolean | null
          rubric_scores?: Json | null
          student_id: string
          total_score?: number | null
        }
        Update: {
          ai_analysis?: Json | null
          ai_assisted?: boolean | null
          classroom_debate_id?: string
          feedback?: string | null
          graded_at?: string | null
          graded_by?: string
          id?: string
          letter_grade?: string | null
          percentage?: number | null
          published_to_student?: boolean | null
          rubric_scores?: Json | null
          student_id?: string
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_grades_classroom_debate_id_fkey"
            columns: ["classroom_debate_id"]
            isOneToOne: false
            referencedRelation: "classroom_debates"
            referencedColumns: ["id"]
          },
        ]
      }
      student_guardians: {
        Row: {
          created_at: string | null
          guardian_id: string
          id: string
          relationship_type: string
          status: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          guardian_id: string
          id?: string
          relationship_type: string
          status?: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          guardian_id?: string
          id?: string
          relationship_type?: string
          status?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      study_analytics_cache: {
        Row: {
          created_at: string
          date: string
          flashcards_correct: number | null
          flashcards_reviewed: number | null
          focus_score: number | null
          id: string
          metrics: Json | null
          subjects_studied: string[] | null
          total_study_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          flashcards_correct?: number | null
          flashcards_reviewed?: number | null
          focus_score?: number | null
          id?: string
          metrics?: Json | null
          subjects_studied?: string[] | null
          total_study_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          flashcards_correct?: number | null
          flashcards_reviewed?: number | null
          focus_score?: number | null
          id?: string
          metrics?: Json | null
          subjects_studied?: string[] | null
          total_study_minutes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_diary_entries: {
        Row: {
          content: string | null
          created_at: string | null
          entry_date: string | null
          id: string
          mood: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          entry_date?: string | null
          id?: string
          mood?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          entry_date?: string | null
          id?: string
          mood?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      study_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_groups: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_private: boolean | null
          max_members: number | null
          name: string
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          max_members?: number | null
          name: string
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          max_members?: number | null
          name?: string
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      study_habits: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          frequency: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          target_per_day: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          frequency?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          target_per_day?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          frequency?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          target_per_day?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      study_heatmap_data: {
        Row: {
          created_at: string
          focus_score: number | null
          id: string
          sessions_count: number | null
          study_date: string
          subjects_studied: string[] | null
          total_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          focus_score?: number | null
          id?: string
          sessions_count?: number | null
          study_date?: string
          subjects_studied?: string[] | null
          total_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          focus_score?: number | null
          id?: string
          sessions_count?: number | null
          study_date?: string
          subjects_studied?: string[] | null
          total_minutes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_materials: {
        Row: {
          album: string | null
          artist: string | null
          category: string | null
          created_at: string | null
          duration: number | null
          flashcards: Json | null
          folder_path: string
          id: string
          is_public: boolean | null
          name: string
          notes: string | null
          saved_for_later: boolean | null
          size: number
          summary: string | null
          tags: string[] | null
          type: string
          uploaded_by: string | null
          url: string
          user_id: string | null
        }
        Insert: {
          album?: string | null
          artist?: string | null
          category?: string | null
          created_at?: string | null
          duration?: number | null
          flashcards?: Json | null
          folder_path?: string
          id?: string
          is_public?: boolean | null
          name: string
          notes?: string | null
          saved_for_later?: boolean | null
          size: number
          summary?: string | null
          tags?: string[] | null
          type: string
          uploaded_by?: string | null
          url: string
          user_id?: string | null
        }
        Update: {
          album?: string | null
          artist?: string | null
          category?: string | null
          created_at?: string | null
          duration?: number | null
          flashcards?: Json | null
          folder_path?: string
          id?: string
          is_public?: boolean | null
          name?: string
          notes?: string | null
          saved_for_later?: boolean | null
          size?: number
          summary?: string | null
          tags?: string[] | null
          type?: string
          uploaded_by?: string | null
          url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      study_paths: {
        Row: {
          created_at: string | null
          current_milestone: number | null
          description: string | null
          difficulty_level: string | null
          goal: string
          id: string
          is_active: boolean | null
          progress_percentage: number | null
          roadmap: Json
          subjects: string[]
          target_date: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_milestone?: number | null
          description?: string | null
          difficulty_level?: string | null
          goal: string
          id?: string
          is_active?: boolean | null
          progress_percentage?: number | null
          roadmap?: Json
          subjects: string[]
          target_date?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_milestone?: number | null
          description?: string | null
          difficulty_level?: string | null
          goal?: string
          id?: string
          is_active?: boolean | null
          progress_percentage?: number | null
          roadmap?: Json
          subjects?: string[]
          target_date?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      study_personas: {
        Row: {
          created_at: string
          custom_preferences: Json | null
          id: string
          persona_type: string
          updated_at: string
          user_id: string
          widgets_config: Json | null
        }
        Insert: {
          created_at?: string
          custom_preferences?: Json | null
          id?: string
          persona_type: string
          updated_at?: string
          user_id: string
          widgets_config?: Json | null
        }
        Update: {
          created_at?: string
          custom_preferences?: Json | null
          id?: string
          persona_type?: string
          updated_at?: string
          user_id?: string
          widgets_config?: Json | null
        }
        Relationships: []
      }
      study_room_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          message_type: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_room_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "study_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      study_room_participants: {
        Row: {
          id: string
          joined_at: string | null
          left_at: string | null
          role: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          left_at?: string | null
          role?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          left_at?: string | null
          role?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "study_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      study_rooms: {
        Row: {
          created_at: string | null
          description: string | null
          ends_at: string | null
          host_id: string
          id: string
          is_active: boolean | null
          is_public: boolean | null
          max_participants: number | null
          name: string
          room_code: string | null
          settings: Json | null
          subject: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          host_id: string
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          max_participants?: number | null
          name: string
          room_code?: string | null
          settings?: Json | null
          subject?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          host_id?: string
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          max_participants?: number | null
          name?: string
          room_code?: string | null
          settings?: Json | null
          subject?: string | null
        }
        Relationships: []
      }
      study_session_plans: {
        Row: {
          created_at: string | null
          end_time: string | null
          id: string
          is_completed: boolean | null
          notes: string | null
          plan_date: string
          start_time: string | null
          subject: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_time?: string | null
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          plan_date: string
          start_time?: string | null
          subject: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_time?: string | null
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          plan_date?: string
          start_time?: string | null
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          created_at: string | null
          duration: number
          id: string
          partner_ids: string[] | null
          subject: string | null
          type: string
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          created_at?: string | null
          duration: number
          id?: string
          partner_ids?: string[] | null
          subject?: string | null
          type: string
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          created_at?: string | null
          duration?: number
          id?: string
          partner_ids?: string[] | null
          subject?: string | null
          type?: string
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      study_streaks: {
        Row: {
          activities: Json | null
          created_at: string | null
          id: string
          minutes_studied: number | null
          study_date: string
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          activities?: Json | null
          created_at?: string | null
          id?: string
          minutes_studied?: number | null
          study_date: string
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          activities?: Json | null
          created_at?: string | null
          id?: string
          minutes_studied?: number | null
          study_date?: string
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      study_templates: {
        Row: {
          category: string
          created_at: string
          created_by: string
          description: string | null
          downloads_count: number | null
          id: string
          is_active: boolean | null
          name: string
          template_data: Json
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by: string
          description?: string | null
          downloads_count?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          template_data?: Json
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          description?: string | null
          downloads_count?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          template_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      task_notifications: {
        Row: {
          created_at: string | null
          id: string
          notification_type: string
          scheduled_for: string
          sent_at: string | null
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notification_type: string
          scheduled_for: string
          sent_at?: string | null
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notification_type?: string
          scheduled_for?: string
          sent_at?: string | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_notifications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_scheduler_items: {
        Row: {
          category: string | null
          column_type: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          is_completed: boolean | null
          priority: string | null
          title: string
          user_id: string
        }
        Insert: {
          category?: string | null
          column_type?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          priority?: string | null
          title: string
          user_id: string
        }
        Update: {
          category?: string | null
          column_type?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          priority?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category: string | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          recurring_type: string | null
          subtasks: Json | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
          xp_reward: number | null
        }
        Insert: {
          category?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          recurring_type?: string | null
          subtasks?: Json | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
          xp_reward?: number | null
        }
        Update: {
          category?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          recurring_type?: string | null
          subtasks?: Json | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          xp_reward?: number | null
        }
        Relationships: []
      }
      test_attempts: {
        Row: {
          answers: Json | null
          created_at: string
          id: string
          marked_for_review: Json | null
          percentage: number | null
          score: number | null
          started_at: string
          status: string
          student_id: string
          submitted_at: string | null
          tab_switches: number | null
          test_id: string
          time_spent_seconds: number | null
          total_marks: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string
          id?: string
          marked_for_review?: Json | null
          percentage?: number | null
          score?: number | null
          started_at?: string
          status?: string
          student_id: string
          submitted_at?: string | null
          tab_switches?: number | null
          test_id: string
          time_spent_seconds?: number | null
          total_marks?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string
          id?: string
          marked_for_review?: Json | null
          percentage?: number | null
          score?: number | null
          started_at?: string
          status?: string
          student_id?: string
          submitted_at?: string | null
          tab_switches?: number | null
          test_id?: string
          time_spent_seconds?: number | null
          total_marks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "test_attempts_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_questions: {
        Row: {
          correct_answer: string | null
          created_at: string
          explanation: string | null
          id: string
          marks: number
          options: Json | null
          order_index: number
          question_text: string
          question_type: string
          test_id: string
        }
        Insert: {
          correct_answer?: string | null
          created_at?: string
          explanation?: string | null
          id?: string
          marks?: number
          options?: Json | null
          order_index?: number
          question_text: string
          question_type: string
          test_id: string
        }
        Update: {
          correct_answer?: string | null
          created_at?: string
          explanation?: string | null
          id?: string
          marks?: number
          options?: Json | null
          order_index?: number
          question_text?: string
          question_type?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          allow_copy_paste: boolean | null
          created_at: string
          description: string | null
          difficulty: string
          duration_minutes: number
          id: string
          max_attempts: number | null
          passing_percentage: number | null
          published_at: string | null
          require_fullscreen: boolean | null
          scheduled_for: string | null
          show_result_immediately: boolean | null
          shuffle_options: boolean | null
          shuffle_questions: boolean | null
          status: string
          subject: string
          tab_switch_limit: number | null
          teacher_id: string
          title: string
          total_marks: number
          updated_at: string
          webcam_required: boolean | null
        }
        Insert: {
          allow_copy_paste?: boolean | null
          created_at?: string
          description?: string | null
          difficulty?: string
          duration_minutes?: number
          id?: string
          max_attempts?: number | null
          passing_percentage?: number | null
          published_at?: string | null
          require_fullscreen?: boolean | null
          scheduled_for?: string | null
          show_result_immediately?: boolean | null
          shuffle_options?: boolean | null
          shuffle_questions?: boolean | null
          status?: string
          subject: string
          tab_switch_limit?: number | null
          teacher_id: string
          title: string
          total_marks?: number
          updated_at?: string
          webcam_required?: boolean | null
        }
        Update: {
          allow_copy_paste?: boolean | null
          created_at?: string
          description?: string | null
          difficulty?: string
          duration_minutes?: number
          id?: string
          max_attempts?: number | null
          passing_percentage?: number | null
          published_at?: string | null
          require_fullscreen?: boolean | null
          scheduled_for?: string | null
          show_result_immediately?: boolean | null
          shuffle_options?: boolean | null
          shuffle_questions?: boolean | null
          status?: string
          subject?: string
          tab_switch_limit?: number | null
          teacher_id?: string
          title?: string
          total_marks?: number
          updated_at?: string
          webcam_required?: boolean | null
        }
        Relationships: []
      }
      topic_map_history: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          input_text: string | null
          title: string
          topic_map_data: Json
          user_id: string
          visualization_mode: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          input_text?: string | null
          title: string
          topic_map_data: Json
          user_id: string
          visualization_mode?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          input_text?: string | null
          title?: string
          topic_map_data?: Json
          user_id?: string
          visualization_mode?: string
        }
        Relationships: []
      }
      track_plays: {
        Row: {
          id: string
          played_at: string | null
          track_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          played_at?: string | null
          track_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          played_at?: string | null
          track_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "track_plays_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      tracks: {
        Row: {
          album: string | null
          album_id: string | null
          artist: string
          artist_id: string | null
          artwork_url: string | null
          audio_url: string
          cover_url: string | null
          created_at: string | null
          custom_url: string | null
          description: string | null
          duration: number | null
          genre: string | null
          id: string
          is_approved: boolean | null
          lyrics: string | null
          moderated_by: string | null
          moderation_notes: string | null
          play_count: number | null
          producer: string | null
          release_date: string | null
          songwriter: string | null
          title: string
          uploaded_by: string | null
          video_url: string | null
        }
        Insert: {
          album?: string | null
          album_id?: string | null
          artist: string
          artist_id?: string | null
          artwork_url?: string | null
          audio_url: string
          cover_url?: string | null
          created_at?: string | null
          custom_url?: string | null
          description?: string | null
          duration?: number | null
          genre?: string | null
          id?: string
          is_approved?: boolean | null
          lyrics?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          play_count?: number | null
          producer?: string | null
          release_date?: string | null
          songwriter?: string | null
          title: string
          uploaded_by?: string | null
          video_url?: string | null
        }
        Update: {
          album?: string | null
          album_id?: string | null
          artist?: string
          artist_id?: string | null
          artwork_url?: string | null
          audio_url?: string
          cover_url?: string | null
          created_at?: string | null
          custom_url?: string | null
          description?: string | null
          duration?: number | null
          genre?: string | null
          id?: string
          is_approved?: boolean | null
          lyrics?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          play_count?: number | null
          producer?: string | null
          release_date?: string | null
          songwriter?: string | null
          title?: string
          uploaded_by?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracks_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      typing_stats: {
        Row: {
          accuracy: number | null
          best_wpm: number | null
          created_at: string | null
          id: string
          tests_taken: number | null
          user_id: string
          wpm: number | null
        }
        Insert: {
          accuracy?: number | null
          best_wpm?: number | null
          created_at?: string | null
          id?: string
          tests_taken?: number | null
          user_id: string
          wpm?: number | null
        }
        Update: {
          accuracy?: number | null
          best_wpm?: number | null
          created_at?: string | null
          id?: string
          tests_taken?: number | null
          user_id?: string
          wpm?: number | null
        }
        Relationships: []
      }
      user_2fa: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          secret: string
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          secret: string
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          secret?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string | null
          earned_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          achievement_id?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          achievement_id?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_activity_log: {
        Row: {
          action_type: string
          created_at: string
          device_info: Json | null
          id: string
          ip_address: string | null
          is_suspicious: boolean | null
          location: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          device_info?: Json | null
          id?: string
          ip_address?: string | null
          is_suspicious?: boolean | null
          location?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          device_info?: Json | null
          id?: string
          ip_address?: string | null
          is_suspicious?: boolean | null
          location?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_challenge_progress: {
        Row: {
          challenge_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          progress_value: number | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          progress_value?: number | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          progress_value?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_cloud_drives: {
        Row: {
          created_at: string | null
          drive_description: string | null
          drive_name: string
          id: string
          is_public: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          drive_description?: string | null
          drive_name: string
          id?: string
          is_public?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          drive_description?: string | null
          drive_name?: string
          id?: string
          is_public?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_cloud_files: {
        Row: {
          created_at: string | null
          drive_id: string | null
          file_description: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          folder_path: string
          id: string
          is_public: boolean | null
          source: string | null
          source_id: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          drive_id?: string | null
          file_description?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          folder_path?: string
          id?: string
          is_public?: boolean | null
          source?: string | null
          source_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          drive_id?: string | null
          file_description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          folder_path?: string
          id?: string
          is_public?: boolean | null
          source?: string | null
          source_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_cloud_folders: {
        Row: {
          created_at: string | null
          drive_id: string
          folder_name: string
          folder_path: string
          id: string
          parent_path: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          drive_id: string
          folder_name: string
          folder_path: string
          id?: string
          parent_path?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          drive_id?: string
          folder_name?: string
          folder_path?: string
          id?: string
          parent_path?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_cloud_folders_drive_id_fkey"
            columns: ["drive_id"]
            isOneToOne: false
            referencedRelation: "user_cloud_drives"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cloud_storage: {
        Row: {
          created_at: string | null
          id: string
          total_bytes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          total_bytes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          total_bytes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_currency: {
        Row: {
          coins: number | null
          created_at: string | null
          gems: number | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          coins?: number | null
          created_at?: string | null
          gems?: number | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          coins?: number | null
          created_at?: string | null
          gems?: number | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_custom_sidebar_groups: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_enabled: boolean
          name: string
          order_index: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_enabled?: boolean
          name: string
          order_index?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_enabled?: boolean
          name?: string
          order_index?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_custom_sidebar_pages: {
        Row: {
          created_at: string
          disabled_until: string | null
          group_id: string | null
          icon: string | null
          id: string
          is_enabled: boolean
          order_index: number
          title: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          disabled_until?: string | null
          group_id?: string | null
          icon?: string | null
          id?: string
          is_enabled?: boolean
          order_index?: number
          title: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          disabled_until?: string | null
          group_id?: string | null
          icon?: string | null
          id?: string
          is_enabled?: boolean
          order_index?: number
          title?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_custom_sidebar_pages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "user_custom_sidebar_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_debate_stats: {
        Row: {
          awards_received: number | null
          best_argument_score: number | null
          comment_karma: number | null
          comments_posted: number | null
          created_at: string | null
          debate_karma: number | null
          debate_streak: number | null
          debates_created: number | null
          debates_won: number | null
          id: string
          rank: string | null
          total_karma: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          awards_received?: number | null
          best_argument_score?: number | null
          comment_karma?: number | null
          comments_posted?: number | null
          created_at?: string | null
          debate_karma?: number | null
          debate_streak?: number | null
          debates_created?: number | null
          debates_won?: number | null
          id?: string
          rank?: string | null
          total_karma?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          awards_received?: number | null
          best_argument_score?: number | null
          comment_karma?: number | null
          comments_posted?: number | null
          created_at?: string | null
          debate_karma?: number | null
          debate_streak?: number | null
          debates_created?: number | null
          debates_won?: number | null
          id?: string
          rank?: string | null
          total_karma?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_earned_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_earned_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "streak_badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_equipped_badges: {
        Row: {
          badge_id: string
          equipped_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          equipped_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          equipped_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_equipped_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "streak_badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string | null
          display_order: number | null
          icon_name: string | null
          id: string
          page_title: string
          page_url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          icon_name?: string | null
          id?: string
          page_title: string
          page_url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          icon_name?: string | null
          id?: string
          page_title?: string
          page_url?: string
          user_id?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          created_at: string | null
          current_progress: number | null
          deadline: string | null
          description: string | null
          goal_type: string
          id: string
          priority: string | null
          status: string | null
          target_value: number
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_progress?: number | null
          deadline?: string | null
          description?: string | null
          goal_type: string
          id?: string
          priority?: string | null
          status?: string | null
          target_value: number
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_progress?: number | null
          deadline?: string | null
          description?: string | null
          goal_type?: string
          id?: string
          priority?: string | null
          status?: string | null
          target_value?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_nexus_links: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          name: string
          updated_at: string | null
          url: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string | null
          url: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          id: string
          is_online: boolean | null
          last_seen: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string | null
          level: number
          longest_streak: number
          total_study_minutes: number
          updated_at: string
          xp: number
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id: string
          last_activity_date?: string | null
          level?: number
          longest_streak?: number
          total_study_minutes?: number
          updated_at?: string
          xp?: number
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          level?: number
          longest_streak?: number
          total_study_minutes?: number
          updated_at?: string
          xp?: number
        }
        Relationships: []
      }
      user_purchases: {
        Row: {
          id: string
          item_id: string
          purchased_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          item_id: string
          purchased_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          item_id?: string
          purchased_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_recycle_settings: {
        Row: {
          auto_delete_enabled: boolean | null
          created_at: string
          id: string
          retention_days: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_delete_enabled?: boolean | null
          created_at?: string
          id?: string
          retention_days?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_delete_enabled?: boolean | null
          created_at?: string
          id?: string
          retention_days?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_info: string | null
          expires_at: string
          id: string
          ip_address: string | null
          last_activity: string | null
          session_token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          last_activity?: string | null
          session_token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          last_activity?: string | null
          session_token?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          id: string
          settings_data: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          settings_data?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          settings_data?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_sidebar_additions: {
        Row: {
          created_at: string
          group_id: string | null
          icon: string | null
          id: string
          title: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id?: string | null
          icon?: string | null
          id?: string
          title: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string | null
          icon?: string | null
          id?: string
          title?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sidebar_additions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "sidebar_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sidebar_preferences: {
        Row: {
          created_at: string
          disabled_until: string | null
          group_id: string | null
          id: string
          is_enabled: boolean
          order_index: number | null
          page_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          disabled_until?: string | null
          group_id?: string | null
          id?: string
          is_enabled?: boolean
          order_index?: number | null
          page_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          disabled_until?: string | null
          group_id?: string | null
          id?: string
          is_enabled?: boolean
          order_index?: number | null
          page_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sidebar_preferences_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "sidebar_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sidebar_preferences_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "sidebar_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_space_limits: {
        Row: {
          created_at: string | null
          id: string
          max_spaces: number | null
          set_by: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          max_spaces?: number | null
          set_by?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          max_spaces?: number | null
          set_by?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_sync_data: {
        Row: {
          created_at: string | null
          device_info: Json | null
          id: string
          last_synced_at: string | null
          metadata: Json | null
          page_title: string
          page_url: string
          session_id: string | null
          sync_status: string | null
          total_time_seconds: number | null
          updated_at: string | null
          user_id: string
          visit_count: number | null
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          id?: string
          last_synced_at?: string | null
          metadata?: Json | null
          page_title: string
          page_url: string
          session_id?: string | null
          sync_status?: string | null
          total_time_seconds?: number | null
          updated_at?: string | null
          user_id: string
          visit_count?: number | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          id?: string
          last_synced_at?: string | null
          metadata?: Json | null
          page_title?: string
          page_url?: string
          session_id?: string | null
          sync_status?: string | null
          total_time_seconds?: number | null
          updated_at?: string | null
          user_id?: string
          visit_count?: number | null
        }
        Relationships: []
      }
      video_library: {
        Row: {
          ai_summary: string | null
          created_at: string | null
          description: string | null
          duration: string | null
          id: string
          is_favorite: boolean | null
          key_topics: string[] | null
          notes: string | null
          subject: string | null
          timestamps: Json | null
          title: string
          updated_at: string | null
          user_id: string
          video_id: string
          video_url: string
          watch_progress: number | null
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_favorite?: boolean | null
          key_topics?: string[] | null
          notes?: string | null
          subject?: string | null
          timestamps?: Json | null
          title: string
          updated_at?: string | null
          user_id: string
          video_id: string
          video_url: string
          watch_progress?: number | null
        }
        Update: {
          ai_summary?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_favorite?: boolean | null
          key_topics?: string[] | null
          notes?: string | null
          subject?: string | null
          timestamps?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string
          video_id?: string
          video_url?: string
          watch_progress?: number | null
        }
        Relationships: []
      }
      video_likes: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: []
      }
      video_watch_history: {
        Row: {
          completed: boolean | null
          duration_seconds: number | null
          duration_watched: number | null
          first_watched_at: string | null
          id: string
          last_position_seconds: number | null
          last_watched_at: string | null
          user_id: string
          video_name: string
          video_url: string
          watch_count: number | null
          watched_at: string | null
        }
        Insert: {
          completed?: boolean | null
          duration_seconds?: number | null
          duration_watched?: number | null
          first_watched_at?: string | null
          id?: string
          last_position_seconds?: number | null
          last_watched_at?: string | null
          user_id: string
          video_name?: string
          video_url?: string
          watch_count?: number | null
          watched_at?: string | null
        }
        Update: {
          completed?: boolean | null
          duration_seconds?: number | null
          duration_watched?: number | null
          first_watched_at?: string | null
          id?: string
          last_position_seconds?: number | null
          last_watched_at?: string | null
          user_id?: string
          video_name?: string
          video_url?: string
          watch_count?: number | null
          watched_at?: string | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          likes: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string
          video_url: string
          views: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          likes?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          video_url: string
          views?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          likes?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          video_url?: string
          views?: number | null
        }
        Relationships: []
      }
      virtual_lab_experiments: {
        Row: {
          ai_feedback: Json | null
          completed_at: string | null
          conclusion: string | null
          created_at: string | null
          experiment_name: string
          id: string
          is_completed: boolean | null
          lab_type: string
          observations: string | null
          user_id: string
          variables: Json | null
        }
        Insert: {
          ai_feedback?: Json | null
          completed_at?: string | null
          conclusion?: string | null
          created_at?: string | null
          experiment_name: string
          id?: string
          is_completed?: boolean | null
          lab_type: string
          observations?: string | null
          user_id: string
          variables?: Json | null
        }
        Update: {
          ai_feedback?: Json | null
          completed_at?: string | null
          conclusion?: string | null
          created_at?: string | null
          experiment_name?: string
          id?: string
          is_completed?: boolean | null
          lab_type?: string
          observations?: string | null
          user_id?: string
          variables?: Json | null
        }
        Relationships: []
      }
      voice_command_history: {
        Row: {
          action_taken: string
          command_text: string
          created_at: string | null
          id: string
          metadata: Json | null
          success: boolean | null
          user_id: string
        }
        Insert: {
          action_taken: string
          command_text: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          success?: boolean | null
          user_id: string
        }
        Update: {
          action_taken?: string
          command_text?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          success?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      voice_preferences: {
        Row: {
          auto_play: boolean | null
          created_at: string | null
          id: string
          preferred_voice: string | null
          preferred_voice_id: string | null
          speed: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_play?: boolean | null
          created_at?: string | null
          id?: string
          preferred_voice?: string | null
          preferred_voice_id?: string | null
          speed?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_play?: boolean | null
          created_at?: string | null
          id?: string
          preferred_voice?: string | null
          preferred_voice_id?: string | null
          speed?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      voice_tutor_sessions: {
        Row: {
          created_at: string | null
          id: string
          messages: Json | null
          subject: string | null
          updated_at: string | null
          user_id: string
          voice_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          messages?: Json | null
          subject?: string | null
          updated_at?: string | null
          user_id: string
          voice_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          messages?: Json | null
          subject?: string | null
          updated_at?: string | null
          user_id?: string
          voice_id?: string | null
        }
        Relationships: []
      }
      whats_new: {
        Row: {
          created_at: string | null
          created_by: string
          description: string
          icon: string | null
          id: string
          is_active: boolean | null
          link: string | null
          priority: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          link?: string | null
          priority?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          link?: string | null
          priority?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      whiteboards: {
        Row: {
          canvas_data: Json
          created_at: string | null
          id: string
          is_public: boolean | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          canvas_data?: Json
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          canvas_data?: Json
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      widget_preferences: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          position: number | null
          updated_at: string
          user_id: string
          widget_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          position?: number | null
          updated_at?: string
          user_id: string
          widget_name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          position?: number | null
          updated_at?: string
          user_id?: string
          widget_name?: string
        }
        Relationships: []
      }
      workload_snapshots: {
        Row: {
          classes_count: number | null
          created_at: string | null
          date: string
          exams_count: number | null
          homework_count: number | null
          id: string
          stress_level: number | null
          total_estimated_hours: number | null
          user_id: string
        }
        Insert: {
          classes_count?: number | null
          created_at?: string | null
          date: string
          exams_count?: number | null
          homework_count?: number | null
          id?: string
          stress_level?: number | null
          total_estimated_hours?: number | null
          user_id: string
        }
        Update: {
          classes_count?: number | null
          created_at?: string | null
          date?: string
          exams_count?: number | null
          homework_count?: number | null
          id?: string
          stress_level?: number | null
          total_estimated_hours?: number | null
          user_id?: string
        }
        Relationships: []
      }
      workspaces: {
        Row: {
          created_at: string | null
          description: string | null
          favorites: Json | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          favorites?: Json | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          favorites?: Json | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      xboard_boards: {
        Row: {
          columns: Json
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          columns?: Json
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          columns?: Json
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      xboard_cards: {
        Row: {
          board_id: string
          column_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          position: number
          priority: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          board_id: string
          column_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number
          priority?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          board_id?: string
          column_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number
          priority?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xboard_cards_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "xboard_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      xclip_items: {
        Row: {
          content: string
          content_type: string | null
          created_at: string | null
          id: string
          is_pinned: boolean | null
          is_starred: boolean | null
          label: string | null
          user_id: string
        }
        Insert: {
          content: string
          content_type?: string | null
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          is_starred?: boolean | null
          label?: string | null
          user_id: string
        }
        Update: {
          content?: string
          content_type?: string | null
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          is_starred?: boolean | null
          label?: string | null
          user_id?: string
        }
        Relationships: []
      }
      xflow_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          parent_comment_id: string | null
          post_id: string
          profile_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_comment_id?: string | null
          post_id: string
          profile_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_comment_id?: string | null
          post_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xflow_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "xflow_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xflow_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "xflow_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xflow_comments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "xflow_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      xflow_follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xflow_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "xflow_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xflow_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "xflow_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      xflow_highlights: {
        Row: {
          cover_url: string | null
          created_at: string | null
          id: string
          media_urls: Json | null
          profile_id: string
          title: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          id?: string
          media_urls?: Json | null
          profile_id: string
          title: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          id?: string
          media_urls?: Json | null
          profile_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "xflow_highlights_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "xflow_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      xflow_likes: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          post_id: string | null
          profile_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          profile_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xflow_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "xflow_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xflow_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "xflow_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xflow_likes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "xflow_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      xflow_messages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          media_url: string | null
          receiver_id: string
          sender_id: string
          shared_post_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          media_url?: string | null
          receiver_id: string
          sender_id: string
          shared_post_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          media_url?: string | null
          receiver_id?: string
          sender_id?: string
          shared_post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "xflow_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "xflow_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xflow_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "xflow_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xflow_messages_shared_post_id_fkey"
            columns: ["shared_post_id"]
            isOneToOne: false
            referencedRelation: "xflow_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      xflow_posts: {
        Row: {
          comments_count: number | null
          content: string | null
          created_at: string | null
          id: string
          is_pinned: boolean | null
          likes_count: number | null
          media_type: string | null
          media_urls: Json | null
          profile_id: string
          shares_count: number | null
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          media_type?: string | null
          media_urls?: Json | null
          profile_id: string
          shares_count?: number | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          media_type?: string | null
          media_urls?: Json | null
          profile_id?: string
          shares_count?: number | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "xflow_posts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "xflow_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      xflow_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          followers_count: number | null
          following_count: number | null
          gender: string | null
          id: string
          is_approved: boolean | null
          is_private: boolean | null
          is_verified: boolean | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_status: string | null
          password_hash: string
          posts_count: number | null
          updated_at: string | null
          user_id: string
          username: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          gender?: string | null
          id?: string
          is_approved?: boolean | null
          is_private?: boolean | null
          is_verified?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: string | null
          password_hash: string
          posts_count?: number | null
          updated_at?: string | null
          user_id: string
          username: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          gender?: string | null
          id?: string
          is_approved?: boolean | null
          is_private?: boolean | null
          is_verified?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: string | null
          password_hash?: string
          posts_count?: number | null
          updated_at?: string | null
          user_id?: string
          username?: string
          website?: string | null
        }
        Relationships: []
      }
      xflow_saved_posts: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          profile_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xflow_saved_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "xflow_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xflow_saved_posts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "xflow_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      xlink_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          is_public: boolean | null
          links: Json | null
          slug: string | null
          social_links: Json | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_public?: boolean | null
          links?: Json | null
          slug?: string | null
          social_links?: Json | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_public?: boolean | null
          links?: Json | null
          slug?: string | null
          social_links?: Json | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      xmap_nodes: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          is_collapsed: boolean | null
          label: string
          map_id: string
          parent_id: string | null
          user_id: string
          x: number | null
          y: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_collapsed?: boolean | null
          label: string
          map_id?: string
          parent_id?: string | null
          user_id: string
          x?: number | null
          y?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_collapsed?: boolean | null
          label?: string
          map_id?: string
          parent_id?: string | null
          user_id?: string
          x?: number | null
          y?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "xmap_nodes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "xmap_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_transactions: {
        Row: {
          activity_type: string | null
          amount: number
          created_at: string | null
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          activity_type?: string | null
          amount: number
          created_at?: string | null
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      xstage_channels: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          project_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          project_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xstage_channels_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "xstage_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      xstage_event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: Database["public"]["Enums"]["xstage_rsvp_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status?: Database["public"]["Enums"]["xstage_rsvp_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: Database["public"]["Enums"]["xstage_rsvp_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xstage_event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "xstage_events"
            referencedColumns: ["id"]
          },
        ]
      }
      xstage_events: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_time: string | null
          event_date: string
          event_type: Database["public"]["Enums"]["xstage_event_type"]
          id: string
          location: string | null
          project_id: string
          start_time: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_time?: string | null
          event_date: string
          event_type?: Database["public"]["Enums"]["xstage_event_type"]
          id?: string
          location?: string | null
          project_id: string
          start_time?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_time?: string | null
          event_date?: string
          event_type?: Database["public"]["Enums"]["xstage_event_type"]
          id?: string
          location?: string | null
          project_id?: string
          start_time?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "xstage_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "xstage_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      xstage_file_comments: {
        Row: {
          content: string
          created_at: string
          file_id: string
          id: string
          timestamp_seconds: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          file_id: string
          id?: string
          timestamp_seconds?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          file_id?: string
          id?: string
          timestamp_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xstage_file_comments_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "xstage_files"
            referencedColumns: ["id"]
          },
        ]
      }
      xstage_file_versions: {
        Row: {
          created_at: string
          file_id: string
          file_size: number | null
          file_url: string
          id: string
          uploaded_by: string
          version_number: number
        }
        Insert: {
          created_at?: string
          file_id: string
          file_size?: number | null
          file_url: string
          id?: string
          uploaded_by: string
          version_number?: number
        }
        Update: {
          created_at?: string
          file_id?: string
          file_size?: number | null
          file_url?: string
          id?: string
          uploaded_by?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "xstage_file_versions_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "xstage_files"
            referencedColumns: ["id"]
          },
        ]
      }
      xstage_files: {
        Row: {
          created_at: string
          file_size: number | null
          file_url: string | null
          id: string
          is_folder: boolean
          mime_type: string | null
          name: string
          parent_id: string | null
          project_id: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_folder?: boolean
          mime_type?: string | null
          name: string
          parent_id?: string | null
          project_id: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_folder?: boolean
          mime_type?: string | null
          name?: string
          parent_id?: string | null
          project_id?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "xstage_files_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "xstage_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xstage_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "xstage_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      xstage_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          id: string
          invited_by: string
          project_id: string
          role: Database["public"]["Enums"]["xstage_project_role"]
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          id?: string
          invited_by: string
          project_id: string
          role?: Database["public"]["Enums"]["xstage_project_role"]
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_by?: string
          project_id?: string
          role?: Database["public"]["Enums"]["xstage_project_role"]
        }
        Relationships: [
          {
            foreignKeyName: "xstage_invites_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "xstage_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      xstage_message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xstage_message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "xstage_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      xstage_message_reads: {
        Row: {
          id: string
          message_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xstage_message_reads_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "xstage_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      xstage_messages: {
        Row: {
          channel_id: string | null
          content: string | null
          created_at: string
          duration: number | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_pinned: boolean | null
          message_type: Database["public"]["Enums"]["xstage_message_type"]
          parent_message_id: string | null
          project_id: string
          recipient_id: string | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          channel_id?: string | null
          content?: string | null
          created_at?: string
          duration?: number | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_pinned?: boolean | null
          message_type?: Database["public"]["Enums"]["xstage_message_type"]
          parent_message_id?: string | null
          project_id: string
          recipient_id?: string | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          channel_id?: string | null
          content?: string | null
          created_at?: string
          duration?: number | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_pinned?: boolean | null
          message_type?: Database["public"]["Enums"]["xstage_message_type"]
          parent_message_id?: string | null
          project_id?: string
          recipient_id?: string | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "xstage_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "xstage_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xstage_messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "xstage_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xstage_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "xstage_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      xstage_project_members: {
        Row: {
          id: string
          instrument: string | null
          joined_at: string
          project_id: string
          role: Database["public"]["Enums"]["xstage_project_role"]
          user_id: string
        }
        Insert: {
          id?: string
          instrument?: string | null
          joined_at?: string
          project_id: string
          role?: Database["public"]["Enums"]["xstage_project_role"]
          user_id: string
        }
        Update: {
          id?: string
          instrument?: string | null
          joined_at?: string
          project_id?: string
          role?: Database["public"]["Enums"]["xstage_project_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xstage_project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "xstage_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      xstage_projects: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          type: Database["public"]["Enums"]["xstage_project_type"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          type?: Database["public"]["Enums"]["xstage_project_type"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["xstage_project_type"]
          updated_at?: string
        }
        Relationships: []
      }
      xstage_setlist_songs: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          position: number
          setlist_id: string
          song_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          position?: number
          setlist_id: string
          song_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          position?: number
          setlist_id?: string
          song_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xstage_setlist_songs_setlist_id_fkey"
            columns: ["setlist_id"]
            isOneToOne: false
            referencedRelation: "xstage_setlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xstage_setlist_songs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "xstage_songs"
            referencedColumns: ["id"]
          },
        ]
      }
      xstage_setlists: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          project_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          project_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "xstage_setlists_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "xstage_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      xstage_songs: {
        Row: {
          bpm: number | null
          created_at: string
          created_by: string
          duration_seconds: number | null
          id: string
          key: string | null
          lyrics: string | null
          notes: string | null
          project_id: string
          title: string
          updated_at: string
        }
        Insert: {
          bpm?: number | null
          created_at?: string
          created_by: string
          duration_seconds?: number | null
          id?: string
          key?: string | null
          lyrics?: string | null
          notes?: string | null
          project_id: string
          title: string
          updated_at?: string
        }
        Update: {
          bpm?: number | null
          created_at?: string
          created_by?: string
          duration_seconds?: number | null
          id?: string
          key?: string | null
          lyrics?: string | null
          notes?: string | null
          project_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "xstage_songs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "xstage_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      xstage_typing_indicators: {
        Row: {
          channel_id: string | null
          id: string
          project_id: string
          recipient_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          channel_id?: string | null
          id?: string
          project_id: string
          recipient_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string | null
          id?: string
          project_id?: string
          recipient_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xstage_typing_indicators_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "xstage_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xstage_typing_indicators_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "xstage_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      xstellar_project_files: {
        Row: {
          content: string | null
          created_at: string | null
          file_type: string | null
          filename: string
          id: string
          project_id: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          file_type?: string | null
          filename: string
          id?: string
          project_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          file_type?: string | null
          filename?: string
          id?: string
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "xstellar_project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "xstellar_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      xstellar_project_migrations: {
        Row: {
          created_at: string | null
          executed: boolean | null
          executed_at: string | null
          id: string
          project_id: string
          sql_code: string
        }
        Insert: {
          created_at?: string | null
          executed?: boolean | null
          executed_at?: string | null
          id?: string
          project_id: string
          sql_code: string
        }
        Update: {
          created_at?: string | null
          executed?: boolean | null
          executed_at?: string | null
          id?: string
          project_id?: string
          sql_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "xstellar_project_migrations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "xstellar_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      xstellar_projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          name: string
          owner_id: string
          project_type: string | null
          published_url: string | null
          settings: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          name: string
          owner_id: string
          project_type?: string | null
          published_url?: string | null
          settings?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          name?: string
          owner_id?: string
          project_type?: string | null
          published_url?: string | null
          settings?: Json | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      xvault_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          is_favorite: boolean
          pin_hash: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          pin_hash?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          pin_hash?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      xvibe_admin_actions: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          target_id: string
          target_type: string
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id: string
          target_type: string
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      xvibe_admin_artist_accounts: {
        Row: {
          admin_user_id: string
          artist_id: string
          created_at: string
          custom_url: string | null
          email: string | null
          id: string
          is_active: boolean | null
          password_hash: string | null
          updated_at: string
        }
        Insert: {
          admin_user_id: string
          artist_id: string
          created_at?: string
          custom_url?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          password_hash?: string | null
          updated_at?: string
        }
        Update: {
          admin_user_id?: string
          artist_id?: string
          created_at?: string
          custom_url?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          password_hash?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "xvibe_admin_artist_accounts_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "xvibe_artists"
            referencedColumns: ["id"]
          },
        ]
      }
      xvibe_ai_profiles: {
        Row: {
          created_at: string | null
          discovery_score: number | null
          energy_level_avg: number | null
          id: string
          last_analyzed_at: string | null
          listening_patterns: Json | null
          preferred_genres: string[] | null
          preferred_moods: string[] | null
          skip_patterns: Json | null
          time_of_day_preferences: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          discovery_score?: number | null
          energy_level_avg?: number | null
          id?: string
          last_analyzed_at?: string | null
          listening_patterns?: Json | null
          preferred_genres?: string[] | null
          preferred_moods?: string[] | null
          skip_patterns?: Json | null
          time_of_day_preferences?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          discovery_score?: number | null
          energy_level_avg?: number | null
          id?: string
          last_analyzed_at?: string | null
          listening_patterns?: Json | null
          preferred_genres?: string[] | null
          preferred_moods?: string[] | null
          skip_patterns?: Json | null
          time_of_day_preferences?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      xvibe_albums: {
        Row: {
          album_type: string | null
          artist_id: string | null
          copyright_composition: string | null
          copyright_recording: string | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          genre: string | null
          id: string
          is_explicit: boolean | null
          language: string | null
          play_count: number | null
          record_label: string | null
          rejection_reason: string | null
          release_date: string | null
          status: string | null
          title: string
          total_duration: number | null
          total_tracks: number | null
          upc_code: string | null
          updated_at: string | null
        }
        Insert: {
          album_type?: string | null
          artist_id?: string | null
          copyright_composition?: string | null
          copyright_recording?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          genre?: string | null
          id?: string
          is_explicit?: boolean | null
          language?: string | null
          play_count?: number | null
          record_label?: string | null
          rejection_reason?: string | null
          release_date?: string | null
          status?: string | null
          title: string
          total_duration?: number | null
          total_tracks?: number | null
          upc_code?: string | null
          updated_at?: string | null
        }
        Update: {
          album_type?: string | null
          artist_id?: string | null
          copyright_composition?: string | null
          copyright_recording?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          genre?: string | null
          id?: string
          is_explicit?: boolean | null
          language?: string | null
          play_count?: number | null
          record_label?: string | null
          rejection_reason?: string | null
          release_date?: string | null
          status?: string | null
          title?: string
          total_duration?: number | null
          total_tracks?: number | null
          upc_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "xvibe_albums_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "xvibe_artists"
            referencedColumns: ["id"]
          },
        ]
      }
      xvibe_artist_followers: {
        Row: {
          artist_id: string | null
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          artist_id?: string | null
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          artist_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xvibe_artist_followers_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "xvibe_artists"
            referencedColumns: ["id"]
          },
        ]
      }
      xvibe_artists: {
        Row: {
          apple_music_url: string | null
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string | null
          follower_count: number | null
          genres: string[] | null
          id: string
          instagram_url: string | null
          is_verified: boolean | null
          monthly_listeners: number | null
          name: string
          social_links: Json | null
          spotify_url: string | null
          status: string | null
          total_streams: number | null
          twitter_url: string | null
          updated_at: string | null
          user_id: string | null
          website_url: string | null
          youtube_url: string | null
        }
        Insert: {
          apple_music_url?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          follower_count?: number | null
          genres?: string[] | null
          id?: string
          instagram_url?: string | null
          is_verified?: boolean | null
          monthly_listeners?: number | null
          name: string
          social_links?: Json | null
          spotify_url?: string | null
          status?: string | null
          total_streams?: number | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          apple_music_url?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          follower_count?: number | null
          genres?: string[] | null
          id?: string
          instagram_url?: string | null
          is_verified?: boolean | null
          monthly_listeners?: number | null
          name?: string
          social_links?: Json | null
          spotify_url?: string | null
          status?: string | null
          total_streams?: number | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      xvibe_artwork_validations: {
        Row: {
          file_size_kb: number | null
          format: string | null
          height: number | null
          id: string
          image_url: string
          is_valid: boolean | null
          release_id: string | null
          track_id: string | null
          validated_at: string | null
          validation_errors: Json | null
          width: number | null
        }
        Insert: {
          file_size_kb?: number | null
          format?: string | null
          height?: number | null
          id?: string
          image_url: string
          is_valid?: boolean | null
          release_id?: string | null
          track_id?: string | null
          validated_at?: string | null
          validation_errors?: Json | null
          width?: number | null
        }
        Update: {
          file_size_kb?: number | null
          format?: string | null
          height?: number | null
          id?: string
          image_url?: string
          is_valid?: boolean | null
          release_id?: string | null
          track_id?: string | null
          validated_at?: string | null
          validation_errors?: Json | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "xvibe_artwork_validations_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "xvibe_releases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xvibe_artwork_validations_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "xvibe_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      xvibe_copyright_checks: {
        Row: {
          audio_fingerprint: string | null
          checked_at: string | null
          id: string
          match_confidence: number | null
          match_found: boolean | null
          matched_track_info: Json | null
          track_id: string
        }
        Insert: {
          audio_fingerprint?: string | null
          checked_at?: string | null
          id?: string
          match_confidence?: number | null
          match_found?: boolean | null
          matched_track_info?: Json | null
          track_id: string
        }
        Update: {
          audio_fingerprint?: string | null
          checked_at?: string | null
          id?: string
          match_confidence?: number | null
          match_found?: boolean | null
          matched_track_info?: Json | null
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xvibe_copyright_checks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "xvibe_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      xvibe_dj_scripts: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          mood_tags: string[] | null
          script_template: string
          script_type: string
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          mood_tags?: string[] | null
          script_template: string
          script_type: string
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          mood_tags?: string[] | null
          script_template?: string
          script_type?: string
          variables?: Json | null
        }
        Relationships: []
      }
      xvibe_dj_sessions: {
        Row: {
          energy_curve: number[] | null
          id: string
          likes: number | null
          mood_progression: string[] | null
          session_ended_at: string | null
          session_started_at: string | null
          skips: number | null
          speaking_frequency: string | null
          tracks_played: string[] | null
          user_id: string
          voice_enabled: boolean | null
        }
        Insert: {
          energy_curve?: number[] | null
          id?: string
          likes?: number | null
          mood_progression?: string[] | null
          session_ended_at?: string | null
          session_started_at?: string | null
          skips?: number | null
          speaking_frequency?: string | null
          tracks_played?: string[] | null
          user_id: string
          voice_enabled?: boolean | null
        }
        Update: {
          energy_curve?: number[] | null
          id?: string
          likes?: number | null
          mood_progression?: string[] | null
          session_ended_at?: string | null
          session_started_at?: string | null
          skips?: number | null
          speaking_frequency?: string | null
          tracks_played?: string[] | null
          user_id?: string
          voice_enabled?: boolean | null
        }
        Relationships: []
      }
      xvibe_downloads: {
        Row: {
          downloaded_at: string | null
          expires_at: string | null
          id: string
          track_id: string | null
          user_id: string
        }
        Insert: {
          downloaded_at?: string | null
          expires_at?: string | null
          id?: string
          track_id?: string | null
          user_id: string
        }
        Update: {
          downloaded_at?: string | null
          expires_at?: string | null
          id?: string
          track_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xvibe_downloads_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "xvibe_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      xvibe_drm_licenses: {
        Row: {
          created_at: string | null
          device_fingerprint: string
          device_id: string
          download_count: number | null
          encryption_key: string
          expires_at: string
          id: string
          is_revoked: boolean | null
          max_downloads: number | null
          revoke_reason: string | null
          revoked_at: string | null
          track_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_fingerprint: string
          device_id: string
          download_count?: number | null
          encryption_key: string
          expires_at: string
          id?: string
          is_revoked?: boolean | null
          max_downloads?: number | null
          revoke_reason?: string | null
          revoked_at?: string | null
          track_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string
          device_id?: string
          download_count?: number | null
          encryption_key?: string
          expires_at?: string
          id?: string
          is_revoked?: boolean | null
          max_downloads?: number | null
          revoke_reason?: string | null
          revoked_at?: string | null
          track_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xvibe_drm_licenses_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "xvibe_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      xvibe_likes: {
        Row: {
          created_at: string | null
          id: string
          track_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          track_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          track_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xvibe_likes_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "xvibe_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      xvibe_listening_history: {
        Row: {
          completed: boolean | null
          duration_played: number | null
          id: string
          played_at: string | null
          track_id: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          duration_played?: number | null
          id?: string
          played_at?: string | null
          track_id?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          duration_played?: number | null
          id?: string
          played_at?: string | null
          track_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xvibe_listening_history_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "xvibe_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      xvibe_moderation_logs: {
        Row: {
          action: string
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          moderator_id: string
          reason: string | null
        }
        Insert: {
          action: string
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          moderator_id: string
          reason?: string | null
        }
        Update: {
          action?: string
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          moderator_id?: string
          reason?: string | null
        }
        Relationships: []
      }
      xvibe_moderation_queue: {
        Row: {
          assigned_to: string | null
          auto_checks: Json | null
          changes_requested: string | null
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          manual_notes: string | null
          priority: number | null
          rejection_reason: string | null
          reviewed_at: string | null
          status: string | null
          submitted_at: string | null
          submitted_by: string
        }
        Insert: {
          assigned_to?: string | null
          auto_checks?: Json | null
          changes_requested?: string | null
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          manual_notes?: string | null
          priority?: number | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by: string
        }
        Update: {
          assigned_to?: string | null
          auto_checks?: Json | null
          changes_requested?: string | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          manual_notes?: string | null
          priority?: number | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string
        }
        Relationships: []
      }
      xvibe_offline_downloads: {
        Row: {
          checksum: string
          chunk_index: number
          created_at: string | null
          encrypted_data_url: string
          id: string
          license_id: string
        }
        Insert: {
          checksum: string
          chunk_index: number
          created_at?: string | null
          encrypted_data_url: string
          id?: string
          license_id: string
        }
        Update: {
          checksum?: string
          chunk_index?: number
          created_at?: string | null
          encrypted_data_url?: string
          id?: string
          license_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xvibe_offline_downloads_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "xvibe_drm_licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      xvibe_playlist_tracks: {
        Row: {
          added_at: string | null
          added_by: string | null
          id: string
          playlist_id: string | null
          position: number
          track_id: string | null
        }
        Insert: {
          added_at?: string | null
          added_by?: string | null
          id?: string
          playlist_id?: string | null
          position: number
          track_id?: string | null
        }
        Update: {
          added_at?: string | null
          added_by?: string | null
          id?: string
          playlist_id?: string | null
          position?: number
          track_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "xvibe_playlist_tracks_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "xvibe_playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xvibe_playlist_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "xvibe_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      xvibe_playlists: {
        Row: {
          cover_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_collaborative: boolean | null
          is_public: boolean | null
          name: string
          total_duration: number | null
          track_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_collaborative?: boolean | null
          is_public?: boolean | null
          name: string
          total_duration?: number | null
          track_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_collaborative?: boolean | null
          is_public?: boolean | null
          name?: string
          total_duration?: number | null
          track_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      xvibe_release_tracks: {
        Row: {
          created_at: string | null
          id: string
          isrc_code: string | null
          preview_start_seconds: number | null
          release_id: string
          track_id: string
          track_number: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          isrc_code?: string | null
          preview_start_seconds?: number | null
          release_id: string
          track_id: string
          track_number: number
        }
        Update: {
          created_at?: string | null
          id?: string
          isrc_code?: string | null
          preview_start_seconds?: number | null
          release_id?: string
          track_id?: string
          track_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "xvibe_release_tracks_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "xvibe_releases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xvibe_release_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "xvibe_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      xvibe_release_writers: {
        Row: {
          created_at: string | null
          first_name: string
          id: string
          last_name: string
          release_id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          first_name: string
          id?: string
          last_name: string
          release_id: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string
          id?: string
          last_name?: string
          release_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "xvibe_release_writers_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "xvibe_releases"
            referencedColumns: ["id"]
          },
        ]
      }
      xvibe_releases: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          artist_id: string
          copyright_composition: string | null
          copyright_recording: string | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_compilation: boolean | null
          is_cover_version: boolean | null
          is_explicit: boolean | null
          language: string | null
          original_release_date: string | null
          preorder_date: string | null
          primary_genre: string | null
          record_label: string | null
          rejection_reason: string | null
          release_type: string
          sales_start_date: string | null
          secondary_genre: string | null
          status: string | null
          submitted_at: string | null
          title: string
          upc_code: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          artist_id: string
          copyright_composition?: string | null
          copyright_recording?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_compilation?: boolean | null
          is_cover_version?: boolean | null
          is_explicit?: boolean | null
          language?: string | null
          original_release_date?: string | null
          preorder_date?: string | null
          primary_genre?: string | null
          record_label?: string | null
          rejection_reason?: string | null
          release_type?: string
          sales_start_date?: string | null
          secondary_genre?: string | null
          status?: string | null
          submitted_at?: string | null
          title: string
          upc_code?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          artist_id?: string
          copyright_composition?: string | null
          copyright_recording?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_compilation?: boolean | null
          is_cover_version?: boolean | null
          is_explicit?: boolean | null
          language?: string | null
          original_release_date?: string | null
          preorder_date?: string | null
          primary_genre?: string | null
          record_label?: string | null
          rejection_reason?: string | null
          release_type?: string
          sales_start_date?: string | null
          secondary_genre?: string | null
          status?: string | null
          submitted_at?: string | null
          title?: string
          upc_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "xvibe_releases_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "xvibe_artists"
            referencedColumns: ["id"]
          },
        ]
      }
      xvibe_reports: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reporter_id: string
          status: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reporter_id: string
          status?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          status?: string | null
        }
        Relationships: []
      }
      xvibe_saved_albums: {
        Row: {
          album_id: string | null
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          album_id?: string | null
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          album_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xvibe_saved_albums_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "xvibe_albums"
            referencedColumns: ["id"]
          },
        ]
      }
      xvibe_streams: {
        Row: {
          completed: boolean | null
          country_code: string | null
          device_type: string | null
          duration_played: number
          id: string
          session_id: string | null
          streamed_at: string | null
          track_id: string
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          country_code?: string | null
          device_type?: string | null
          duration_played?: number
          id?: string
          session_id?: string | null
          streamed_at?: string | null
          track_id: string
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          country_code?: string | null
          device_type?: string | null
          duration_played?: number
          id?: string
          session_id?: string | null
          streamed_at?: string | null
          track_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "xvibe_streams_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "xvibe_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      xvibe_tracks: {
        Row: {
          album_id: string | null
          artist_id: string | null
          audio_url: string
          avg_completion_rate: number | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          featured_artists: string[] | null
          full_play_count: number | null
          genre: string | null
          id: string
          is_explicit: boolean | null
          isrc_code: string | null
          language: string | null
          lyrics: string | null
          mood_tags: string[] | null
          play_count: number | null
          preview_start_seconds: number | null
          rejection_reason: string | null
          skip_count: number | null
          status: string | null
          title: string
          track_number: number | null
          updated_at: string | null
        }
        Insert: {
          album_id?: string | null
          artist_id?: string | null
          audio_url: string
          avg_completion_rate?: number | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          featured_artists?: string[] | null
          full_play_count?: number | null
          genre?: string | null
          id?: string
          is_explicit?: boolean | null
          isrc_code?: string | null
          language?: string | null
          lyrics?: string | null
          mood_tags?: string[] | null
          play_count?: number | null
          preview_start_seconds?: number | null
          rejection_reason?: string | null
          skip_count?: number | null
          status?: string | null
          title: string
          track_number?: number | null
          updated_at?: string | null
        }
        Update: {
          album_id?: string | null
          artist_id?: string | null
          audio_url?: string
          avg_completion_rate?: number | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          featured_artists?: string[] | null
          full_play_count?: number | null
          genre?: string | null
          id?: string
          is_explicit?: boolean | null
          isrc_code?: string | null
          language?: string | null
          lyrics?: string | null
          mood_tags?: string[] | null
          play_count?: number | null
          preview_start_seconds?: number | null
          rejection_reason?: string | null
          skip_count?: number | null
          status?: string | null
          title?: string
          track_number?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "xvibe_tracks_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "xvibe_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xvibe_tracks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "xvibe_artists"
            referencedColumns: ["id"]
          },
        ]
      }
      xvibe_user_preferences: {
        Row: {
          created_at: string | null
          id: string
          onboarding_completed: boolean | null
          preferred_genres: string[] | null
          preferred_moods: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          onboarding_completed?: boolean | null
          preferred_genres?: string[] | null
          preferred_moods?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          onboarding_completed?: boolean | null
          preferred_genres?: string[] | null
          preferred_moods?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      xwave_ai_insights: {
        Row: {
          confidence_score: number | null
          energy_level: number | null
          generated_at: string | null
          id: string
          is_clean_version: boolean | null
          language: string | null
          lyrics_analysis: string | null
          meaning: string | null
          mood: string | null
          mood_tags: string[] | null
          song_id: string
          themes: string[] | null
          tldr: string | null
          updated_at: string | null
        }
        Insert: {
          confidence_score?: number | null
          energy_level?: number | null
          generated_at?: string | null
          id?: string
          is_clean_version?: boolean | null
          language?: string | null
          lyrics_analysis?: string | null
          meaning?: string | null
          mood?: string | null
          mood_tags?: string[] | null
          song_id: string
          themes?: string[] | null
          tldr?: string | null
          updated_at?: string | null
        }
        Update: {
          confidence_score?: number | null
          energy_level?: number | null
          generated_at?: string | null
          id?: string
          is_clean_version?: boolean | null
          language?: string | null
          lyrics_analysis?: string | null
          meaning?: string | null
          mood?: string | null
          mood_tags?: string[] | null
          song_id?: string
          themes?: string[] | null
          tldr?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "xwave_ai_insights_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: true
            referencedRelation: "xvibe_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      xwave_blog_comments: {
        Row: {
          blog_id: string
          content: string
          created_at: string | null
          id: string
          parent_comment_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          blog_id: string
          content: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          blog_id?: string
          content?: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xwave_blog_comments_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "xwave_blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xwave_blog_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "xwave_blog_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      xwave_blog_likes: {
        Row: {
          blog_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          blog_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          blog_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xwave_blog_likes_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "xwave_blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      xwave_blog_posts: {
        Row: {
          content: string
          cover_image_url: string | null
          created_at: string | null
          editor_id: string
          editorial_tag: string | null
          excerpt: string | null
          id: string
          like_count: number | null
          published_at: string | null
          slug: string | null
          song_id: string | null
          status: string | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          content: string
          cover_image_url?: string | null
          created_at?: string | null
          editor_id: string
          editorial_tag?: string | null
          excerpt?: string | null
          id?: string
          like_count?: number | null
          published_at?: string | null
          slug?: string | null
          song_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          content?: string
          cover_image_url?: string | null
          created_at?: string | null
          editor_id?: string
          editorial_tag?: string | null
          excerpt?: string | null
          id?: string
          like_count?: number | null
          published_at?: string | null
          slug?: string | null
          song_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "xwave_blog_posts_editor_id_fkey"
            columns: ["editor_id"]
            isOneToOne: false
            referencedRelation: "xwave_editors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xwave_blog_posts_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "xvibe_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      xwave_editors: {
        Row: {
          articles_published: number | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          id: string
          is_verified: boolean | null
          name: string
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          articles_published?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          name: string
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          articles_published?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          name?: string
          role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      xwave_external_links: {
        Row: {
          created_at: string | null
          custom_label: string | null
          display_order: number | null
          id: string
          platform: string
          song_id: string
          url: string
        }
        Insert: {
          created_at?: string | null
          custom_label?: string | null
          display_order?: number | null
          id?: string
          platform: string
          song_id: string
          url: string
        }
        Update: {
          created_at?: string | null
          custom_label?: string | null
          display_order?: number | null
          id?: string
          platform?: string
          song_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "xwave_external_links_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "xvibe_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_award_streak_badges: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      calculate_level: { Args: { xp_amount: number }; Returns: number }
      can_create_website: { Args: { p_user_id: string }; Returns: boolean }
      generate_ai_generation_slug: { Args: never; Returns: string }
      generate_api_key: { Args: never; Returns: string }
      generate_class_code: { Args: never; Returns: string }
      generate_email_slug: { Args: never; Returns: string }
      generate_mailbox_slug: { Args: never; Returns: string }
      generate_share_token: { Args: never; Returns: string }
      generate_theme_share_token: { Args: never; Returns: string }
      get_admin_feedback_stats: {
        Args: never
        Returns: {
          avg_upvotes: number
          completed: number
          in_progress: number
          pending: number
          total_feedback: number
          unique_submitters: number
        }[]
      }
      get_admin_resource_stats: {
        Args: never
        Returns: {
          active_uploaders: number
          shared_resources: number
          total_downloads: number
          total_resources: number
          total_views: number
        }[]
      }
      get_admin_setting: { Args: { p_setting_key: string }; Returns: Json }
      get_admin_study_stats: {
        Args: never
        Returns: {
          active_students: number
          avg_session_duration: number
          total_minutes: number
          total_sessions: number
        }[]
      }
      get_admin_user_stats: {
        Args: never
        Returns: {
          active_users_week: number
          avg_level: number
          avg_xp: number
          new_users_month: number
          total_users: number
        }[]
      }
      get_current_streak: { Args: { p_user_id: string }; Returns: number }
      get_leaderboard_rankings: {
        Args: {
          p_category?: string
          p_leaderboard_type?: string
          p_limit?: number
        }
        Returns: {
          alltime_rank: number
          avatar_url: string
          category: string
          created_at: string
          full_name: string
          id: string
          leaderboard_type: string
          metadata: Json
          monthly_rank: number
          period_end: string
          period_start: string
          score: number
          user_id: string
          weekly_rank: number
        }[]
      }
      get_public_user_info: {
        Args: { target_user_id: string }
        Returns: {
          avatar_url: string
          bio: string
          display_name: string
          id: string
          is_verified: boolean
          username: string
        }[]
      }
      get_student_weekly_stats: {
        Args: { p_student_id: string; p_week_start: string }
        Returns: Json
      }
      get_user_storage_limit: { Args: { p_user_id: string }; Returns: number }
      get_user_website_count: { Args: { p_user_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_xvibe_play_count: {
        Args: { p_track_id: string }
        Returns: undefined
      }
      is_classroom_member: {
        Args: { _classroom_id: string; _user_id: string }
        Returns: boolean
      }
      is_member_of_chat_room: { Args: { _room_id: string }; Returns: boolean }
      is_xstage_project_admin: {
        Args: { p_project_id: string; p_user_id: string }
        Returns: boolean
      }
      is_xstage_project_member: {
        Args: { p_project_id: string; p_user_id: string }
        Returns: boolean
      }
      notify_user: {
        Args: {
          p_data?: Json
          p_message: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      record_study_activity: {
        Args: {
          p_minutes?: number
          p_tasks?: number
          p_user_id: string
          p_xp?: number
        }
        Returns: undefined
      }
      refresh_current_month_leaderboard: { Args: never; Returns: undefined }
      send_exam_reminders: { Args: never; Returns: undefined }
      send_streak_reminders: { Args: never; Returns: undefined }
      update_leaderboard_entries: {
        Args: { p_end_date: string; p_start_date: string }
        Returns: undefined
      }
      update_live_class_status: { Args: never; Returns: undefined }
      update_recent_page: {
        Args: { p_page_title: string; p_page_url: string; p_user_id: string }
        Returns: undefined
      }
      validate_api_key: {
        Args: { p_api_key: string }
        Returns: {
          key_id: string
          key_user_id: string
          permissions: string[]
          rate_limit: number
        }[]
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "parent"
        | "teacher"
        | "music_moderator"
      debate_award_rarity: "common" | "rare" | "epic" | "legendary"
      debate_report_status: "pending" | "reviewed" | "dismissed" | "actioned"
      debate_source_type: "url" | "citation" | "image" | "document"
      debate_stance: "for" | "against" | "neutral"
      debate_target_type: "topic" | "comment"
      debate_vote_type: "upvote" | "downvote"
      xstage_event_type:
        | "rehearsal"
        | "gig"
        | "recording"
        | "deadline"
        | "meeting"
      xstage_message_type: "text" | "image" | "video" | "file" | "voice"
      xstage_project_role:
        | "owner"
        | "admin"
        | "member"
        | "session_musician"
        | "viewer"
      xstage_project_type: "band" | "solo" | "side_project" | "collaboration"
      xstage_rsvp_status: "attending" | "maybe" | "declined"
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "parent",
        "teacher",
        "music_moderator",
      ],
      debate_award_rarity: ["common", "rare", "epic", "legendary"],
      debate_report_status: ["pending", "reviewed", "dismissed", "actioned"],
      debate_source_type: ["url", "citation", "image", "document"],
      debate_stance: ["for", "against", "neutral"],
      debate_target_type: ["topic", "comment"],
      debate_vote_type: ["upvote", "downvote"],
      xstage_event_type: [
        "rehearsal",
        "gig",
        "recording",
        "deadline",
        "meeting",
      ],
      xstage_message_type: ["text", "image", "video", "file", "voice"],
      xstage_project_role: [
        "owner",
        "admin",
        "member",
        "session_musician",
        "viewer",
      ],
      xstage_project_type: ["band", "solo", "side_project", "collaboration"],
      xstage_rsvp_status: ["attending", "maybe", "declined"],
    },
  },
} as const
