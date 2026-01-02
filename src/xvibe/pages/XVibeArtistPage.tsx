import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Shuffle, CheckCircle, MoreHorizontal, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { XVibeLayout } from '../components/layout/XVibeLayout';
import { TrackRow, TrackRowHeader } from '../components/ui/TrackRow';
import { AlbumCard } from '../components/ui/AlbumCard';
import { ArtistCard } from '../components/ui/ArtistCard';
import { XVibeArtist, XVibeTrack, XVibeAlbum } from '../types';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useXVibeFollowedArtists } from '../hooks/useXVibeLibrary';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function XVibeArtistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [artist, setArtist] = useState<XVibeArtist | null>(null);
  const [topTracks, setTopTracks] = useState<XVibeTrack[]>([]);
  const [albums, setAlbums] = useState<XVibeAlbum[]>([]);
  const [relatedArtists, setRelatedArtists] = useState<XVibeArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllTracks, setShowAllTracks] = useState(false);

  const { currentTrack, isPlaying, playTrack, togglePlayPause } = useMusicPlayer();
  const { isFollowing, toggleFollow } = useXVibeFollowedArtists();

  useEffect(() => {
    if (id) fetchArtistData();
  }, [id]);

  const fetchArtistData = async () => {
    if (!id) return;
    setLoading(true);

    try {
      // Fetch artist
      const { data: artistData } = await supabase
        .from('xvibe_artists')
        .select('*')
        .eq('id', id)
        .single();

      if (artistData) {
        setArtist(artistData as XVibeArtist);

        // Fetch top tracks
        const { data: tracksData } = await supabase
          .from('xvibe_tracks')
          .select('*, artist:xvibe_artists(*), album:xvibe_albums(*)')
          .eq('artist_id', id)
          .eq('status', 'live')
          .order('play_count', { ascending: false })
          .limit(20);

        setTopTracks((tracksData || []) as XVibeTrack[]);

        // Fetch albums
        const { data: albumsData } = await supabase
          .from('xvibe_albums')
          .select('*, artist:xvibe_artists(*)')
          .eq('artist_id', id)
          .eq('status', 'live')
          .order('release_date', { ascending: false });

        setAlbums((albumsData || []) as XVibeAlbum[]);

        // Fetch related artists (same genre or random)
        const { data: relatedData } = await supabase
          .from('xvibe_artists')
          .select('*')
          .neq('id', id)
          .eq('status', 'approved')
          .limit(6);

        setRelatedArtists((relatedData || []) as XVibeArtist[]);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatListeners = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handlePlayAll = () => {
    if (topTracks.length > 0) {
      const isArtistPlaying = topTracks.some(t => t.id === currentTrack?.id) && isPlaying;
      if (isArtistPlaying) {
        togglePlayPause();
      } else {
        playTrack({ id: topTracks[0].id, name: topTracks[0].title, url: topTracks[0].audio_url, artist: topTracks[0].artist?.name });
      }
    }
  };

  const isArtistPlaying = topTracks.some(t => t.id === currentTrack?.id) && isPlaying;
  const displayedTracks = showAllTracks ? topTracks : topTracks.slice(0, 5);

  if (loading) {
    return (
      <XVibeLayout>
        <div className="min-h-full bg-[#121212]">
          <Skeleton className="h-80 bg-[#282828]" />
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-40 bg-[#282828]" />
            <Skeleton className="h-6 w-60 bg-[#282828]" />
          </div>
        </div>
      </XVibeLayout>
    );
  }

  if (!artist) {
    return (
      <XVibeLayout>
        <div className="min-h-full bg-[#121212] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Artist not found</h2>
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
          className="relative h-80 bg-gradient-to-b from-[#535353] to-[#121212] overflow-hidden"
          style={{
            backgroundImage: artist.banner_url ? `url(${artist.banner_url})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end gap-6">
            {/* Artist Avatar */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-48 h-48 rounded-full overflow-hidden shadow-2xl flex-shrink-0"
            >
              {artist.avatar_url ? (
                <img src={artist.avatar_url} alt={artist.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                  <span className="text-6xl">👤</span>
                </div>
              )}
            </motion.div>

            {/* Artist Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {artist.is_verified && (
                  <div className="flex items-center gap-1 text-[#3D91F4]">
                    <CheckCircle className="h-5 w-5 fill-current" />
                    <span className="text-xs font-semibold">Verified Artist</span>
                  </div>
                )}
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 truncate">
                {artist.name}
              </h1>
              <p className="text-white/80">
                {formatListeners(artist.monthly_listeners)} monthly listeners
              </p>
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
            {isArtistPlaying ? (
              <Pause className="h-6 w-6 text-black fill-black" />
            ) : (
              <Play className="h-6 w-6 text-black fill-black ml-1" />
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => toggleFollow(artist.id)}
            className={cn(
              'rounded-full font-semibold px-6',
              isFollowing(artist.id)
                ? 'border-white text-white'
                : 'border-[#727272] text-white hover:border-white'
            )}
          >
            {isFollowing(artist.id) ? 'Following' : 'Follow'}
          </Button>
          <Button variant="ghost" size="icon" className="text-[#B3B3B3]">
            <MoreHorizontal className="h-6 w-6" />
          </Button>
        </div>

        {/* Popular Tracks */}
        {topTracks.length > 0 && (
          <section className="px-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Popular</h2>
            <div className="space-y-1">
              {displayedTracks.map((track, i) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={i + 1}
                  queue={topTracks}
                  showAlbum={false}
                />
              ))}
            </div>
            {topTracks.length > 5 && (
              <Button
                variant="ghost"
                className="mt-4 text-[#B3B3B3] hover:text-white font-semibold"
                onClick={() => setShowAllTracks(!showAllTracks)}
              >
                {showAllTracks ? 'Show less' : 'See more'}
              </Button>
            )}
          </section>
        )}

        {/* Discography */}
        {albums.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between px-6 mb-4">
              <h2 className="text-xl font-bold text-white">Discography</h2>
              <Button variant="ghost" className="text-[#B3B3B3] hover:text-white text-sm">
                Show all
              </Button>
            </div>
            <ScrollArea className="w-full">
              <div className="flex gap-4 px-6 pb-4">
                {albums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>
        )}

        {/* About */}
        {artist.bio && (
          <section className="px-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">About</h2>
            <div className="bg-[#181818] rounded-lg p-6">
              <p className="text-[#B3B3B3] whitespace-pre-wrap">{artist.bio}</p>
            </div>
          </section>
        )}

        {/* Related Artists */}
        {relatedArtists.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white px-6 mb-4">Fans also like</h2>
            <ScrollArea className="w-full">
              <div className="flex gap-4 px-6 pb-4">
                {relatedArtists.map((a) => (
                  <ArtistCard key={a.id} artist={a} />
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
