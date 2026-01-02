import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Music, Play, User, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { GlassCard } from '@/components/niranx/GlassCard';
import { NiranXNavigation } from '@/components/niranx/NiranXNavigation';
import { NiranXFooter } from '@/components/niranx/NiranXFooter';

interface Artist {
  id: string;
  name: string;
  image_url: string | null;
  spotify_url: string | null;
}

interface Song {
  id: string;
  title: string;
  artist_id: string | null;
  spotify_url: string | null;
  artist?: Artist;
}

export default function Songs() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [artistsRes, songsRes] = await Promise.all([
        supabase.from('niranx_artists').select('*').order('display_order'),
        supabase.from('niranx_songs').select('*').order('display_order'),
      ]);

      if (artistsRes.data) setArtists(artistsRes.data);
      if (songsRes.data && artistsRes.data) {
        // Map songs with artist info
        const songsWithArtists = songsRes.data.map((song) => ({
          ...song,
          artist: artistsRes.data.find((a) => a.id === song.artist_id),
        }));
        setSongs(songsWithArtists);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NiranXNavigation />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="container mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Music className="w-3 h-3 mr-1" /> Music
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold font-[Orbitron] mb-4">
              Songs & <span className="text-primary">Artists</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover the music of NiranX Universe. Stream on your favorite platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Artists Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold font-[Orbitron] mb-2">
              <User className="w-8 h-8 inline-block mr-2 text-primary" />
              Artists
            </h2>
            <p className="text-muted-foreground">Featured artists in the universe</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artists.map((artist, i) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="group">
                  <div className="p-6 text-center">
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-muted/30 mb-4">
                      {artist.image_url ? (
                        <img
                          src={artist.image_url}
                          alt={artist.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-12 h-12 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{artist.name}</h3>
                    {artist.spotify_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(artist.spotify_url!, '_blank')}
                        className="group/btn"
                      >
                        <ExternalLink className="w-4 h-4 mr-1 group-hover/btn:text-primary" />
                        Spotify
                      </Button>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {artists.length === 0 && (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No artists yet. Check back later!</p>
            </div>
          )}
        </div>
      </section>

      {/* Songs Section */}
      <section className="py-16 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold font-[Orbitron] mb-2">
              <Music className="w-8 h-8 inline-block mr-2 text-accent" />
              Songs
            </h2>
            <p className="text-muted-foreground">Latest tracks and releases</p>
          </motion.div>

          <div className="space-y-4">
            {songs.map((song, i) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard className="group">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Music className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{song.title}</h3>
                        {song.artist && (
                          <p className="text-sm text-muted-foreground">{song.artist.name}</p>
                        )}
                      </div>
                    </div>
                    {song.spotify_url && (
                      <Button
                        size="sm"
                        onClick={() => window.open(song.spotify_url!, '_blank')}
                        className="bg-gradient-to-r from-primary to-accent"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Play
                      </Button>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {songs.length === 0 && (
            <div className="text-center py-12">
              <Music className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No songs yet. Check back later!</p>
            </div>
          )}
        </div>
      </section>

      <NiranXFooter />
    </div>
  );
}
