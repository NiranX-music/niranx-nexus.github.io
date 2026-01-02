import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, TrendingUp, Sparkles, Radio } from 'lucide-react';
import { motion } from 'framer-motion';
import { XVibeLayout } from '../components/layout/XVibeLayout';
import { TrackCard } from '../components/ui/TrackCard';
import { ArtistCard } from '../components/ui/ArtistCard';
import { AlbumCard } from '../components/ui/AlbumCard';
import { useXVibeTracks, useXVibeArtists, useXVibeAlbums, useXVibeListeningHistory } from '../hooks/useXVibeTracks';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

function TrackRowSection({ title, icon: Icon, children, loading }: { 
  title: string; 
  icon?: any; 
  children: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4 px-6">
        {Icon && <Icon className="h-5 w-5 text-[#1DB954]" />}
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      <ScrollArea className="w-full">
        <div className="flex gap-4 px-6 pb-4">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-40 h-56 rounded-lg bg-[#282828]" />
            ))
          ) : (
            children
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}

export default function XVibeHome() {
  const navigate = useNavigate();
  const { tracks, loading: tracksLoading } = useXVibeTracks();
  const { artists, loading: artistsLoading } = useXVibeArtists();
  const { albums, loading: albumsLoading } = useXVibeAlbums();
  const { history, loading: historyLoading } = useXVibeListeningHistory();
  const { playTrack } = useMusicPlayer();
  const isDJMode = false; // DJ Mode archived
  const toggleDJMode = () => {}; // DJ Mode archived

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Group tracks by genre/mood for "Made for You" sections
  const trendingTracks = tracks.slice(0, 10);
  const newReleases = [...tracks].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 10);

  return (
    <XVibeLayout>
      <div className="min-h-full bg-gradient-to-b from-[#1e3a5f] to-[#121212]">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-gradient-to-b from-[#1e3a5f]/90 to-transparent backdrop-blur-sm p-6 pb-0">
          <h1 className="text-3xl font-bold text-white">{getGreeting()}</h1>
        </header>

        {/* Quick Access Grid */}
        <section className="px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {/* DJ Mode Card */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={toggleDJMode}
              className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                isDJMode 
                  ? 'bg-[#1DB954] text-black' 
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <div className={`w-12 h-12 rounded flex items-center justify-center ${
                isDJMode ? 'bg-black/20' : 'bg-gradient-to-br from-[#1DB954] to-[#1ed760]'
              }`}>
                <Radio className="h-6 w-6" />
              </div>
              <span className="font-semibold">AI DJ Mode</span>
            </motion.button>

            {/* Recent History Quick Cards */}
            {history.slice(0, 5).map((track) => (
              <motion.button
                key={track.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => playTrack({ id: track.id, name: track.title, url: track.audio_url, artist: track.artist?.name })}
                className="flex items-center gap-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                  {track.cover_url ? (
                    <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                      <span>🎵</span>
                    </div>
                  )}
                </div>
                <span className="font-semibold text-white truncate text-sm">
                  {track.title}
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Recently Played */}
        {history.length > 0 && (
          <TrackRowSection title="Recently Played" icon={Clock} loading={historyLoading}>
            {history.slice(0, 10).map((track) => (
              <TrackCard key={track.id} track={track} queue={history} />
            ))}
          </TrackRowSection>
        )}

        {/* Trending Now */}
        <TrackRowSection title="Trending Now" icon={TrendingUp} loading={tracksLoading}>
          {trendingTracks.map((track) => (
            <TrackCard key={track.id} track={track} queue={trendingTracks} />
          ))}
        </TrackRowSection>

        {/* Made for You */}
        <TrackRowSection title="Made for You" icon={Sparkles} loading={tracksLoading}>
          {tracks.slice(5, 15).map((track) => (
            <TrackCard key={track.id} track={track} queue={tracks} />
          ))}
        </TrackRowSection>

        {/* New Releases */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4 px-6">
            <h2 className="text-xl font-bold text-white">New Releases</h2>
            <Button
              variant="ghost"
              className="text-[#B3B3B3] hover:text-white text-sm"
              onClick={() => navigate('/xvibe/search?filter=new')}
            >
              Show all
            </Button>
          </div>
          <ScrollArea className="w-full">
            <div className="flex gap-4 px-6 pb-4">
              {albumsLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <Skeleton key={i} className="w-40 h-56 rounded-lg bg-[#282828]" />
                ))
              ) : (
                albums.slice(0, 10).map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>

        {/* Popular Artists */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4 px-6">
            <h2 className="text-xl font-bold text-white">Popular Artists</h2>
            <Button
              variant="ghost"
              className="text-[#B3B3B3] hover:text-white text-sm"
              onClick={() => navigate('/xvibe/search?filter=artists')}
            >
              Show all
            </Button>
          </div>
          <ScrollArea className="w-full">
            <div className="flex gap-4 px-6 pb-4">
              {artistsLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <Skeleton key={i} className="w-40 h-52 rounded-lg bg-[#282828]" />
                ))
              ) : (
                artists.slice(0, 10).map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>

        {/* Bottom Padding */}
        <div className="h-8" />
      </div>
    </XVibeLayout>
  );
}
