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
      messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          receiver_id: string
          room_id: string | null
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          receiver_id: string
          room_id?: string | null
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          receiver_id?: string
          room_id?: string | null
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
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
          email_notifications: boolean | null
          exam_reminders: boolean | null
          feedback_responses: boolean | null
          id: string
          push_notifications: boolean | null
          resource_access: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          exam_reminders?: boolean | null
          feedback_responses?: boolean | null
          id?: string
          push_notifications?: boolean | null
          resource_access?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          exam_reminders?: boolean | null
          feedback_responses?: boolean | null
          id?: string
          push_notifications?: boolean | null
          resource_access?: boolean | null
          updated_at?: string | null
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
      app_role: "admin" | "moderator" | "user"
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
    },
  },
} as const
