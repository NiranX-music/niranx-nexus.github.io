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
          added_by: string | null
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
          added_by?: string | null
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
          added_by?: string | null
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
          sender_id?: string
          updated_at?: string
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
          id: string
          institute_id: string | null
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
          id?: string
          institute_id?: string | null
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
          id?: string
          institute_id?: string | null
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
      study_materials: {
        Row: {
          category: string | null
          created_at: string
          flashcards: Json | null
          id: string
          name: string
          notes: string | null
          size: number
          summary: string | null
          tags: string[] | null
          type: string
          uploaded_by: string | null
          url: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          flashcards?: Json | null
          id?: string
          name: string
          notes?: string | null
          size: number
          summary?: string | null
          tags?: string[] | null
          type: string
          uploaded_by?: string | null
          url: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          flashcards?: Json | null
          id?: string
          name?: string
          notes?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_level: {
        Args: { xp_amount: number }
        Returns: number
      }
      check_rate_limit: {
        Args: {
          action_type_param: string
          limit_per_hour?: number
          user_uuid: string
        }
        Returns: boolean
      }
      claim_daily_reward: {
        Args: { user_uuid: string }
        Returns: Json
      }
      cleanup_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
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
      validate_message_content: {
        Args: { content: string }
        Returns: boolean
      }
      validate_profile_data: {
        Args: {
          bio_input?: string
          display_name_input?: string
          username_input?: string
        }
        Returns: boolean
      }
      xp_for_next_level: {
        Args: { current_level: number }
        Returns: number
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
