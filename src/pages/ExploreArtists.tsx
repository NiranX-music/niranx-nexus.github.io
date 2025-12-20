import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Music, Plus, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Artist {
  id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  is_verified: boolean;
  follower_count: number;
  monthly_listeners: number;
}

export default function ExploreArtists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const { data, error } = await supabase
        .from("artists")
        .select("*")
        .order("follower_count", { ascending: false });

      if (error) throw error;
      setArtists(data || []);
    } catch (error: any) {
      console.error("Error fetching artists:", error);
      toast.error("Failed to load artists");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Users className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Users className="h-10 w-10" />
            Explore Artists
          </h1>
          <p className="text-muted-foreground mt-2">
            Discover amazing artists and their music
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => navigate("/niranx/music/artist/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Artist
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search artists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredArtists.map((artist) => (
          <Card
            key={artist.id}
            className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300"
            onClick={() => navigate(`/niranx/music/artist/${artist.id}`)}
          >
            <div className="aspect-square relative overflow-hidden">
              <img
                src={artist.avatar_url || "/placeholder.svg"}
                alt={artist.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Button
                size="icon"
                className="absolute bottom-4 right-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/niranx/music/artist/${artist.id}`);
                }}
              >
                <Music className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">{artist.name}</h3>
                {artist.is_verified && (
                  <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {artist.follower_count?.toLocaleString() || 0} followers
              </p>
              {artist.monthly_listeners > 0 && (
                <p className="text-xs text-muted-foreground">
                  {artist.monthly_listeners.toLocaleString()} monthly listeners
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredArtists.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">No Artists Found</h2>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "Try a different search term"
              : "Be the first to create an artist profile!"}
          </p>
          <Button onClick={() => navigate("/niranx/music/artist/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Artist
          </Button>
        </Card>
      )}
    </div>
  );
}
