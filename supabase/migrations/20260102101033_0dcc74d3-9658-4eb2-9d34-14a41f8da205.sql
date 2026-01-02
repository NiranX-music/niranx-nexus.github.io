-- =============================================
-- XSTAGE DATABASE SCHEMA
-- Complete music collaboration platform
-- =============================================

-- Create project role enum
CREATE TYPE public.xstage_project_role AS ENUM ('owner', 'admin', 'member', 'session_musician', 'viewer');

-- Create project type enum
CREATE TYPE public.xstage_project_type AS ENUM ('band', 'solo', 'side_project', 'collaboration');

-- Create event type enum
CREATE TYPE public.xstage_event_type AS ENUM ('rehearsal', 'gig', 'recording', 'deadline', 'meeting');

-- Create RSVP status enum
CREATE TYPE public.xstage_rsvp_status AS ENUM ('attending', 'maybe', 'declined');

-- Create message type enum
CREATE TYPE public.xstage_message_type AS ENUM ('text', 'image', 'video', 'file', 'voice');

-- =============================================
-- PROJECTS TABLE
-- =============================================
CREATE TABLE public.xstage_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type xstage_project_type NOT NULL DEFAULT 'band',
  avatar_url TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- PROJECT MEMBERS TABLE
-- =============================================
CREATE TABLE public.xstage_project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.xstage_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role xstage_project_role NOT NULL DEFAULT 'member',
  instrument TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- =============================================
