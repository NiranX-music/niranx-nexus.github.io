import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Play, Search, Plus, Heart, Music2 } from "lucide-react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { useNavigate } from "react-router-dom";

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  audio_url: string;
  cover_url?: string;
  artwork_url?: string;
  duration?: number;
  artist_id?: string;
}

interface Playlist {
  id: string;
  name: string;
  cover_image_url?: string;
  description?: string;
}

interface Artist {
  id: string;
  name: string;
  avatar_url?: string;
}

export default function MusicHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [recommendedTracks, setRecommendedTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [userName, setUserName] = useState("User");
  const { playTrack } = useMusicPlayer();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    fetchUserName();
  }, []);

  const fetchUserName = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (session.session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, username")
        .eq("user_id", session.session.user.id)
        .single();
      if (profile) {
        setUserName(profile.display_name || profile.username || "User");
      }
    }
  };

  const fetchData = async () => {
    const { data: session } = await supabase.auth.getSession();
    
    // Fetch playlists
    if (session.session) {
      const { data: playlistData } = await supabase
        .from("playlists")
        .select("*")
        .eq("user_id", session.session.user.id)
        .limit(8);
      setPlaylists(playlistData || []);

      // Fetch liked tracks
      const { data: likedData } = await supabase
        .from("liked_tracks")
        .select("track_id, tracks(*)")
        .eq("user_id", session.session.user.id)
        .limit(10);
      if (likedData) {
        setLikedTracks(likedData.map((l: any) => l.tracks).filter(Boolean));
      }
    }

    // Fetch recent/popular tracks
    const { data: tracksData } = await supabase
      .from("tracks")
      .select("*")
      .eq("is_approved", true)
      .order("play_count", { ascending: false })
      .limit(20);
    setRecentTracks(tracksData?.slice(0, 10) || []);
    setRecommendedTracks(tracksData?.slice(10, 20) || []);

    // Fetch artists
    const { data: artistsData } = await supabase
      .from("artists")
      .select("*")
      .eq("is_verified", true)
      .limit(8);
    setArtists(artistsData || []);
  };

  const handlePlayTrack = (track: Track) => {
    playTrack({
      id: track.id,
      name: track.title,
      url: track.audio_url,
      artist: track.artist,
      album: track.album,
      duration: track.duration,
    });
  };

  const QuickPlayCard = ({ item, type }: { item: any; type: "playlist" | "artist" | "track" }) => (
    <Card
      className="group relative flex items-center gap-4 p-3 bg-card/50 hover:bg-card cursor-pointer transition-all rounded-lg overflow-hidden"
      onClick={() => {
        if (type === "playlist") navigate(`/niranx/music/playlist/${item.id}`);
        else if (type === "artist") navigate(`/niranx/music/artist/${item.id}`);
        else handlePlayTrack(item);
      }}
    >
      <img
        src={item.cover_image_url || item.avatar_url || item.artwork_url || item.cover_url || "/placeholder.svg"}
        alt={item.name || item.title}
        className={`h-14 w-14 object-cover ${type === "artist" ? "rounded-full" : "rounded"}`}
      />
      <span className="font-medium truncate flex-1">{item.name || item.title}</span>
      <Button
        size="icon"
        className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-primary text-primary-foreground shadow-lg"
        onClick={(e) => {
          e.stopPropagation();
          if (type === "track") handlePlayTrack(item);
        }}
      >
        <Play className="h-4 w-4 fill-current" />
      </Button>
    </Card>
  );

  const TrackCard = ({ track }: { track: Track }) => (
    <Card
      className="group cursor-pointer hover:bg-accent/30 transition-all p-4 min-w-[180px] space-y-3"
      onClick={() => navigate(`/niranx/music/track/${track.id}`)}
    >
      <div className="relative">
        <img
          src={track.artwork_url || track.cover_url || "/placeholder.svg"}
          alt={track.title}
          className="w-full aspect-square object-cover rounded-lg shadow-lg"
        />
        <Button
          size="icon"
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all rounded-full bg-primary text-primary-foreground shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            handlePlayTrack(track);
          }}
        >
          <Play className="h-5 w-5 fill-current" />
        </Button>
      </div>
      <div>
        <p className="font-bold text-sm truncate">{track.title}</p>
        <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
      </div>
    </Card>
  );

  const ArtistCard = ({ artist }: { artist: Artist }) => (
    <Card
      className="group cursor-pointer hover:bg-accent/30 transition-all p-4 min-w-[160px] text-center space-y-3"
      onClick={() => navigate(`/niranx/music/artist/${artist.id}`)}
    >
      <div className="relative mx-auto w-28 h-28">
        <img
          src={artist.avatar_url || "/placeholder.svg"}
          alt={artist.name}
          className="w-full h-full object-cover rounded-full shadow-lg"
        />
        <Button
          size="icon"
          className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-all rounded-full bg-primary text-primary-foreground shadow-lg"
        >
          <Play className="h-4 w-4 fill-current" />
        </Button>
      </div>
      <div>
        <p className="font-bold text-sm truncate">{artist.name}</p>
        <p className="text-xs text-muted-foreground">Artist</p>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {userName}</h1>
          <p className="text-muted-foreground">What would you like to listen to?</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tracks, artists, albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full"
            />
          </div>
          <Button onClick={() => navigate("/niranx/music/upload")}>
            <Plus className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Quick Access */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {/* Liked Songs Card */}
          <Card
            className="group relative flex items-center gap-4 p-3 bg-card/50 hover:bg-card cursor-pointer transition-all rounded-lg overflow-hidden"
            onClick={() => navigate("/niranx/music/library")}
          >
            <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded flex items-center justify-center">
              <Heart className="h-6 w-6 text-white fill-white" />
            </div>
            <div>
              <span className="font-medium">Liked Songs</span>
              <p className="text-xs text-muted-foreground">{likedTracks.length} songs</p>
            </div>
          </Card>
          
          {playlists.slice(0, 3).map((playlist) => (
            <QuickPlayCard key={playlist.id} item={playlist} type="playlist" />
          ))}
          {artists.slice(0, 4).map((artist) => (
            <QuickPlayCard key={artist.id} item={artist} type="artist" />
          ))}
        </div>
      </section>

      {/* Made For You */}
      {recommendedTracks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Made For You</h2>
            <Button variant="link" className="text-muted-foreground">Show all</Button>
          </div>
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4">
              {recommendedTracks.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>
      )}

      {/* Recently Played / Popular */}
      {recentTracks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Popular Tracks</h2>
            <Button variant="link" className="text-muted-foreground" onClick={() => navigate("/niranx/music/library")}>
              View Library
            </Button>
          </div>
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4">
              {recentTracks.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>
      )}

      {/* Popular Artists */}
      {artists.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Popular Artists</h2>
            <Button variant="link" className="text-muted-foreground">Show all</Button>
          </div>
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4">
              {artists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>
      )}

      {/* Empty State */}
      {recentTracks.length === 0 && artists.length === 0 && (
        <div className="text-center py-16">
          <Music2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No music yet</h3>
          <p className="text-muted-foreground mb-4">Be the first to upload a track!</p>
          <Button onClick={() => navigate("/niranx/music/upload")}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Track
          </Button>
        </div>
      )}
    </div>
  );
}
