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
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          requirement_value: number | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          requirement_value?: number | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          requirement_value?: number | null
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
          created_at: string | null
          id: string
          leaderboard_type: string
          period_end: string
          period_start: string
          rank: number | null
          score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          leaderboard_type: string
          period_end: string
          period_start: string
          rank?: number | null
          score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          leaderboard_type?: string
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
      live_classes: {
        Row: {
          attendance_count: number | null
          class_link: string | null
          created_at: string | null
          end_time: string
          id: string
          is_recurring: boolean | null
          notes: string | null
          recording_url: string | null
          recurring_days: number[] | null
          recurring_end_date: string | null
          recurring_pattern: string | null
          start_time: string
          status: string | null
          subject: string
          title: string
          user_id: string
        }
        Insert: {
          attendance_count?: number | null
          class_link?: string | null
          created_at?: string | null
          end_time: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          recording_url?: string | null
          recurring_days?: number[] | null
          recurring_end_date?: string | null
          recurring_pattern?: string | null
          start_time: string
          status?: string | null
          subject: string
          title: string
          user_id: string
        }
        Update: {
          attendance_count?: number | null
          class_link?: string | null
          created_at?: string | null
          end_time?: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          recording_url?: string | null
          recurring_days?: number[] | null
          recurring_end_date?: string | null
          recurring_pattern?: string | null
          start_time?: string
          status?: string | null
          subject?: string
          title?: string
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
      notification_preferences: {
        Row: {
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
          updated_at: string | null
          user_id: string
        }
        Insert: {
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
          updated_at?: string | null
          user_id: string
        }
        Update: {
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
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          item_type: string
          name: string
          xp_cost: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          item_type: string
          name: string
          xp_cost: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          item_type?: string
          name?: string
          xp_cost?: number
        }
        Relationships: []
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
    }
    Functions: {
      calculate_level: { Args: { xp_amount: number }; Returns: number }
      generate_share_token: { Args: never; Returns: string }
      generate_theme_share_token: { Args: never; Returns: string }
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
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
      refresh_current_month_leaderboard: { Args: never; Returns: undefined }
      send_exam_reminders: { Args: never; Returns: undefined }
      update_leaderboard_entries: {
        Args: { p_end_date: string; p_start_date: string }
        Returns: undefined
      }
      update_recent_page: {
        Args: { p_page_title: string; p_page_url: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "parent" | "teacher"
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
    },
  },
} as const
