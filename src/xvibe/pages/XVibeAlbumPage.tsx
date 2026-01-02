import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, Pause, Heart, MoreHorizontal, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { XVibeLayout } from '../components/layout/XVibeLayout';
import { TrackRow, TrackRowHeader } from '../components/ui/TrackRow';
import { AlbumCard } from '../components/ui/AlbumCard';
import { XVibeAlbum, XVibeTrack } from '../types';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useXVibeSavedAlbums } from '../hooks/useXVibeLibrary';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function XVibeAlbumPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [album, setAlbum] = useState<XVibeAlbum | null>(null);
  const [tracks, setTracks] = useState<XVibeTrack[]>([]);
  const [moreByArtist, setMoreByArtist] = useState<XVibeAlbum[]>([]);
  const [loading, setLoading] = useState(true);

  const { currentTrack, isPlaying, playTrack, togglePlayPause } = useMusicPlayer();
  const { isSaved, toggleSave } = useXVibeSavedAlbums();

  useEffect(() => {
    if (id) fetchAlbumData();
  }, [id]);

  const fetchAlbumData = async () => {
    if (!id) return;
    setLoading(true);

    try {
      // Fetch album
      const { data: albumData } = await supabase
        .from('xvibe_albums')
        .select('*, artist:xvibe_artists(*)')
        .eq('id', id)
        .single();

      if (albumData) {
        setAlbum(albumData as XVibeAlbum);

        // Fetch tracks
        const { data: tracksData } = await supabase
          .from('xvibe_tracks')
          .select('*, artist:xvibe_artists(*)')
          .eq('album_id', id)
          .eq('status', 'live')
          .order('track_number', { ascending: true });

        setTracks((tracksData || []) as XVibeTrack[]);

        // Fetch more albums by artist
        if (albumData.artist_id) {
          const { data: moreData } = await supabase
            .from('xvibe_albums')
            .select('*, artist:xvibe_artists(*)')
            .eq('artist_id', albumData.artist_id)
            .eq('status', 'live')
            .neq('id', id)
            .limit(6);

          setMoreByArtist((moreData || []) as XVibeAlbum[]);
        }
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
      const isAlbumPlaying = tracks.some(t => t.id === currentTrack?.id) && isPlaying;
      if (isAlbumPlaying) {
        togglePlayPause();
      } else {
        playTrack({ id: tracks[0].id, name: tracks[0].title, url: tracks[0].audio_url, artist: tracks[0].artist?.name });
      }
    }
  };

  const isAlbumPlaying = tracks.some(t => t.id === currentTrack?.id) && isPlaying;
  const totalDuration = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  // Generate gradient from album cover
  const gradientColor = '#535353';

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

  if (!album) {
    return (
      <XVibeLayout>
        <div className="min-h-full bg-[#121212] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Album not found</h2>
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
        <div 
          className="relative min-h-[340px] p-6 flex items-end gap-6"
          style={{
            background: `linear-gradient(to bottom, ${gradientColor}, ${gradientColor}80, #121212)`,
          }}
        >
          {/* Album Cover */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-56 h-56 rounded-md overflow-hidden shadow-2xl flex-shrink-0"
          >
            {album.cover_url ? (
              <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                <span className="text-6xl">💿</span>
              </div>
            )}
          </motion.div>

          {/* Album Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white/80 font-medium uppercase mb-2">
              {album.album_type}
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 truncate">
              {album.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-white/80">
              {album.artist && (
                <>
                  {album.artist.avatar_url && (
                    <img 
                      src={album.artist.avatar_url} 
                      alt="" 
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <Link 
                    to={`/xvibe/artist/${album.artist.id}`}
                    className="font-semibold text-white hover:underline"
                  >
                    {album.artist.name}
                  </Link>
                  <span>•</span>
                </>
              )}
              {album.release_date && (
                <>
                  <span>{new Date(album.release_date).getFullYear()}</span>
                  <span>•</span>
                </>
              )}
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
          >
            {isAlbumPlaying ? (
              <Pause className="h-6 w-6 text-black fill-black" />
            ) : (
              <Play className="h-6 w-6 text-black fill-black ml-1" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => toggleSave(album.id)}
          >
            <Heart
              className={cn(
                'h-8 w-8',
                isSaved(album.id) ? 'fill-[#1DB954] text-[#1DB954]' : 'text-[#B3B3B3]'
              )}
            />
          </Button>
          <Button variant="ghost" size="icon" className="text-[#B3B3B3]">
            <MoreHorizontal className="h-6 w-6" />
          </Button>
        </div>

        {/* Track List */}
        <div className="px-6">
          <TrackRowHeader showAlbum={false} />
          <div className="space-y-1">
            {tracks.map((track, i) => (
              <TrackRow
                key={track.id}
                track={track}
                index={i + 1}
                queue={tracks}
                showAlbum={false}
                showCover={false}
              />
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="px-6 py-8 text-xs text-[#B3B3B3]">
          {album.release_date && (
            <p className="mb-1">{new Date(album.release_date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          )}
          <p>© {new Date(album.release_date || album.created_at).getFullYear()} {album.artist?.name}</p>
        </div>

        {/* More by Artist */}
        {moreByArtist.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between px-6 mb-4">
              <h2 className="text-xl font-bold text-white">
                More by {album.artist?.name}
              </h2>
              <Button 
                variant="ghost" 
                className="text-[#B3B3B3] hover:text-white text-sm"
                onClick={() => navigate(`/xvibe/artist/${album.artist?.id}`)}
              >
                See discography
              </Button>
            </div>
            <ScrollArea className="w-full">
              <div className="flex gap-4 px-6 pb-4">
                {moreByArtist.map((a) => (
                  <AlbumCard key={a.id} album={a} />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>
        )}

        {/* Bottom Padding */}
        <div className="h-8" />
      </div>
    </XVibeLayout>
  );
}
