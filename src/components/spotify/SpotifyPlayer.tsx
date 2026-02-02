import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSpotify } from '@/hooks/useSpotify';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Music, 
  ExternalLink, 
  Play, 
  History, 
  Heart, 
  Loader2,
  Headphones,
  Link2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album?: {
    name: string;
    images: { url: string }[];
  };
  external_urls?: {
    spotify: string;
  };
  duration_ms: number;
}

interface RecentlyPlayed {
  track: SpotifyTrack;
  played_at: string;
}

export function SpotifyPlayer() {
  const { user } = useAuth();
  const { isConnected, loading: spotifyLoading, openInSpotify } = useSpotify();
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayed[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<SpotifyTrack | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected) {
      fetchSpotifyData();
      // Poll for currently playing every 30 seconds
      const interval = setInterval(fetchCurrentlyPlaying, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const fetchSpotifyData = async () => {
    setLoading(true);
    await Promise.all([
      fetchRecentlyPlayed(),
      fetchCurrentlyPlaying()
    ]);
    setLoading(false);
  };

  const fetchRecentlyPlayed = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('spotify-api', {
        body: { action: 'getRecentlyPlayed' },
      });

      if (error) throw error;
      if (data?.items) {
        setRecentlyPlayed(data.items.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching recently played:', error);
    }
  };

  const fetchCurrentlyPlaying = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('spotify-api', {
        body: { action: 'getCurrentlyPlaying' },
      });

      if (error) throw error;
      if (data?.item) {
        setCurrentlyPlaying(data.item);
      } else {
        setCurrentlyPlaying(null);
      }
    } catch (error) {
      console.error('Error fetching currently playing:', error);
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleConnect = () => {
    window.location.href = '/niranx/settings';
    toast({
      title: 'Connect Spotify',
      description: 'Go to Settings to connect your Spotify account',
    });
  };

  if (spotifyLoading) {
    return (
      <Card className="glass-card border-green-500/20">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-green-500" />
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card className="glass-card border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-green-500" />
            Spotify
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Headphones className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground mb-4">Connect your Spotify account to see your listening activity</p>
          <Button onClick={handleConnect} className="bg-green-600 hover:bg-green-700">
            <Link2 className="h-4 w-4 mr-2" />
            Connect Spotify
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-green-500/20 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 text-green-500" />
            Spotify
          </div>
          <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-500">
            Connected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Currently Playing */}
        {currentlyPlaying && (
          <div className="p-4 bg-gradient-to-r from-green-500/10 to-transparent border-b border-border/50">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Now Playing
            </p>
            <div className="flex items-center gap-3">
              {currentlyPlaying.album?.images[0] && (
                <img
                  src={currentlyPlaying.album.images[0].url}
                  alt={currentlyPlaying.album.name}
                  className="w-12 h-12 rounded-md"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{currentlyPlaying.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {currentlyPlaying.artists.map(a => a.name).join(', ')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openInSpotify(currentlyPlaying.id)}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Recently Played */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              Recently Played
            </p>
            <Button variant="ghost" size="sm" onClick={fetchSpotifyData} disabled={loading}>
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Refresh'}
            </Button>
          </div>

          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {recentlyPlayed.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No recently played tracks
                </p>
              ) : (
                recentlyPlayed.map((item, index) => (
                  <div
                    key={`${item.track.id}-${index}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
                    onClick={() => openInSpotify(item.track.id)}
                  >
                    {item.track.album?.images[2] && (
                      <img
                        src={item.track.album.images[2].url}
                        alt={item.track.album.name}
                        className="w-10 h-10 rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-green-500 transition-colors">
                        {item.track.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.track.artists.map(a => a.name).join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(item.track.duration_ms)}
                      </span>
                      <Play className="h-4 w-4 opacity-0 group-hover:opacity-100 text-green-500 transition-opacity" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