-- EVENTS TABLE
-- =============================================
CREATE TABLE public.xstage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.xstage_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type xstage_event_type NOT NULL DEFAULT 'rehearsal',
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- EVENT RSVPS TABLE
-- =============================================
CREATE TABLE public.xstage_event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.xstage_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status xstage_rsvp_status NOT NULL DEFAULT 'attending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- =============================================
-- CHAT CHANNELS TABLE
-- =============================================
CREATE TABLE public.xstage_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.xstage_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- MESSAGES TABLE
-- =============================================
CREATE TABLE public.xstage_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.xstage_channels(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  project_id UUID NOT NULL REFERENCES public.xstage_projects(id) ON DELETE CASCADE,
  content TEXT,
  message_type xstage_message_type NOT NULL DEFAULT 'text',
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  duration INTEGER,
  is_pinned BOOLEAN DEFAULT false,
  parent_message_id UUID REFERENCES public.xstage_messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- MESSAGE REACTIONS TABLE
-- =============================================
CREATE TABLE public.xstage_message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.xstage_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- =============================================
-- MESSAGE READS TABLE
-- =============================================
CREATE TABLE public.xstage_message_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.xstage_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- =============================================
-- TYPING INDICATORS TABLE
-- =============================================
CREATE TABLE public.xstage_typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.xstage_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.xstage_projects(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- FILES TABLE
-- =============================================
CREATE TABLE public.xstage_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.xstage_projects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.xstage_files(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_folder BOOLEAN NOT NULL DEFAULT false,
  file_url TEXT,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- FILE VERSIONS TABLE
-- =============================================
CREATE TABLE public.xstage_file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES public.xstage_files(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- FILE COMMENTS TABLE
-- =============================================
CREATE TABLE public.xstage_file_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES public.xstage_files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- SONGS TABLE
-- =============================================
CREATE TABLE public.xstage_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.xstage_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  bpm INTEGER,
  key TEXT,
  duration_seconds INTEGER,
  lyrics TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- SETLISTS TABLE
-- =============================================
CREATE TABLE public.xstage_setlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.xstage_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- SETLIST SONGS TABLE
-- =============================================
CREATE TABLE public.xstage_setlist_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setlist_id UUID NOT NULL REFERENCES public.xstage_setlists(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.xstage_songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- PROJECT INVITES TABLE
-- =============================================
CREATE TABLE public.xstage_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.xstage_projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role xstage_project_role NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================
ALTER TABLE public.xstage_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xstage_project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xstage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xstage_event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xstage_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xstage_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xstage_message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xstage_message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xstage_typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xstage_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xstage_file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xstage_file_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xstage_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xstage_setlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xstage_setlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xstage_invites ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTION: Check if user is project member
-- =============================================
CREATE OR REPLACE FUNCTION public.is_xstage_project_member(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.xstage_project_members
    WHERE project_id = p_project_id AND user_id = p_user_id
  );
$$;

-- =============================================
-- HELPER FUNCTION: Check if user is project admin/owner
-- =============================================
CREATE OR REPLACE FUNCTION public.is_xstage_project_admin(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.xstage_project_members
    WHERE project_id = p_project_id 
      AND user_id = p_user_id 
      AND role IN ('owner', 'admin')
  );
$$;

-- =============================================
-- RLS POLICIES: Projects
-- =============================================
CREATE POLICY "Users can view projects they are members of"
ON public.xstage_projects FOR SELECT
TO authenticated
USING (public.is_xstage_project_member(id, auth.uid()));

CREATE POLICY "Authenticated users can create projects"
ON public.xstage_projects FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Project admins can update projects"
ON public.xstage_projects FOR UPDATE
TO authenticated
USING (public.is_xstage_project_admin(id, auth.uid()));

CREATE POLICY "Project owners can delete projects"
ON public.xstage_projects FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.xstage_project_members
  WHERE project_id = id AND user_id = auth.uid() AND role = 'owner'
));

-- =============================================
-- RLS POLICIES: Project Members
-- =============================================
CREATE POLICY "Members can view project members"
ON public.xstage_project_members FOR SELECT
TO authenticated
USING (public.is_xstage_project_member(project_id, auth.uid()));

CREATE POLICY "Admins can add project members"
ON public.xstage_project_members FOR INSERT
TO authenticated
WITH CHECK (public.is_xstage_project_admin(project_id, auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Admins can update project members"
ON public.xstage_project_members FOR UPDATE
TO authenticated
USING (public.is_xstage_project_admin(project_id, auth.uid()));

CREATE POLICY "Admins can remove project members"
ON public.xstage_project_members FOR DELETE
TO authenticated
USING (public.is_xstage_project_admin(project_id, auth.uid()) OR user_id = auth.uid());

-- =============================================
-- RLS POLICIES: Events
-- =============================================
CREATE POLICY "Members can view project events"
ON public.xstage_events FOR SELECT
TO authenticated
USING (public.is_xstage_project_member(project_id, auth.uid()));

CREATE POLICY "Members can create events"
ON public.xstage_events FOR INSERT
TO authenticated
WITH CHECK (public.is_xstage_project_member(project_id, auth.uid()));

CREATE POLICY "Event creators and admins can update events"
ON public.xstage_events FOR UPDATE
TO authenticated
USING (created_by = auth.uid() OR public.is_xstage_project_admin(project_id, auth.uid()));

CREATE POLICY "Event creators and admins can delete events"
ON public.xstage_events FOR DELETE
TO authenticated
USING (created_by = auth.uid() OR public.is_xstage_project_admin(project_id, auth.uid()));

-- =============================================
-- RLS POLICIES: Event RSVPs
-- =============================================
CREATE POLICY "Members can view event RSVPs"
ON public.xstage_event_rsvps FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.xstage_events e
  WHERE e.id = event_id AND public.is_xstage_project_member(e.project_id, auth.uid())
));

CREATE POLICY "Members can create their own RSVPs"
ON public.xstage_event_rsvps FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own RSVPs"
ON public.xstage_event_rsvps FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own RSVPs"
ON public.xstage_event_rsvps FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- =============================================
-- RLS POLICIES: Channels
-- =============================================
CREATE POLICY "Members can view project channels"
ON public.xstage_channels FOR SELECT
TO authenticated
USING (public.is_xstage_project_member(project_id, auth.uid()));

CREATE POLICY "Members can create channels"
ON public.xstage_channels FOR INSERT
TO authenticated
WITH CHECK (public.is_xstage_project_member(project_id, auth.uid()));

CREATE POLICY "Channel creators and admins can update channels"
ON public.xstage_channels FOR UPDATE
TO authenticated
USING (created_by = auth.uid() OR public.is_xstage_project_admin(project_id, auth.uid()));

CREATE POLICY "Channel creators and admins can delete channels"
ON public.xstage_channels FOR DELETE
TO authenticated
USING (created_by = auth.uid() OR public.is_xstage_project_admin(project_id, auth.uid()));

-- =============================================
-- RLS POLICIES: Messages
-- =============================================
CREATE POLICY "Members can view project messages"
ON public.xstage_messages FOR SELECT
TO authenticated
USING (public.is_xstage_project_member(project_id, auth.uid()));

CREATE POLICY "Members can create messages"
ON public.xstage_messages FOR INSERT
TO authenticated
WITH CHECK (public.is_xstage_project_member(project_id, auth.uid()) AND sender_id = auth.uid());

CREATE POLICY "Senders can update their messages"
ON public.xstage_messages FOR UPDATE
TO authenticated
USING (sender_id = auth.uid());

CREATE POLICY "Senders and admins can delete messages"
ON public.xstage_messages FOR DELETE
TO authenticated
USING (sender_id = auth.uid() OR public.is_xstage_project_admin(project_id, auth.uid()));

-- =============================================
-- RLS POLICIES: Message Reactions
-- =============================================
CREATE POLICY "Members can view message reactions"
ON public.xstage_message_reactions FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.xstage_messages m
  WHERE m.id = message_id AND public.is_xstage_project_member(m.project_id, auth.uid())
));

CREATE POLICY "Members can add reactions"
ON public.xstage_message_reactions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their reactions"
ON public.xstage_message_reactions FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- =============================================
-- RLS POLICIES: Message Reads
-- =============================================
CREATE POLICY "Members can view message reads"
ON public.xstage_message_reads FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.xstage_messages m
  WHERE m.id = message_id AND public.is_xstage_project_member(m.project_id, auth.uid())
));

