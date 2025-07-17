-- Fix RLS security issues by enabling RLS on all public tables and creating appropriate policies

-- Enable RLS on all remaining tables that don't have it yet
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for likes table
CREATE POLICY "Users can view their own likes" ON public.likes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for battles table
CREATE POLICY "Everyone can view battles" ON public.battles FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create battles" ON public.battles FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Battle creators can update their battles" ON public.battles FOR UPDATE USING (auth.uid() = created_by);

-- Create RLS policies for battle_entries table
CREATE POLICY "Everyone can view battle entries" ON public.battle_entries FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create battle entries" ON public.battle_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own battle entries" ON public.battle_entries FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for achievements table
CREATE POLICY "Everyone can view achievements" ON public.achievements FOR SELECT USING (true);

-- Create RLS policies for follows table
CREATE POLICY "Users can view their own follows" ON public.follows FOR SELECT USING (auth.uid() = follower_id OR auth.uid() = following_id);
CREATE POLICY "Users can create follows" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete their own follows" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Create RLS policies for fan_clubs table
CREATE POLICY "Everyone can view public fan clubs" ON public.fan_clubs FOR SELECT USING (is_private = false OR auth.uid() = artist_id);
CREATE POLICY "Artists can create their own fan clubs" ON public.fan_clubs FOR INSERT WITH CHECK (auth.uid() = artist_id);
CREATE POLICY "Artists can update their own fan clubs" ON public.fan_clubs FOR UPDATE USING (auth.uid() = artist_id);

-- Create RLS policies for battle_votes table
CREATE POLICY "Everyone can view battle votes" ON public.battle_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create battle votes" ON public.battle_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for fan_club_members table
CREATE POLICY "Members can view fan club memberships" ON public.fan_club_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can join fan clubs" ON public.fan_club_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave fan clubs" ON public.fan_club_members FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for challenges table
CREATE POLICY "Everyone can view challenges" ON public.challenges FOR SELECT USING (true);

-- Create RLS policies for user_achievements table
CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policies for track_analysis table
CREATE POLICY "Everyone can view track analysis" ON public.track_analysis FOR SELECT USING (true);

-- Create RLS policies for playlists table
CREATE POLICY "Users can view public playlists or their own" ON public.playlists FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can create their own playlists" ON public.playlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own playlists" ON public.playlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own playlists" ON public.playlists FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for voice_commands table
CREATE POLICY "Users can view their own voice commands" ON public.voice_commands FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own voice commands" ON public.voice_commands FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for audio_samples table
CREATE POLICY "Users can view public audio samples or their own" ON public.audio_samples FOR SELECT USING (is_public = true OR auth.uid() = uploaded_by);
CREATE POLICY "Users can create their own audio samples" ON public.audio_samples FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Users can update their own audio samples" ON public.audio_samples FOR UPDATE USING (auth.uid() = uploaded_by);

-- Create RLS policies for users table
CREATE POLICY "Everyone can view user profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for tracks table
CREATE POLICY "Everyone can view tracks" ON public.tracks FOR SELECT USING (true);
CREATE POLICY "Users can create their own tracks" ON public.tracks FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Users can update their own tracks" ON public.tracks FOR UPDATE USING (auth.uid() = uploaded_by);

-- Create RLS policies for listening_history table
CREATE POLICY "Users can view their own listening history" ON public.listening_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own listening history" ON public.listening_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for playlist_tracks table
CREATE POLICY "Users can view tracks in public playlists or their own" ON public.playlist_tracks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND (is_public = true OR user_id = auth.uid()))
);
CREATE POLICY "Users can add tracks to their own playlists" ON public.playlist_tracks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND user_id = auth.uid())
);
CREATE POLICY "Users can remove tracks from their own playlists" ON public.playlist_tracks FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND user_id = auth.uid())
);

-- Create RLS policies for notifications table
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for live_streams table
CREATE POLICY "Everyone can view live streams" ON public.live_streams FOR SELECT USING (true);
CREATE POLICY "Artists can create their own live streams" ON public.live_streams FOR INSERT WITH CHECK (auth.uid() = artist_id);
CREATE POLICY "Artists can update their own live streams" ON public.live_streams FOR UPDATE USING (auth.uid() = artist_id);

-- Fix search_path security warnings for existing functions
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- Add missing policies for chat room operations
CREATE POLICY "Users can create chat rooms" ON public.chat_rooms FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Room creators can update their rooms" ON public.chat_rooms FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Room creators can delete their rooms" ON public.chat_rooms FOR DELETE USING (auth.uid() = created_by);

-- Add missing policies for chat room members operations
CREATE POLICY "Users can join chat rooms" ON public.chat_room_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave chat rooms" ON public.chat_room_members FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Room admins can manage members" ON public.chat_room_members FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.chat_room_members WHERE room_id = chat_room_members.room_id AND user_id = auth.uid() AND role = 'admin')
);