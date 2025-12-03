import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Play, Search, Plus, Heart, Library, Music2, Mic2 } from "lucide-react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
      className="group relative flex items-center gap-4 p-2 bg-card/50 hover:bg-card cursor-pointer transition-all rounded-md overflow-hidden"
      onClick={() => {
        if (type === "playlist") navigate(`/niranx/music/playlist/${item.id}`);
        else if (type === "artist") navigate(`/niranx/music/artist/${item.id}`);
        else handlePlayTrack(item);
      }}
    >
      <img
        src={item.cover_image_url || item.avatar_url || item.artwork_url || item.cover_url || "/placeholder.svg"}
        alt={item.name || item.title}
        className={`h-12 w-12 object-cover ${type === "artist" ? "rounded-full" : "rounded"}`}
      />
      <span className="font-medium text-sm truncate flex-1">{item.name || item.title}</span>
      <Button
        size="icon"
        className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-primary text-primary-foreground shadow-lg"
        onClick={(e) => {
          e.stopPropagation();
          if (type === "track") handlePlayTrack(item);
        }}
      >
        <Play className="h-4 w-4 fill-current" />
      </Button>
    </Card>
  );

  const MixCard = ({ tracks, title, subtitle }: { tracks: Track[]; title: string; subtitle: string }) => (
    <Card
      className="group cursor-pointer hover:bg-accent/30 transition-all p-4 min-w-[180px] space-y-3"
      onClick={() => {
        if (tracks.length > 0) handlePlayTrack(tracks[0]);
      }}
    >
      <div className="relative">
        <div className="grid grid-cols-2 gap-0.5 rounded-lg overflow-hidden aspect-square">
          {tracks.slice(0, 4).map((t, i) => (
            <img
              key={i}
              src={t.artwork_url || t.cover_url || "/placeholder.svg"}
              alt=""
              className="w-full h-full object-cover"
            />
          ))}
        </div>
        <Button
          size="icon"
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all rounded-full bg-primary text-primary-foreground shadow-lg"
        >
          <Play className="h-5 w-5 fill-current" />
        </Button>
      </div>
      <div>
        <p className="font-bold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{subtitle}</p>
      </div>
    </Card>
  );

  const ArtistCard = ({ artist }: { artist: Artist }) => (
    <Card
      className="group cursor-pointer hover:bg-accent/30 transition-all p-4 min-w-[160px] text-center space-y-3"
      onClick={() => navigate(`/niranx/music/artist/${artist.id}`)}
    >
      <div className="relative mx-auto w-32 h-32">
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
    <div className="min-h-screen bg-background">
      {/* Sidebar Section */}
      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-72 border-r border-border p-4 space-y-4 hidden lg:block sticky top-0 h-screen overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Library className="h-5 w-5" />
              <span className="font-bold">Your Library</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigate("/niranx/music/playlists/create")}>
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" size="sm" className="rounded-full text-xs">Playlists</Button>
            <Button variant="ghost" size="sm" className="rounded-full text-xs">Artists</Button>
            <Button variant="ghost" size="sm" className="rounded-full text-xs">Albums</Button>
          </div>

          {/* Library Items */}
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-1">
              {/* Liked Songs */}
              <Card
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent/50"
                onClick={() => navigate("/niranx/music/library")}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white fill-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">Liked Songs</p>
                  <p className="text-xs text-muted-foreground">{likedTracks.length} songs</p>
                </div>
              </Card>

              {/* Playlists */}
              {playlists.map((playlist) => (
                <Card
                  key={playlist.id}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent/50"
                  onClick={() => navigate(`/niranx/music/playlist/${playlist.id}`)}
                >
                  <img
                    src={playlist.cover_image_url || "/placeholder.svg"}
                    alt={playlist.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{playlist.name}</p>
                    <p className="text-xs text-muted-foreground">Playlist</p>
                  </div>
                </Card>
              ))}

              {/* Artists */}
              {artists.slice(0, 4).map((artist) => (
                <Card
                  key={artist.id}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent/50"
                  onClick={() => navigate(`/niranx/music/artist/${artist.id}`)}
                >
                  <img
                    src={artist.avatar_url || "/placeholder.svg"}
                    alt={artist.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{artist.name}</p>
                    <p className="text-xs text-muted-foreground">Artist</p>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-8 pb-32">
          {/* Header Search */}
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="What do you want to play?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full bg-card"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/niranx/music/upload")}>
                <Plus className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <Button variant="outline" onClick={() => navigate("/niranx/music/library")}>
                <Music2 className="h-4 w-4 mr-2" />
                Library
              </Button>
            </div>
          </div>

          {/* Quick Access Grid */}
          <section>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {playlists.slice(0, 4).map((playlist) => (
                <QuickPlayCard key={playlist.id} item={playlist} type="playlist" />
              ))}
              {artists.slice(0, 4).map((artist) => (
                <QuickPlayCard key={artist.id} item={artist} type="artist" />
              ))}
            </div>
          </section>

          {/* Made For You */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Made For {userName}</h2>
              <Button variant="link" className="text-muted-foreground">Show all</Button>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-4">
                <MixCard
                  tracks={recommendedTracks.slice(0, 4)}
                  title="Discover Weekly"
                  subtitle="Your shortcut to hidden gems, deep cuts, and more"
                />
                {[1, 2, 3, 4, 5].map((i) => (
                  <MixCard
                    key={i}
                    tracks={recentTracks.slice(i * 2, i * 2 + 4)}
                    title={`Daily Mix ${i}`}
                    subtitle={recentTracks.slice(i * 2, i * 2 + 2).map(t => t.artist).join(", ") || "Various Artists"}
                  />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>

          {/* Recently Played */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Recently played</h2>
              <Button variant="link" className="text-muted-foreground">Show all</Button>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-4">
                {recentTracks.map((track) => (
                  <Card
                    key={track.id}
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
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>

          {/* Popular Artists */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Popular Artists</h2>
              <Button variant="link" className="text-muted-foreground">Show all</Button>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-4">
                {artists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>
        </main>
      </div>
    </div>
  );
}