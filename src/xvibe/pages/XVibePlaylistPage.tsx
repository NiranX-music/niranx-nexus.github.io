import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Heart, MoreHorizontal, Clock, Pencil, Music, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { XVibeLayout } from '../components/layout/XVibeLayout';
import { TrackRow, TrackRowHeader } from '../components/ui/TrackRow';
import { XVibePlaylist, XVibeTrack } from '../types';
import { useXVibePlayer } from '../contexts/XVibePlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function XVibePlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [playlist, setPlaylist] = useState<XVibePlaylist | null>(null);
  const [tracks, setTracks] = useState<XVibeTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const { currentTrack, isPlaying, playTrack, togglePlayPause } = useXVibePlayer();

  useEffect(() => {
    if (id) fetchPlaylistData();
  }, [id]);

  const fetchPlaylistData = async () => {
    if (!id) return;
    setLoading(true);

    try {
      // Fetch playlist
      const { data: playlistData } = await supabase
        .from('xvibe_playlists')
        .select('*')
        .eq('id', id)
        .single();

      if (playlistData) {
        setPlaylist(playlistData as XVibePlaylist);

        // Fetch playlist tracks
        const { data: tracksData } = await supabase
          .from('xvibe_playlist_tracks')
          .select(`
            position,
            track:xvibe_tracks(*, artist:xvibe_artists(*), album:xvibe_albums(*))
          `)
          .eq('playlist_id', id)
          .order('position', { ascending: true });

        const trackList = tracksData?.map(t => t.track).filter(Boolean) as XVibeTrack[];
        setTracks(trackList || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} hr ${mins} min`;
    }
    return `${mins} min`;
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      const isPlaylistPlaying = tracks.some(t => t.id === currentTrack?.id) && isPlaying;
      if (isPlaylistPlaying) {
        togglePlayPause();
      } else {
        playTrack(tracks[0], tracks);
      }
    }
  };

  const isPlaylistPlaying = tracks.some(t => t.id === currentTrack?.id) && isPlaying;
  const totalDuration = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const isOwner = user?.id === playlist?.user_id;

  const filteredTracks = searchQuery
    ? tracks.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.artist?.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tracks;

  if (loading) {
    return (
      <XVibeLayout>
        <div className="min-h-full bg-[#121212]">
          <div className="h-80 bg-gradient-to-b from-[#535353] to-[#121212] flex items-end p-6 gap-6">
            <Skeleton className="w-56 h-56 rounded-md bg-[#282828]" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-48 bg-[#282828]" />
              <Skeleton className="h-6 w-32 bg-[#282828]" />
            </div>
          </div>
        </div>
      </XVibeLayout>
    );
  }

  if (!playlist) {
    return (
      <XVibeLayout>
        <div className="min-h-full bg-[#121212] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Playlist not found</h2>
            <Button onClick={() => navigate('/xvibe')} variant="outline">
              Go Home
            </Button>
          </div>
        </div>
      </XVibeLayout>
    );
  }

  return (
    <XVibeLayout>
      <div className="min-h-full bg-[#121212]">
        {/* Hero Section */}
        <div className="relative min-h-[340px] p-6 flex items-end gap-6 bg-gradient-to-b from-[#5038a0] to-[#121212]">
          {/* Playlist Cover */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-56 h-56 rounded-md overflow-hidden shadow-2xl flex-shrink-0 group relative"
          >
            {playlist.cover_url ? (
              <img src={playlist.cover_url} alt={playlist.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#5038a0] to-[#1a1a2e] flex items-center justify-center">
                <Music className="h-24 w-24 text-white/50" />
              </div>
            )}
            {isOwner && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="ghost" className="text-white">
                  <Pencil className="h-6 w-6 mr-2" />
                  Choose photo
                </Button>
              </div>
            )}
          </motion.div>

          {/* Playlist Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white/80 font-medium uppercase mb-2">Playlist</p>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 truncate">
              {playlist.name}
            </h1>
            {playlist.description && (
              <p className="text-sm text-white/70 mb-2">{playlist.description}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-white/80">
              <span>{tracks.length} songs</span>
              <span>•</span>
              <span>{formatDuration(totalDuration)}</span>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center gap-4 p-6 bg-gradient-to-b from-[#121212]/60 to-[#121212]">
          <Button
            size="lg"
            className="w-14 h-14 rounded-full bg-[#1DB954] hover:bg-[#1ed760] hover:scale-105 transition-transform shadow-xl"
            onClick={handlePlayAll}
            disabled={tracks.length === 0}
          >
            {isPlaylistPlaying ? (
              <Pause className="h-6 w-6 text-black fill-black" />
            ) : (
              <Play className="h-6 w-6 text-black fill-black ml-1" />
            )}
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-[#B3B3B3]">
            <Heart className="h-8 w-8" />
          </Button>
          <Button variant="ghost" size="icon" className="text-[#B3B3B3]">
            <MoreHorizontal className="h-6 w-6" />
          </Button>

          {/* Search within playlist */}
          {tracks.length > 5 && (
            <div className="ml-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B3B3B3]" />
              <Input
                type="text"
                placeholder="Search in playlist"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#282828] border-none text-white w-48 focus:w-64 transition-all"
              />
            </div>
          )}
        </div>

        {/* Track List */}
        {tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <Music className="h-16 w-16 text-[#B3B3B3] mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              Let's find something for your playlist
            </h3>
            <Button
              onClick={() => navigate('/xvibe/search')}
              className="bg-white text-black hover:bg-white/90 rounded-full font-semibold mt-4"
            >
              Find songs
            </Button>
          </div>
        ) : (
          <div className="px-6">
            <TrackRowHeader showAlbum />
            <div className="space-y-1">
              {filteredTracks.map((track, i) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={i + 1}
                  queue={tracks}
                />
              ))}
            </div>
          </div>
        )}

        {/* Bottom Padding */}
        <div className="h-8" />
      </div>
    </XVibeLayout>
  );
}
