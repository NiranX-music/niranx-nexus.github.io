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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
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
      audio_samples: {
        Row: {
          audio_url: string
          blob_pathname: string | null
          bpm: number | null
          created_at: string | null
          description: string | null
          download_count: number | null
          duration: number | null
          genre: string | null
          id: string
          is_public: boolean | null
          key_signature: string | null
          name: string
          tags: string[] | null
          uploaded_by: string | null
        }
        Insert: {
          audio_url: string
          blob_pathname?: string | null
          bpm?: number | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          duration?: number | null
          genre?: string | null
          id?: string
          is_public?: boolean | null
          key_signature?: string | null
          name: string
          tags?: string[] | null
          uploaded_by?: string | null
        }
        Update: {
          audio_url?: string
          blob_pathname?: string | null
          bpm?: number | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          duration?: number | null
          genre?: string | null
          id?: string
          is_public?: boolean | null
          key_signature?: string | null
          name?: string
          tags?: string[] | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_samples_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
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
      battle_entries: {
        Row: {
          battle_id: string | null
          created_at: string | null
          id: string
          playlist_id: string | null
          track_id: string | null
          user_id: string | null
          votes: number | null
        }
        Insert: {
          battle_id?: string | null
          created_at?: string | null
          id?: string
          playlist_id?: string | null
          track_id?: string | null
          user_id?: string | null
          votes?: number | null
        }
        Update: {
          battle_id?: string | null
          created_at?: string | null
          id?: string
          playlist_id?: string | null
          track_id?: string | null
          user_id?: string | null
          votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "battle_entries_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_entries_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_entries_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_votes: {
        Row: {
          battle_id: string | null
          created_at: string | null
          entry_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          battle_id?: string | null
          created_at?: string | null
          entry_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          battle_id?: string | null
          created_at?: string | null
          entry_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "battle_votes_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_votes_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "battle_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      battles: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          start_date: string | null
          status: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "battles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          edited_at: string
          edited_by: string
          id: string
          new_content: string
          previous_content: string
        }
        Insert: {
          blog_id: string
          edited_at?: string
          edited_by: string
          id?: string
          new_content: string
          previous_content: string
        }
        Update: {
          blog_id?: string
          edited_at?: string
          edited_by?: string
          id?: string
          new_content?: string
          previous_content?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_edits_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blogs"
            referencedColumns: ["id"]
          },
        ]
      }
      blogs: {
        Row: {
          attachments: Json | null
          content: string
          cover_image_url: string | null
          created_at: string
          created_by: string
          id: string
          is_published: boolean | null
          publisher_id: string | null
          publisher_name: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          id?: string
          is_published?: boolean | null
          publisher_id?: string | null
          publisher_name?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          id?: string
          is_published?: boolean | null
          publisher_id?: string | null
          publisher_name?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          prize_description: string | null
          start_date: string | null
          theme: string | null
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          prize_description?: string | null
          start_date?: string | null
          theme?: string | null
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          prize_description?: string | null
          start_date?: string | null
          theme?: string | null
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      chat_room_members: {
        Row: {
          id: string
          joined_at: string
          role: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
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
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_group: boolean | null
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_group?: boolean | null
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_group?: boolean | null
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          status: string | null
          subject: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          status?: string | null
          subject: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string | null
          subject?: string
        }
        Relationships: []
      }
      content_reports: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
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
          resolved_at?: string | null
          resolved_by?: string | null
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
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          challenge_date: string
          challenge_type: string
          created_at: string | null
          description: string
          id: string
          target_value: number
          title: string
          xp_reward: number | null
        }
        Insert: {
          challenge_date?: string
          challenge_type: string
          created_at?: string | null
          description: string
          id?: string
          target_value: number
          title: string
          xp_reward?: number | null
        }
        Update: {
          challenge_date?: string
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
          reward_date: string
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          reward_date?: string
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          reward_date?: string
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      fan_club_members: {
        Row: {
          fan_club_id: string | null
          id: string
          joined_at: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          fan_club_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          fan_club_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fan_club_members_fan_club_id_fkey"
            columns: ["fan_club_id"]
            isOneToOne: false
            referencedRelation: "fan_clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fan_club_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      fan_clubs: {
        Row: {
          artist_id: string
          cover_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_private: boolean | null
          member_count: number | null
          name: string
        }
        Insert: {
          artist_id: string
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_private?: boolean | null
          member_count?: number | null
          name: string
        }
        Update: {
          artist_id?: string
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_private?: boolean | null
          member_count?: number | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fan_clubs_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_decks: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          subject: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          subject?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          subject?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      flashcard_progress: {
        Row: {
          card_id: string
          ease_factor: number | null
          id: string
          interval_days: number | null
          last_reviewed: string | null
          next_review: string | null
          repetitions: number | null
          user_id: string
        }
        Insert: {
          card_id: string
          ease_factor?: number | null
          id?: string
          interval_days?: number | null
          last_reviewed?: string | null
          next_review?: string | null
          repetitions?: number | null
          user_id: string
        }
        Update: {
          card_id?: string
          ease_factor?: number | null
          id?: string
          interval_days?: number | null
          last_reviewed?: string | null
          next_review?: string | null
          repetitions?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_progress_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          back: string
          created_at: string | null
          deck_id: string
          front: string
          id: string
          position: number | null
          updated_at: string | null
        }
        Insert: {
          back: string
          created_at?: string | null
          deck_id: string
          front: string
          id?: string
          position?: number | null
          updated_at?: string | null
        }
        Update: {
          back?: string
          created_at?: string | null
          deck_id?: string
          front?: string
          id?: string
          position?: number | null
          updated_at?: string | null
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
      follows: {
        Row: {
          created_at: string | null
          follower_id: string | null
          following_id: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          difficulty: string | null
          duration: number | null
          game_type: string
          id: string
          played_at: string | null
          score: number
          stats: Json | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          difficulty?: string | null
          duration?: number | null
          game_type: string
          id?: string
          played_at?: string | null
          score: number
          stats?: Json | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          difficulty?: string | null
          duration?: number | null
          game_type?: string
          id?: string
          played_at?: string | null
          score?: number
          stats?: Json | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      game_statistics: {
        Row: {
          achievements: string[] | null
          high_scores: Json | null
          total_games_played: number | null
          total_xp_earned: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievements?: string[] | null
          high_scores?: Json | null
          total_games_played?: number | null
          total_xp_earned?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievements?: string[] | null
          high_scores?: Json | null
          total_games_played?: number | null
          total_xp_earned?: number | null
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
        Relationships: [
          {
            foreignKeyName: "goal_milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "user_goals"
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
      leaderboard_entries: {
        Row: {
          created_at: string | null
          id: string
          leaderboard_type: string
          period_end: string
          period_start: string
          rank: number | null
          score: number
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
          score?: number
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
          score?: number
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
        Relationships: [
          {
            foreignKeyName: "likes_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "listening_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      live_streams: {
        Row: {
          artist_id: string
          created_at: string | null
          description: string | null
          ended_at: string | null
          id: string
          scheduled_at: string | null
          started_at: string | null
          status: string | null
          stream_url: string | null
          title: string
          viewer_count: number | null
        }
        Insert: {
          artist_id: string
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
          stream_url?: string | null
          title: string
          viewer_count?: number | null
        }
        Update: {
          artist_id?: string
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
          stream_url?: string | null
          title?: string
          viewer_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "live_streams_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string | null
          receiver_id: string
          room_id: string | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          receiver_id: string
          room_id?: string | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          receiver_id?: string
          room_id?: string | null
          sender_id?: string
          updated_at?: string
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
      music_playlist_tracks: {
        Row: {
          created_at: string | null
          id: string
          playlist_id: string
          position: number
          track_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          playlist_id: string
          position?: number
          track_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          playlist_id?: string
          position?: number
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "music_playlist_tracks_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "music_playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "music_playlist_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "study_materials"
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
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
        Relationships: [
          {
            foreignKeyName: "picture_likes_picture_id_fkey"
            columns: ["picture_id"]
            isOneToOne: false
            referencedRelation: "pictures"
            referencedColumns: ["id"]
          },
        ]
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
      playlist_tracks: {
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
            foreignKeyName: "playlist_tracks_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
          cover_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_ai_generated: boolean | null
          is_collaborative: boolean | null
          is_public: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_ai_generated?: boolean | null
          is_collaborative?: boolean | null
          is_public?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_ai_generated?: boolean | null
          is_collaborative?: boolean | null
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          created_at: string
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
          updated_at: string
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
          created_at?: string
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
          updated_at?: string
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
          created_at?: string
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
          updated_at?: string
          user_id?: string
          username?: string | null
          website?: string | null
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action_count: number | null
          action_type: string
          created_at: string | null
          id: string
          user_id: string
          window_start: string | null
        }
        Insert: {
          action_count?: number | null
          action_type: string
          created_at?: string | null
          id?: string
          user_id: string
          window_start?: string | null
        }
        Update: {
          action_count?: number | null
          action_type?: string
          created_at?: string | null
          id?: string
          user_id?: string
          window_start?: string | null
        }
        Relationships: []
      }
      schedule_tasks: {
        Row: {
          class_duration: number
          class_link: string | null
          created_at: string
          day_of_week: string
          end_time: string
          id: string
          is_recurring: boolean | null
          notes: string | null
          priority: string
          recording_link: string | null
          start_time: string
          status: string | null
          subject: string
          task_name: string
          task_type: string
          topic: string | null
          unique_url_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          class_duration?: number
          class_link?: string | null
          created_at?: string
          day_of_week: string
          end_time: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          priority?: string
          recording_link?: string | null
          start_time: string
          status?: string | null
          subject: string
          task_name: string
          task_type?: string
          topic?: string | null
          unique_url_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          class_duration?: number
          class_link?: string | null
          created_at?: string
          day_of_week?: string
          end_time?: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          priority?: string
          recording_link?: string | null
          start_time?: string
          status?: string | null
          subject?: string
          task_name?: string
          task_type?: string
          topic?: string | null
          unique_url_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      school_timetable: {
        Row: {
          created_at: string | null
          day_of_week: string
          end_time: string
          id: string
          period_number: number
          room: string | null
          start_time: string
          subject: string
          teacher: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: string
          end_time: string
          id?: string
          period_number: number
          room?: string | null
          start_time: string
          subject: string
          teacher?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: string
          end_time?: string
          id?: string
          period_number?: number
          room?: string | null
          start_time?: string
          subject?: string
          teacher?: string | null
          updated_at?: string | null
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
          created_at: string
          duration: number | null
          flashcards: Json | null
          folder_path: string
          id: string
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
          created_at?: string
          duration?: number | null
          flashcards?: Json | null
          folder_path?: string
          id?: string
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
          created_at?: string
          duration?: number | null
          flashcards?: Json | null
          folder_path?: string
          id?: string
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
      task_chains: {
        Row: {
          created_at: string | null
          id: string
          is_expanded: boolean | null
          level: number
          parent_id: string | null
          position: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_expanded?: boolean | null
          level?: number
          parent_id?: string | null
          position?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_expanded?: boolean | null
          level?: number
          parent_id?: string | null
          position?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_chains_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "task_chains"
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
          xp_reward: number
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
          xp_reward?: number
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
          xp_reward?: number
        }
        Relationships: []
      }
      tests: {
        Row: {
          created_at: string | null
          end_time: string
          id: string
          institute: string
          name: string
          start_time: string
          studied_topics: string[] | null
          test_date: string
          test_link: string | null
          topics_covered: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          end_time: string
          id?: string
          institute: string
          name: string
          start_time: string
          studied_topics?: string[] | null
          test_date: string
          test_link?: string | null
          topics_covered?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          end_time?: string
          id?: string
          institute?: string
          name?: string
          start_time?: string
          studied_topics?: string[] | null
          test_date?: string
          test_link?: string | null
          topics_covered?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      timetable_slots: {
        Row: {
          color: string | null
          created_at: string | null
          day_of_week: string
          end_time: string
          id: string
          priority: string | null
          slot_type: string | null
          start_time: string
          sub_slots: Json | null
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          day_of_week: string
          end_time: string
          id?: string
          priority?: string | null
          slot_type?: string | null
          start_time: string
          sub_slots?: Json | null
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          day_of_week?: string
          end_time?: string
          id?: string
          priority?: string | null
          slot_type?: string | null
          start_time?: string
          sub_slots?: Json | null
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      track_analysis: {
        Row: {
          acousticness: number | null
          analyzed_at: string | null
          danceability: number | null
          energy: number | null
          id: string
          instrumentalness: number | null
          key_signature: string | null
          liveness: number | null
          loudness: number | null
          speechiness: number | null
          tempo: number | null
          time_signature: string | null
          track_id: string | null
          valence: number | null
        }
        Insert: {
          acousticness?: number | null
          analyzed_at?: string | null
          danceability?: number | null
          energy?: number | null
          id?: string
          instrumentalness?: number | null
          key_signature?: string | null
          liveness?: number | null
          loudness?: number | null
          speechiness?: number | null
          tempo?: number | null
          time_signature?: string | null
          track_id?: string | null
          valence?: number | null
        }
        Update: {
          acousticness?: number | null
          analyzed_at?: string | null
          danceability?: number | null
          energy?: number | null
          id?: string
          instrumentalness?: number | null
          key_signature?: string | null
          liveness?: number | null
          loudness?: number | null
          speechiness?: number | null
          tempo?: number | null
          time_signature?: string | null
          track_id?: string | null
          valence?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "track_analysis_track_id_fkey"
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
          artist: string
          audio_fingerprint: string | null
          audio_url: string
          blob_pathname: string | null
          bpm: number | null
          cover_blob_pathname: string | null
          cover_url: string | null
          created_at: string | null
          duration: number
          energy_level: number | null
          genre: string | null
          id: string
          is_ai_generated: boolean | null
          key_signature: string | null
          mood: string | null
          title: string
          uploaded_by: string | null
        }
        Insert: {
          album?: string | null
          artist: string
          audio_fingerprint?: string | null
          audio_url: string
          blob_pathname?: string | null
          bpm?: number | null
          cover_blob_pathname?: string | null
          cover_url?: string | null
          created_at?: string | null
          duration: number
          energy_level?: number | null
          genre?: string | null
          id?: string
          is_ai_generated?: boolean | null
          key_signature?: string | null
          mood?: string | null
          title: string
          uploaded_by?: string | null
        }
        Update: {
          album?: string | null
          artist?: string
          audio_fingerprint?: string | null
          audio_url?: string
          blob_pathname?: string | null
          bpm?: number | null
          cover_blob_pathname?: string | null
          cover_url?: string | null
          created_at?: string | null
          duration?: number
          energy_level?: number | null
          genre?: string | null
          id?: string
          is_ai_generated?: boolean | null
          key_signature?: string | null
          mood?: string | null
          title?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracks_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_2fa: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          secret: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          secret?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          secret?: string | null
          updated_at?: string | null
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
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cloud_drives: {
        Row: {
          created_at: string | null
          drive_description: string | null
          drive_name: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          drive_description?: string | null
          drive_name: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          drive_description?: string | null
          drive_name?: string
          id?: string
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
        Relationships: [
          {
            foreignKeyName: "user_cloud_files_drive_id_fkey"
            columns: ["drive_id"]
            isOneToOne: false
            referencedRelation: "user_cloud_drives"
            referencedColumns: ["id"]
          },
        ]
      }
      user_goals: {
        Row: {
          completed_at: string | null
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
          completed_at?: string | null
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
          completed_at?: string | null
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
          is_active: boolean | null
          item_id: string
          purchased_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          item_id: string
          purchased_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean | null
          item_id?: string
          purchased_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_purchases_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "store_items"
            referencedColumns: ["id"]
          },
        ]
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
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string
          email: string
          id: string
          is_artist: boolean | null
          is_verified: boolean | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name: string
          email: string
          id?: string
          is_artist?: boolean | null
          is_verified?: boolean | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string
          email?: string
          id?: string
          is_artist?: boolean | null
          is_verified?: boolean | null
          updated_at?: string | null
          username?: string
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
        Relationships: [
          {
            foreignKeyName: "video_likes_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
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
      voice_commands: {
        Row: {
          command_text: string
          created_at: string | null
          id: string
          intent: string | null
          response_text: string | null
          success: boolean | null
          user_id: string | null
        }
        Insert: {
          command_text: string
          created_at?: string | null
          id?: string
          intent?: string | null
          response_text?: string | null
          success?: boolean | null
          user_id?: string | null
        }
        Update: {
          command_text?: string
          created_at?: string | null
          id?: string
          intent?: string | null
          response_text?: string | null
          success?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_commands_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      pg_stat_monitor: {
        Row: {
          application_name: string | null
          blk_read_time: number | null
          blk_write_time: number | null
          bucket: number | null
          bucket_done: boolean | null
          bucket_start_time: string | null
          calls: number | null
          client_ip: unknown
          cmd_type: number | null
          cmd_type_text: string | null
          comments: string | null
          cpu_sys_time: number | null
          cpu_user_time: number | null
          datname: string | null
          dbid: unknown
          elevel: number | null
          jit_emission_count: number | null
          jit_emission_time: number | null
          jit_functions: number | null
          jit_generation_time: number | null
          jit_inlining_count: number | null
          jit_inlining_time: number | null
          jit_optimization_count: number | null
          jit_optimization_time: number | null
          local_blks_dirtied: number | null
          local_blks_hit: number | null
          local_blks_read: number | null
          local_blks_written: number | null
          max_exec_time: number | null
          max_plan_time: number | null
          mean_exec_time: number | null
          mean_plan_time: number | null
          message: string | null
          min_exec_time: number | null
          min_plan_time: number | null
          pgsm_query_id: number | null
          planid: number | null
          plans: number | null
          query: string | null
          query_plan: string | null
          queryid: number | null
          relations: string[] | null
          resp_calls: string[] | null
          rows: number | null
          shared_blks_dirtied: number | null
          shared_blks_hit: number | null
          shared_blks_read: number | null
          shared_blks_written: number | null
          sqlcode: string | null
          stddev_exec_time: number | null
          stddev_plan_time: number | null
          temp_blk_read_time: number | null
          temp_blk_write_time: number | null
          temp_blks_read: number | null
          temp_blks_written: number | null
          top_query: string | null
          top_queryid: number | null
          toplevel: boolean | null
          total_exec_time: number | null
          total_plan_time: number | null
          userid: unknown
          username: string | null
          wal_bytes: number | null
          wal_fpi: number | null
          wal_records: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      __plpgsql_show_dependency_tb:
        | {
            Args: {
              anycompatiblerangetype?: unknown
              anycompatibletype?: unknown
              anyelememttype?: unknown
              anyenumtype?: unknown
              anyrangetype?: unknown
              name: string
              relid?: unknown
            }
            Returns: {
              name: string
              oid: unknown
              params: string
              schema: string
              type: string
            }[]
          }
        | {
            Args: {
              anycompatiblerangetype?: unknown
              anycompatibletype?: unknown
              anyelememttype?: unknown
              anyenumtype?: unknown
              anyrangetype?: unknown
              funcoid: unknown
              relid?: unknown
            }
            Returns: {
              name: string
              oid: unknown
              params: string
              schema: string
              type: string
            }[]
          }
      bytea_to_text: { Args: { data: string }; Returns: string }
      calculate_level: { Args: { xp_amount: number }; Returns: number }
      check_rate_limit: {
        Args: {
          action_type_param: string
          limit_per_hour?: number
          user_uuid: string
        }
        Returns: boolean
      }
      claim_daily_reward: { Args: { user_uuid: string }; Returns: Json }
      cleanup_expired_sessions: { Args: never; Returns: undefined }
      cleanup_rate_limits: { Args: never; Returns: undefined }
      decode_error_level: { Args: { elevel: number }; Returns: string }
      get_cmd_type: { Args: { cmd_type: number }; Returns: string }
      get_histogram_timings: { Args: never; Returns: string }
      get_public_profile_info: {
        Args: { target_user_id: string }
        Returns: {
          avatar_url: string
          bio: string
          class: string
          display_name: string
          id: string
          is_verified: boolean
          level: number
          user_id: string
          username: string
          xp: number
        }[]
      }
      get_public_user_info: {
        Args: { target_user_id: string }
        Returns: {
          avatar_url: string
          bio: string
          display_name: string
          id: string
          is_artist: boolean
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
      histogram: {
        Args: { _bucket: number; _quryid: number }
        Returns: Record<string, unknown>[]
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "http_request"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_delete:
        | {
            Args: { uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { content: string; content_type: string; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_get:
        | {
            Args: { uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { data: Json; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
        SetofOptions: {
          from: "*"
          to: "http_header"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_list_curlopt: {
        Args: never
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_post:
        | {
            Args: { content: string; content_type: string; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { data: Json; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_put: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_reset_curlopt: { Args: never; Returns: boolean }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      pg_stat_monitor_internal: {
        Args: { showtext: boolean }
        Returns: Record<string, unknown>[]
      }
      pg_stat_monitor_reset: { Args: never; Returns: undefined }
      pg_stat_monitor_version: { Args: never; Returns: string }
      pgsm_create_11_view: { Args: never; Returns: number }
      pgsm_create_13_view: { Args: never; Returns: number }
      pgsm_create_14_view: { Args: never; Returns: number }
      pgsm_create_15_view: { Args: never; Returns: number }
      pgsm_create_17_view: { Args: never; Returns: number }
      pgsm_create_view: { Args: never; Returns: number }
      plpgsql_check_function:
        | {
            Args: {
              all_warnings?: boolean
              anycompatiblerangetype?: unknown
              anycompatibletype?: unknown
              anyelememttype?: unknown
              anyenumtype?: unknown
              anyrangetype?: unknown
              compatibility_warnings?: boolean
              constant_tracing?: boolean
              extra_warnings?: boolean
              fatal_errors?: boolean
              format?: string
              incomment_options_usage_warning?: boolean
              name: string
              newtable?: unknown
              oldtable?: unknown
              other_warnings?: boolean
              performance_warnings?: boolean
              relid?: unknown
              security_warnings?: boolean
              use_incomment_options?: boolean
              without_warnings?: boolean
            }
            Returns: string[]
          }
        | {
            Args: {
              all_warnings?: boolean
              anycompatiblerangetype?: unknown
              anycompatibletype?: unknown
              anyelememttype?: unknown
              anyenumtype?: unknown
              anyrangetype?: unknown
              compatibility_warnings?: boolean
              constant_tracing?: boolean
              extra_warnings?: boolean
              fatal_errors?: boolean
              format?: string
              funcoid: unknown
              incomment_options_usage_warning?: boolean
              newtable?: unknown
              oldtable?: unknown
              other_warnings?: boolean
              performance_warnings?: boolean
              relid?: unknown
              security_warnings?: boolean
              use_incomment_options?: boolean
              without_warnings?: boolean
            }
            Returns: string[]
          }
      plpgsql_check_function_tb:
        | {
            Args: {
              all_warnings?: boolean
              anycompatiblerangetype?: unknown
              anycompatibletype?: unknown
              anyelememttype?: unknown
              anyenumtype?: unknown
              anyrangetype?: unknown
              compatibility_warnings?: boolean
              constant_tracing?: boolean
              extra_warnings?: boolean
              fatal_errors?: boolean
              incomment_options_usage_warning?: boolean
              name: string
              newtable?: unknown
              oldtable?: unknown
              other_warnings?: boolean
              performance_warnings?: boolean
              relid?: unknown
              security_warnings?: boolean
              use_incomment_options?: boolean
              without_warnings?: boolean
            }
            Returns: {
              context: string
              detail: string
              functionid: unknown
              hint: string
              level: string
              lineno: number
              message: string
              position: number
              query: string
              sqlstate: string
              statement: string
            }[]
          }
        | {
            Args: {
              all_warnings?: boolean
              anycompatiblerangetype?: unknown
              anycompatibletype?: unknown
              anyelememttype?: unknown
              anyenumtype?: unknown
              anyrangetype?: unknown
              compatibility_warnings?: boolean
              constant_tracing?: boolean
              extra_warnings?: boolean
              fatal_errors?: boolean
              funcoid: unknown
              incomment_options_usage_warning?: boolean
              newtable?: unknown
              oldtable?: unknown
              other_warnings?: boolean
              performance_warnings?: boolean
              relid?: unknown
              security_warnings?: boolean
              use_incomment_options?: boolean
              without_warnings?: boolean
            }
            Returns: {
              context: string
              detail: string
              functionid: unknown
              hint: string
              level: string
              lineno: number
              message: string
              position: number
              query: string
              sqlstate: string
              statement: string
            }[]
          }
      plpgsql_check_pragma: { Args: { name: string[] }; Returns: number }
      plpgsql_check_profiler: { Args: { enable?: boolean }; Returns: boolean }
      plpgsql_check_tracer: {
        Args: { enable?: boolean; verbosity?: string }
        Returns: boolean
      }
      plpgsql_coverage_branches:
        | { Args: { name: string }; Returns: number }
        | { Args: { funcoid: unknown }; Returns: number }
      plpgsql_coverage_statements:
        | { Args: { name: string }; Returns: number }
        | { Args: { funcoid: unknown }; Returns: number }
      plpgsql_profiler_function_statements_tb:
        | {
            Args: { name: string }
            Returns: {
              avg_time: number
              block_num: number
              exec_stmts: number
              exec_stmts_err: number
              lineno: number
              max_time: number
              parent_note: string
              parent_stmtid: number
              processed_rows: number
              queryid: number
              stmtid: number
              stmtname: string
              total_time: number
            }[]
          }
        | {
            Args: { funcoid: unknown }
            Returns: {
              avg_time: number
              block_num: number
              exec_stmts: number
              exec_stmts_err: number
              lineno: number
              max_time: number
              parent_note: string
              parent_stmtid: number
              processed_rows: number
              queryid: number
              stmtid: number
              stmtname: string
              total_time: number
            }[]
          }
      plpgsql_profiler_function_tb:
        | {
            Args: { name: string }
            Returns: {
              avg_time: number
              cmds_on_row: number
              exec_stmts: number
              exec_stmts_err: number
              lineno: number
              max_time: number[]
              processed_rows: number[]
              queryids: number[]
              source: string
              stmt_lineno: number
              total_time: number
            }[]
          }
        | {
            Args: { funcoid: unknown }
            Returns: {
              avg_time: number
              cmds_on_row: number
              exec_stmts: number
              exec_stmts_err: number
              lineno: number
              max_time: number[]
              processed_rows: number[]
              queryids: number[]
              source: string
              stmt_lineno: number
              total_time: number
            }[]
          }
      plpgsql_profiler_functions_all: {
        Args: never
        Returns: {
          avg_time: number
          exec_count: number
          exec_stmts_err: number
          funcoid: unknown
          max_time: number
          min_time: number
          stddev_time: number
          total_time: number
        }[]
      }
      plpgsql_profiler_install_fake_queryid_hook: {
        Args: never
        Returns: undefined
      }
      plpgsql_profiler_remove_fake_queryid_hook: {
        Args: never
        Returns: undefined
      }
      plpgsql_profiler_reset: { Args: { funcoid: unknown }; Returns: undefined }
      plpgsql_profiler_reset_all: { Args: never; Returns: undefined }
      plpgsql_show_dependency_tb:
        | {
            Args: {
              anycompatiblerangetype?: unknown
              anycompatibletype?: unknown
              anyelememttype?: unknown
              anyenumtype?: unknown
              anyrangetype?: unknown
              funcoid: unknown
              relid?: unknown
            }
            Returns: {
              name: string
              oid: unknown
              params: string
              schema: string
              type: string
            }[]
          }
        | {
            Args: {
              anycompatiblerangetype?: unknown
              anycompatibletype?: unknown
              anyelememttype?: unknown
              anyenumtype?: unknown
              anyrangetype?: unknown
              fnname: string
              relid?: unknown
            }
            Returns: {
              name: string
              oid: unknown
              params: string
              schema: string
              type: string
            }[]
          }
      range: { Args: never; Returns: string[] }
      record_study_session: {
        Args: { activity: string; minutes: number }
        Returns: Json
      }
      text_to_bytea: { Args: { data: string }; Returns: string }
      text2ltree: { Args: { "": string }; Returns: unknown }
      urlencode:
        | { Args: { data: Json }; Returns: string }
        | {
            Args: { string: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.urlencode(string => bytea), public.urlencode(string => varchar). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { string: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.urlencode(string => bytea), public.urlencode(string => varchar). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
      validate_message_content: { Args: { content: string }; Returns: boolean }
      validate_profile_data: {
        Args: {
          bio_input?: string
          display_name_input?: string
          username_input?: string
        }
        Returns: boolean
      }
      xp_for_next_level: { Args: { current_level: number }; Returns: number }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
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
