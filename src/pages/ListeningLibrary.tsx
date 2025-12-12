import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Headphones, Play, Pause, Search, Music, Clock, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface ListeningHistoryItem {
  id: string;
  track_id: string;
  played_at: string;
  duration_played: number;
  tracks: {
    title: string;
    artist: string;
    album: string | null;
    audio_url: string;
    cover_url: string | null;
    duration: number;
  } | null;
}

const ListeningLibrary = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [history, setHistory] = useState<ListeningHistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ListeningHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (user) {
      fetchListeningHistory();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = history.filter(item => 
        item.tracks?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tracks?.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tracks?.album?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredHistory(filtered);
    } else {
      setFilteredHistory(history);
    }
  }, [searchQuery, history]);

  const fetchListeningHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('listening_history')
        .select(`
          id,
          track_id,
          played_at,
          duration_played,
          tracks:track_id (
            title,
            artist,
            album,
            audio_url,
            cover_url,
            duration
          )
        `)
        .eq('user_id', user?.id)
        .order('played_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setHistory(data as ListeningHistoryItem[]);
      setFilteredHistory(data as ListeningHistoryItem[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load listening history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (trackId: string, audioUrl: string) => {
    if (currentlyPlaying === trackId) {
      // Pause if already playing
      if (audioElement) {
        audioElement.pause();
        setCurrentlyPlaying(null);
      }
    } else {
      // Stop previous audio if any
      if (audioElement) {
        audioElement.pause();
      }

      // Create and play new audio
      const audio = new Audio(audioUrl);
      audio.play();
      setAudioElement(audio);
      setCurrentlyPlaying(trackId);

      audio.onended = () => {
        setCurrentlyPlaying(null);
      };
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
            <Headphones className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Xvibe Listening Library</h1>
            <p className="text-muted-foreground">Browse and replay your Xvibe music history</p>
          </div>
        </div>

        {/* Search */}
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by title, artist, or album..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Music className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{history.length}</p>
                  <p className="text-sm text-muted-foreground">Total Plays</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Headphones className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold">
                    {new Set(history.map(h => h.track_id)).size}
                  </p>
                  <p className="text-sm text-muted-foreground">Unique Tracks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-success" />
                <div>
                  <p className="text-2xl font-bold">
                    {Math.floor(history.reduce((acc, h) => acc + (h.duration_played || 0), 0) / 60)}
                  </p>
                  <p className="text-sm text-muted-foreground">Minutes Listened</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History List */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Listening History</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <Music className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No tracks found matching your search' : 'No listening history yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    {/* Album Art */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex-shrink-0">
                      {item.tracks?.cover_url ? (
                        <img
                          src={item.tracks.cover_url}
                          alt={item.tracks.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{item.tracks?.title || 'Unknown Track'}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {item.tracks?.artist || 'Unknown Artist'}
                        {item.tracks?.album && ` • ${item.tracks.album}`}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(item.played_at), { addSuffix: true })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(item.tracks?.duration || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Play Button */}
                    <Button
                      size="icon"
                      variant={currentlyPlaying === item.track_id ? "default" : "outline"}
                      onClick={() => handlePlay(item.track_id, item.tracks?.audio_url || '')}
                      disabled={!item.tracks?.audio_url}
                    >
                      {currentlyPlaying === item.track_id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ListeningLibrary;
