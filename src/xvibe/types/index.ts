// XVibe Types

export interface XVibeTrack {
  id: string;
  title: string;
  artist_id: string;
  album_id?: string;
  audio_url: string;
  cover_url?: string;
  duration: number;
  genre?: string;
  mood_tags?: string[];
  is_explicit: boolean;
  play_count: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'live';
  created_at: string;
  // Joined data
  artist?: XVibeArtist;
  album?: XVibeAlbum;
}

export interface XVibeArtist {
  id: string;
  user_id?: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  is_verified: boolean;
  monthly_listeners: number;
  follower_count: number;
  genres?: string[];
  social_links?: Record<string, string>;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface XVibeAlbum {
  id: string;
  artist_id: string;
  title: string;
  cover_url?: string;
  description?: string;
  release_date?: string;
  album_type: 'album' | 'ep' | 'single';
  genre?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'live';
  total_tracks: number;
  total_duration: number;
  play_count: number;
  created_at: string;
  // Joined data
  artist?: XVibeArtist;
  tracks?: XVibeTrack[];
}

export interface XVibePlaylist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  cover_url?: string;
  is_public: boolean;
  is_collaborative: boolean;
  track_count: number;
  total_duration: number;
  created_at: string;
  // Joined data
  tracks?: XVibeTrack[];
}

export interface XVibeUserPreferences {
  id: string;
  user_id: string;
  preferred_genres: string[];
  preferred_moods: string[];
  onboarding_completed: boolean;
}

export interface XVibeListeningHistory {
  id: string;
  user_id: string;
  track_id: string;
  played_at: string;
  duration_played: number;
  completed: boolean;
  track?: XVibeTrack;
}

export type RepeatMode = 'off' | 'one' | 'all';

export interface PlayerState {
  currentTrack: XVibeTrack | null;
  queue: XVibeTrack[];
  originalQueue: XVibeTrack[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffleMode: boolean;
  repeatMode: RepeatMode;
  isFullscreen: boolean;
  isQueueOpen: boolean;
  isDJMode: boolean;
}

export interface DJState {
  isActive: boolean;
  currentMood: string;
  energyLevel: number;
  speakingAllowed: boolean;
  lastSpoke: number;
}

export const GENRES = [
  'Pop', 'Hip-Hop', 'R&B', 'Rock', 'Electronic', 'Jazz', 'Classical',
  'Country', 'Reggae', 'Latin', 'K-Pop', 'Indie', 'Metal', 'Folk', 'Blues'
] as const;

export const MOODS = [
  'Happy', 'Sad', 'Energetic', 'Chill', 'Romantic', 'Angry', 'Focused',
  'Party', 'Workout', 'Sleep', 'Study', 'Driving'
] as const;
