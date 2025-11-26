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
          created_at: string | null
          id: string
          prompt: string | null
          result_data: Json | null
          status: string | null
          tool_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          prompt?: string | null
          result_data?: Json | null
          status?: string | null
          tool_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          prompt?: string | null
          result_data?: Json | null
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
          phone_number: string | null
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
          phone_number?: string | null
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
          phone_number?: string | null
          social_links?: Json | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
          website?: string | null
          xp?: number | null
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
      tracks: {
        Row: {
          album: string | null
          artist: string
          audio_url: string
          cover_url: string | null
          created_at: string | null
          duration: number | null
          genre: string | null
          id: string
          title: string
          uploaded_by: string | null
        }
        Insert: {
          album?: string | null
          artist: string
          audio_url: string
          cover_url?: string | null
          created_at?: string | null
          duration?: number | null
          genre?: string | null
          id?: string
          title: string
          uploaded_by?: string | null
        }
        Update: {
          album?: string | null
          artist?: string
          audio_url?: string
          cover_url?: string | null
          created_at?: string | null
          duration?: number | null
          genre?: string | null
          id?: string
          title?: string
          uploaded_by?: string | null
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
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string | null
          credits_limit: number
          credits_remaining: number
          id: string
          last_reset_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_limit?: number
          credits_remaining?: number
          id?: string
          last_reset_date?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_limit?: number
          credits_remaining?: number
          id?: string
          last_reset_date?: string
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
    }
    Views: {
      admin_feedback_stats: {
        Row: {
          avg_upvotes: number | null
          completed: number | null
          in_progress: number | null
          pending: number | null
          total_feedback: number | null
          unique_submitters: number | null
        }
        Relationships: []
      }
      admin_resource_stats: {
        Row: {
          active_uploaders: number | null
          shared_resources: number | null
          total_downloads: number | null
          total_resources: number | null
          total_views: number | null
        }
        Relationships: []
      }
      admin_study_stats: {
        Row: {
          active_students: number | null
          avg_session_duration: number | null
          total_minutes: number | null
          total_sessions: number | null
        }
        Relationships: []
      }
      admin_user_stats: {
        Row: {
          active_users_week: number | null
          avg_level: number | null
          avg_xp: number | null
          new_users_month: number | null
          total_users: number | null
        }
        Relationships: []
      }
      leaderboard_rankings: {
        Row: {
          alltime_rank: number | null
          avatar_url: string | null
          category: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          leaderboard_type: string | null
          metadata: Json | null
          monthly_rank: number | null
          period_end: string | null
          period_start: string | null
          rank: number | null
          score: number | null
          updated_at: string | null
          user_id: string | null
          weekly_rank: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_level: { Args: { xp_amount: number }; Returns: number }
      can_create_website: { Args: { p_user_id: string }; Returns: boolean }
      deduct_credits: {
        Args: { _amount: number; _user_id: string }
        Returns: boolean
      }
      ensure_user_credits: {
        Args: { _user_id: string }
        Returns: {
          credits_limit: number
          credits_remaining: number
        }[]
      }
      generate_class_code: { Args: never; Returns: string }
      generate_share_token: { Args: never; Returns: string }
      generate_theme_share_token: { Args: never; Returns: string }
      get_admin_setting: { Args: { p_setting_key: string }; Returns: Json }
      get_current_streak: { Args: { p_user_id: string }; Returns: number }
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
      get_user_credit_limit: { Args: { _user_id: string }; Returns: number }
      get_user_website_count: { Args: { p_user_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_classroom_member: {
        Args: { _classroom_id: string; _user_id: string }
        Returns: boolean
      }
      is_member_of_chat_room: { Args: { _room_id: string }; Returns: boolean }
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
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "parent" | "teacher"
      debate_award_rarity: "common" | "rare" | "epic" | "legendary"
      debate_report_status: "pending" | "reviewed" | "dismissed" | "actioned"
      debate_source_type: "url" | "citation" | "image" | "document"
      debate_stance: "for" | "against" | "neutral"
      debate_target_type: "topic" | "comment"
      debate_vote_type: "upvote" | "downvote"
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
      app_role: ["admin", "moderator", "user", "parent", "teacher"],
      debate_award_rarity: ["common", "rare", "epic", "legendary"],
      debate_report_status: ["pending", "reviewed", "dismissed", "actioned"],
      debate_source_type: ["url", "citation", "image", "document"],
      debate_stance: ["for", "against", "neutral"],
      debate_target_type: ["topic", "comment"],
      debate_vote_type: ["upvote", "downvote"],
    },
  },
} as const
