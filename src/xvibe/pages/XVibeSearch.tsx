import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { XVibeLayout } from '../components/layout/XVibeLayout';
import { TrackCard } from '../components/ui/TrackCard';
import { ArtistCard } from '../components/ui/ArtistCard';
import { AlbumCard } from '../components/ui/AlbumCard';
import { TrackRow, TrackRowHeader } from '../components/ui/TrackRow';
import { useXVibeSearch, useXVibeTracks, useXVibeArtists, useXVibeAlbums } from '../hooks/useXVibeTracks';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const BROWSE_CATEGORIES = [
  { id: 'pop', name: 'Pop', color: '#E13300' },
  { id: 'hiphop', name: 'Hip-Hop', color: '#BA5D07' },
  { id: 'rock', name: 'Rock', color: '#8D67AB' },
  { id: 'rnb', name: 'R&B', color: '#DC148C' },
  { id: 'electronic', name: 'Electronic', color: '#056952' },
  { id: 'jazz', name: 'Jazz', color: '#503750' },
  { id: 'classical', name: 'Classical', color: '#84BD00' },
  { id: 'kpop', name: 'K-Pop', color: '#148A08' },
  { id: 'latin', name: 'Latin', color: '#E1118B' },
  { id: 'indie', name: 'Indie', color: '#477D95' },
  { id: 'metal', name: 'Metal', color: '#1E3264' },
  { id: 'country', name: 'Country', color: '#A56752' },
];

export default function XVibeSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState('all');
  
  const { results, loading: searchLoading } = useXVibeSearch(query);
  const { tracks: allTracks } = useXVibeTracks();
  const { artists: allArtists } = useXVibeArtists();
  const { albums: allAlbums } = useXVibeAlbums();

  const hasResults = results.tracks.length > 0 || results.artists.length > 0 || results.albums.length > 0;

  return (
    <XVibeLayout>
      <div className="min-h-full bg-[#121212]">
        {/* Search Header */}
        <div className="sticky top-0 z-20 bg-[#121212] p-6 pb-4">
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#B3B3B3]" />
            <Input
              type="text"
              placeholder="What do you want to listen to?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-10 py-6 bg-white text-black placeholder:text-[#757575] rounded-full border-none text-base"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#757575] hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {query.length >= 2 ? (
          /* Search Results */
          <div className="px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-transparent border-b border-[#282828] w-full justify-start rounded-none h-auto p-0 mb-6">
                {['all', 'songs', 'artists', 'albums'].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className={cn(
                      'px-4 py-3 rounded-full text-sm font-medium capitalize',
                      'data-[state=active]:bg-white data-[state=active]:text-black',
                      'data-[state=inactive]:bg-[#232323] data-[state=inactive]:text-white'
                    )}
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="mt-0">
                {!hasResults && !searchLoading ? (
                  <div className="text-center py-20">
                    <p className="text-xl font-bold text-white mb-2">
                      No results found for "{query}"
                    </p>
                    <p className="text-[#B3B3B3]">
                      Check your spelling or try different keywords
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Top Result + Songs */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      {/* Top Result */}
                      {results.tracks[0] && (
                        <div>
                          <h3 className="text-xl font-bold text-white mb-4">Top result</h3>
                          <motion.div
                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                            className="bg-[#181818] rounded-lg p-5 cursor-pointer"
                          >
                            <div className="w-24 h-24 rounded overflow-hidden mb-4 shadow-lg">
                              {results.tracks[0].cover_url ? (
                                <img src={results.tracks[0].cover_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                                  <span className="text-3xl">🎵</span>
                                </div>
                              )}
                            </div>
                            <h4 className="text-3xl font-bold text-white mb-1">
                              {results.tracks[0].title}
                            </h4>
                            <p className="text-sm text-[#B3B3B3]">
                              Song • {results.tracks[0].artist?.name}
                            </p>
                          </motion.div>
                        </div>
                      )}

                      {/* Songs */}
                      {results.tracks.length > 0 && (
                        <div>
                          <h3 className="text-xl font-bold text-white mb-4">Songs</h3>
                          <div className="space-y-1">
                            {results.tracks.slice(0, 4).map((track, i) => (
                              <TrackRow
                                key={track.id}
                                track={track}
                                index={i + 1}
                                queue={results.tracks}
                                showAlbum={false}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Artists */}
                    {results.artists.length > 0 && (
                      <section className="mb-8">
                        <h3 className="text-xl font-bold text-white mb-4">Artists</h3>
                        <ScrollArea className="w-full">
                          <div className="flex gap-4 pb-4">
                            {results.artists.map((artist) => (
                              <ArtistCard key={artist.id} artist={artist} />
                            ))}
                          </div>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                      </section>
                    )}

                    {/* Albums */}
                    {results.albums.length > 0 && (
                      <section className="mb-8">
                        <h3 className="text-xl font-bold text-white mb-4">Albums</h3>
                        <ScrollArea className="w-full">
                          <div className="flex gap-4 pb-4">
                            {results.albums.map((album) => (
                              <AlbumCard key={album.id} album={album} />
                            ))}
                          </div>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                      </section>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="songs" className="mt-0">
                <TrackRowHeader showAlbum />
                <div className="space-y-1">
                  {results.tracks.map((track, i) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={i + 1}
                      queue={results.tracks}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="artists" className="mt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {results.artists.map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="albums" className="mt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {results.albums.map((album) => (
                    <AlbumCard key={album.id} album={album} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          /* Browse Categories */
          <div className="px-6">
            <h2 className="text-xl font-bold text-white mb-4">Browse all</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {BROWSE_CATEGORIES.map((category) => (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setQuery(category.name)}
                  className="relative aspect-square rounded-lg overflow-hidden"
                  style={{ backgroundColor: category.color }}
                >
                  <span className="absolute top-4 left-4 text-xl font-bold text-white">
                    {category.name}
                  </span>
                </motion.button>
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
