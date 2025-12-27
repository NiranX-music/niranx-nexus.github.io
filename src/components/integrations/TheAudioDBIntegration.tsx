import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Music2,
  Disc,
  User,
  Loader2,
  ExternalLink,
  Play,
  Calendar,
  MapPin
} from "lucide-react";

interface Artist {
  idArtist: string;
  strArtist: string;
  strArtistThumb?: string;
  strGenre?: string;
  strCountry?: string;
  strBiographyEN?: string;
  strLabel?: string;
  intFormedYear?: string;
  strWebsite?: string;
  strFacebook?: string;
  strTwitter?: string;
}

interface Album {
  idAlbum: string;
  strAlbum: string;
  strArtist: string;
  strAlbumThumb?: string;
  intYearReleased?: string;
  strGenre?: string;
  strLabel?: string;
  strDescriptionEN?: string;
  intScore?: string;
}

interface Track {
  idTrack: string;
  strTrack: string;
  strArtist: string;
  strAlbum?: string;
  intDuration?: string;
  strGenre?: string;
  strMusicVid?: string;
}

export default function TheAudioDBIntegration() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"artist" | "album" | "track">("artist");
  const [loading, setLoading] = useState(false);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  const searchAudioDB = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    try {
      setLoading(true);
      setArtists([]);
      setAlbums([]);
      setTracks([]);
      
      const { data, error } = await supabase.functions.invoke('radio-api', {
        body: { 
          action: 'searchAudioDB',
          searchType,
          searchQuery 
        }
      });

      if (error) throw error;

      if (searchType === "artist") {
        setArtists(data?.artists || []);
        if (!data?.artists?.length) toast.info("No artists found");
      } else if (searchType === "album") {
        setAlbums(data?.album || []);
        if (!data?.album?.length) toast.info("No albums found");
      } else if (searchType === "track") {
        setTracks(data?.track || []);
        if (!data?.track?.length) toast.info("No tracks found");
      }
    } catch (error) {
      console.error('Error searching AudioDB:', error);
      toast.error('Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchArtistDetails = async (artistId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('radio-api', {
        body: { 
          action: 'getArtistDetails',
          artistId
        }
      });

      if (error) throw error;
      
      if (data?.artists?.[0]) {
        setSelectedArtist(data.artists[0]);
      }
    } catch (error) {
      console.error('Error fetching artist details:', error);
      toast.error('Failed to load artist details');
    } finally {
      setLoading(false);
    }
  };

  const fetchArtistAlbums = async (artistId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('radio-api', {
        body: { 
          action: 'getArtistAlbums',
          artistId
        }
      });

      if (error) throw error;
      setAlbums(data?.album || []);
    } catch (error) {
      console.error('Error fetching albums:', error);
      toast.error('Failed to load albums');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: string) => {
    const totalSeconds = parseInt(ms) / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
          <Disc className="h-8 w-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">TheAudioDB</h2>
          <p className="text-muted-foreground">Music metadata and artist information</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3">
        <Tabs value={searchType} onValueChange={(v) => setSearchType(v as typeof searchType)}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="artist" className="gap-2">
              <User className="h-4 w-4" />
              Artist
            </TabsTrigger>
            <TabsTrigger value="album" className="gap-2">
              <Disc className="h-4 w-4" />
              Album
            </TabsTrigger>
            <TabsTrigger value="track" className="gap-2">
              <Music2 className="h-4 w-4" />
              Track
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${searchType}s...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchAudioDB()}
              className="pl-10"
            />
          </div>
          <Button onClick={searchAudioDB} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          {/* Artist Results */}
          {artists.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Artists</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {artists.map((artist) => (
                  <Card 
                    key={artist.idArtist} 
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => {
                      fetchArtistDetails(artist.idArtist);
                      fetchArtistAlbums(artist.idArtist);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {artist.strArtistThumb ? (
                          <img
                            src={artist.strArtistThumb}
                            alt={artist.strArtist}
                            className="h-20 w-20 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                            <User className="h-8 w-8 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{artist.strArtist}</h4>
                          {artist.strGenre && (
                            <Badge variant="secondary" className="mt-1">{artist.strGenre}</Badge>
                          )}
                          {artist.strCountry && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {artist.strCountry}
                            </p>
                          )}
                          {artist.intFormedYear && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Formed {artist.intFormedYear}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Album Results */}
          {albums.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Albums</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {albums.map((album) => (
                  <Card key={album.idAlbum}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {album.strAlbumThumb ? (
                          <img
                            src={album.strAlbumThumb}
                            alt={album.strAlbum}
                            className="h-20 w-20 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <Disc className="h-8 w-8 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{album.strAlbum}</h4>
                          <p className="text-sm text-muted-foreground truncate">{album.strArtist}</p>
                          {album.intYearReleased && (
                            <Badge variant="outline" className="mt-1">{album.intYearReleased}</Badge>
                          )}
                          {album.strGenre && (
                            <Badge variant="secondary" className="mt-1 ml-1">{album.strGenre}</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Track Results */}
          {tracks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tracks</h3>
              <Card>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    <div className="divide-y">
                      {tracks.map((track) => (
                        <div 
                          key={track.idTrack}
                          className="flex items-center gap-4 p-4 hover:bg-accent transition-colors"
                        >
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                            <Music2 className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{track.strTrack}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {track.strArtist} {track.strAlbum && `• ${track.strAlbum}`}
                            </p>
                          </div>
                          {track.intDuration && (
                            <span className="text-sm text-muted-foreground">
                              {formatDuration(track.intDuration)}
                            </span>
                          )}
                          {track.strMusicVid && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => window.open(track.strMusicVid, '_blank')}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Selected Artist Details */}
          {selectedArtist && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {selectedArtist.strArtist}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  {selectedArtist.strArtistThumb && (
                    <img
                      src={selectedArtist.strArtistThumb}
                      alt={selectedArtist.strArtist}
                      className="h-48 w-48 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {selectedArtist.strGenre && (
                        <Badge>{selectedArtist.strGenre}</Badge>
                      )}
                      {selectedArtist.strCountry && (
                        <Badge variant="outline">{selectedArtist.strCountry}</Badge>
                      )}
                      {selectedArtist.strLabel && (
                        <Badge variant="secondary">{selectedArtist.strLabel}</Badge>
                      )}
                    </div>
                    {selectedArtist.strBiographyEN && (
                      <p className="text-sm text-muted-foreground line-clamp-4">
                        {selectedArtist.strBiographyEN}
                      </p>
                    )}
                    <div className="flex gap-2">
                      {selectedArtist.strWebsite && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`https://${selectedArtist.strWebsite}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Website
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && artists.length === 0 && albums.length === 0 && tracks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Disc className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Search for artists, albums, or tracks</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
