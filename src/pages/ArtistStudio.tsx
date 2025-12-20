import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Music,
  Upload,
  FolderPlus,
  Mail,
  Settings,
  BarChart3,
  Disc,
  Users,
  Play,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

interface Artist {
  id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  email?: string;
  is_verified: boolean;
  follower_count: number;
  monthly_listeners: number;
}

interface Track {
  id: string;
  title: string;
  album?: string;
  play_count?: number;
  created_at: string;
}

export default function ArtistStudio() {
  const { artistId } = useParams<{ artistId: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already authenticated via session storage
    const storedSession = sessionStorage.getItem(`artist_studio_${artistId}`);
    if (storedSession) {
      setIsAuthenticated(true);
    }
    fetchArtist();
  }, [artistId]);

  useEffect(() => {
    if (isAuthenticated && artistId) {
      fetchTracks();
    }
  }, [isAuthenticated, artistId]);

  const fetchArtist = async () => {
    try {
      const { data, error } = await supabase
        .from("artists")
        .select("*")
        .eq("id", artistId)
        .single();

      if (error) throw error;
      setArtist(data);
    } catch (error: any) {
      console.error("Error fetching artist:", error);
      toast.error("Artist not found");
      navigate("/niranx/music/artists");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTracks = async () => {
    try {
      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .eq("artist_id", artistId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTracks(data || []);
    } catch (error: any) {
      console.error("Error fetching tracks:", error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!artist) return;

    // Simple password check (in production, use proper hashing)
    const { data, error } = await supabase
      .from("artists")
      .select("password_hash")
      .eq("id", artistId)
      .single();

    if (error || !data?.password_hash) {
      toast.error("Artist studio not set up. Please contact admin.");
      return;
    }

    // Simple comparison (in production, use bcrypt or similar)
    if (data.password_hash === password) {
      sessionStorage.setItem(`artist_studio_${artistId}`, "authenticated");
      setIsAuthenticated(true);
      toast.success(`Welcome to ${artist.name}'s Studio!`);
    } else {
      toast.error("Invalid password");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(`artist_studio_${artistId}`);
    setIsAuthenticated(false);
    setPassword("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Music className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!artist) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6 max-w-md">
        <Card className="p-8">
          <div className="text-center mb-6">
            <img
              src={artist.avatar_url || "/placeholder.svg"}
              alt={artist.name}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            />
            <h1 className="text-2xl font-bold">{artist.name}'s Studio</h1>
            <p className="text-muted-foreground">Enter your password to access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Studio Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your studio password"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Enter Studio
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Artist email: {artist.email || `${artist.name.toLowerCase().replace(/\s+/g, "")}@niranx.com`}
          </p>
        </Card>
      </div>
    );
  }

  const totalPlays = tracks.reduce((acc, t) => acc + (t.play_count || 0), 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={artist.avatar_url || "/placeholder.svg"}
            alt={artist.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h1 className="text-3xl font-bold">{artist.name}'s Studio</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {artist.email || `${artist.name.toLowerCase().replace(/\s+/g, "")}@niranx.com`}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="h-4 w-4" />
            <span className="text-sm">Followers</span>
          </div>
          <p className="text-2xl font-bold">{artist.follower_count?.toLocaleString() || 0}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <BarChart3 className="h-4 w-4" />
            <span className="text-sm">Monthly Listeners</span>
          </div>
          <p className="text-2xl font-bold">{artist.monthly_listeners?.toLocaleString() || 0}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Disc className="h-4 w-4" />
            <span className="text-sm">Total Tracks</span>
          </div>
          <p className="text-2xl font-bold">{tracks.length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Play className="h-4 w-4" />
            <span className="text-sm">Total Plays</span>
          </div>
          <p className="text-2xl font-bold">{totalPlays.toLocaleString()}</p>
        </Card>
      </div>

      <Tabs defaultValue="tracks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tracks">
            <Music className="h-4 w-4 mr-2" />
            Tracks
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracks" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Tracks</h2>
            <Button onClick={() => navigate(`/niranx/music/upload?artistId=${artistId}`)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload New Track
            </Button>
          </div>

          {tracks.length === 0 ? (
            <Card className="p-12 text-center">
              <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Tracks Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start uploading your music to build your catalogue
              </p>
              <Button onClick={() => navigate(`/niranx/music/upload?artistId=${artistId}`)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Track
              </Button>
            </Card>
          ) : (
            <div className="space-y-2">
              {tracks.map((track) => (
                <Card
                  key={track.id}
                  className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/niranx/music/track/${track.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{track.title}</p>
                      {track.album && (
                        <p className="text-sm text-muted-foreground">{track.album}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{(track.play_count || 0).toLocaleString()} plays</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(track.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Upload</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-32 flex flex-col gap-2"
                onClick={() => navigate(`/niranx/music/upload?artistId=${artistId}`)}
              >
                <Music className="h-8 w-8" />
                <span>Upload Single Track</span>
              </Button>
              <Button
                variant="outline"
                className="h-32 flex flex-col gap-2"
                onClick={() => navigate(`/niranx/music/album/create?artistId=${artistId}`)}
              >
                <Disc className="h-8 w-8" />
                <span>Upload Album</span>
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Studio Settings</h2>
            <div className="space-y-4">
              <div>
                <Label>Artist Email</Label>
                <Input
                  value={artist.email || `${artist.name.toLowerCase().replace(/\s+/g, "")}@niranx.com`}
                  disabled
                />
              </div>
              <Separator />
              <Button
                variant="outline"
                onClick={() => navigate(`/niranx/music/artist/${artistId}/edit`)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