CREATE POLICY "Users can mark messages as read"
ON public.xstage_message_reads FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- =============================================
-- RLS POLICIES: Typing Indicators
-- =============================================
CREATE POLICY "Members can view typing indicators"
ON public.xstage_typing_indicators FOR SELECT
TO authenticated
USING (public.is_xstage_project_member(project_id, auth.uid()));

CREATE POLICY "Users can create their typing indicators"
ON public.xstage_typing_indicators FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their typing indicators"
ON public.xstage_typing_indicators FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their typing indicators"
ON public.xstage_typing_indicators FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- =============================================
-- RLS POLICIES: Files
-- =============================================
CREATE POLICY "Members can view project files"
ON public.xstage_files FOR SELECT
TO authenticated
USING (public.is_xstage_project_member(project_id, auth.uid()));

CREATE POLICY "Members can upload files"
ON public.xstage_files FOR INSERT
TO authenticated
WITH CHECK (public.is_xstage_project_member(project_id, auth.uid()));

CREATE POLICY "File uploaders and admins can update files"
ON public.xstage_files FOR UPDATE
TO authenticated
USING (uploaded_by = auth.uid() OR public.is_xstage_project_admin(project_id, auth.uid()));

CREATE POLICY "File uploaders and admins can delete files"
ON public.xstage_files FOR DELETE
TO authenticated
USING (uploaded_by = auth.uid() OR public.is_xstage_project_admin(project_id, auth.uid()));

-- =============================================
-- RLS POLICIES: File Versions
-- =============================================
CREATE POLICY "Members can view file versions"
ON public.xstage_file_versions FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.xstage_files f
  WHERE f.id = file_id AND public.is_xstage_project_member(f.project_id, auth.uid())
));

CREATE POLICY "Members can create file versions"
ON public.xstage_file_versions FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.xstage_files f
  WHERE f.id = file_id AND public.is_xstage_project_member(f.project_id, auth.uid())
));

-- =============================================
-- RLS POLICIES: File Comments
-- =============================================
CREATE POLICY "Members can view file comments"
ON public.xstage_file_comments FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.xstage_files f
  WHERE f.id = file_id AND public.is_xstage_project_member(f.project_id, auth.uid())
));

CREATE POLICY "Members can create file comments"
ON public.xstage_file_comments FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Comment authors can update comments"
ON public.xstage_file_comments FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Comment authors can delete comments"
ON public.xstage_file_comments FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- =============================================
-- RLS POLICIES: Songs
-- =============================================
CREATE POLICY "Members can view project songs"
ON public.xstage_songs FOR SELECT
TO authenticated
USING (public.is_xstage_project_member(project_id, auth.uid()));

CREATE POLICY "Members can create songs"
ON public.xstage_songs FOR INSERT
TO authenticated
WITH CHECK (public.is_xstage_project_member(project_id, auth.uid()));

CREATE POLICY "Members can update songs"
ON public.xstage_songs FOR UPDATE
TO authenticated
USING (public.is_xstage_project_member(project_id, auth.uid()));

