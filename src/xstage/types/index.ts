// Xstage Type Definitions

export type ProjectRole = 'owner' | 'admin' | 'member' | 'session_musician' | 'viewer';
export type ProjectType = 'band' | 'solo' | 'side_project' | 'collaboration';
export type EventType = 'rehearsal' | 'gig' | 'recording' | 'deadline' | 'meeting';
export type RSVPStatus = 'attending' | 'maybe' | 'declined';
export type MessageType = 'text' | 'image' | 'video' | 'file' | 'voice';

export interface XstageProject {
  id: string;
  name: string;
  description: string | null;
  type: ProjectType;
  avatar_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface XstageProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectRole;
  instrument: string | null;
  joined_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    email?: string;
  };
}

export interface XstageEvent {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  event_type: EventType;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  rsvps?: XstageEventRSVP[];
}

export interface XstageEventRSVP {
  id: string;
  event_id: string;
  user_id: string;
  status: RSVPStatus;
  created_at: string;
  updated_at: string;
}

export interface XstageChannel {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
}

export interface XstageMessage {
  id: string;
  channel_id: string | null;
  sender_id: string;
  recipient_id: string | null;
  project_id: string;
  content: string | null;
  message_type: MessageType;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  duration: number | null;
  is_pinned: boolean;
  parent_message_id: string | null;
  created_at: string;
  updated_at: string;
  sender?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  reactions?: XstageMessageReaction[];
}

export interface XstageMessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface XstageFile {
  id: string;
  project_id: string;
  parent_id: string | null;
  name: string;
  is_folder: boolean;
  file_url: string | null;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface XstageSong {
  id: string;
  project_id: string;
  title: string;
  bpm: number | null;
  key: string | null;
  duration_seconds: number | null;
  lyrics: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface XstageSetlist {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface XstageSetlistSong {
  id: string;
  setlist_id: string;
  song_id: string;
  position: number;
  notes: string | null;
  created_at: string;
  song?: XstageSong;
}

export interface XstageInvite {
  id: string;
  project_id: string;
  email: string;
  role: ProjectRole;
  invited_by: string;
  accepted_at: string | null;
  created_at: string;
}

// Event type colors and icons
export const EVENT_TYPE_CONFIG: Record<EventType, { color: string; bg: string; label: string }> = {
  rehearsal: { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Rehearsal' },
  gig: { color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/20', label: 'Gig' },
  recording: { color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Recording' },
  deadline: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Deadline' },
  meeting: { color: 'text-gray-400', bg: 'bg-gray-500/20', label: 'Meeting' },
};

// Project type icons
export const PROJECT_TYPE_CONFIG: Record<ProjectType, { label: string; emoji: string }> = {
  band: { label: 'Band', emoji: '🎸' },
  solo: { label: 'Solo Artist', emoji: '🎤' },
  side_project: { label: 'Side Project', emoji: '🎹' },
  collaboration: { label: 'Collaboration', emoji: '🤝' },
};

// Musical keys
export const MUSICAL_KEYS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  'Cm', 'C#m', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bbm', 'Bm',
];
