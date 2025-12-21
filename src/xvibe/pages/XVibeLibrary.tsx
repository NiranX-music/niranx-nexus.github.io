import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Music, Heart, Disc, Users, Download, Grid, List, Plus } from 'lucide-react';
import { XVibeLayout } from '../components/layout/XVibeLayout';
import { TrackRow, TrackRowHeader } from '../components/ui/TrackRow';
import { PlaylistCard } from '../components/ui/PlaylistCard';
import { AlbumCard } from '../components/ui/AlbumCard';
import { ArtistCard } from '../components/ui/ArtistCard';
import { useXVibeLikes, useXVibePlaylists, useXVibeSavedAlbums, useXVibeFollowedArtists } from '../hooks/useXVibeLibrary';
import { useXVibePlayer } from '../contexts/XVibePlayerContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function XVibeLibrary() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'playlists';
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { playlists, loading: playlistsLoading } = useXVibePlaylists();
  const { likedTracks, loading: likesLoading } = useXVibeLikes();
  const { albums: savedAlbums, loading: albumsLoading } = useXVibeSavedAlbums();
  const { artists: followedArtists, loading: artistsLoading } = useXVibeFollowedArtists();
  const { playTrack } = useXVibePlayer();

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  return (
    <XVibeLayout>
      <div className="min-h-full bg-[#121212] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Your Library</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8', viewMode === 'list' && 'bg-[#282828]')}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4 text-[#B3B3B3]" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8', viewMode === 'grid' && 'bg-[#282828]')}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4 text-[#B3B3B3]" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setTab}>
          <TabsList className="bg-transparent border-b border-[#282828] w-full justify-start rounded-none h-auto p-0 mb-6">
            {[
              { value: 'playlists', label: 'Playlists', icon: Music },
              { value: 'liked', label: 'Liked Songs', icon: Heart },
              { value: 'albums', label: 'Albums', icon: Disc },
              { value: 'artists', label: 'Artists', icon: Users },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 rounded-full text-sm font-medium mr-2',
                  'data-[state=active]:bg-white data-[state=active]:text-black',
                  'data-[state=inactive]:bg-[#232323] data-[state=inactive]:text-white'
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Playlists */}
          <TabsContent value="playlists" className="mt-0">
            {playlistsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array(6).fill(0).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg bg-[#282828]" />
                ))}
              </div>
            ) : playlists.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-full bg-[#282828] flex items-center justify-center mb-4">
                  <Music className="h-8 w-8 text-[#B3B3B3]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Create your first playlist</h3>
                <p className="text-[#B3B3B3] mb-6">It's easy, we'll help you</p>
                <Button className="bg-white text-black hover:bg-white/90 rounded-full font-semibold">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Playlist
                </Button>
              </div>
            ) : (
              <div className={cn(
                viewMode === 'grid' 
                  ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'
                  : 'space-y-2'
              )}>
                {playlists.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Liked Songs */}
          <TabsContent value="liked" className="mt-0">
            {likesLoading ? (
              <div className="space-y-2">
                {Array(10).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-md bg-[#282828]" />
                ))}
              </div>
            ) : likedTracks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#450af5] to-[#8e8ee5] flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Songs you like will appear here</h3>
                <p className="text-[#B3B3B3]">Save songs by tapping the heart icon</p>
              </div>
            ) : (
              <div>
                {/* Liked Songs Header */}
                <div className="flex items-center gap-6 mb-6 p-6 rounded-lg bg-gradient-to-b from-[#5038a0] to-transparent">
                  <div className="w-24 h-24 rounded-md bg-gradient-to-br from-[#450af5] to-[#8e8ee5] flex items-center justify-center shadow-xl">
                    <Heart className="h-10 w-10 text-white fill-white" />
                  </div>
                  <div>
                    <p className="text-sm text-white/80 uppercase">Playlist</p>
                    <h2 className="text-4xl font-bold text-white mb-2">Liked Songs</h2>
                    <p className="text-sm text-white/80">{likedTracks.length} songs</p>
                  </div>
                </div>

                <TrackRowHeader showAlbum />
                <div className="space-y-1">
                  {likedTracks.map((track, i) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={i + 1}
                      queue={likedTracks}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Saved Albums */}
          <TabsContent value="albums" className="mt-0">
            {albumsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array(6).fill(0).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg bg-[#282828]" />
                ))}
              </div>
            ) : savedAlbums.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-full bg-[#282828] flex items-center justify-center mb-4">
                  <Disc className="h-8 w-8 text-[#B3B3B3]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Follow your first album</h3>
                <p className="text-[#B3B3B3]">Save albums by tapping the heart icon</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {savedAlbums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Followed Artists */}
          <TabsContent value="artists" className="mt-0">
            {artistsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array(6).fill(0).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-full bg-[#282828]" />
                ))}
              </div>
            ) : followedArtists.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-full bg-[#282828] flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-[#B3B3B3]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Follow your first artist</h3>
                <p className="text-[#B3B3B3]">Follow artists you like by tapping the follow button</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {followedArtists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Bottom Padding */}
        <div className="h-8" />
      </div>
    </XVibeLayout>
  );
}
