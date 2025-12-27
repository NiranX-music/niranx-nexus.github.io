import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Radio, 
  Play, 
  Pause, 
  Search, 
  Volume2, 
  VolumeX,
  History,
  Heart,
  Globe,
  Music,
  Loader2,
  X
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface Genre {
  id: string;
  name: string;
  count?: number;
}

interface Station {
  id: string;
  name: string;
  url: string;
  logo?: string;
  genre?: string;
  country?: string;
  votes?: number;
}

interface ListeningHistory {
  id: string;
  station_id: string;
  station_name: string;
  station_url: string;
  station_logo: string;
  genre: string;
  listened_at: string;
}

export default function FerqX() {
  const { user } = useAuth();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [history, setHistory] = useState<ListeningHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playStartTime = useRef<number | null>(null);

  useEffect(() => {
    fetchGenres();
    if (user) {
      fetchListeningHistory();
    }
  }, [user]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const fetchGenres = async () => {
    try {
      setLoadingGenres(true);
      const { data, error } = await supabase.functions.invoke('radio-api', {
        body: { action: 'getGenres' }
      });

      if (error) throw error;
      
      // Handle different response formats
      const genreList = data?.genres || data?.data || data || [];
      setGenres(Array.isArray(genreList) ? genreList : []);
    } catch (error) {
      console.error('Error fetching genres:', error);
      toast.error('Failed to load genres');
    } finally {
      setLoadingGenres(false);
    }
  };

  const fetchStationsByGenre = async (genre: Genre) => {
    try {
      setLoading(true);
      setSelectedGenre(genre);
      const { data, error } = await supabase.functions.invoke('radio-api', {
        body: { action: 'getStationsByGenre', genreId: genre.id }
      });

      if (error) throw error;
      
      const stationList = data?.radios || data?.data || data || [];
      setStations(Array.isArray(stationList) ? stationList : []);
    } catch (error) {
      console.error('Error fetching stations:', error);
      toast.error('Failed to load stations');
    } finally {
      setLoading(false);
    }
  };

  const searchStations = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      setSelectedGenre(null);
      const { data, error } = await supabase.functions.invoke('radio-api', {
        body: { action: 'searchStations', searchQuery }
      });

      if (error) throw error;
      
      const stationList = data?.radios || data?.data || data || [];
      setStations(Array.isArray(stationList) ? stationList : []);
    } catch (error) {
      console.error('Error searching stations:', error);
      toast.error('Failed to search stations');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopStations = async () => {
    try {
      setLoading(true);
      setSelectedGenre(null);
      const { data, error } = await supabase.functions.invoke('radio-api', {
        body: { action: 'getTopStations' }
      });

      if (error) throw error;
      
      const stationList = data?.radios || data?.data || data || [];
      setStations(Array.isArray(stationList) ? stationList : []);
    } catch (error) {
      console.error('Error fetching top stations:', error);
      toast.error('Failed to load top stations');
    } finally {
      setLoading(false);
    }
  };

  const fetchListeningHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('radio_listening_history')
        .select('*')
        .eq('user_id', user.id)
        .order('listened_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const saveToHistory = async (station: Station, durationSeconds: number) => {
    if (!user) return;
    
    try {
      await supabase.from('radio_listening_history').insert({
        user_id: user.id,
        station_id: station.id,
        station_name: station.name,
        station_url: station.url,
        station_logo: station.logo || '',
        genre: station.genre || '',
        duration_seconds: durationSeconds
      });
      
      fetchListeningHistory();
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  const playStation = (station: Station) => {
    // Stop current station if playing
    if (audioRef.current && currentStation) {
      audioRef.current.pause();
      
      // Calculate duration and save to history
      if (playStartTime.current) {
        const durationSeconds = Math.floor((Date.now() - playStartTime.current) / 1000);
        if (durationSeconds > 10) {
          saveToHistory(currentStation, durationSeconds);
        }
      }
    }

    // Create new audio element
    audioRef.current = new Audio(station.url);
    audioRef.current.volume = isMuted ? 0 : volume / 100;
    
    audioRef.current.play()
      .then(() => {
        setCurrentStation(station);
        setIsPlaying(true);
        playStartTime.current = Date.now();
        toast.success(`Now playing: ${station.name}`);
      })
      .catch((error) => {
        console.error('Error playing station:', error);
        toast.error('Failed to play station. The stream may be unavailable.');
      });

    audioRef.current.onerror = () => {
      toast.error('Stream error. Please try another station.');
      setIsPlaying(false);
    };
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const stopPlaying = () => {
    if (audioRef.current && currentStation) {
      audioRef.current.pause();
      
      if (playStartTime.current) {
        const durationSeconds = Math.floor((Date.now() - playStartTime.current) / 1000);
        if (durationSeconds > 10) {
          saveToHistory(currentStation, durationSeconds);
        }
      }
      
      setCurrentStation(null);
      setIsPlaying(false);
      playStartTime.current = null;
    }
  };

  const playFromHistory = (historyItem: ListeningHistory) => {
    playStation({
      id: historyItem.station_id,
      name: historyItem.station_name,
      url: historyItem.station_url,
      logo: historyItem.station_logo,
      genre: historyItem.genre
    });
  };

  return (
    <div className="container mx-auto p-4 pb-32 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
          <Radio className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            FerqX Radio
          </h1>
          <p className="text-muted-foreground">50,000+ Radio Stations Worldwide</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search radio stations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchStations()}
            className="pl-10"
          />
        </div>
        <Button onClick={searchStations} disabled={loading}>
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={fetchTopStations} disabled={loading}>
          <Heart className="h-4 w-4 mr-2" />
          Top Voted
        </Button>
      </div>

      <Tabs defaultValue="genres" className="space-y-4">
        <TabsList>
          <TabsTrigger value="genres" className="gap-2">
            <Music className="h-4 w-4" />
            Genres
          </TabsTrigger>
          <TabsTrigger value="stations" className="gap-2">
            <Radio className="h-4 w-4" />
            Stations
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="genres">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Browse by Genre
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingGenres ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 rounded-lg" />
                  ))}
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {genres.map((genre) => (
                      <Button
                        key={genre.id}
                        variant={selectedGenre?.id === genre.id ? "default" : "outline"}
                        className="justify-start h-auto py-3"
                        onClick={() => fetchStationsByGenre(genre)}
                      >
                        <Music className="h-4 w-4 mr-2 shrink-0" />
                        <span className="truncate">{genre.name}</span>
                        {genre.count && (
                          <Badge variant="secondary" className="ml-auto">
                            {genre.count}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5" />
                {selectedGenre ? `${selectedGenre.name} Stations` : 'Radio Stations'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : stations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Radio className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a genre or search to find stations</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {stations.map((station) => (
                      <div
                        key={station.id}
                        className={`flex items-center gap-4 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-accent ${
                          currentStation?.id === station.id ? 'bg-accent border-primary' : ''
                        }`}
                        onClick={() => playStation(station)}
                      >
                        {station.logo ? (
                          <img
                            src={station.logo}
                            alt={station.name}
                            className="h-12 w-12 rounded-lg object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Radio className="h-6 w-6 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{station.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {station.genre && <Badge variant="outline">{station.genre}</Badge>}
                            {station.country && <span>{station.country}</span>}
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant={currentStation?.id === station.id && isPlaying ? "default" : "outline"}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (currentStation?.id === station.id) {
                              togglePlayPause();
                            } else {
                              playStation(station);
                            }
                          }}
                        >
                          {currentStation?.id === station.id && isPlaying ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Listening History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!user ? (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sign in to see your listening history</p>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No listening history yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                        onClick={() => playFromHistory(item)}
                      >
                        {item.station_logo ? (
                          <img
                            src={item.station_logo}
                            alt={item.station_name}
                            className="h-10 w-10 rounded-lg object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Radio className="h-5 w-5 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.station_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(item.listened_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button size="icon" variant="ghost">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Now Playing Bar */}
      {currentStation && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t p-4 z-50">
          <div className="container mx-auto flex items-center gap-4">
            {currentStation.logo ? (
              <img
                src={currentStation.logo}
                alt={currentStation.name}
                className="h-14 w-14 rounded-lg object-cover"
              />
            ) : (
              <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Radio className="h-7 w-7 text-white" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{currentStation.name}</p>
              <div className="flex items-center gap-2">
                {isPlaying && (
                  <span className="flex items-center gap-1 text-sm text-green-500">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Live
                  </span>
                )}
                {currentStation.genre && (
                  <Badge variant="outline" className="text-xs">{currentStation.genre}</Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button size="icon" variant="ghost" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <Slider
                value={[volume]}
                onValueChange={([val]) => setVolume(val)}
                max={100}
                step={1}
                className="w-24"
              />
              <Button size="icon" onClick={togglePlayPause}>
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button size="icon" variant="ghost" onClick={stopPlaying}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