CREATE POLICY "Song creators and admins can delete songs"
ON public.xstage_songs FOR DELETE
TO authenticated
USING (created_by = auth.uid() OR public.is_xstage_project_admin(project_id, auth.uid()));

-- =============================================
-- RLS POLICIES: Setlists
-- =============================================
CREATE POLICY "Members can view project setlists"
ON public.xstage_setlists FOR SELECT
TO authenticated
USING (public.is_xstage_project_member(project_id, auth.uid()));

CREATE POLICY "Members can create setlists"
ON public.xstage_setlists FOR INSERT
TO authenticated
WITH CHECK (public.is_xstage_project_member(project_id, auth.uid()));

CREATE POLICY "Members can update setlists"
ON public.xstage_setlists FOR UPDATE
TO authenticated
USING (public.is_xstage_project_member(project_id, auth.uid()));

CREATE POLICY "Setlist creators and admins can delete setlists"
ON public.xstage_setlists FOR DELETE
TO authenticated
USING (created_by = auth.uid() OR public.is_xstage_project_admin(project_id, auth.uid()));

-- =============================================
-- RLS POLICIES: Setlist Songs
-- =============================================
CREATE POLICY "Members can view setlist songs"
ON public.xstage_setlist_songs FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.xstage_setlists s
  WHERE s.id = setlist_id AND public.is_xstage_project_member(s.project_id, auth.uid())
));

CREATE POLICY "Members can add songs to setlists"
ON public.xstage_setlist_songs FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.xstage_setlists s
  WHERE s.id = setlist_id AND public.is_xstage_project_member(s.project_id, auth.uid())
));

CREATE POLICY "Members can update setlist songs"
ON public.xstage_setlist_songs FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.xstage_setlists s
  WHERE s.id = setlist_id AND public.is_xstage_project_member(s.project_id, auth.uid())
));

CREATE POLICY "Members can remove songs from setlists"
ON public.xstage_setlist_songs FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.xstage_setlists s
  WHERE s.id = setlist_id AND public.is_xstage_project_member(s.project_id, auth.uid())
));

-- =============================================
-- RLS POLICIES: Invites
-- =============================================
CREATE POLICY "Project admins can view invites"
ON public.xstage_invites FOR SELECT
TO authenticated
USING (public.is_xstage_project_admin(project_id, auth.uid()));

CREATE POLICY "Project admins can create invites"
ON public.xstage_invites FOR INSERT
TO authenticated
WITH CHECK (public.is_xstage_project_admin(project_id, auth.uid()));

CREATE POLICY "Project admins can delete invites"
ON public.xstage_invites FOR DELETE
TO authenticated
USING (public.is_xstage_project_admin(project_id, auth.uid()));

-- =============================================
-- ENABLE REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.xstage_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.xstage_message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.xstage_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.xstage_event_rsvps;
ALTER PUBLICATION supabase_realtime ADD TABLE public.xstage_typing_indicators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.xstage_files;

-- =============================================
-- STORAGE BUCKET FOR XSTAGE
-- =============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('xstage-files', 'xstage-files', true, 104857600)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload xstage files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'xstage-files');

CREATE POLICY "Anyone can view xstage files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'xstage-files');

CREATE POLICY "Users can update their own xstage files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'xstage-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own xstage files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'xstage-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_xstage_project_members_user ON public.xstage_project_members(user_id);
CREATE INDEX idx_xstage_project_members_project ON public.xstage_project_members(project_id);
CREATE INDEX idx_xstage_events_project ON public.xstage_events(project_id);
CREATE INDEX idx_xstage_events_date ON public.xstage_events(event_date);
CREATE INDEX idx_xstage_messages_channel ON public.xstage_messages(channel_id);
CREATE INDEX idx_xstage_messages_project ON public.xstage_messages(project_id);
CREATE INDEX idx_xstage_messages_created ON public.xstage_messages(created_at DESC);
CREATE INDEX idx_xstage_files_project ON public.xstage_files(project_id);
CREATE INDEX idx_xstage_files_parent ON public.xstage_files(parent_id);
CREATE INDEX idx_xstage_songs_project ON public.xstage_songs(project_id);
CREATE INDEX idx_xstage_setlists_project ON public.xstage_setlists(project_id);