import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Youtube, Play, Clock, Music } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const YOUTUBE_API_KEY = "AIzaSyCViLOHg7rv0sRvPOXLgoHXXO7fJzidsWI";

interface VideoResult {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  duration?: string;
}

export default function StreamSphere() {
  const [currentVideoId, setCurrentVideoId] = useState("dQw4w9WgXcQ");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<VideoResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchVideos = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&q=${encodeURIComponent(
          searchQuery
        )}&type=video&key=${YOUTUBE_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.error) {
        toast.error("Failed to search videos");
        return;
      }

      const videos: VideoResult[] = data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
      }));

      setSearchResults(videos);
    } catch (error) {
      console.error("Error searching videos:", error);
      toast.error("Failed to search videos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadUrl = () => {
    if (searchQuery) {
      const match = searchQuery.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      const id = match ? match[1] : searchQuery;
      if (id) {
        setCurrentVideoId(id);
        setSearchQuery("");
        setSearchResults([]);
      }
    }
  };

  const playVideo = (videoId: string) => {
    setCurrentVideoId(videoId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text mb-2 flex items-center gap-2">
          <Youtube className="w-8 h-8" />
          StreamSphere
        </h1>
        <p className="text-muted-foreground">
          Search and watch YouTube videos in a focused viewing experience
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="Search for videos or paste YouTube URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  if (searchQuery.includes("youtube.com") || searchQuery.includes("youtu.be")) {
                    handleLoadUrl();
                  } else {
                    searchVideos();
                  }
                }
              }}
              className="flex-1"
            />
            <Button onClick={handleLoadUrl} variant="outline">
              Load URL
            </Button>
            <Button onClick={searchVideos} disabled={isLoading}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Video Player */}
      <div className="relative w-full rounded-lg overflow-hidden shadow-2xl" style={{ paddingBottom: "56.25%" }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=0&rel=0&modestbranding=1`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Search Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {searchResults.map((video) => (
              <Card
                key={video.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                onClick={() => playVideo(video.id)}
              >
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                    {video.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-1">{video.channelTitle}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{video.publishedAt}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quick Access Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover-lift cursor-pointer" onClick={() => {
          setSearchQuery("study music lofi");
          searchVideos();
        }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              Study Music
            </CardTitle>
            <CardDescription>Relaxing lo-fi beats for studying</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="hover-lift cursor-pointer" onClick={() => {
          setSearchQuery("educational documentary");
          searchVideos();
        }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="w-5 h-5" />
              Educational
            </CardTitle>
            <CardDescription>Learn something new</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="hover-lift cursor-pointer" onClick={() => {
          setSearchQuery("white noise focus");
          searchVideos();
        }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Focus Sessions
            </CardTitle>
            <CardDescription>Ambient sounds for concentration</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
